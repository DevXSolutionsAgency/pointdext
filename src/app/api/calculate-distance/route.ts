import { NextResponse } from 'next/server';
import axios from 'axios';

/** We'll store coordinates in { lat, lng } shape */
interface Coord {
  lat: number;
  lng: number;
}

/** For the directions JSON response */
interface DirectionsResponse {
  routes: Array<{
    legs: Array<{
      distance: { value: number };
      duration: { value: number };
      steps: Array<{
        html_instructions: string;
      }>;
    }>;
  }>;
  status: string;
}

/** For geocoding responses */
interface GeocodeResponse {
  results: Array<{
    geometry: {
      location: { lat: number; lng: number };
    };
  }>;
  status: string;
}

/** For the Places Nearby Search response */
interface PlacesSearchResponse {
  results: Array<{
    name?: string;
    geometry?: {
      location?: { lat: number; lng: number };
    };
    // other fields as needed
  }>;
  status: string;
}

const { GOOGLE_MAPS_API_KEY } = process.env;
if (!GOOGLE_MAPS_API_KEY) {
  throw new Error('GOOGLE_MAPS_API_KEY is not defined in env');
}

/** Helper: geocode an address -> { lat, lng } */
async function geocodeAddress(address: string): Promise<Coord> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${GOOGLE_MAPS_API_KEY}`;

  const resp = await axios.get<GeocodeResponse>(url);
  if (!resp.data.results || resp.data.results.length === 0) {
    throw new Error(`No geocoding results for "${address}"`);
  }
  return resp.data.results[0].geometry.location;
}

/** Helper: Directions API to get distance, duration, and tollCount for a single route */
async function getDirectionsSegment(from: Coord, to: Coord) {
  const origin = `${from.lat},${from.lng}`;
  const destination = `${to.lat},${to.lng}`;
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_MAPS_API_KEY}`;

  const resp = await axios.get<DirectionsResponse>(url);
  if (resp.data.status !== 'OK' || !resp.data.routes.length) {
    throw new Error(
      `No valid route from [${origin}] to [${destination}]. Directions status: ${resp.data.status}`
    );
  }

  const route = resp.data.routes[0];
  const leg = route.legs[0]; // typically only 1 leg
  const distanceMiles = leg.distance.value / 1609.34;
  const durationMinutes = leg.duration.value / 60;

  // Tally up steps that mention "toll"
  let tollsCount = 0;
  for (const step of leg.steps) {
    const instructions = step.html_instructions.toLowerCase();
    if (instructions.includes('toll')) {
      tollsCount++;
    }
  }

  return {
    distanceMiles,
    durationMinutes,
    tollsCount,
  };
}

/**
 * Helper: Use Places Nearby Search to find any airports, rank by distance,
 * then pick the first that has "international" in its name. If none found,
 * fallback to the #1 result, if any.
 */
async function getNearestMajorAirport(deliveryCoord: Coord): Promise<string> {
  // No more "keyword=international" here. We'll manually filter below.
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${deliveryCoord.lat},${deliveryCoord.lng}&rankby=distance&type=airport&key=${GOOGLE_MAPS_API_KEY}`;

  const resp = await axios.get<PlacesSearchResponse>(url);
  if (resp.data.status !== 'OK' || !resp.data.results?.length) {
    return 'No International Airport Found';
  }

  // 1) Look for an airport with "international" in the name
  for (const place of resp.data.results) {
    const name = place.name?.toLowerCase() || '';
    if (name.includes('international')) {
      return place.name || 'Unknown International Airport';
    }
  }

  // 2) If none are named "international," fallback to the first result
  return resp.data.results[0].name || 'No Airport Found';
}

/**
 * POST /api/calculate-distance
 * Body: {
 *   moveType: 'one-way' | 'round-trip',
 *   warehouse: string,       // e.g. "3045 S 46th st"
 *   pickup: string,          // e.g. "123 Main st"
 *   delivery: string,        // e.g. "456 Elm st"
 *   returnWarehouse?: string // if round-trip
 * }
 */
export async function POST(request: Request) {
  try {
    const { moveType, warehouse, pickup, delivery, returnWarehouse } =
      (await request.json()) as {
        moveType: 'one-way' | 'round-trip';
        warehouse: string;
        pickup: string;
        delivery: string;
        returnWarehouse?: string;
      };

    if (!moveType || !warehouse || !pickup || !delivery) {
      throw new Error('Missing required fields: moveType, warehouse, pickup, delivery.');
    }

    // Geocode each required address
    const warehouseCoord = await geocodeAddress(warehouse);
    const pickupCoord = await geocodeAddress(pickup);
    const deliveryCoord = await geocodeAddress(delivery);

    let returnCoord: Coord | null = null;
    if (moveType === 'round-trip') {
      // If user provides a separate returnWarehouse, use it; otherwise fallback to 'warehouse'
      const ret = returnWarehouse && returnWarehouse.trim().length > 0
        ? returnWarehouse
        : warehouse;
      returnCoord = await geocodeAddress(ret);
    }

    let totalDistanceMiles = 0;
    let totalDurationMinutes = 0;
    let totalTolls = 0;
    let nearestAirport = '';

    if (moveType === 'one-way') {
      // Segment 1: warehouse -> pickup
      const seg1 = await getDirectionsSegment(warehouseCoord, pickupCoord);
      totalDistanceMiles += seg1.distanceMiles;
      totalDurationMinutes += seg1.durationMinutes;
      totalTolls += seg1.tollsCount;

      // Segment 2: pickup -> delivery
      const seg2 = await getDirectionsSegment(pickupCoord, deliveryCoord);
      totalDistanceMiles += seg2.distanceMiles;
      totalDurationMinutes += seg2.durationMinutes;
      totalTolls += seg2.tollsCount;

      // Find the "major" airport using the new function
      nearestAirport = await getNearestMajorAirport(deliveryCoord);
    } else {
      // Round-trip: warehouse -> pickup -> delivery -> returnWarehouse
      const seg1 = await getDirectionsSegment(warehouseCoord, pickupCoord);
      totalDistanceMiles += seg1.distanceMiles;
      totalDurationMinutes += seg1.durationMinutes;
      totalTolls += seg1.tollsCount;

      const seg2 = await getDirectionsSegment(pickupCoord, deliveryCoord);
      totalDistanceMiles += seg2.distanceMiles;
      totalDurationMinutes += seg2.durationMinutes;
      totalTolls += seg2.tollsCount;

      if (!returnCoord) {
        throw new Error(
          'Round-trip requested, but returnWarehouse not provided nor fallback found.'
        );
      }
      const seg3 = await getDirectionsSegment(deliveryCoord, returnCoord);
      totalDistanceMiles += seg3.distanceMiles;
      totalDurationMinutes += seg3.durationMinutes;
      totalTolls += seg3.tollsCount;
    }

    return NextResponse.json({
      success: true,
      data: {
        distance: totalDistanceMiles,
        duration: totalDurationMinutes,
        tolls: totalTolls,
        nearestAirport, // only meaningful if one-way
      },
    });
  } catch (error: any) {
    console.error('Error calculating route:', error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to calculate distance',
      },
      { status: 500 }
    );
  }
}
 