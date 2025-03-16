// src/app/services/route.ts
import { NextResponse } from 'next/server';
import { smartMovingService } from '@/app/services/smartMoving';

export async function GET() {
  try {
    const leads = await smartMovingService.getLeads(1, 25);
    return NextResponse.json(leads, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}
