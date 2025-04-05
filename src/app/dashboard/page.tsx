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
        const res = await fetch('/services'); // your Next.js route to fetch from SmartMoving
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
  const [truckDays, setTruckDays] = useState(1);

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
                        <td className="px-3 py-2 border text-black">{lead.customerName||'N/A'}</td>
                        <td className="px-3 py-2 border text-black">{lead.originAddressFull||'N/A'}</td>
                        <td className="px-3 py-2 border text-black">{lead.destinationAddressFull||'N/A'}</td>
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
  truckDays: number;
  setTruckDays: (v: number) => void;

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
    ...rest
  } = props;

  // Handle the multi-leg route fetch
  async function handleDistanceCalc() {
    // We must pass {moveType, warehouse, pickup, delivery, returnWarehouse}
    if (!moveType || !warehouseStart || !pickup || !delivery) {
      alert('Please fill in moveType, warehouseStart, pickup, and delivery');
      return;
    }

    try {
      const body = {
        moveType,
        warehouse: warehouseStart, // The server expects 'warehouse' for the start
        pickup,
        delivery,
        returnWarehouse: warehouseReturn // if round-trip
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

      const { distance, duration } = data.data; // miles + minutes
      setTotalMiles(distance);
      setGpsDriveHours(duration / 60);

      alert(`Route = ${distance.toFixed(1)} miles, ~${(duration/60).toFixed(1)} hours`);
    } catch (err: any) {
      alert(`Error calculating route: ${err.message}`);
      console.error(err);
    }
  }

  // Basic cost logic
  function calculateCost() {
    const extraHours = Math.floor(gpsDriveHours / 6) * 2;
    const adjustedDriveHours = gpsDriveHours + extraHours;
    const drivingDays = Math.ceil(gpsDriveHours / 9);

    const driverRate = (moveType === 'one-way')
      ? rest.oneWayDriverHourly
      : rest.roundTripDriverHourly;

    const driverPay = adjustedDriveHours * driverRate;
    const gallons = totalMiles / 5;
    const fuelCost = gallons * rest.gasPrice;

    const laborCost = rest.numWorkers * rest.numLaborDays * rest.laborRate;
    const hotelCost = drivingDays * rest.hotelRate;
    const perDiemCost = drivingDays * rest.perDiemRate * 1;

    const packing = rest.needsPacking ? rest.packingCost : 0;

    let truckCost = 0;
    if (moveType === 'one-way') {
      truckCost = rest.oneWayTruckCost;
    } else {
      truckCost = (rest.truckDays * rest.truckDailyRate)
        + (totalMiles * rest.truckMileageRate);
    }

    let flightCost = 0;
    if (moveType === 'one-way') {
      flightCost = rest.numReturnFlights * rest.flightTicketRate;
    }

    const tollBase = rest.numTolls * 100;
    const tollCost = (moveType === 'round-trip') ? tollBase * 2 : tollBase;

    const total = driverPay + fuelCost + laborCost + hotelCost + perDiemCost
      + packing + truckCost + flightCost + tollCost;

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
      total
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

      {/* Addresses */}
      <div className="border p-3 rounded space-y-3">
        <h3 className="font-semibold text-black">Addresses</h3>
        <TextField
          label="Warehouse (Start)"
          value={warehouseStart}
          setValue={props.setWarehouseStart}
        />
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
        {moveType === 'round-trip' && (
          <TextField
            label="Warehouse (Return)"
            value={warehouseReturn}
            setValue={props.setWarehouseReturn}
          />
        )}
      </div>

      {/* Button to fetch real route from /api/calculate-distance */}
      <button
        onClick={handleDistanceCalc}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Calculate Distance
      </button>

      {/* Miles, Hours, Tolls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <NumberField label="Total Miles" value={totalMiles} setValue={setTotalMiles} />
        <NumberField label="GPS Drive Hours" value={gpsDriveHours} setValue={setGpsDriveHours} />
        <NumberField label="# Tolls" value={rest.numTolls} setValue={rest.setNumTolls} />
      </div>

      {/* Gas Price */}
      <NumberField label="Gas Price ($/gallon)" value={rest.gasPrice} setValue={rest.setGasPrice} />

      {/* Loading Labor */}
      <div className="border p-3 rounded space-y-2">
        <h3 className="font-semibold text-black">Loading Labor</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberField label="# of Workers" value={rest.numWorkers} setValue={rest.setNumWorkers} />
          <NumberField label="# of Days" value={rest.numLaborDays} setValue={rest.setNumLaborDays} />
        </div>
        <NumberField label="Daily Rate ($/day/guy)" value={rest.laborRate} setValue={rest.setLaborRate} />
      </div>

      {/* Hotel & Per Diem */}
      <div className="border p-3 rounded space-y-2">
        <h3 className="font-semibold text-black">Hotel & Per Diem</h3>
        <NumberField label="Hotel Rate ($/night)" value={rest.hotelRate} setValue={rest.setHotelRate} />
        <NumberField label="Per Diem Rate ($/night/driver)" value={rest.perDiemRate} setValue={rest.setPerDiemRate} />
      </div>

      {/* Packing */}
      <div className="border p-3 rounded space-y-2">
        <h3 className="font-semibold text-black">Packing Supplies</h3>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={rest.needsPacking}
            onChange={e => {
              rest.setNeedsPacking(e.target.checked);
              if (!e.target.checked) rest.setPackingCost(0);
            }}
          />
          <span className="text-black">Needs packing supplies?</span>
        </div>
        {rest.needsPacking && (
          <NumberField
            label="Packing Cost"
            value={rest.packingCost}
            setValue={rest.setPackingCost}
          />
        )}
      </div>

      {/* One-Way or Round-Trip Truck Rental */}
      {moveType === 'one-way' ? (
        <div className="border p-3 rounded space-y-2">
          <h3 className="font-semibold text-black">One-Way Truck Rental</h3>
          <TextField
            label="Rental City"
            value={rest.penskeCity}
            setValue={rest.setPenskeCity}
          />
          <NumberField
            label="One-Way Truck Cost"
            value={rest.oneWayTruckCost}
            setValue={rest.setOneWayTruckCost}
          />
        </div>
      ) : (
        <div className="border p-3 rounded space-y-2">
          <h3 className="font-semibold text-black">Round-Trip Truck Rental</h3>
          <NumberField label="# of Truck Days" value={rest.truckDays} setValue={rest.setTruckDays} />
          <NumberField label="Truck Daily Rate ($/day)" value={rest.truckDailyRate} setValue={rest.setTruckDailyRate} />
          <NumberField label="Truck Mileage Rate ($/mile)" value={rest.truckMileageRate} setValue={rest.setTruckMileageRate} />
        </div>
      )}

      {/* Plane Tickets (One-Way Only) */}
      {moveType === 'one-way' && (
        <div className="border p-3 rounded space-y-2">
          <h3 className="font-semibold text-black">Return Flights</h3>
          <NumberField
            label="How many guys flying back?"
            value={rest.numReturnFlights}
            setValue={rest.setNumReturnFlights}
          />
          <NumberField
            label="Flight Ticket Rate"
            value={rest.flightTicketRate}
            setValue={rest.setFlightTicketRate}
          />
        </div>
      )}

      {/* Driver Hourly Rates */}
      <div className="border p-3 rounded space-y-2">
        <h3 className="font-semibold text-black">Driver Hourly Rates</h3>
        <NumberField
          label="One-Way Rate ($/hr)"
          value={rest.oneWayDriverHourly}
          setValue={rest.setOneWayDriverHourly}
        />
        <NumberField
          label="Round-Trip Rate ($/hr)"
          value={rest.roundTripDriverHourly}
          setValue={rest.setRoundTripDriverHourly}
        />
      </div>

      {/* Final Cost Breakdown */}
      {(() => {
        const costs = calculateCost();
        return (
          <div className="border p-3 rounded space-y-4 bg-gray-50">
            <h3 className="font-bold text-lg text-black">Cost Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <LineItem label="Driver Pay" value={costs.driverPay} />
              <LineItem label="Fuel" value={costs.fuelCost} />
              <LineItem label="Loading Labor" value={costs.laborCost} />
              <LineItem label="Hotel" value={costs.hotelCost} />
              <LineItem label="Per Diem" value={costs.perDiemCost} />
              <LineItem label="Packing" value={costs.packingCost} hide={!rest.needsPacking} />
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
              <p>GPS Drive Hours: {gpsDriveHours.toFixed(1)}, Adjusted: {costs.adjustedDriveHours.toFixed(1)}</p>
              <p>Driving Days (9hr rule): {costs.drivingDays}</p>
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

/** Basic numeric input field */
function NumberField({
  label,
  value,
  setValue
}: {
  label: string;
  value: number;
  setValue: (val: number) => void;
}) {
  return (
    <label className="block text-black mb-2">
      <span className="font-medium">{label}</span>
      <input
        type="number"
        className="border border-gray-300 rounded w-full mt-1 p-2 text-black"
        value={value}
        onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
      />
    </label>
  );
}

/** A row for cost breakdown */
function LineItem({
  label,
  value,
  hide
}: {
  label: string;
  value: number;
  hide?: boolean;
}) {
  if (hide) return null;
  return (
    <div className="flex justify-between bg-white p-2 rounded text-black">
      <span>{label}</span>
      <span>${value.toFixed(2)}</span>
    </div>
  );
}
