import { NextResponse } from 'next/server';
import axios from 'axios';

/** We'll store coordinates in { lat, lng } */
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

/** For geocoding */
interface GeocodeResponse {
  results: Array<{
    geometry: { location: { lat: number; lng: number } };
  }>;
  status: string;
}

/** For the Places API (finding nearest international airport) */
interface PlacesSearchResponse {
  results: Array<{
    name?: string;
    geometry?: { location?: { lat: number; lng: number } };
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

/**
 * Helper: Use the Directions API to get distance (miles), duration (minutes),
 * and tollCount for a single route from 'fromCoord' to 'toCoord'.
 */
async function getDirectionsSegment(from: Coord, to: Coord) {
  const origin = `${from.lat},${from.lng}`;
  const destination = `${to.lat},${to.lng}`;

  // Basic driving route
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_MAPS_API_KEY}`;

  const resp = await axios.get<DirectionsResponse>(url);
  if (resp.data.status !== 'OK' || !resp.data.routes.length) {
    throw new Error(
      `No valid route from [${origin}] to [${destination}]. Directions status: ${resp.data.status}`
    );
  }

  // We'll just take the first route
  const route = resp.data.routes[0];
  const leg = route.legs[0]; // There's typically only 1 leg if no waypoints

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
 * Helper: Use Places API to find the nearest **international** airport to given lat/lng.
 * This uses the `keyword=international` parameter so only airports named "International" appear.
 */
async function getNearestInternationalAirport(deliveryCoord: Coord): Promise<string> {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${deliveryCoord.lat},${deliveryCoord.lng}&rankby=distance&type=airport&keyword=international&key=${GOOGLE_MAPS_API_KEY}`;

  const resp = await axios.get<PlacesSearchResponse>(url);
  if (resp.data.status === 'OK' && resp.data.results?.length) {
    return resp.data.results[0].name || 'Unknown International Airport';
  }
  return 'No International Airport Found';
}

/**
 * POST /api/calculate-distance
 * Body: {
 *   moveType: 'one-way' | 'round-trip',
 *   warehouse: string,
 *   pickup: string,
 *   delivery: string,
 *   returnWarehouse?: string
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

    // Validate
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

    // We'll accumulate total distance, total duration, and total tolls across each segment
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

      // Find nearest "international" airport
      nearestAirport = await getNearestInternationalAirport(deliveryCoord);
    } else {
      // Round-trip
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

      if (!returnCoord) {
        throw new Error('Round-trip requested but no return warehouse found.');
      }
      // Segment 3: delivery -> returnWarehouse
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
        tolls: totalTolls,          // <--- We return total toll steps
        nearestAirport,            // only non-empty if one-way
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
