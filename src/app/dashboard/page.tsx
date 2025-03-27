'use client';

import { useEffect, useState } from 'react';

/** 
 * Example shape of a lead. 
 * Adjust fields per your actual data 
 */
interface SmartMovingLead {
  id: string;
  customerName?: string;
  status?: string;
  originAddressFull?: string;
  destinationAddressFull?: string;
  originStreet?: string;
  originCity?: string;
  destinationStreet?: string;
  destinationCity?: string;
  branch?: string;
  createdAt?: string;
}

/** The 10-step single-page move calculator states */
type MoveType = 'one-way' | 'round-trip';

export default function DashboardPage() {
  // ------------------- VIEW TOGGLE: leads/calculator/split -------------------
  const [view, setView] = useState<'split' | 'leads' | 'calculator'>('split');

  // ------------------- LEADS DATA -------------------
  const [leads, setLeads] = useState<SmartMovingLead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- Fetch from your Next.js route at /services ----
  useEffect(() => {
    async function loadLeads() {
      try {
        setLoadingLeads(true);
        const res = await fetch('/services');
        if (!res.ok) {
          throw new Error(`Failed to fetch leads. Status code: ${res.status}`);
        }
        const data: SmartMovingLead[] = await res.json();
        setLeads(data);
        setError(null);
      } catch (err) {
        console.error('Error loading leads:', err);
        setError('Failed to load leads');
      } finally {
        setLoadingLeads(false);
      }
    }
    loadLeads();
  }, []);

  // ------ CALCULATOR STATE (moved to parent) ------
  // 1) Move Type
  const [moveType, setMoveType] = useState<MoveType>('one-way');

  // 2) Addresses
  const [warehouse, setWarehouse] = useState('');
  const [pickup, setPickup] = useState('');
  const [delivery, setDelivery] = useState('');
  const [nearestAirport, setNearestAirport] = useState('');
  const [returnWarehouse, setReturnWarehouse] = useState('');

  // Let the user manually enter total miles / hours / tolls
  const [totalMiles, setTotalMiles] = useState(0);
  const [gpsDriveHours, setGpsDriveHours] = useState(0);
  const [numTolls, setNumTolls] = useState(0);

  // Manager-adjustable rates
  const [gasPrice, setGasPrice] = useState(3.5);
  const [laborRate, setLaborRate] = useState(300);
  const [hotelRate, setHotelRate] = useState(150);
  const [perDiemRate, setPerDiemRate] = useState(50);
  const [oneWayDriverHourly, setOneWayDriverHourly] = useState(40);
  const [roundTripDriverHourly, setRoundTripDriverHourly] = useState(50);

  // 4) Loading Labor
  const [numWorkers, setNumWorkers] = useState(2);
  const [numLaborDays, setNumLaborDays] = useState(1);

  // 6) Packing Supplies
  const [needsPacking, setNeedsPacking] = useState(false);
  const [packingCost, setPackingCost] = useState(0);

  // 7) One-Way Truck Rental
  const [penskeCity, setPenskeCity] = useState('');
  const [oneWayTruckCost, setOneWayTruckCost] = useState(0);

  // 8) Round-Trip Truck Cost
  const [truckDailyRate, setTruckDailyRate] = useState(300);
  const [truckMileageRate, setTruckMileageRate] = useState(0.3);
  const [truckDays, setTruckDays] = useState(1);

  // 9) Plane Tickets
  const [numReturnFlights, setNumReturnFlights] = useState(2);
  const [flightTicketRate, setFlightTicketRate] = useState(500);

  // --------------- HELPER: IMPORT LEAD ADDRESSES ---------------
  function handleImportLead(lead: SmartMovingLead) {
    // For the sake of example, let's treat "origin" as the "pickup" 
    // and "destination" as "delivery":
    // If we want to do "warehouse" or "returnWarehouse," 
    // that would be up to your logic.
    let pickupAddr = '';
    if (lead.originAddressFull && lead.originAddressFull.trim()) {
      pickupAddr = lead.originAddressFull.trim();
    } else {
      // fallback to originStreet + originCity
      pickupAddr = `${lead.originStreet || ''} ${lead.originCity || ''}`.trim();
    }

    let deliveryAddr = '';
    if (lead.destinationAddressFull && lead.destinationAddressFull.trim()) {
      deliveryAddr = lead.destinationAddressFull.trim();
    } else {
      deliveryAddr = `${lead.destinationStreet || ''} ${lead.destinationCity || ''}`.trim();
    }

    setPickup(pickupAddr);
    setDelivery(deliveryAddr);

    // Optionally: set move type, etc. But we'll just do addresses for now.
    // Also you might want to set "view" to show the calculator automatically:
    setView('calculator');
  }

  // Toggle button for the top nav
  function ToggleButton({
    label,
    current,
    setView,
    mode
  }: {
    label: string;
    current: 'split' | 'leads' | 'calculator';
    setView: React.Dispatch<React.SetStateAction<'split' | 'leads' | 'calculator'>>;
    mode: 'split' | 'leads' | 'calculator';
  }) {
    const isActive = current === mode;
    return (
      <button
        onClick={() => setView(mode)}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors 
          ${
            isActive
              ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow'
              : 'bg-white border border-gray-300 text-black hover:bg-gray-50'
          }
        `}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* ------------ TOP NAV ------------ */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            PointDex Quote Calculator
          </h1>
        </div>
      </header>

      {/* ------------ VIEW TOGGLE BAR ------------ */}
      <nav className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex space-x-3 justify-center">
          <ToggleButton label="Split View" current={view} setView={setView} mode="split" />
          <ToggleButton label="Full Leads" current={view} setView={setView} mode="leads" />
          <ToggleButton label="Full Calculator" current={view} setView={setView} mode="calculator" />
        </div>
      </nav>

      {/* ------------ MAIN CONTENT AREA ------------ */}
      <main className="flex-1 overflow-auto p-4">
        <div
          className={
            view === 'split'
              ? 'grid grid-cols-1 lg:grid-cols-2 gap-6 h-full'
              : 'h-full'
          }
        >
          {/* LEFT: LEADS TABLE */}
          {(view === 'split' || view === 'leads') && (
            <div
              className={`bg-white rounded-md shadow p-4 flex flex-col ${
                view === 'split' ? '' : 'max-w-6xl mx-auto'
              }`}
            >
              <h2 className="text-xl font-bold text-black mb-4">Leads</h2>
              {loadingLeads ? (
                <p className="text-black">Loading leads...</p>
              ) : error ? (
                <p className="text-red-600">{error}</p>
              ) : (
                <div className="overflow-auto flex-1">
                  <table className="min-w-full border text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 border text-black">Name</th>
                        <th className="px-3 py-2 border text-black">Status</th>
                        <th className="px-3 py-2 border text-black">Origin</th>
                        <th className="px-3 py-2 border text-black">Destination</th>
                        <th className="px-3 py-2 border text-black">Branch</th>
                        <th className="px-3 py-2 border text-black">Created</th>
                        <th className="px-3 py-2 border text-black">Import</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 border text-black">
                            {lead.customerName || 'N/A'}
                          </td>
                          <td className="px-3 py-2 border text-black">
                            {lead.status || 'N/A'}
                          </td>
                          <td className="px-3 py-2 border text-black">
                            {lead.originAddressFull
                              ? lead.originAddressFull
                              : `${lead.originStreet || ''} ${lead.originCity || ''}`
                            }
                          </td>
                          <td className="px-3 py-2 border text-black">
                            {lead.destinationAddressFull
                              ? lead.destinationAddressFull
                              : `${lead.destinationStreet || ''} ${lead.destinationCity || ''}`
                            }
                          </td>
                          <td className="px-3 py-2 border text-black">
                            {lead.branch || 'N/A'}
                          </td>
                          <td className="px-3 py-2 border text-black">
                            {lead.createdAt
                              ? new Date(lead.createdAt).toLocaleDateString()
                              : 'N/A'}
                          </td>
                          <td className="px-3 py-2 border text-black">
                            {/* 
                              NEW: Import to Calculator button
                              When clicked => calls handleImportLead(lead)
                            */}
                            <button
                              onClick={() => handleImportLead(lead)}
                              className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Import
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* RIGHT: CALCULATOR */}
          {(view === 'split' || view === 'calculator') && (
            <div
              className={`bg-white rounded-md shadow p-4 flex flex-col ${
                view === 'split' ? '' : 'max-w-6xl mx-auto mt-4 lg:mt-0'
              }`}
            >
              {/* We pass our calculator states + setters to SinglePageCalculator */}
              <SinglePageCalculator
                moveType={moveType}
                setMoveType={setMoveType}
                warehouse={warehouse}
                setWarehouse={setWarehouse}
                pickup={pickup}
                setPickup={setPickup}
                delivery={delivery}
                setDelivery={setDelivery}
                nearestAirport={nearestAirport}
                setNearestAirport={setNearestAirport}
                returnWarehouse={returnWarehouse}
                setReturnWarehouse={setReturnWarehouse}
                totalMiles={totalMiles}
                setTotalMiles={setTotalMiles}
                gpsDriveHours={gpsDriveHours}
                setGpsDriveHours={setGpsDriveHours}
                numTolls={numTolls}
                setNumTolls={setNumTolls}
                gasPrice={gasPrice}
                setGasPrice={setGasPrice}
                laborRate={laborRate}
                setLaborRate={setLaborRate}
                hotelRate={hotelRate}
                setHotelRate={setHotelRate}
                perDiemRate={perDiemRate}
                setPerDiemRate={setPerDiemRate}
                oneWayDriverHourly={oneWayDriverHourly}
                setOneWayDriverHourly={setOneWayDriverHourly}
                roundTripDriverHourly={roundTripDriverHourly}
                setRoundTripDriverHourly={setRoundTripDriverHourly}
                numWorkers={numWorkers}
                setNumWorkers={setNumWorkers}
                numLaborDays={numLaborDays}
                setNumLaborDays={setNumLaborDays}
                needsPacking={needsPacking}
                setNeedsPacking={setNeedsPacking}
                packingCost={packingCost}
                setPackingCost={setPackingCost}
                penskeCity={penskeCity}
                setPenskeCity={setPenskeCity}
                oneWayTruckCost={oneWayTruckCost}
                setOneWayTruckCost={setOneWayTruckCost}
                truckDailyRate={truckDailyRate}
                setTruckDailyRate={setTruckDailyRate}
                truckMileageRate={truckMileageRate}
                setTruckMileageRate={setTruckMileageRate}
                truckDays={truckDays}
                setTruckDays={setTruckDays}
                numReturnFlights={numReturnFlights}
                setNumReturnFlights={setNumReturnFlights}
                flightTicketRate={flightTicketRate}
                setFlightTicketRate={setFlightTicketRate}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/** 
 * SinglePageCalculator is now a "controlled component"
 * that receives all states + setters via props.
 */
function SinglePageCalculator(props: {
  moveType: MoveType;
  setMoveType: (val: MoveType) => void;

  warehouse: string;
  setWarehouse: (val: string) => void;

  pickup: string;
  setPickup: (val: string) => void;

  delivery: string;
  setDelivery: (val: string) => void;

  nearestAirport: string;
  setNearestAirport: (val: string) => void;

  returnWarehouse: string;
  setReturnWarehouse: (val: string) => void;

  totalMiles: number;
  setTotalMiles: (val: number) => void;

  gpsDriveHours: number;
  setGpsDriveHours: (val: number) => void;

  numTolls: number;
  setNumTolls: (val: number) => void;

  gasPrice: number;
  setGasPrice: (val: number) => void;

  laborRate: number;
  setLaborRate: (val: number) => void;

  hotelRate: number;
  setHotelRate: (val: number) => void;

  perDiemRate: number;
  setPerDiemRate: (val: number) => void;

  oneWayDriverHourly: number;
  setOneWayDriverHourly: (val: number) => void;

  roundTripDriverHourly: number;
  setRoundTripDriverHourly: (val: number) => void;

  numWorkers: number;
  setNumWorkers: (val: number) => void;

  numLaborDays: number;
  setNumLaborDays: (val: number) => void;

  needsPacking: boolean;
  setNeedsPacking: (val: boolean) => void;

  packingCost: number;
  setPackingCost: (val: number) => void;

  penskeCity: string;
  setPenskeCity: (val: string) => void;

  oneWayTruckCost: number;
  setOneWayTruckCost: (val: number) => void;

  truckDailyRate: number;
  setTruckDailyRate: (val: number) => void;

  truckMileageRate: number;
  setTruckMileageRate: (val: number) => void;

  truckDays: number;
  setTruckDays: (val: number) => void;

  numReturnFlights: number;
  setNumReturnFlights: (val: number) => void;

  flightTicketRate: number;
  setFlightTicketRate: (val: number) => void;
}) {
  const {
    moveType, setMoveType,
    warehouse, setWarehouse,
    pickup, setPickup,
    delivery, setDelivery,
    nearestAirport, setNearestAirport,
    returnWarehouse, setReturnWarehouse,
    totalMiles, setTotalMiles,
    gpsDriveHours, setGpsDriveHours,
    numTolls, setNumTolls,
    gasPrice, setGasPrice,
    laborRate, setLaborRate,
    hotelRate, setHotelRate,
    perDiemRate, setPerDiemRate,
    oneWayDriverHourly, setOneWayDriverHourly,
    roundTripDriverHourly, setRoundTripDriverHourly,
    numWorkers, setNumWorkers,
    numLaborDays, setNumLaborDays,
    needsPacking, setNeedsPacking,
    packingCost, setPackingCost,
    penskeCity, setPenskeCity,
    oneWayTruckCost, setOneWayTruckCost,
    truckDailyRate, setTruckDailyRate,
    truckMileageRate, setTruckMileageRate,
    truckDays, setTruckDays,
    numReturnFlights, setNumReturnFlights,
    flightTicketRate, setFlightTicketRate
  } = props;

  // Calculation logic
  function calculateCost() {
    const extraHours = Math.floor(gpsDriveHours / 6) * 2;
    const adjustedDriveHours = gpsDriveHours + extraHours;
    const drivingDays = Math.ceil(gpsDriveHours / 9);

    // 1) Driver Pay
    const driverRate = moveType === 'one-way' ? oneWayDriverHourly : roundTripDriverHourly;
    const driverPay = adjustedDriveHours * driverRate;

    // 2) Fuel
    const gallons = totalMiles / 5;
    const fuelCost = gallons * gasPrice;

    // 4) Loading Labor
    const laborCost = numWorkers * numLaborDays * laborRate;

    // 5) Hotel/PerDiem
    const totalHotel = hotelRate * drivingDays;
    const totalPerDiem = perDiemRate * drivingDays * 1; // assume 1 driver

    // 6) Packing
    const finalPacking = needsPacking ? packingCost : 0;

    // 7 & 8) Truck
    let truckCost = 0;
    if (moveType === 'one-way') {
      truckCost = oneWayTruckCost;
    } else {
      truckCost = truckDays * truckDailyRate + totalMiles * truckMileageRate;
    }

    // 9) Flight
    let flightCost = 0;
    if (moveType === 'one-way') {
      flightCost = numReturnFlights * flightTicketRate;
    }

    // 10) Tolls
    const tollBase = numTolls * 100;
    const tollCost = moveType === 'round-trip' ? tollBase * 2 : tollBase;

    const total =
      driverPay +
      fuelCost +
      laborCost +
      totalHotel +
      totalPerDiem +
      finalPacking +
      truckCost +
      flightCost +
      tollCost;

    return {
      adjustedDriveHours,
      drivingDays,
      driverPay,
      fuelCost,
      laborCost,
      hotelCost: totalHotel,
      perDiemCost: totalPerDiem,
      packingCost: finalPacking,
      truckCost,
      flightCost,
      tollCost,
      total,
    };
  }

  const costs = calculateCost();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-black mb-3">Move Calculator</h2>

      {/* Move Type */}
      <div>
        <label className="font-medium mr-3 text-black">Move Type:</label>
        <button
          onClick={() => setMoveType('one-way')}
          className={`px-3 py-1 mr-2 rounded border text-black ${
            moveType === 'one-way'
              ? 'border-red-500 bg-red-100'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          One-Way
        </button>
        <button
          onClick={() => setMoveType('round-trip')}
          className={`px-3 py-1 rounded border text-black ${
            moveType === 'round-trip'
              ? 'border-red-500 bg-red-100'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          Round-Trip
        </button>
      </div>

      {/* Addresses */}
      <div className="border p-3 rounded space-y-3">
        <h3 className="font-semibold text-black">Addresses</h3>
        {moveType === 'one-way' ? (
          <div className="space-y-2">
            <TextField label="Warehouse Address" value={warehouse} setValue={setWarehouse} />
            <TextField label="Pick-up Address" value={pickup} setValue={setPickup} />
            <TextField label="Delivery Address" value={delivery} setValue={setDelivery} />
            <TextField
              label="Nearest Airport (return flight)"
              value={nearestAirport}
              setValue={setNearestAirport}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <TextField label="Warehouse (start)" value={warehouse} setValue={setWarehouse} />
            <TextField label="Pick-up Address" value={pickup} setValue={setPickup} />
            <TextField label="Drop-off Address" value={delivery} setValue={setDelivery} />
            <TextField
              label="Warehouse (return)"
              value={returnWarehouse}
              setValue={setReturnWarehouse}
            />
          </div>
        )}
      </div>

      {/* Miles, Hours, Tolls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <NumberField label="Total Miles" value={totalMiles} setValue={setTotalMiles} />
        <NumberField label="GPS Drive Hours" value={gpsDriveHours} setValue={setGpsDriveHours} />
        <NumberField label="# Tolls" value={numTolls} setValue={setNumTolls} />
      </div>

      {/* Gas Price */}
      <NumberField label="Gas Price ($/gallon)" value={gasPrice} setValue={setGasPrice} />

      {/* Loading Labor */}
      <div className="border p-3 rounded space-y-2">
        <h3 className="font-semibold text-black">Loading Labor</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberField label="# of Workers" value={numWorkers} setValue={setNumWorkers} />
          <NumberField label="# of Days" value={numLaborDays} setValue={setNumLaborDays} />
        </div>
        <NumberField label="Daily Rate ($/day/guy)" value={laborRate} setValue={setLaborRate} />
      </div>

      {/* Hotel & Per Diem */}
      <div className="border p-3 rounded space-y-2">
        <h3 className="font-semibold text-black">Hotel & Per Diem</h3>
        <NumberField label="Hotel Rate ($/night)" value={hotelRate} setValue={setHotelRate} />
        <NumberField
          label="Per Diem Rate ($/night/driver)"
          value={perDiemRate}
          setValue={setPerDiemRate}
        />
      </div>

      {/* Packing */}
      <div className="border p-3 rounded space-y-2">
        <h3 className="font-semibold text-black">Packing Supplies</h3>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={needsPacking}
            onChange={(e) => {
              setNeedsPacking(e.target.checked);
              if (!e.target.checked) setPackingCost(0);
            }}
          />
          <span className="text-black">Does the customer need packing supplies?</span>
        </div>
        {needsPacking && (
          <NumberField
            label="Packing Cost"
            value={packingCost}
            setValue={setPackingCost}
          />
        )}
      </div>

      {/* Truck Rental */}
      {moveType === 'one-way' ? (
        <div className="border p-3 rounded space-y-2">
          <h3 className="font-semibold text-black">One-Way Truck Rental</h3>
          <TextField
            label="Rental City (Penske, 26-ft truck)"
            value={penskeCity}
            setValue={setPenskeCity}
          />
          <NumberField
            label="One-Way Truck Cost"
            value={oneWayTruckCost}
            setValue={setOneWayTruckCost}
          />
        </div>
      ) : (
        <div className="border p-3 rounded space-y-2">
          <h3 className="font-semibold text-black">Round-Trip Truck Rental</h3>
          <NumberField label="# of Truck Days" value={truckDays} setValue={setTruckDays} />
          <NumberField
            label="Truck Daily Rate ($/day)"
            value={truckDailyRate}
            setValue={setTruckDailyRate}
          />
          <NumberField
            label="Truck Mileage Rate ($/mile)"
            value={truckMileageRate}
            setValue={setTruckMileageRate}
          />
        </div>
      )}

      {/* Plane Tickets (One-Way) */}
      {moveType === 'one-way' && (
        <div className="border p-3 rounded space-y-2">
          <h3 className="font-semibold text-black">Return Flights</h3>
          <NumberField
            label="How many guys flying back?"
            value={numReturnFlights}
            setValue={setNumReturnFlights}
          />
          <NumberField
            label="Flight Ticket Rate"
            value={flightTicketRate}
            setValue={setFlightTicketRate}
          />
        </div>
      )}

      {/* Driver Hourly Rates */}
      <div className="border p-3 rounded space-y-2">
        <h3 className="font-semibold text-black">Driver Hourly Rates</h3>
        <NumberField
          label="One-Way Rate ($/hr)"
          value={oneWayDriverHourly}
          setValue={setOneWayDriverHourly}
        />
        <NumberField
          label="Round-Trip Rate ($/hr)"
          value={roundTripDriverHourly}
          setValue={setRoundTripDriverHourly}
        />
      </div>

      {/* Final Cost Breakdown */}
      <div className="border p-3 rounded space-y-4 bg-gray-50">
        <h3 className="font-bold text-lg text-black">Cost Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <LineItem label="Driver Pay" value={costs.driverPay} />
          <LineItem label="Fuel" value={costs.fuelCost} />
          <LineItem label="Loading Labor" value={costs.laborCost} />
          <LineItem label="Hotel" value={costs.hotelCost} />
          <LineItem label="Per Diem" value={costs.perDiemCost} />
          <LineItem label="Packing" value={costs.packingCost} hide={!needsPacking} />
          <LineItem label="Truck Cost" value={costs.truckCost} />
          <LineItem label="Flight Cost" value={costs.flightCost} hide={moveType !== 'one-way'} />
          <LineItem label="Toll Cost" value={costs.tollCost} />
        </div>
        <hr />
        <div className="flex justify-between font-bold text-xl text-black">
          <span>Total</span>
          <span>${costs.total.toFixed(2)}</span>
        </div>
        <div className="mt-2 text-sm text-black">
          <p>GPS Drive Hours: {gpsDriveHours}, Adjusted: {costs.adjustedDriveHours}</p>
          <p>Driving Days (9hr rule): {costs.drivingDays}</p>
        </div>
      </div>
    </div>
  );
}

/** 
 * Simple display line for final breakdown 
 */
function LineItem({ label, value, hide }: { label: string; value: number; hide?: boolean }) {
  if (hide) return null;
  return (
    <div className="flex justify-between px-2 py-1 bg-white rounded text-black">
      <span>{label}</span>
      <span>${value.toFixed(2)}</span>
    </div>
  );
}

/** Text-based input field with label. */
function TextField({
  label,
  value,
  setValue,
}: {
  label: string;
  value: string;
  setValue: (val: string) => void;
}) {
  return (
    <label className="block text-black">
      <span className="font-medium">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="block w-full mt-1 px-3 py-2 border border-gray-300 rounded-md 
                   text-black placeholder-gray-400 
                   focus:outline-none focus:ring-2 focus:ring-red-500"
      />
    </label>
  );
}

/** Numeric input field with label. */
function NumberField({
  label,
  value,
  setValue,
}: {
  label: string;
  value: number;
  setValue: (val: number) => void;
}) {
  return (
    <label className="block text-black">
      <span className="font-medium">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
        className="block w-full mt-1 px-3 py-2 border border-gray-300 rounded-md 
                   text-black placeholder-gray-400 
                   focus:outline-none focus:ring-2 focus:ring-red-500"
      />
    </label>
  );
}
