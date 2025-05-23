import { NextResponse } from 'next/server';
import axios from 'axios';

/* 1 ▸ TYPES */
interface Coord { lat: number; lng: number; }
interface DirectionsResponse {
  routes: Array<{ legs: Array<{ distance:{ value:number }; duration:{ value:number };
                                 steps:Array<{ html_instructions:string }> }> }>;
  status: string;
}
interface GeocodeResponse {
  results: Array<{ geometry: { location: Coord } }>;
  status : string;
}

/* 2 ▸ ENV VARS */
const GOOGLE_MAPS_API_KEY   = process.env.GOOGLE_MAPS_API_KEY!;
const AMADEUS_CLIENT_ID     = process.env.AMADEUS_CLIENT_ID!;
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET!;
if (!GOOGLE_MAPS_API_KEY) throw new Error('GOOGLE_MAPS_API_KEY missing');
if (!AMADEUS_CLIENT_ID || !AMADEUS_CLIENT_SECRET) throw new Error('Amadeus creds missing');

/* 3 ▸ HELPERS */
async function geocode(addr: string): Promise<Coord> {
  const { data } = await axios.get<GeocodeResponse>(
    'https://maps.googleapis.com/maps/api/geocode/json',
    { params: { address: addr, key: GOOGLE_MAPS_API_KEY } }
  );
  if (data.status !== 'OK' || !data.results?.length)
    throw new Error(`Geocode failed (${data.status}) for "${addr}"`);
  return data.results[0].geometry.location;
}

async function directions(a: Coord, b: Coord) {
  const { data } = await axios.get<DirectionsResponse>(
    'https://maps.googleapis.com/maps/api/directions/json',
    { params: { origin:`${a.lat},${a.lng}`, destination:`${b.lat},${b.lng}`, key:GOOGLE_MAPS_API_KEY } }
  );
  if (data.status !== 'OK' || !data.routes.length)
    throw new Error(`Directions failed (${data.status})`);
  const leg = data.routes[0].legs[0];
  const miles   = leg.distance.value / 1609.34;
  const minutes = leg.duration.value / 60;
  const tolls   = leg.steps.filter(s => s.html_instructions.toLowerCase().includes('toll')).length;
  return { miles, minutes, tolls };
}

/* 4 ▸ AMADEUS */
interface AmaToken { access_token:string; expires_in:number }
interface AmaAirport { iataCode:string; name:string; distance:{ value:number } }
interface AmaAirportResp { data?: AmaAirport[] }
let cachedAma: { tok: string; exp: number } | null = null;

async function getAmaToken(): Promise<string> {
  const now = Date.now();
  if (cachedAma && now < cachedAma.exp) return cachedAma.tok;

  const form = new URLSearchParams();
  form.append('grant_type', 'client_credentials');
  form.append('client_id', AMADEUS_CLIENT_ID);
  form.append('client_secret', AMADEUS_CLIENT_SECRET);

  const { data } = await axios.post<AmaToken>(
    'https://test.api.amadeus.com/v1/security/oauth2/token',
    form.toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  cachedAma = { tok: data.access_token, exp: now + (data.expires_in - 60) * 1e3 };
  return cachedAma.tok;
}

async function nearestAirport(c: Coord) {
  const token = await getAmaToken();
  const { data } = await axios.get<AmaAirportResp>(
    'https://test.api.amadeus.com/v1/reference-data/locations/airports',
    {
      headers: { Authorization: `Bearer ${token}` },
      params : {
        latitude : c.lat.toFixed(6),
        longitude: c.lng.toFixed(6),
        radius   : 100,
        'page[limit]': 5
      }
    }
  );
  const first = data.data?.[0];
  if (!first) throw new Error('Amadeus returned no airport');
  return { name: first.name, code: first.iataCode };
}

/* 5 ▸ HANDLER */
export async function POST(req: Request) {
  try {
    const {
      moveType,
      warehouse,
      pickup,
      stops = [],          
      delivery,
      returnWarehouse
    } = await req.json();

    if (!moveType || !warehouse || !pickup || !delivery) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    /* ▸ Build ordered waypoint list */
    const points: Coord[] = [];
    points.push(await geocode(warehouse));
    points.push(await geocode(pickup));

    for (const s of stops) {
      if (s && s.trim() !== '') points.push(await geocode(s));
    }

    const dl = await geocode(delivery);
    points.push(dl);

    if (moveType === 'round-trip') {
      points.push(await geocode((returnWarehouse || warehouse).trim()));
    }

    /* ▸ Aggregate distances */
    let miles = 0, minutes = 0, tolls = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const seg = await directions(points[i], points[i + 1]);
      miles   += seg.miles;
      minutes += seg.minutes;
      tolls   += seg.tolls;
    }

    /* ▸ Airport (one-way) */
    let airportName = '', airportCode = '';
    if (moveType === 'one-way') {
      try {
        const ap = await nearestAirport(dl);
        airportName = ap.name;
        airportCode = ap.code;
      } catch (e) {
        console.warn('Amadeus airport lookup failed', e);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        distance: miles,
        duration: minutes,
        tolls,
        nearestAirportName: airportName,
        nearestAirportCode: airportCode
      }
    });
  } catch (err: any) {
    console.error('calculate-distance error:', err.message || err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed' },
      { status: 500 }
    );
  }
}
