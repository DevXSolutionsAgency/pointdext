import { NextResponse } from 'next/server';
import axios from 'axios';
import Amadeus from 'amadeus';

interface CostCalculationParams {
  tripType: 'one-way' | 'round-trip';
  addresses: {
    warehouse: string;
    pickup: string;
    delivery: string;
    returnWarehouse?: string; // Only for round-trip
    nearestAirport?: string; // Only for one-way
  };
  loading: {
    numberOfGuys: number;
    numberOfDays: number;
  };
  numberOfDrivers: number;
  packingSuppliesNeeded: boolean;
  truckRental?: {
    city: string;
    cost: number; // Manual input for one-way truck rental cost
  };
  numberOfReturnFlights?: number; // For one-way moves
}

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

// Default rates (should be configurable in backend)
const RATES = {
  DRIVER_PAY: {
    'one-way': 40,
    'round-trip': 50
  },
  FUEL_EFFICIENCY: 5, // miles per gallon
  LOADING_LABOR: 300, // per guy per day
  HOTEL: 150, // per night
  PER_DIEM: 50, // per night per driver
  TRUCK_RENTAL: {
    DAILY_RATE: 300,
    MILEAGE_RATE: 0.30
  },
  PLANE_TICKET: 500,
  TOLL_COST: 100,
  DEFAULT_GAS_PRICE: 3.50
};

export async function POST(request: Request) {
  try {
    const params: CostCalculationParams = await request.json();
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Missing Google Maps API key');
    }

    // Calculate total distance and duration
    const calculateDistance = async (origin: string, destination: string) => {
      const response = await axios.get<DistanceMatrixResponse>(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      return {
        distance: response.data.rows[0].elements[0].distance.value / 1609.34, // Convert to miles
        duration: response.data.rows[0].elements[0].duration.value / 3600 // Convert to hours
      };
    };

    // Calculate main trip distance
    const mainTrip = await calculateDistance(params.addresses.pickup, params.addresses.delivery);
    
    // Calculate return trip distance if round-trip
    let returnTrip = { distance: 0, duration: 0 };
    if (params.tripType === 'round-trip' && params.addresses.returnWarehouse) {
      returnTrip = await calculateDistance(params.addresses.delivery, params.addresses.returnWarehouse);
    }

    // Calculate total distance and duration
    const totalDistance = mainTrip.distance + returnTrip.distance;
    const totalDuration = mainTrip.duration + returnTrip.duration;

    // Apply the formula: For every 6 hours of GPS drive time, add 2 additional hours
    const additionalHours = Math.floor(totalDuration / 6) * 2;
    const adjustedDuration = totalDuration + additionalHours;

    // Calculate driving days (9 hours per day)
    const drivingDays = Math.ceil(adjustedDuration / 9);

    // Calculate costs
    const costs = {
      // Driver pay (using adjusted duration)
      driverPay: drivingDays * 24 * RATES.DRIVER_PAY[params.tripType] * params.numberOfDrivers,

      // Fuel cost
      fuelCost: (totalDistance / RATES.FUEL_EFFICIENCY) * (Number(process.env.GAS_PRICE) || RATES.DEFAULT_GAS_PRICE),

      // Loading labor
      loadingLabor: params.loading.numberOfGuys * params.loading.numberOfDays * RATES.LOADING_LABOR,

      // Hotel and per diem
      hotelCost: drivingDays * RATES.HOTEL,
      perDiem: drivingDays * RATES.PER_DIEM * params.numberOfDrivers,

      // Truck rental
      truckRental: params.tripType === 'round-trip' 
        ? (drivingDays * RATES.TRUCK_RENTAL.DAILY_RATE) + (totalDistance * RATES.TRUCK_RENTAL.MILEAGE_RATE)
        : params.truckRental?.cost || 0,

      // Packing supplies
      packingSupplies: params.packingSuppliesNeeded 
        ? await getSmartMovingPackingSupplies(params.addresses.pickup)
        : 0,

      // Plane tickets (one-way only)
      planeTickets: params.tripType === 'one-way' && params.numberOfReturnFlights
        ? params.numberOfReturnFlights * RATES.PLANE_TICKET
        : 0,

      // Toll costs
      tollCost: (mainTrip.distance / 100) * RATES.TOLL_COST * (params.tripType === 'round-trip' ? 2 : 1)
    };

    // Calculate total cost
    const totalCost = Object.values(costs).reduce((sum, cost) => sum + cost, 0);

    return NextResponse.json({
      success: true,
      data: {
        tripDetails: {
          totalDistance,
          totalDuration,
          adjustedDuration,
          drivingDays
        },
        costs,
        totalCost
      }
    });

  } catch (error: any) {
    console.error('Error calculating costs:', error.response?.data || error.message);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to calculate costs',
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    );
  }
}

// Helper function to get SmartMoving packing supplies
async function getSmartMovingPackingSupplies(address: string): Promise<number> {
  // TODO: Implement SmartMoving API integration
  // For now, return a placeholder value
  return 500;
} 