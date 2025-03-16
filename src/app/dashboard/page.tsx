// src/app/dashboard/page.tsx
'use client'; // Mark this as a Client Component
import { useUser, useClerk } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { smartMovingService, SmartMovingLead } from '../services/smartMoving';

type OppStatus = 'New' | 'Contacted' | 'Qualified' | 'Lost' | 'Won';

// Calculator types
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

// Common styles
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
          <div>
            <label className={commonStyles.label}>Worker Daily Rate ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={localAdjustments.workerDailyRate}
              onChange={(e) => setLocalAdjustments(prev => ({
                ...prev,
                workerDailyRate: parseFloat(e.target.value) || 0
              }))}
              className={commonStyles.input}
            />
          </div>
          <div>
            <label className={commonStyles.label}>Hotel Rate per Night ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={localAdjustments.hotelRate}
              onChange={(e) => setLocalAdjustments(prev => ({
                ...prev,
                hotelRate: parseFloat(e.target.value) || 0
              }))}
              className={commonStyles.input}
            />
          </div>
          <div>
            <label className={commonStyles.label}>Per Diem Rate ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={localAdjustments.perDiemRate}
              onChange={(e) => setLocalAdjustments(prev => ({
                ...prev,
                perDiemRate: parseFloat(e.target.value) || 0
              }))}
              className={commonStyles.input}
            />
          </div>
          <div>
            <label className={commonStyles.label}>Truck Daily Rate ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={localAdjustments.truckDailyRate}
              onChange={(e) => setLocalAdjustments(prev => ({
                ...prev,
                truckDailyRate: parseFloat(e.target.value) || 0
              }))}
              className={commonStyles.input}
            />
          </div>
          <div>
            <label className={commonStyles.label}>Truck Mileage Rate ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={localAdjustments.truckMileageRate}
              onChange={(e) => setLocalAdjustments(prev => ({
                ...prev,
                truckMileageRate: parseFloat(e.target.value) || 0
              }))}
              className={commonStyles.input}
            />
          </div>
          <div>
            <label className={commonStyles.label}>Flight Ticket Rate ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={localAdjustments.flightTicketRate}
              onChange={(e) => setLocalAdjustments(prev => ({
                ...prev,
                flightTicketRate: parseFloat(e.target.value) || 0
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
  const { user } = useClerk();
  const { signOut } = useClerk();
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
      gasPrice: 3.50,
      workerDailyRate: 300,
      hotelRate: 150,
      perDiemRate: 50,
      truckDailyRate: 300,
      truckMileageRate: 0.30,
      flightTicketRate: 500,
    }
  });
  const [leads, setLeads] = useState<SmartMovingLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch leads on component mount
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const fetchedLeads = await smartMovingService.getLeads();
      setLeads(fetchedLeads);
      setError(null);
    } catch (err) {
      setError('Failed to fetch leads. Please try again later.');
      console.error('Error fetching leads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLead = async (id: string) => {
    try {
      await smartMovingService.deleteLead(id);
      setLeads(prevLeads => prevLeads.filter(lead => lead.id !== id));
    } catch (err) {
      console.error('Error deleting lead:', err);
      // You might want to show an error message to the user here
    }
  };

  const handleQuoteApproval = async () => {
    const costs = calculateTotalCost();
    
    const newLead: Partial<SmartMovingLead> = {
      status: 'New',
      moveType: calculatorState.moveType === 'one-way' ? 'One-Way Move' : 'Round-Trip Move',
      serviceDate: new Date().toISOString().split('T')[0], // Today's date as default
      customerName: 'New Customer', // This should be collected during the quote process
      branch: calculatorState.addresses.warehouse.city,
      opportunityType: 'Moving',
      pickupAddress: `${calculatorState.addresses.pickup.street}, ${calculatorState.addresses.pickup.city}, ${calculatorState.addresses.pickup.state} ${calculatorState.addresses.pickup.zip}`,
      moveSize: `${calculatorState.loading.workers} Workers, ${calculatorState.loading.days} Days`,
      leadSource: 'Quote Calculator',
      createdAt: new Date().toISOString(),
      quoteAmount: costs.total
    };

    try {
      const createdLead = await smartMovingService.createLead(newLead);
      setLeads(prevLeads => [...prevLeads, createdLead]);

      // Reset calculator state
      setCalculatorState({
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
          gasPrice: 3.50,
          workerDailyRate: 300,
          hotelRate: 150,
          perDiemRate: 50,
          truckDailyRate: 300,
          truckMileageRate: 0.30,
          flightTicketRate: 500,
        }
      });

      setCurrentStep('move-type');
      setView('leads'); // Switch to leads view after approval
    } catch (err) {
      console.error('Error creating lead:', err);
      // You might want to show an error message to the user here
    }
  };

  // Sample leads data with new structure
  const sampleLeads = [
    {
      id: 1,
      oppStatus: 'New' as OppStatus,
      type: 'Residential',
      serviceDate: '2024-04-01',
      name: 'John Doe',
      branch: 'North Dallas',
      opportunityType: 'Moving',
      address: '1234 Main St, Dallas, TX 75001',
      moveSize: '2 Bedroom',
      source: 'Website',
      age: '2 days'
    },
    {
      id: 2,
      oppStatus: 'Contacted' as OppStatus,
      type: 'Commercial',
      serviceDate: '2024-04-15',
      name: 'Jane Smith',
      branch: 'South Austin',
      opportunityType: 'Storage',
      address: '5678 Business Ave, Austin, TX 78701',
      moveSize: 'Office (2000 sqft)',
      source: 'Referral',
      age: '1 day'
    },
    {
      id: 3,
      oppStatus: 'Qualified' as OppStatus,
      type: 'Residential',
      serviceDate: '2024-04-10',
      name: 'Mike Johnson',
      branch: 'West Houston',
      opportunityType: 'Moving',
      address: '910 Oak Lane, Houston, TX 77001',
      moveSize: '3 Bedroom',
      source: 'Google Ads',
      age: '5 days'
    },
  ];

  const ViewToggle = ({ currentView, viewType, label }: { currentView: string, viewType: 'split' | 'leads' | 'calculator', label: string }) => (
    <button
      onClick={() => setView(viewType)}
      className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        currentView === viewType
          ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-md'
          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
      }`}
    >
      {label}
    </button>
  );

  // Function to render status badge with appropriate color
  const StatusBadge = ({ status }: { status: OppStatus }) => {
    const colors: Record<OppStatus, string> = {
      'New': 'bg-green-100 text-green-800',
      'Contacted': 'bg-blue-100 text-blue-800',
      'Qualified': 'bg-yellow-100 text-yellow-800',
      'Lost': 'bg-red-100 text-red-800',
      'Won': 'bg-purple-100 text-purple-800'
    };
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[status]}`}>
        {status}
      </span>
    );
  };

  const calculateTotalCost = () => {
    const {
      moveType,
      distances,
      loading,
      packingCost,
      truckRental,
      returnFlights,
      tolls,
      adjustments
    } = calculatorState;

    // Driver pay
    const driverRate = moveType === 'one-way' ? adjustments.driverHourlyRate : 50;
    const totalDrivingHours = distances.drivingHours + Math.floor(distances.drivingHours / 6) * 2;
    const driverPay = totalDrivingHours * driverRate;

    // Fuel cost
    const gallonsNeeded = distances.totalMiles / 5;
    const fuelCost = gallonsNeeded * adjustments.gasPrice;

    // Loading labor
    const laborCost = loading.workers * loading.days * adjustments.workerDailyRate;

    // Hotel and per diem
    const hotelCost = distances.drivingDays * adjustments.hotelRate;
    const perDiemCost = distances.drivingDays * adjustments.perDiemRate * (moveType === 'one-way' ? 1 : 2);

    // Truck costs
    let truckCost = 0;
    if (moveType === 'round-trip') {
      truckCost = (truckRental.days * adjustments.truckDailyRate) + (distances.totalMiles * adjustments.truckMileageRate);
    } else {
      truckCost = truckRental.cost;
    }

    // Flight costs
    const flightCost = moveType === 'one-way' ? returnFlights * adjustments.flightTicketRate : 0;

    // Toll costs
    const tollCost = tolls * 100 * (moveType === 'round-trip' ? 2 : 1);

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
      total: driverPay + fuelCost + laborCost + hotelCost + perDiemCost + truckCost + flightCost + tollCost + packingCost
    };
  };

  const renderCalculatorStep = () => {
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
      {/* Top Navigation Bar */}
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
            <ViewToggle currentView={view} viewType="split" label="Split View" />
            <ViewToggle currentView={view} viewType="leads" label="Full Leads" />
            <ViewToggle currentView={view} viewType="calculator" label="Full Calculator" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className={`h-full ${view === 'split' ? 'grid grid-cols-2 gap-6 p-6' : ''}`}>
          {/* Leads Table */}
          {(view === 'split' || view === 'leads') && (
            <div className={`flex flex-col bg-white shadow-sm ${view === 'split' ? 'rounded-lg' : ''}`}>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opp Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opportunity Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Move Size</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={lead.status as OppStatus} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{lead.moveType}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{lead.serviceDate}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{lead.customerName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{lead.branch}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{lead.opportunityType}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{lead.pickupAddress}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{lead.moveSize}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{lead.leadSource}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(lead.createdAt).toLocaleDateString()}
                            </div>
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
            <div className={`flex flex-col bg-white shadow-sm ${view === 'split' ? 'rounded-lg' : ''}`}>
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