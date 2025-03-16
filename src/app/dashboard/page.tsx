// src/app/dashboard/page.tsx
'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

interface SmartMovingLead {
  id: string;
  status?: string;     
  moveType?: string;
  serviceDate?: string;
  customerName?: string;
  branch?: string;
  opportunityType?: string;
  pickupAddress?: string;
  moveSize?: string;
  leadSource?: string;
  createdAt?: string;  
  quoteAmount?: number;    
}

type OppStatus = 'New' | 'Contacted' | 'Qualified' | 'Lost' | 'Won';

type MoveType = 'one-way' | 'round-trip';
type CalculatorStep =
  | 'move-type'
  | 'addresses'
  | 'loading-labor'
  | 'packing'
  | 'truck-rental'
  | 'plane-tickets'
  | 'review';

type AddressKey = 'warehouse' | 'pickup' | 'delivery';

interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface CalculatorState {
  moveType: MoveType | null;
  addresses: {
    warehouse: Address;
    pickup: Address;
    delivery: Address;
    airport?: Address;
  };
  distances: {
    totalMiles: number;
    drivingHours: number;
    drivingDays: number;
  };
  loading: {
    workers: number;
    days: number;
  };
  needsPacking: boolean;
  packingCost: number;
  truckRental: {
    cost: number;
    days: number;
  };
  returnFlights: number;
  tolls: number;
  adjustments: {
    driverHourlyRate: number;
    gasPrice: number;
    workerDailyRate: number;
    hotelRate: number;
    perDiemRate: number;
    truckDailyRate: number;
    truckMileageRate: number;
    flightTicketRate: number;
  };
}

interface AdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  adjustments: CalculatorState['adjustments'];
  onSave: (newAdjustments: CalculatorState['adjustments']) => void;
}

const commonStyles = {
  input: "mt-1 block w-full border-2 border-red-200 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-500",
  inputWithPrefix: "mt-1 block w-full pl-7 border-2 border-red-200 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-500",
  label: "block text-sm font-medium text-gray-900",
  costDisplay: "bg-gray-50 rounded-lg p-4 border-2 border-red-200"
};

function AdjustmentModal({ isOpen, onClose, adjustments, onSave }: AdjustmentModalProps) {
  const [localAdjustments, setLocalAdjustments] = useState(adjustments);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Adjust Rate Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={commonStyles.label}>Driver Hourly Rate ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={localAdjustments.driverHourlyRate}
              onChange={(e) => setLocalAdjustments(prev => ({
                ...prev,
                driverHourlyRate: parseFloat(e.target.value) || 0
              }))}
              className={commonStyles.input}
            />
          </div>
          <div>
            <label className={commonStyles.label}>Gas Price per Gallon ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={localAdjustments.gasPrice}
              onChange={(e) => setLocalAdjustments(prev => ({
                ...prev,
                gasPrice: parseFloat(e.target.value) || 0
              }))}
              className={commonStyles.input}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(localAdjustments);
              onClose();
            }}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, signOut } = useClerk();
  const [view, setView] = useState<'split' | 'leads' | 'calculator'>('split');
  const [currentStep, setCurrentStep] = useState<CalculatorStep>('move-type');
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [calculatorState, setCalculatorState] = useState<CalculatorState>({
    moveType: null,
    addresses: {
      warehouse: { street: '', city: '', state: '', zip: '' },
      pickup: { street: '', city: '', state: '', zip: '' },
      delivery: { street: '', city: '', state: '', zip: '' },
    },
    distances: {
      totalMiles: 0,
      drivingHours: 0,
      drivingDays: 0,
    },
    loading: {
      workers: 0,
      days: 0,
    },
    needsPacking: false,
    packingCost: 0,
    truckRental: {
      cost: 0,
      days: 0,
    },
    returnFlights: 0,
    tolls: 0,
    adjustments: {
      driverHourlyRate: 40,
      gasPrice: 3.5,
      workerDailyRate: 300,
      hotelRate: 150,
      perDiemRate: 50,
      truckDailyRate: 300,
      truckMileageRate: 0.3,
      flightTicketRate: 500,
    },
  });

  // The leads array loaded from /services
  const [leads, setLeads] = useState<SmartMovingLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch leads once on mount
  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    try {
      setIsLoading(true);
      const res = await fetch('/services');
      if (!res.ok) {
        throw new Error(`Failed to fetch leads from /services. Status: ${res.status}`);
      }
      const data = await res.json();
      setLeads(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Failed to fetch leads. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }


  function handleDeleteLead(_id: string) {
    console.warn('DELETE not supported by SmartMoving v1');
  }

  function handleQuoteApproval() {
    const costs = calculateTotalCost();
    console.log('Quote approved with total cost = ', costs.total);
  }


  function calculateTotalCost() {
    const {
      moveType,
      distances,
      loading,
      packingCost,
      truckRental,
      returnFlights,
      tolls,
      adjustments,
    } = calculatorState;

    // Example cost logic from your original code
    const driverRate = moveType === 'one-way' ? adjustments.driverHourlyRate : 50;
    const totalDrivingHours = distances.drivingHours + Math.floor(distances.drivingHours / 6) * 2;
    const driverPay = totalDrivingHours * driverRate;
    const gallonsNeeded = distances.totalMiles / 5;
    const fuelCost = gallonsNeeded * adjustments.gasPrice;
    const laborCost = loading.workers * loading.days * adjustments.workerDailyRate;
    const hotelCost = distances.drivingDays * adjustments.hotelRate;
    const perDiemCost = distances.drivingDays * adjustments.perDiemRate * (moveType === 'one-way' ? 1 : 2);

    let truckCost = 0;
    if (moveType === 'round-trip') {
      truckCost =
        truckRental.days * adjustments.truckDailyRate + distances.totalMiles * adjustments.truckMileageRate;
    } else {
      truckCost = truckRental.cost;
    }

    const flightCost = moveType === 'one-way' ? returnFlights * adjustments.flightTicketRate : 0;
    const tollCost = tolls * 100 * (moveType === 'round-trip' ? 2 : 1);

    const total =
      driverPay +
      fuelCost +
      laborCost +
      hotelCost +
      perDiemCost +
      truckCost +
      flightCost +
      tollCost +
      packingCost;

    return {
      driverPay,
      fuelCost,
      laborCost,
      hotelCost,
      perDiemCost,
      truckCost,
      flightCost,
      tollCost,
      packingCost,
      total,
    };
  }

  function renderCalculatorStep() {
    switch (currentStep) {
      case 'move-type':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Move Type</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setCalculatorState(prev => ({ ...prev, moveType: 'one-way' }));
                  setCurrentStep('addresses');
                }}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  calculatorState.moveType === 'one-way'
                    ? 'border-red-500 bg-red-50 text-gray-900 font-medium'
                    : 'border-red-200 hover:border-red-500 text-gray-900 hover:bg-red-50'
                }`}
              >
                One-Way Move
              </button>
              <button
                onClick={() => {
                  setCalculatorState(prev => ({ ...prev, moveType: 'round-trip' }));
                  setCurrentStep('addresses');
                }}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  calculatorState.moveType === 'round-trip'
                    ? 'border-red-500 bg-red-50 text-gray-900 font-medium'
                    : 'border-red-200 hover:border-red-500 text-gray-900 hover:bg-red-50'
                }`}
              >
                Round-Trip Move
              </button>
            </div>
          </div>
        );

      case 'addresses':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Addresses</h3>
            <div className="grid grid-cols-1 gap-6">
              {(['warehouse', 'pickup', 'delivery'] as AddressKey[]).map((type) => (
                <div key={type} className="space-y-4">
                  <h4 className="font-medium text-gray-900 capitalize">{type} Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={commonStyles.label}>Street</label>
                      <input
                        type="text"
                        value={calculatorState.addresses[type].street}
                        onChange={(e) => setCalculatorState(prev => ({
                          ...prev,
                          addresses: {
                            ...prev.addresses,
                            [type]: { ...prev.addresses[type], street: e.target.value }
                          }
                        }))}
                        className={commonStyles.input}
                        placeholder="Enter street address"
                      />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className={commonStyles.label}>City</label>
                        <input
                          type="text"
                          value={calculatorState.addresses[type].city}
                          onChange={(e) => setCalculatorState(prev => ({
                            ...prev,
                            addresses: {
                              ...prev.addresses,
                              [type]: { ...prev.addresses[type], city: e.target.value }
                            }
                          }))}
                          className={commonStyles.input}
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className={commonStyles.label}>State</label>
                        <input
                          type="text"
                          value={calculatorState.addresses[type].state}
                          onChange={(e) => setCalculatorState(prev => ({
                            ...prev,
                            addresses: {
                              ...prev.addresses,
                              [type]: { ...prev.addresses[type], state: e.target.value }
                            }
                          }))}
                          className={commonStyles.input}
                          placeholder="State"
                        />
                      </div>
                      <div>
                        <label className={commonStyles.label}>ZIP</label>
                        <input
                          type="text"
                          value={calculatorState.addresses[type].zip}
                          onChange={(e) => setCalculatorState(prev => ({
                            ...prev,
                            addresses: {
                              ...prev.addresses,
                              [type]: { ...prev.addresses[type], zip: e.target.value }
                            }
                          }))}
                          className={commonStyles.input}
                          placeholder="ZIP"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {calculatorState.moveType === 'one-way' && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Nearest Airport (for return flight)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={commonStyles.label}>Airport Name/Code</label>
                      <input
                        type="text"
                        value={calculatorState.addresses.airport?.street || ''}
                        onChange={(e) => setCalculatorState(prev => ({
                          ...prev,
                          addresses: {
                            ...prev.addresses,
                            airport: { ...prev.addresses.airport || { city: '', state: '', zip: '' }, street: e.target.value }
                          }
                        }))}
                        className={commonStyles.input}
                        placeholder="Enter airport name or code"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep('move-type')}
                className="px-4 py-2 text-sm font-medium text-gray-900 hover:text-red-600"
              >
                Back
              </button>
              <button
                onClick={() => {
                  setCalculatorState(prev => ({
                    ...prev,
                    distances: {
                      totalMiles: 1200,
                      drivingHours: 20,
                      drivingDays: Math.ceil(20 / 9)
                    }
                  }));
                  setCurrentStep('loading-labor');
                }}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg font-medium"
              >
                Calculate Distance & Continue
              </button>
            </div>
          </div>
        );

      case 'loading-labor':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Loading Labor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={commonStyles.label}>Number of Workers</label>
                <input
                  type="number"
                  min="1"
                  value={calculatorState.loading.workers}
                  onChange={(e) => setCalculatorState(prev => ({
                    ...prev,
                    loading: { ...prev.loading, workers: parseInt(e.target.value) || 0 }
                  }))}
                  className={commonStyles.input}
                />
              </div>
              <div>
                <label className={commonStyles.label}>Number of Days</label>
                <input
                  type="number"
                  min="1"
                  value={calculatorState.loading.days}
                  onChange={(e) => setCalculatorState(prev => ({
                    ...prev,
                    loading: { ...prev.loading, days: parseInt(e.target.value) || 0 }
                  }))}
                  className={commonStyles.input}
                />
              </div>
            </div>
            <div className={commonStyles.costDisplay}>
              <p className="text-sm text-gray-700">
                Labor cost per worker per day: <span className="font-medium text-gray-900">${calculatorState.adjustments.workerDailyRate}</span>
              </p>
              <p className="text-lg font-semibold text-gray-900 mt-2">
                Total Labor Cost: ${(calculatorState.loading.workers * calculatorState.loading.days * calculatorState.adjustments.workerDailyRate).toFixed(2)}
              </p>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep('addresses')}
                className="px-4 py-2 text-sm font-medium text-gray-900 hover:text-red-600"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep('packing')}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg font-medium"
              >
                Next
              </button>
            </div>
          </div>
        );

      case 'packing':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Packing Supplies</h3>
            <div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="needsPacking"
                  checked={calculatorState.needsPacking}
                  onChange={(e) => setCalculatorState(prev => ({
                    ...prev,
                    needsPacking: e.target.checked,
                    packingCost: e.target.checked ? prev.packingCost : 0
                  }))}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="needsPacking" className="text-sm font-medium text-gray-700">
                  Customer needs packing supplies
                </label>
              </div>
              {calculatorState.needsPacking && (
                <div className="mt-4">
                  <label className={commonStyles.label}>Packing Cost</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={calculatorState.packingCost}
                      onChange={(e) => setCalculatorState(prev => ({
                        ...prev,
                        packingCost: parseFloat(e.target.value) || 0
                      }))}
                      className={commonStyles.inputWithPrefix}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep('loading-labor')}
                className="px-4 py-2 text-sm font-medium text-gray-900 hover:text-red-600"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep('truck-rental')}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg font-medium"
              >
                Next
              </button>
            </div>
          </div>
        );

      case 'truck-rental':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Truck Rental</h3>
            {calculatorState.moveType === 'one-way' ? (
              <div>
                <label className={commonStyles.label}>One-Way Truck Rental Cost (26-foot truck)</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={calculatorState.truckRental.cost}
                    onChange={(e) => setCalculatorState(prev => ({
                      ...prev,
                      truckRental: { ...prev.truckRental, cost: parseFloat(e.target.value) || 0 }
                    }))}
                    className={commonStyles.inputWithPrefix}
                    placeholder="Enter Penske quote"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className={commonStyles.label}>Number of Days</label>
                  <input
                    type="number"
                    min="1"
                    value={calculatorState.truckRental.days}
                    onChange={(e) => setCalculatorState(prev => ({
                      ...prev,
                      truckRental: { ...prev.truckRental, days: parseInt(e.target.value) || 0 }
                    }))}
                    className={commonStyles.input}
                  />
                </div>
              </div>
            )}
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep('packing')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(calculatorState.moveType === 'one-way' ? 'plane-tickets' : 'review')}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg"
              >
                Next
              </button>
            </div>
          </div>
        );

      case 'plane-tickets':
        if (calculatorState.moveType !== 'one-way') return null;
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Return Flights</h3>
            <div>
              <label className={commonStyles.label}>Number of Return Tickets Needed</label>
              <input
                type="number"
                min="1"
                value={calculatorState.returnFlights}
                onChange={(e) => setCalculatorState(prev => ({
                  ...prev,
                  returnFlights: parseInt(e.target.value) || 0
                }))}
                className={commonStyles.input}
              />
            </div>
            <div className={commonStyles.costDisplay}>
              <p className="text-sm text-gray-900">Cost per ticket: ${calculatorState.adjustments.flightTicketRate}</p>
              <p className="text-lg font-semibold text-gray-900 mt-2">
                Total Flight Cost: ${(calculatorState.returnFlights * calculatorState.adjustments.flightTicketRate).toFixed(2)}
              </p>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep('truck-rental')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep('review')}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg"
              >
                Next
              </button>
            </div>
          </div>
        );

      case 'review':
        const costs = calculateTotalCost();
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Review Quote</h3>
            <div className={commonStyles.costDisplay}>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(costs).map(([key, value]) => {
                  if (key === 'total') return null;
                  if (key === 'flightCost' && calculatorState.moveType !== 'one-way') return null;
                  if (key === 'packingCost' && !calculatorState.needsPacking) return null;
                  
                  return (
                    <div key={key} className="p-3 bg-gray-50 rounded-lg border border-red-100">
                      <span className="text-sm text-gray-700">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <p className="text-lg font-medium text-gray-900 mt-2">${value.toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>
              <div className="border-t-2 border-red-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold text-gray-900">Total Estimate</span>
                  <span className="text-3xl font-bold text-red-600">${costs.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(calculatorState.moveType === 'one-way' ? 'plane-tickets' : 'truck-rental')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Back
              </button>
              <div className="space-x-4">
                <button
                  onClick={() => setIsAdjustmentModalOpen(true)}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Adjust Estimate
                </button>
                <button
                  onClick={handleQuoteApproval}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg"
                >
                  Approve Quote
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Nav */}
      <nav className="bg-white shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                PoinDex Quote Calculator
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  {user?.firstName?.[0] || 'U'}
                </div>
                <span className="text-gray-700">{user?.firstName}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* View Toggle Bar */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3 flex justify-center space-x-4">
            <button
              onClick={() => setView('split')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                view === 'split'
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setView('leads')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                view === 'leads'
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Full Leads
            </button>
            <button
              onClick={() => setView('calculator')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                view === 'calculator'
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Full Calculator
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className={`${view === 'split' ? 'grid grid-cols-2 gap-6 p-6 h-full' : 'h-full'}`}>
          {/* Leads Table */}
          {(view === 'split' || view === 'leads') && (
            <div className="flex flex-col bg-white shadow-sm rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-gray-800">Leads</h2>
                  <button className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-colors duration-200">
                    Add New Lead
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-full text-red-600">
                    {error}
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Move Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Branch
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Opportunity Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Move Size
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Source
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {lead.status || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {lead.moveType || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {lead.serviceDate || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                            {lead.customerName || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {lead.branch || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {lead.opportunityType || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {lead.pickupAddress || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {lead.moveSize || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {lead.leadSource || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleDeleteLead(lead.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Quote Calculator */}
          {(view === 'split' || view === 'calculator') && (
            <div className="flex flex-col bg-white shadow-sm rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-800">Quote Calculator</h2>
              </div>
              <div className="flex-1 p-6 overflow-auto">
                <div className={`${view !== 'split' ? 'max-w-2xl mx-auto w-full' : ''}`}>
                  {renderCalculatorStep()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <AdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        adjustments={calculatorState.adjustments}
        onSave={(newAdjustments) => {
          setCalculatorState(prev => ({
            ...prev,
            adjustments: newAdjustments
          }));
        }}
      />
    </div>
  );
}
