import { NextResponse, NextRequest } from 'next/server';
import { smartMovingService, SmartMovingLead } from '@/app/services/smartMoving';

export async function GET() {
  try {
    const leads = await smartMovingService.getLeads(1, 25);
    return NextResponse.json(leads, { status: 200 });
  } catch (err: any) {
    console.error('Error fetching leads:', err.response?.data || err.message);
    return NextResponse.json({ 
      error: 'Failed to fetch leads',
      details: err.response?.data || err.message
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { lead, total } = await req.json() as {
      lead: SmartMovingLead;
      total: number;
    };

    // Validate the incoming data
    if (!lead || !lead.id || !lead.branchId || typeof total !== 'number') {
      return NextResponse.json(
        { ok: false, message: 'Invalid lead data or total amount' },
        { status: 400 }
      );
    }

    console.log('Processing calculator total for lead:', {
      id: lead.id,
      customerName: lead.customerName,
      total: total.toFixed(2)
    });

    // Convert lead to opportunity and add the calculator total as a note
    const result = await smartMovingService.convertLeadAndAddNote(lead, total);
    
    return NextResponse.json({ 
      ok: true, 
      message: `Lead converted to opportunity and note added`,
      data: result
    });
  } catch (err: any) {
    const errorDetails = {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data
    };
    
    console.error('Error processing calculator total:', errorDetails);
    
    return NextResponse.json(
      { 
        ok: false, 
        message: 'Failed to process calculator total', 
        details: errorDetails 
      },
      { status: 500 }
    );
  }
}