import { NextResponse } from 'next/server';
import axios from 'axios';
import Amadeus from 'amadeus';

interface DistanceMatrixResponse {
  rows: Array<{
    elements: Array<{
      distance: {
        value: number;
        text: string;
      };
      duration: {
        value: number;
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

interface FlightOffer {
  price: {
    total: string;
  };
}

interface AmadeusResponse {
  data: FlightOffer[];
}

if (!process.env.GOOGLE_MAPS_API_KEY) {
  throw new Error('GOOGLE_MAPS_API_KEY is not defined');
}

if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) {
  throw new Error('Amadeus credentials are not defined');
}

// Initialize Amadeus client
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET
});

// Function to get nearest airport code from coordinates
async function getNearestAirport(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await amadeus.referenceData.locations.get({
      subType: 'AIRPORT',
      latitude: lat,
      longitude: lng,
      radius: 50, // Search within 50km
      sort: 'distance'
    });

    if (response.data && response.data.length > 0) {
      return response.data[0].address.cityCode;
    }
    return null;
  } catch (error) {
    console.error('Error finding nearest airport:', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { origin, destination } = await request.json();
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Missing Google Maps API key');
    }

    // Get coordinates for origin and destination
    const geocodeOrigin = await axios.get<GeocodeResponse>(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(origin)}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const geocodeDest = await axios.get<GeocodeResponse>(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=${GOOGLE_MAPS_API_KEY}`
    );

    const originLocation = geocodeOrigin.data.results[0].geometry.location;
    const destLocation = geocodeDest.data.results[0].geometry.location;

    // Get nearest airports
    const originAirport = await getNearestAirport(originLocation.lat, originLocation.lng);
    const destAirport = await getNearestAirport(destLocation.lat, destLocation.lng);

    if (!originAirport || !destAirport) {
      throw new Error('Could not find nearby airports');
    }

    // Get distance and duration from Google Maps
    const response = await axios.get<DistanceMatrixResponse>(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${GOOGLE_MAPS_API_KEY}`
    );

    const distance = response.data.rows[0].elements[0].distance.value; // Distance in meters
    const duration = response.data.rows[0].elements[0].duration.value; // Duration in seconds

    // Get real flight prices from Amadeus
    const flightOffers = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: originAirport,
      destinationLocationCode: destAirport,
      departureDate: new Date().toISOString().split('T')[0],
      adults: '1'
    }) as AmadeusResponse;

    if (!flightOffers.data || flightOffers.data.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          distance: distance / 1609.34, // Convert to miles
          duration: duration / 60, // Convert to minutes
          planeTicketCost: null,
          message: 'No flights found for the selected route'
        }
      });
    }

    // Get the lowest price from available flights
    const lowestPrice = flightOffers.data.reduce((lowest: number, offer: FlightOffer) => {
      const price = parseFloat(offer.price.total);
      return price < lowest ? price : lowest;
    }, Infinity);

    return NextResponse.json({
      success: true,
      data: {
        distance: distance / 1609.34, // Convert to miles
        duration: duration / 60, // Convert to minutes
        planeTicketCost: lowestPrice || null,
        originAirport,
        destinationAirport: destAirport
      }
    });
  } catch (error: any) {
    console.error('Error calculating distance:', error.response?.data || error.message);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to calculate distance',
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    );
  }
} 