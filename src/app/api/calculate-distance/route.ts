import { NextResponse } from 'next/server';
import axios from 'axios';

/** We’ll store coordinate in { lat, lng } shape */
interface Coord {
  lat: number;
  lng: number;
}

/** For the distance matrix JSON response */
interface DistanceMatrixResponse {
  rows: Array<{
    elements: Array<{
      distance?: { value: number; text: string };
      duration?: { value: number; text: string };
      status?: string;
    }>;
  }>;
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

const { GOOGLE_MAPS_API_KEY } = process.env;
if (!GOOGLE_MAPS_API_KEY) {
  throw new Error('GOOGLE_MAPS_API_KEY is not defined in env');
}

/** Helper: geocode an address -> { lat, lng } */
async function geocodeAddress(address: string): Promise<Coord> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
  const resp = await axios.get<GeocodeResponse>(url);
  if (!resp.data.results || resp.data.results.length === 0) {
    throw new Error(`No geocoding results for "${address}"`);
  }
  return resp.data.results[0].geometry.location;
}

/** Helper: DistanceMatrix for from->to coords. Returns miles + minutes */
async function getDistanceAndDuration(from: Coord, to: Coord) {
  const originsParam = `${from.lat},${from.lng}`;
  const destinationsParam = `${to.lat},${to.lng}`;
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originsParam}&destinations=${destinationsParam}&key=${GOOGLE_MAPS_API_KEY}`;

  const resp = await axios.get<DistanceMatrixResponse>(url);
  const element = resp.data.rows[0]?.elements[0];
  if (!element?.distance?.value || !element?.duration?.value || element.status !== 'OK') {
    throw new Error(`Distance Matrix had no valid route from [${originsParam}] to [${destinationsParam}]. Status=${element?.status}`);
  }
  return {
    distanceMiles: element.distance.value / 1609.34,
    durationMinutes: element.duration.value / 60
  };
}

/** 
 * POST /api/calculate-distance
 * Body: {
 *   moveType: 'one-way' | 'round-trip',
 *   warehouse: string,       // e.g. "3045 S 46th st, Phoenix 85040"
 *   pickup: string,          // e.g. "123 E Main St"
 *   delivery: string,        // e.g. "456 W Elm Rd"
 *   returnWarehouse?: string // if round-trip, can differ from 'warehouse'
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
      // if user provides a separate returnWarehouse, use it; otherwise fallback to warehouse
      const returnAddr = returnWarehouse && returnWarehouse.trim().length > 0
        ? returnWarehouse
        : warehouse;
      returnCoord = await geocodeAddress(returnAddr);
    }

    let totalDistanceMiles = 0;
    let totalDurationMinutes = 0;

    // One-way: warehouse -> pickup, pickup -> delivery
    if (moveType === 'one-way') {
      const seg1 = await getDistanceAndDuration(warehouseCoord, pickupCoord);
      totalDistanceMiles += seg1.distanceMiles;
      totalDurationMinutes += seg1.durationMinutes;

      const seg2 = await getDistanceAndDuration(pickupCoord, deliveryCoord);
      totalDistanceMiles += seg2.distanceMiles;
      totalDurationMinutes += seg2.durationMinutes;
    }
    // Round-trip: warehouse -> pickup, pickup -> delivery, delivery -> returnWarehouse
    else {
      const seg1 = await getDistanceAndDuration(warehouseCoord, pickupCoord);
      totalDistanceMiles += seg1.distanceMiles;
      totalDurationMinutes += seg1.durationMinutes;

      const seg2 = await getDistanceAndDuration(pickupCoord, deliveryCoord);
      totalDistanceMiles += seg2.distanceMiles;
      totalDurationMinutes += seg2.durationMinutes;

      if (!returnCoord) {
        throw new Error('Round-trip requested, but returnWarehouse not provided nor fallback found.');
      }
      const seg3 = await getDistanceAndDuration(deliveryCoord, returnCoord);
      totalDistanceMiles += seg3.distanceMiles;
      totalDurationMinutes += seg3.durationMinutes;
    }

    return NextResponse.json({
      success: true,
      data: {
        distance: totalDistanceMiles,
        duration: totalDurationMinutes
      }
    });
  } catch (error: any) {
    console.error('Error calculating route:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to calculate distance'
    }, { status: 500 });
  }
}
