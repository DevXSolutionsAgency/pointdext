import { NextResponse } from 'next/server';
import axios from 'axios';

// POST handler for creating new leads
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lead, branchId } = body;
    
    const SMARTMOVING_API_URL = process.env.SMARTMOVING_API_URL;
    const PROVIDER_KEY = process.env.SMARTMOVING_PROVIDER_KEY;
    
    // Forward the lead to SmartMoving with branch categorization
    const response = await axios.post(
      `${SMARTMOVING_API_URL}/api/leads/from-provider/v2?providerKey=${PROVIDER_KEY}${branchId ? `&branchId=${branchId}` : ''}`,
      lead
    );
    
    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error processing lead:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process lead' },
      { status: 500 }
    );
  }
}

// GET handler for fetching leads
export async function GET() {
  try {
    const SMARTMOVING_API_URL = process.env.SMARTMOVING_API_URL;
    const API_KEY = process.env.SMARTMOVING_API_KEY;

    if (!SMARTMOVING_API_URL || !API_KEY) {
      throw new Error('Missing SmartMoving API configuration');
    }

    const response = await axios.get(`${SMARTMOVING_API_URL}/api/leads`, {
      headers: {
        'X-API-KEY': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    return NextResponse.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error('Error fetching leads:', error.response?.data || error.message);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch leads',
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    );
  }
} 