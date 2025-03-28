import { NextResponse } from 'next/server';
import axios from 'axios';

interface DistanceMatrixResponse {
  rows: Array<{
    elements: Array<{
      distance: {
        value: number; // meters
        text: string;
      };
      duration: {
        value: number; // seconds
        text: string;
      };
    }>;
  }>;
}

interface GeocodeResponse {
  results: Array<{
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }>;
  status: string;
}

// Read env variable
const { GOOGLE_MAPS_API_KEY } = process.env;
if (!GOOGLE_MAPS_API_KEY) {
  throw new Error('GOOGLE_MAPS_API_KEY is not defined in env');
}

/**
 * POST /api/calculate-distance
 * Expects JSON body: { origin: string, destination: string }
 */
export async function POST(request: Request) {
  try {
    const { origin, destination } = await request.json() as { origin: string; destination: string };
    if (!origin || !destination) {
      throw new Error('Origin or destination is empty.');
    }

    // 1) Geocode the origin
    const originGeo = await axios.get<GeocodeResponse>(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(origin)}&key=${GOOGLE_MAPS_API_KEY}`
    );
    if (!originGeo.data.results || originGeo.data.results.length === 0) {
      throw new Error(`No geocoding results for origin: "${origin}"`);
    }

    // 2) Geocode the destination
    const destGeo = await axios.get<GeocodeResponse>(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=${GOOGLE_MAPS_API_KEY}`
    );
    if (!destGeo.data.results || destGeo.data.results.length === 0) {
      throw new Error(`No geocoding results for destination: "${destination}"`);
    }

    // 3) Get distance matrix for driving route
    const distMatrix = await axios.get<DistanceMatrixResponse>(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${GOOGLE_MAPS_API_KEY}`
    );

    console.log('distMatrix.data = ', JSON.stringify(distMatrix.data, null, 2));
    const element = distMatrix.data.rows[0]?.elements[0];
    if (!element?.distance?.value || !element?.duration?.value) {
      throw new Error(`Distance Matrix had no valid route from "${origin}" to "${destination}".`);
    }

    // distance in meters, duration in seconds
    const distMeters = element.distance.value;
    const durationSecs = element.duration.value;

    // Convert to miles/minutes
    const distanceMiles = distMeters / 1609.34;
    const durationMinutes = durationSecs / 60;

    return NextResponse.json({
      success: true,
      data: {
        distance: distanceMiles, 
        duration: durationMinutes
      },
    });
  } catch (error: any) {
    console.error('Error calculating distance:', error.message);
    return NextResponse.json({
      success: false,
      error: 'Failed to calculate distance',
      details: error.message,
    }, { status: 500 });
  }
}
