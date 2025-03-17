'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface CostBreakdown {
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
}

interface MovingCalculatorProps {
  initialAddresses?: {
    warehouse: string;
    pickup: string;
    delivery: string;
    returnWarehouse: string;
    nearestAirport: string;
  };
  onCalculate?: (costBreakdown: CostBreakdown) => void;
  loading?: boolean;
}

export default function MovingCalculator({ initialAddresses, onCalculate, loading: externalLoading }: MovingCalculatorProps) {
  const [loading, setLoading] = useState(false);
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way');
  const [addresses, setAddresses] = useState({
    warehouse: initialAddresses?.warehouse || '',
    pickup: initialAddresses?.pickup || '',
    delivery: initialAddresses?.delivery || '',
    returnWarehouse: initialAddresses?.returnWarehouse || '',
    nearestAirport: initialAddresses?.nearestAirport || '',
  });
  const [loadingDetails, setLoadingDetails] = useState({
    numberOfGuys: 2,
    numberOfDays: 1,
  });
  const [numberOfDrivers, setNumberOfDrivers] = useState(2);
  const [packingSuppliesNeeded, setPackingSuppliesNeeded] = useState(false);
  const [truckRental, setTruckRental] = useState({
    city: '',
    cost: 0,
  });
  const [numberOfReturnFlights, setNumberOfReturnFlights] = useState(2);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);
  const [manualAdjustments, setManualAdjustments] = useState<Partial<CostBreakdown['costs']>>({});

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/calculate-cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripType,
          addresses,
          loading: loadingDetails,
          numberOfDrivers,
          packingSuppliesNeeded,
          truckRental: tripType === 'one-way' ? truckRental : undefined,
          numberOfReturnFlights: tripType === 'one-way' ? numberOfReturnFlights : undefined,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setCostBreakdown(data.data);
        onCalculate?.(data.data);
      }
    } catch (error) {
      console.error('Error calculating costs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAdjustment = (key: keyof CostBreakdown['costs'], value: number) => {
    setManualAdjustments(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getAdjustedCost = (key: keyof CostBreakdown['costs']) => {
    if (!costBreakdown) return 0;
    return manualAdjustments[key] ?? costBreakdown.costs[key];
  };

  const getTotalCost = () => {
    if (!costBreakdown) return 0;
    const originalTotal = costBreakdown.totalCost;
    const adjustments = Object.values(manualAdjustments).reduce((sum, value) => sum + value, 0);
    return originalTotal + adjustments;
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Moving Cost Calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Trip Type Selection */}
          <div className="space-y-2">
            <Label>Move Type</Label>
            <RadioGroup
              value={tripType}
              onValueChange={(value: 'one-way' | 'round-trip') => setTripType(value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="one-way" id="one-way" />
                <Label htmlFor="one-way">One-Way</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="round-trip" id="round-trip" />
                <Label htmlFor="round-trip">Round-Trip</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Address Inputs */}
          <div className="space-y-4">
            <Label>Addresses</Label>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="warehouse">Warehouse Address</Label>
                <Input
                  id="warehouse"
                  value={addresses.warehouse}
                  onChange={(e) => setAddresses(prev => ({ ...prev, warehouse: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickup">Pick-up Address</Label>
                <Input
                  id="pickup"
                  value={addresses.pickup}
                  onChange={(e) => setAddresses(prev => ({ ...prev, pickup: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery">Delivery Address</Label>
                <Input
                  id="delivery"
                  value={addresses.delivery}
                  onChange={(e) => setAddresses(prev => ({ ...prev, delivery: e.target.value }))}
                />
              </div>
              {tripType === 'one-way' ? (
                <div className="space-y-2">
                  <Label htmlFor="nearestAirport">Nearest Airport</Label>
                  <Input
                    id="nearestAirport"
                    value={addresses.nearestAirport}
                    onChange={(e) => setAddresses(prev => ({ ...prev, nearestAirport: e.target.value }))}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="returnWarehouse">Return Warehouse Address</Label>
                  <Input
                    id="returnWarehouse"
                    value={addresses.returnWarehouse}
                    onChange={(e) => setAddresses(prev => ({ ...prev, returnWarehouse: e.target.value }))}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Loading Details */}
          <div className="space-y-4">
            <Label>Loading Details</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numberOfGuys">Number of Guys</Label>
                <Input
                  id="numberOfGuys"
                  type="number"
                  value={loadingDetails.numberOfGuys}
                  onChange={(e) => setLoadingDetails(prev => ({ ...prev, numberOfGuys: parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numberOfDays">Number of Days</Label>
                <Input
                  id="numberOfDays"
                  type="number"
                  value={loadingDetails.numberOfDays}
                  onChange={(e) => setLoadingDetails(prev => ({ ...prev, numberOfDays: parseInt(e.target.value) }))}
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <Label>Additional Details</Label>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="numberOfDrivers">Number of Drivers</Label>
                <Input
                  id="numberOfDrivers"
                  type="number"
                  value={numberOfDrivers}
                  onChange={(e) => setNumberOfDrivers(parseInt(e.target.value))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="packingSupplies"
                  checked={packingSuppliesNeeded}
                  onCheckedChange={setPackingSuppliesNeeded}
                />
                <Label htmlFor="packingSupplies">Packing Supplies Needed</Label>
              </div>
              {tripType === 'one-way' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="truckRentalCity">Truck Rental City</Label>
                    <Input
                      id="truckRentalCity"
                      value={truckRental.city}
                      onChange={(e) => setTruckRental(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="truckRentalCost">Truck Rental Cost</Label>
                    <Input
                      id="truckRentalCost"
                      type="number"
                      value={truckRental.cost}
                      onChange={(e) => setTruckRental(prev => ({ ...prev, cost: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numberOfReturnFlights">Number of Return Flights</Label>
                    <Input
                      id="numberOfReturnFlights"
                      type="number"
                      value={numberOfReturnFlights}
                      onChange={(e) => setNumberOfReturnFlights(parseInt(e.target.value))}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <Button 
            onClick={handleCalculate} 
            disabled={loading || externalLoading}
            className="w-full"
          >
            {loading || externalLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculating...
              </>
            ) : (
              'Calculate Costs'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      {costBreakdown && (
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary">
              <TabsList>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="adjustments">Manual Adjustments</TabsTrigger>
              </TabsList>

              <TabsContent value="summary">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Total Distance</Label>
                      <p className="text-lg font-semibold">{costBreakdown.tripDetails.totalDistance.toFixed(2)} miles</p>
                    </div>
                    <div>
                      <Label>Total Duration</Label>
                      <p className="text-lg font-semibold">{costBreakdown.tripDetails.totalDuration.toFixed(2)} hours</p>
                    </div>
                    <div>
                      <Label>Adjusted Duration</Label>
                      <p className="text-lg font-semibold">{costBreakdown.tripDetails.adjustedDuration.toFixed(2)} hours</p>
                    </div>
                    <div>
                      <Label>Driving Days</Label>
                      <p className="text-lg font-semibold">{costBreakdown.tripDetails.drivingDays} days</p>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Label>Total Cost</Label>
                    <p className="text-2xl font-bold">${getTotalCost().toFixed(2)}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details">
                <div className="space-y-4">
                  {Object.entries(costBreakdown.costs).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                      <p className="font-semibold">${value.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="adjustments">
                <div className="space-y-4">
                  {Object.entries(costBreakdown.costs).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={manualAdjustments[key as keyof CostBreakdown['costs']] ?? value}
                          onChange={(e) => handleManualAdjustment(key as keyof CostBreakdown['costs'], parseFloat(e.target.value))}
                        />
                        <Button
                          variant="outline"
                          onClick={() => handleManualAdjustment(key as keyof CostBreakdown['costs'], value)}
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 