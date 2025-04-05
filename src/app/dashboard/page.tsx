'use client';

import { useEffect, useState } from 'react';

/** The shape of your lead data. Adjust as needed. */
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

type MoveType = 'one-way' | 'round-trip';

export default function DashboardPage() {
  // 1) Which view to show?
  const [view, setView] = useState<'split' | 'leads' | 'calculator'>('split');

  // 2) Leads table state
  const [leads, setLeads] = useState<SmartMovingLead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    async function loadLeads() {
      try {
        setLoadingLeads(true);
        const res = await fetch('/services'); // your Next.js route to fetch leads from SmartMoving
        if (!res.ok) {
          throw new Error(`Failed to fetch leads. Status: ${res.status}`);
        }
        const data: SmartMovingLead[] = await res.json();
        setLeads(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching leads:', err);
        setError('Failed to load leads');
      } finally {
        setLoadingLeads(false);
      }
    }
    loadLeads();
  }, []);

  // 3) Calculator states
  const [moveType, setMoveType] = useState<MoveType>('one-way');

  const [warehouseStart, setWarehouseStart] = useState('3045 S 46th St, Phoenix AZ 85040');
  const [warehouseReturn, setWarehouseReturn] = useState('3045 S 46th St, Phoenix AZ 85040');
  const [pickup, setPickup] = useState('');
  const [delivery, setDelivery] = useState('');

  const [totalMiles, setTotalMiles] = useState(0);
  const [gpsDriveHours, setGpsDriveHours] = useState(0);
  const [numTolls, setNumTolls] = useState(0);

  const [gasPrice, setGasPrice] = useState(3.5);
  const [laborRate, setLaborRate] = useState(300);

  // Toggle for hotel/per diem
  const [needsHotel, setNeedsHotel] = useState(false);
  const [hotelRate, setHotelRate] = useState(150);
  const [perDiemRate, setPerDiemRate] = useState(50);

  const [oneWayDriverHourly, setOneWayDriverHourly] = useState(40);
  const [roundTripDriverHourly, setRoundTripDriverHourly] = useState(50);

  const [numWorkers, setNumWorkers] = useState(2);
  const [numLaborDays, setNumLaborDays] = useState(1);

  const [needsPacking, setNeedsPacking] = useState(false);
  const [packingCost, setPackingCost] = useState(0);

  const [penskeCity, setPenskeCity] = useState('');
  const [oneWayTruckCost, setOneWayTruckCost] = useState(0);

  const [truckDailyRate, setTruckDailyRate] = useState(300);
  const [truckMileageRate, setTruckMileageRate] = useState(0.3);

  const [numReturnFlights, setNumReturnFlights] = useState(2);
  const [flightTicketRate, setFlightTicketRate] = useState(500);

  // 4) Import leads -> set pickup/delivery, switch to calculator
  function handleImportLead(lead: SmartMovingLead) {
    let pickupAddr = lead.originAddressFull?.trim()
      || `${lead.originStreet||''} ${lead.originCity||''}`.trim();
    let deliveryAddr = lead.destinationAddressFull?.trim()
      || `${lead.destinationStreet||''} ${lead.destinationCity||''}`.trim();

    setPickup(pickupAddr);
    setDelivery(deliveryAddr);
    setView('calculator');
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            PointDex Quote Calculator
          </h1>
        </div>
      </header>

      {/* View Toggle Bar */}
      <nav className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-2 flex space-x-3 justify-center">
          <ViewToggle label="Split View" current={view} setView={setView} mode="split" />
          <ViewToggle label="Full Leads" current={view} setView={setView} mode="leads" />
          <ViewToggle label="Full Calculator" current={view} setView={setView} mode="calculator" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4">
        <div className={view === 'split' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6 h-full' : 'h-full'}>
          {/* LEFT: Leads */}
          {(view === 'split' || view === 'leads') && (
            <div className="bg-white p-4 rounded-md shadow flex flex-col">
              <h2 className="text-xl font-bold text-black mb-4">Leads</h2>
              {loadingLeads ? (
                <p className="text-black">Loading leads...</p>
              ) : error ? (
                <p className="text-red-600">{error}</p>
              ) : (
                <table className="min-w-full border text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 border text-black">Name</th>
                      <th className="px-3 py-2 border text-black">Origin</th>
                      <th className="px-3 py-2 border text-black">Destination</th>
                      <th className="px-3 py-2 border text-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map(lead => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 border text-black">
                          {lead.customerName||'N/A'}
                        </td>
                        <td className="px-3 py-2 border text-black">
                          {lead.originAddressFull||'N/A'}
                        </td>
                        <td className="px-3 py-2 border text-black">
                          {lead.destinationAddressFull||'N/A'}
                        </td>
                        <td className="px-3 py-2 border text-black">
                          <button
                            onClick={() => handleImportLead(lead)}
                            className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                          >
                            Import
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* RIGHT: Calculator */}
          {(view === 'split' || view === 'calculator') && (
            <div className="bg-white p-4 rounded-md shadow flex flex-col">
              <SinglePageCalculator
                moveType={moveType}
                setMoveType={setMoveType}
                warehouseStart={warehouseStart}
                setWarehouseStart={setWarehouseStart}
                warehouseReturn={warehouseReturn}
                setWarehouseReturn={setWarehouseReturn}
                pickup={pickup}
                setPickup={setPickup}
                delivery={delivery}
                setDelivery={setDelivery}

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

                needsHotel={needsHotel}
                setNeedsHotel={setNeedsHotel}
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

/** Simple view toggle helper */
function ViewToggle({
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
        }`}
    >
      {label}
    </button>
  );
}

/** The full single-page calculator component */
function SinglePageCalculator(props: {
  // move type
  moveType: MoveType;
  setMoveType: (v: MoveType) => void;

  // addresses
  warehouseStart: string;
  setWarehouseStart: (v: string) => void;
  warehouseReturn: string;
  setWarehouseReturn: (v: string) => void;
  pickup: string;
  setPickup: (v: string) => void;
  delivery: string;
  setDelivery: (v: string) => void;

  // distance/time
  totalMiles: number;
  setTotalMiles: (v: number) => void;
  gpsDriveHours: number;
  setGpsDriveHours: (v: number) => void;
  numTolls: number;
  setNumTolls: (v: number) => void;

  // manager-adjustable rates
  gasPrice: number;
  setGasPrice: (v: number) => void;
  laborRate: number;
  setLaborRate: (v: number) => void;

  // Hotel toggle
  needsHotel: boolean;
  setNeedsHotel: (v: boolean) => void;
  hotelRate: number;
  setHotelRate: (v: number) => void;
  perDiemRate: number;
  setPerDiemRate: (v: number) => void;

  oneWayDriverHourly: number;
  setOneWayDriverHourly: (v: number) => void;
  roundTripDriverHourly: number;
  setRoundTripDriverHourly: (v: number) => void;

  // loading labor
  numWorkers: number;
  setNumWorkers: (v: number) => void;
  numLaborDays: number;
  setNumLaborDays: (v: number) => void;

  // packing
  needsPacking: boolean;
  setNeedsPacking: (v: boolean) => void;
  packingCost: number;
  setPackingCost: (v: number) => void;

  // truck rental
  penskeCity: string;
  setPenskeCity: (v: string) => void;
  oneWayTruckCost: number;
  setOneWayTruckCost: (v: number) => void;
  truckDailyRate: number;
  setTruckDailyRate: (v: number) => void;
  truckMileageRate: number;
  setTruckMileageRate: (v: number) => void;

  // flights
  numReturnFlights: number;
  setNumReturnFlights: (v: number) => void;
  flightTicketRate: number;
  setFlightTicketRate: (v: number) => void;
}) {
  const {
    moveType, setMoveType,
    warehouseStart, warehouseReturn, pickup, delivery,
    totalMiles, setTotalMiles,
    gpsDriveHours, setGpsDriveHours,
    numTolls, setNumTolls,
    gasPrice, setGasPrice,
    laborRate, setLaborRate,
    needsHotel, setNeedsHotel,
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
    numReturnFlights, setNumReturnFlights,
    flightTicketRate, setFlightTicketRate
  } = props;

  // Store nearest airport name for one-way moves
  const [nearestAirport, setNearestAirport] = useState('');

  // Handle the multi-leg route fetch
  async function handleDistanceCalc() {
    if (!moveType || !warehouseStart || !pickup || !delivery) {
      alert('Please fill in moveType, warehouseStart, pickup, and delivery');
      return;
    }

    try {
      const body = {
        moveType,
        warehouse: warehouseStart,
        pickup,
        delivery,
        returnWarehouse: warehouseReturn // used if round-trip
      };

      const res = await fetch('/api/calculate-distance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to calculate route');
      }
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to calculate route');
      }

      const { distance, duration, nearestAirport: airportName } = data.data;
      setTotalMiles(distance);
      setGpsDriveHours(duration / 60);

      // If one-way, get nearest airport from the response
      if (moveType === 'one-way' && airportName) {
        setNearestAirport(airportName);
      } else {
        setNearestAirport('');
      }

      alert(`Route = ${distance.toFixed(1)} miles, ~${(duration/60).toFixed(1)} hours`);
    } catch (err: any) {
      alert(`Error calculating route: ${err.message}`);
      console.error(err);
    }
  }

  // Basic cost logic
  function calculateCost() {
    // extra hours = +2 for every 6 hours of GPS time
    const extraHours = Math.floor(gpsDriveHours / 6) * 2;
    const adjustedDriveHours = gpsDriveHours + extraHours;
    const drivingDays = Math.ceil(gpsDriveHours / 9);

    const driverRate = (moveType === 'one-way')
      ? oneWayDriverHourly
      : roundTripDriverHourly;

    const driverPay = adjustedDriveHours * driverRate;
    const gallons = totalMiles / 5;
    const fuelCost = gallons * gasPrice;

    const laborCost = numWorkers * numLaborDays * laborRate;

    // Hotel & PerDiem only if toggled
    let hotelCost = 0;
    let perDiemCost = 0;
    if (needsHotel) {
      hotelCost = drivingDays * hotelRate;
      perDiemCost = drivingDays * perDiemRate;
    }

    const packing = needsPacking ? packingCost : 0;

    // Determine truck cost
    // For round-trip: truck days = labor days + driving days
    // For one-way: a fixed cost
    let truckCost = 0;
    if (moveType === 'one-way') {
      truckCost = oneWayTruckCost;
    } else {
      const roundTripTruckDays = numLaborDays + drivingDays;
      truckCost =
        roundTripTruckDays * truckDailyRate + totalMiles * truckMileageRate;
    }

    // flights only if one-way
    let flightCost = 0;
    if (moveType === 'one-way') {
      flightCost = numReturnFlights * flightTicketRate;
    }

    // toll cost
    const baseToll = numTolls * 100;
    const tollCost = (moveType === 'round-trip') ? baseToll * 2 : baseToll;

    const total =
      driverPay +
      fuelCost +
      laborCost +
      hotelCost +
      perDiemCost +
      packing +
      truckCost +
      flightCost +
      tollCost;

    return {
      adjustedDriveHours,
      drivingDays,
      driverPay,
      fuelCost,
      laborCost,
      hotelCost,
      perDiemCost,
      packingCost: packing,
      truckCost,
      flightCost,
      tollCost,
      total,
    };
  }

  const costs = calculateCost();
  const totalJobDays = costs.drivingDays + numLaborDays;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-black mb-3">Move Calculator</h2>

      {/* Top row: Move Type on left, "Calculate Distance" on right */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        {/* Move Type */}
        <div className="mb-2 md:mb-0">
          <label className="font-medium mr-3 text-black">Move Type:</label>
          <button
            onClick={() => setMoveType('one-way')}
            className={`px-3 py-1 mr-2 rounded border text-black ${
              moveType === 'one-way' ? 'border-red-500 bg-red-100' : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            One-Way
          </button>
          <button
            onClick={() => setMoveType('round-trip')}
            className={`px-3 py-1 rounded border text-black ${
              moveType === 'round-trip' ? 'border-red-500 bg-red-100' : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            Round-Trip
          </button>
        </div>

        {/* Button to fetch real route */}
        <div>
          <button
            onClick={handleDistanceCalc}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Calculate Distance
          </button>
        </div>
      </div>

      {/* If one-way, show nearest airport read-only */}
      {moveType === 'one-way' && (
        <div className="border p-3 rounded space-y-2">
          <label className="block text-black mb-2">
            <span className="font-medium">Nearest Airport (auto-filled):</span>
            <input
              type="text"
              readOnly
              className="border border-gray-300 rounded w-full mt-1 p-2 text-black bg-gray-50"
              value={nearestAirport}
            />
          </label>
        </div>
      )}

      {/* Addresses (2-column grid for compactness) */}
      <div className="border p-3 rounded space-y-3">
        <h3 className="font-semibold text-black">Addresses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Warehouse (Start)"
            value={warehouseStart}
            setValue={props.setWarehouseStart}
          />
          {moveType === 'round-trip' && (
            <TextField
              label="Warehouse (Return)"
              value={warehouseReturn}
              setValue={props.setWarehouseReturn}
            />
          )}
          <TextField
            label="Pick-up"
            value={pickup}
            setValue={props.setPickup}
          />
          <TextField
            label="Delivery"
            value={delivery}
            setValue={props.setDelivery}
          />
        </div>
      </div>

      {/* Miles, Hours, Tolls, Gas Price (4-column grid) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <NumberField label="Total Miles" value={totalMiles} setValue={setTotalMiles} />
        <NumberField label="GPS Drive Hours" value={gpsDriveHours} setValue={setGpsDriveHours} />
        <NumberField label="# Tolls" value={numTolls} setValue={setNumTolls} />
        <NumberField label="Gas Price ($/gallon)" value={gasPrice} setValue={setGasPrice} />
      </div>

      {/* 2-column row: Loading Labor | Hotel & Per Diem */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Loading Labor */}
        <div className="border p-3 rounded space-y-2">
          <h3 className="font-semibold text-black">Loading Labor</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NumberField
              label="# of Workers"
              value={numWorkers}
              setValue={setNumWorkers}
            />
            <NumberField
              label="# of Days"
              value={numLaborDays}
              setValue={setNumLaborDays}
            />
          </div>
          <NumberField
            label="Daily Rate ($/day/guy)"
            value={laborRate}
            setValue={setLaborRate}
          />
        </div>

        {/* Hotel & Per Diem Toggle */}
        <div className="border p-3 rounded space-y-2">
          <h3 className="font-semibold text-black">Hotel &amp; Per Diem</h3>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={needsHotel}
              onChange={e => setNeedsHotel(e.target.checked)}
            />
            <span className="text-black">Need Hotel?</span>
          </div>
          {needsHotel && (
            <>
              <NumberField
                label="Hotel Rate ($/night)"
                value={hotelRate}
                setValue={setHotelRate}
              />
              <NumberField
                label="Per Diem Rate ($/night/driver)"
                value={perDiemRate}
                setValue={setPerDiemRate}
              />
            </>
          )}
        </div>
      </div>

      {/* 2-column row: Packing | Truck Rental */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Packing */}
        <div className="border p-3 rounded space-y-2">
          <h3 className="font-semibold text-black">Packing Supplies</h3>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={needsPacking}
              onChange={e => {
                setNeedsPacking(e.target.checked);
                if (!e.target.checked) setPackingCost(0);
              }}
            />
            <span className="text-black">Needs packing supplies?</span>
          </div>
          {needsPacking && (
            <NumberField
              label="Packing Cost"
              value={packingCost}
              setValue={setPackingCost}
            />
          )}
        </div>

        {/* One-Way or Round-Trip Truck Rental */}
        <div className="border p-3 rounded space-y-2">
          {moveType === 'one-way' ? (
            <>
              <h3 className="font-semibold text-black">One-Way Truck Rental</h3>
              <TextField
                label="Rental City"
                value={penskeCity}
                setValue={setPenskeCity}
              />
              <NumberField
                label="One-Way Truck Cost"
                value={oneWayTruckCost}
                setValue={setOneWayTruckCost}
              />
            </>
          ) : (
            <>
              <h3 className="font-semibold text-black">Round-Trip Truck Rental</h3>
              <p className="text-sm text-black">
                Truck Days = Loading Days + Driving Days
              </p>
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
            </>
          )}
        </div>
      </div>

      {/* 2-column row: Return Flights (if one-way) | Driver Hourly Rates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Plane Tickets (One-Way Only) */}
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

        {/* Driver Hourly Rates (Conditional Display) */}
        <div className="border p-3 rounded space-y-2">
          <h3 className="font-semibold text-black">Driver Hourly Rates</h3>
          {moveType === 'one-way' && (
            <NumberField
              label="One-Way Rate ($/hr)"
              value={oneWayDriverHourly}
              setValue={setOneWayDriverHourly}
            />
          )}
          {moveType === 'round-trip' && (
            <NumberField
              label="Round-Trip Rate ($/hr)"
              value={roundTripDriverHourly}
              setValue={setRoundTripDriverHourly}
            />
          )}
        </div>
      </div>

      {/* Final Cost Breakdown (full width) */}
      {(() => {
        const costs = calculateCost();
        return (
          <div className="border p-3 rounded space-y-4 bg-gray-50">
            <h3 className="font-bold text-lg text-black">Cost Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <LineItem label="Driver Pay" value={costs.driverPay} />
              <LineItem label="Fuel" value={costs.fuelCost} />
              <LineItem label="Loading Labor" value={costs.laborCost} />
              {needsHotel && <LineItem label="Hotel" value={costs.hotelCost} />}
              {needsHotel && <LineItem label="Per Diem" value={costs.perDiemCost} />}
              {needsPacking && (
                <LineItem label="Packing" value={costs.packingCost} />
              )}
              <LineItem label="Truck Cost" value={costs.truckCost} />
              {moveType === 'one-way' && (
                <LineItem label="Flight Cost" value={costs.flightCost} />
              )}
              <LineItem label="Toll Cost" value={costs.tollCost} />
            </div>
            <hr />
            <div className="flex justify-between font-bold text-xl text-black">
              <span>Total</span>
              <span>${costs.total.toFixed(2)}</span>
            </div>

            {/* Extra info lines */}
            <div className="mt-2 text-sm text-black">
              <p>GPS Drive Hours: {gpsDriveHours.toFixed(1)}, Adjusted: {costs.adjustedDriveHours.toFixed(1)}</p>
              <p>Driving Days (9hr rule): {costs.drivingDays}</p>
              <p>Loading Days: {numLaborDays}</p>
              <p>Total Job Days: {totalJobDays}</p>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/** Basic text input field */
function TextField({
  label,
  value,
  setValue
}: {
  label: string;
  value: string;
  setValue: (val: string) => void;
}) {
  return (
    <label className="block text-black mb-2">
      <span className="font-medium">{label}</span>
      <input
        type="text"
        className="border border-gray-300 rounded w-full mt-1 p-2 text-black"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </label>
  );
}

/**
 * A numeric input that allows the user to delete the zero
 * without immediately snapping back to '0'.
 */
function NumberField({
  label,
  value,
  setValue
}: {
  label: string;
  value: number;
  setValue: (val: number) => void;
}) {
  const [localValue, setLocalValue] = useState(value === 0 ? '' : String(value));

  useEffect(() => {
    if (value === 0) {
      setLocalValue('');
    } else {
      setLocalValue(String(value));
    }
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setLocalValue(raw);

    if (raw.trim() === '') {
      setValue(0);
      return;
    }
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      setValue(parsed);
    }
  }

  return (
    <label className="block text-black mb-2">
      <span className="font-medium">{label}</span>
      <input
        type="number"
        className="border border-gray-300 rounded w-full mt-1 p-2 text-black"
        value={localValue}
        onChange={handleChange}
      />
    </label>
  );
}

/** A row for cost breakdown */
function LineItem({
  label,
  value
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex justify-between bg-white p-2 rounded text-black">
      <span>{label}</span>
      <span>${value.toFixed(2)}</span>
    </div>
  );
}
