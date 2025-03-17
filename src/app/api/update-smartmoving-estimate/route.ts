import { NextResponse } from 'next/server';

interface UpdateEstimateRequest {
  leadId: string;
  estimate: number;
  costBreakdown: {
    tripDetails: {
      totalDistance: number;
      totalDuration: number;
      adjustedDuration: number;
      drivingDays: number;
    };
    costs: {
      driverPay: number;
      fuelCost: number;
      loadingLabor: number;
      hotelCost: number;
      perDiem: number;
      truckRental: number;
      packingSupplies: number;
      planeTickets: number;
      tollCost: number;
    };
    totalCost: number;
  };
}

export async function POST(request: Request) {
  try {
    const { leadId, estimate, costBreakdown }: UpdateEstimateRequest = await request.json();

    // For testing, we'll just log the update and return success
    console.log('Updating SmartMoving estimate:', {
      leadId,
      estimate,
      costBreakdown
    });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      data: {
        id: leadId,
        estimate,
        notes: `Cost Breakdown:
          - Total Distance: ${costBreakdown.tripDetails.totalDistance.toFixed(2)} miles
          - Total Duration: ${costBreakdown.tripDetails.totalDuration.toFixed(2)} hours
          - Adjusted Duration: ${costBreakdown.tripDetails.adjustedDuration.toFixed(2)} hours
          - Driving Days: ${costBreakdown.tripDetails.drivingDays}
          
          Cost Components:
          - Driver Pay: $${costBreakdown.costs.driverPay.toFixed(2)}
          - Fuel Cost: $${costBreakdown.costs.fuelCost.toFixed(2)}
          - Loading Labor: $${costBreakdown.costs.loadingLabor.toFixed(2)}
          - Hotel Cost: $${costBreakdown.costs.hotelCost.toFixed(2)}
          - Per Diem: $${costBreakdown.costs.perDiem.toFixed(2)}
          - Truck Rental: $${costBreakdown.costs.truckRental.toFixed(2)}
          - Packing Supplies: $${costBreakdown.costs.packingSupplies.toFixed(2)}
          - Plane Tickets: $${costBreakdown.costs.planeTickets.toFixed(2)}
          - Toll Cost: $${costBreakdown.costs.tollCost.toFixed(2)}
          
          Total Cost: $${costBreakdown.totalCost.toFixed(2)}`
      }
    });

  } catch (error: any) {
    console.error('Error updating SmartMoving estimate:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update estimate',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 