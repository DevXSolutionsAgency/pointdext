import { NextResponse } from 'next/server';
import axios from 'axios';

/**
 * We define typed interfaces for the Amadeus OAuth token and flight offers.
 */

interface AmadeusTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  state?: string;
  scope?: string;
}

/**
 * Each flight offer has a "price" object with a total string (e.g. "120.00").
 * You can expand these fields as needed for your usage.
 */
interface AmadeusFlightOffer {
  price?: {
    currency?: string;
    total?: string; // e.g. "123.45"
  };
  // You can add more fields if needed.
}

interface AmadeusFlightOffersResponse {
  data?: AmadeusFlightOffer[];
  // "meta" or "dictionaries" might also exist in a real response
}

/**
 * POST /api/amadeus-flight
 * Request body: { originAirport: string; departureDate: string; adults: number; }
 * 
 * This route calls the Amadeus test API:
 *   1) Authenticates with "client_credentials" to get an access token
 *   2) Queries flight offers from originAirport -> "PHX"
 *   3) Returns the lowest price
 */
export async function POST(request: Request) {
  try {
    // 1) Parse the incoming JSON
    const { originAirport, departureDate, adults } = await request.json() as {
      originAirport?: string;
      departureDate?: string;
      adults?: number;
    };

    // Validate input
    if (!originAirport || !departureDate || !adults) {
      throw new Error('Missing originAirport, departureDate, or adults in request body.');
    }

    // 2) Ensure your Amadeus env vars exist
    const clientId = process.env.AMADEUS_CLIENT_ID;
    const clientSecret = process.env.AMADEUS_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error('AMADEUS_CLIENT_ID or AMADEUS_CLIENT_SECRET not found in env');
    }

    // 3) Obtain an OAuth token via client_credentials
    const tokenUrl = 'https://test.api.amadeus.com/v1/security/oauth2/token';
    const tokenParams = new URLSearchParams();
    tokenParams.append('grant_type', 'client_credentials');
    tokenParams.append('client_id', clientId);
    tokenParams.append('client_secret', clientSecret);

    const tokenResp = await axios.post<AmadeusTokenResponse>(
      tokenUrl,
      tokenParams.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const accessToken = tokenResp.data.access_token;
    if (!accessToken) {
      throw new Error('Failed to obtain Amadeus access token');
    }

    // 4) Fetch flight offers from originAirport -> PHX
    const flightUrl = 'https://test.api.amadeus.com/v2/shopping/flight-offers';
    const flightResp = await axios.get<AmadeusFlightOffersResponse>(flightUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        originLocationCode: originAirport,
        destinationLocationCode: 'PHX', // Phoenix Sky Harbor
        departureDate,
        adults,
        max: 5,
        currencyCode: 'USD'
      },
    });

    // 5) Find the lowest price among the returned flight offers
    const offers = flightResp.data.data;
    if (!offers || offers.length === 0) {
      throw new Error('No flights found from Amadeus');
    }

    let lowestPrice = Infinity;
    for (const offer of offers) {
      // e.g. "offer.price?.total" is "123.00"
      if (offer.price?.total) {
        const priceNum = parseFloat(offer.price.total);
        if (!isNaN(priceNum) && priceNum < lowestPrice) {
          lowestPrice = priceNum;
        }
      }
    }

    if (!isFinite(lowestPrice)) {
      throw new Error('Failed to parse any valid flight prices from Amadeus');
    }

    return NextResponse.json({
      success: true,
      flightPrice: lowestPrice,
    });
  } catch (err: any) {
    console.error('Error in Amadeus flight route:', err.message || err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to get flight price',
      },
      { status: 500 }
    );
  }
}
