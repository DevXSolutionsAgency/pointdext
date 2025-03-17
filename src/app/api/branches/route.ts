import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    const SMARTMOVING_API_URL = process.env.SMARTMOVING_API_URL;
    const API_KEY = process.env.SMARTMOVING_API_KEY;

    if (!SMARTMOVING_API_URL || !API_KEY) {
      throw new Error('Missing SmartMoving API configuration');
    }

    const response = await axios.get(`${SMARTMOVING_API_URL}/api/branches`, {
      headers: {
        'X-API-KEY': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    return NextResponse.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error('Error fetching branches:', error.response?.data || error.message);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch branches',
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    );
  }
} 