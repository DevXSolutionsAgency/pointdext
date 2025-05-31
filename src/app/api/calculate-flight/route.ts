import { NextResponse } from 'next/server';
import axios from 'axios';

/** OAuth token shape returned by Amadeus */
interface AmadeusTokenResponse {
  access_token: string;
  token_type : string;
  expires_in : number;
  state? : string;
  scope? : string;
}

/** Flight–offer structure */
interface AmadeusFlightOffer {
  price?: { currency?: string; total?: string };

  itineraries?: {
    segments?: {
      carrierCode?: string;           
      departure?: { at: string };     
    }[];
  }[];
}

/** Entire response wrapper */
interface AmadeusFlightOffersResponse {
  data?: AmadeusFlightOffer[];
}

export async function POST(request: Request) {
  try {
    /* 1) input */
    const { originAirport, departureDate, adults } =
      (await request.json()) as {
        originAirport?: string;
        departureDate?: string;
        adults?: number;
      };

    if (!originAirport || !departureDate || !adults) {
      throw new Error(
        'Missing originAirport, departureDate, or adults in request body.'
      );
    }

    /* 2) credentials */
    const clientId     = process.env.AMADEUS_CLIENT_ID;
    const clientSecret = process.env.AMADEUS_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error(
        'AMADEUS_CLIENT_ID or AMADEUS_CLIENT_SECRET not found in env'
      );
    }

    /* 3) get access-token */
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
    if (!accessToken) throw new Error('Failed to obtain Amadeus access token');

    /* 4) fetch offers */
    const flightUrl =
      'https://test.api.amadeus.com/v2/shopping/flight-offers';

    const flightResp = await axios.get<AmadeusFlightOffersResponse>(flightUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params : {
        originLocationCode      : originAirport,
        destinationLocationCode : 'PHX',
        departureDate,
        adults,
        max          : 5,
        currencyCode : 'USD',
      },
    });

    const offers = flightResp.data.data;
    if (!offers?.length) throw new Error('No flights found from Amadeus');

    /* 5) find cheapest & remember its details  */
    let lowestPrice = Infinity;
    let cheapest: AmadeusFlightOffer | null = null;

    for (const offer of offers) {
      if (offer.price?.total) {
        const priceNum = parseFloat(offer.price.total);
        if (!isNaN(priceNum) && priceNum < lowestPrice) {
          lowestPrice = priceNum;
          cheapest    = offer;          
        }
      }
    }

    if (!isFinite(lowestPrice) || !cheapest)
      throw new Error('Failed to parse any valid flight prices');

    /* ▼ Extract airline & departure time (safe-checks in case fields miss) */
    const firstSeg   = cheapest.itineraries?.[0]?.segments?.[0];
    const airline    = firstSeg?.carrierCode ?? '';
    const departTime = firstSeg?.departure?.at ?? '';

    /* 6) respond  */
    return NextResponse.json({
      success     : true,
      flightPrice : lowestPrice,
      airline,
      departTime,
    });
  } catch (err: any) {
    console.error('Error in Amadeus flight route:', err.message || err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to get flight price' },
      { status: 500 },
    );
  }
}
