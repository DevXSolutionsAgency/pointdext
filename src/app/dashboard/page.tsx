'use client';

import { useEffect, useState } from 'react';
import { SmartMovingLead } from '../services/smartMoving';

type MoveType = 'one-way' | 'round-trip';

const defaultPackingItems = [
  { name: 'Small Box',          price: 3.25,  quantity: 0 },
  { name: 'Medium Box',         price: 4.25,  quantity: 0 },
  { name: 'Large Box',          price: 5.25,  quantity: 0 },
  { name: 'Dish Box',           price: 10,    quantity: 0 },
  { name: 'Dish Pack Inserts',  price: 12,    quantity: 0 },
  { name: 'TV Box',             price: 25,    quantity: 0 },
  { name: 'Wardrobe Box',       price: 20,    quantity: 0 },
  { name: 'Mattress Bag (King)',price: 15,    quantity: 0 },
  { name: 'Speed Pack',         price: 60,    quantity: 0 },
  { name: 'Paper Pad (Brown)',  price: 3,     quantity: 0 },
  { name: 'Packing Paper (200)',price: 40,    quantity: 0 },
  { name: 'Furniture Pad',      price: 20,    quantity: 0 },
  { name: '4 Pack Mirror Carton',price:25,    quantity: 0 },
  { name: 'Lamp Box',           price: 5,     quantity: 0 },
  { name: 'Piano Board',        price: 200,   quantity: 0 },
  { name: 'Straps/Tie Downs',   price: 10,    quantity: 0 },
  { name: 'Floor Protection',   price: 100,   quantity: 0 },
  { name: 'Mattress Box',       price: 45,    quantity: 0 },
  { name: 'Pre Move Package',   price: 100,   quantity: 0 },
  { name: 'French Cleat',       price: 20,    quantity: 0 },
];

export default function DashboardPage() {
  // 1) Which view to show?
  const [view, setView] = useState<'split' | 'leads' | 'calculator'>('split');

  // 2) Leads table state
  const [leads, setLeads] = useState<SmartMovingLead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<SmartMovingLead | null>(null);

  useEffect(() => {
    async function loadLeads() {
      try {
        setLoadingLeads(true);
        const res = await fetch('/services'); 
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

  const [gasPrice, setGasPrice] = useState(5);
  const [laborRate, setLaborRate] = useState(300);

  // Toggle for hotel/per diem
  const [needsHotel, setNeedsHotel] = useState(false);
  const [hotelRate, setHotelRate] = useState(150);
  const [perDiemRate, setPerDiemRate] = useState(50);

  const [oneWayDriverHourly, setOneWayDriverHourly] = useState(40);
  const [roundTripDriverHourly, setRoundTripDriverHourly] = useState(50);

  const [numDrivers, setNumDrivers] = useState(1);
  const [numWorkers, setNumWorkers] = useState(2);
  const [numLaborDays, setNumLaborDays] = useState(1);
  const [needsUnloaders, setNeedsUnloaders] = useState(false);
  const [unloadersRate, setUnloadersRate]   = useState(0);

  const [needsPacking, setNeedsPacking] = useState(false);

  const [penskeCity, setPenskeCity] = useState('');
  const [oneWayTruckCost, setOneWayTruckCost] = useState(0);

  const [truckDailyRate, setTruckDailyRate] = useState(300);
  const [truckMileageRate, setTruckMileageRate] = useState(0.3);

  const [numReturnFlights, setNumReturnFlights] = useState(2);
  const [flightTicketRate, setFlightTicketRate] = useState(0);

  // 4) Import leads -> set pickup/delivery, switch to calculator
  function handleImportLead(lead: SmartMovingLead) {
    const pickupAddr = lead.originAddressFull?.trim()
      || `${lead.originStreet || ''} ${lead.originCity || ''}`.trim();
    const deliveryAddr = lead.destinationAddressFull?.trim()
      || `${lead.destinationStreet || ''} ${lead.destinationCity || ''}`.trim();

    setPickup(pickupAddr);
    setDelivery(deliveryAddr);
    setSelectedLead(lead);
    setView('calculator');
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Poindexter Quote Calculator
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
            <div className="bg-white p-4 rounded-md shadow flex flex-col h-full">
              <h2 className="text-xl font-bold text-black mb-4">Leads</h2>

              {loadingLeads ? (
                <p className="text-black">Loading leads...</p>
              ) : error ? (
                <p className="text-red-600">{error}</p>
              ) : (
                <div className="flex-1 min-h-0 overflow-y-auto">
                  <div className="shadow ring-1 ring-gray-200 md:rounded-lg">
                    <table className="min-w-full table-fixed divide-y divide-gray-200 text-sm">
                      {/* all <col> tags on ONE line → no whitespace text nodes */}
                      <colgroup><col className="w-40"/><col className="w-60"/><col className="w-60"/><col className="w-28"/></colgroup>

                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Origin
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Destination
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-200 bg-white">
                        {leads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                              {lead.customerName ?? 'N/A'}
                            </td>

                            <td className="px-4 py-3 text-gray-700">
                              {lead.originAddressFull ?? 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {lead.destinationAddressFull ?? 'N/A'}
                            </td>

                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleImportLead(lead)}
                                className="inline-flex items-center rounded-md bg-gradient-to-r from-gray-400 to-gray-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:from-red-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                Import
                              </button>
                            </td>
                          </tr>
                        ))}

                        {leads.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                              No leads found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
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
                needsUnloaders={needsUnloaders}
                setNeedsUnloaders={setNeedsUnloaders}
                unloadersRate={unloadersRate}
                setUnloadersRate={setUnloadersRate}
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
                numDrivers={numDrivers}
                setNumDrivers={setNumDrivers}
                numWorkers={numWorkers}
                setNumWorkers={setNumWorkers}
                numLaborDays={numLaborDays}
                setNumLaborDays={setNumLaborDays}
                needsPacking={needsPacking}
                setNeedsPacking={setNeedsPacking}
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
                selectedLead={selectedLead}
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

/** The single-page calculator component */
function SinglePageCalculator(props: {
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

  // driver rates
  oneWayDriverHourly: number;
  setOneWayDriverHourly: (v: number) => void;
  roundTripDriverHourly: number;
  setRoundTripDriverHourly: (v: number) => void;

  // labor
  numDrivers: number;
  setNumDrivers: (v: number) => void;
  numWorkers: number;
  setNumWorkers: (v: number) => void;
  numLaborDays: number;
  setNumLaborDays: (v: number) => void;

  needsUnloaders: boolean;
  setNeedsUnloaders: (v: boolean) => void;
  unloadersRate: number;
  setUnloadersRate: (v: number) => void;

  // packing
  needsPacking: boolean;
  setNeedsPacking: (v: boolean) => void;

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

  // Lead Id Traicking
  selectedLead: SmartMovingLead | null;
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
    numDrivers, setNumDrivers,
    numWorkers, setNumWorkers,
    numLaborDays, setNumLaborDays,
    needsUnloaders, setNeedsUnloaders,
    unloadersRate, setUnloadersRate,
    needsPacking, setNeedsPacking,
    truckDailyRate, setTruckDailyRate,
    truckMileageRate, setTruckMileageRate,
    numReturnFlights, setNumReturnFlights,
    flightTicketRate, setFlightTicketRate,
    selectedLead,
  } = props;

  const [stops, setStops] = useState<string[]>([]);
  const handleAddStop     = () => setStops((s) => [...s, '']);
  const handleRemoveStop  = (idx: number) =>
    setStops((s) => s.filter((_, i) => i !== idx));
  const setStop           = (idx: number, val: string) =>
    setStops((s) => s.map((v, i) => (i === idx ? val : v)));

  const [packingItems, setPackingItems] = useState(() => defaultPackingItems);

  function updatePackingItem(idx: number, field: 'price' | 'quantity', val: number) {
    setPackingItems(items =>
      items.map((it, i) => (i === idx ? { ...it, [field]: val } : it))
    );
  }

  const [nearestAirportName, setNearestAirportName] = useState('');
  const [nearestAirportCode, setNearestAirportCode] = useState('');

  // 1) Handle distance calc
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
        stops: stops.filter((s) => s.trim() !== ''),   
        delivery,
        returnWarehouse: warehouseReturn,
      };

      const res = await fetch('/api/calculate-distance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to calculate route');
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to calculate route');

      /* distance payload unchanged */
      const { distance, duration, tolls, nearestAirportName: apName, nearestAirportCode: apCode } =
        data.data;

      setTotalMiles(Math.ceil(distance));
      setGpsDriveHours(Math.ceil(duration / 60));
      setNumTolls(tolls);

      if (moveType === 'one-way' && apName && apCode) {
        setNearestAirportName(apName);
        setNearestAirportCode(apCode);
      } else {
        setNearestAirportName('');
        setNearestAirportCode('');
      }

      alert(
        `Route = ${distance.toFixed(1)} miles, ~${(duration / 60).toFixed(
          1,
        )} hours\nTolls: ${tolls}`,
      );
    } catch (err: any) {
      alert(`Error calculating route: ${err.message}`);
      console.error(err);
    }
  }

  // 2) Handle check flight price: calls /api/calculate-flight
  async function handleCheckFlightPrice() {
    if (!nearestAirportCode) {
      alert('No nearest airport found…');
      return;
    }

    const originCode = nearestAirportCode;       
    const tomorrow   = new Date();
    tomorrow.setDate(tomorrow.getDate() + 5);
    const depStr = tomorrow.toISOString().split('T')[0];

    const adults = numReturnFlights || 1;

    try {
      const res = await fetch('/api/calculate-flight', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          originAirport       : originCode,
          departureDate       : depStr,
          adults
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch flight price');
      }
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to get flight price from Amadeus');
      }

      const flightPrice = data.flightPrice;
      setFlightTicketRate(flightPrice);

      alert(`Found flight from ${originCode} → PHX for ~$${flightPrice}. Updated ticket rate.`);
    } catch (err: any) {
      alert(`Amadeus flight error: ${err.message}`);
      console.error(err);
    }
  }


  // 3) Summarize cost
  function calculateCost() {
    // +2 hours for every 6 hours of GPS time
    const extraHours = Math.floor(gpsDriveHours / 6) * 2;
    const adjustedDriveHours = gpsDriveHours + extraHours;
    const drivingDays = Math.ceil(gpsDriveHours / 9);

    const driverRate = (moveType === 'one-way')
      ? oneWayDriverHourly
      : roundTripDriverHourly;

    const driverPay = numDrivers * adjustedDriveHours * driverRate;
    const gallons = totalMiles / 5; 
    const fuelCost = gallons * gasPrice;

    const laborCost =
      numWorkers * numLaborDays * laborRate +
      (needsUnloaders ? unloadersRate : 0);

    let hotelCost = 0;
    let perDiemCost = 0;
    if (needsHotel) {
      hotelCost = drivingDays * hotelRate;
      perDiemCost = drivingDays * perDiemRate;
    }

    const packingTotal = needsPacking
      ? packingItems.reduce((sum, it) => sum + it.price * it.quantity, 0)
      : 0;

      let truckCost = 0;
      if (moveType === 'one-way') {
        const oneWayTruckDays = numLaborDays + drivingDays;
        truckCost = oneWayTruckDays * truckDailyRate + totalMiles * truckMileageRate;
      } else {
        const roundTripTruckDays = numLaborDays + drivingDays;
        truckCost = roundTripTruckDays * truckDailyRate + totalMiles * truckMileageRate;
      }      

    let flightCost = 0;
    if (moveType === 'one-way') {
      flightCost = numReturnFlights * flightTicketRate;
    }

    const baseToll = numTolls * 100;
    const tollCost = (moveType === 'round-trip') ? baseToll * 2 : baseToll;

    const total =
      driverPay + fuelCost + laborCost + hotelCost + perDiemCost +
      packingTotal + truckCost + flightCost + tollCost;

    return {
      adjustedDriveHours,
      drivingDays,
      driverPay,
      fuelCost,
      laborCost,
      hotelCost,
      perDiemCost,
      packingCost: packingTotal,
      truckCost,
      flightCost,
      tollCost,
      total
    };
  }

  const costs = calculateCost();
  const totalJobDays = costs.drivingDays + numLaborDays;

  return (
    <div className="space-y-6">
      <h2 className="mb-3 text-xl font-bold text-black">Move Calculator</h2>
  
      {/* Move Type toggle + Calculate Distance */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        {/* Move Type */}
        <div className="mb-2 md:mb-0">
          <label className="mr-3 font-medium text-black">Move Type:</label>
          {(['one-way', 'round-trip'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setMoveType(t)}
              className={`mr-2 rounded border px-3 py-1 text-black ${
                moveType === t
                  ? 'border-red-500 bg-red-100'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {t === 'one-way' ? 'One-Way' : 'Round-Trip'}
            </button>
          ))}
        </div>
  
        {/* Calculate Distance */}
        <button
          onClick={handleDistanceCalc}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Calculate Distance
        </button>
      </div>
  
      {/* Addresses & Stops */}
      <div className="rounded border p-3 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-black">Addresses</h3>
          <button
            onClick={handleAddStop}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Add Stop
          </button>
        </div>
  
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Warehouse start */}
          <TextField
            label="Warehouse (Start)"
            value={warehouseStart}
            setValue={props.setWarehouseStart}
          />
  
          {/* Warehouse return for round-trip */}
          {moveType === 'round-trip' && (
            <TextField
              label="Warehouse (Return)"
              value={warehouseReturn}
              setValue={props.setWarehouseReturn}
            />
          )}
  
          {/* Pickup */}
          <TextField label="Pick-up" value={pickup} setValue={props.setPickup} />
  
          {/* Dynamic stops */}
          {stops.map((stop, idx) => (
            <div key={idx} className="mb-2">
              <div className="flex items-center">
                <label
                  htmlFor={`stop-${idx}`}
                  className="font-medium text-black"
                >
                  {`Stop ${idx + 1}`}
                </label>
                <button
                  type="button"
                  onClick={() => handleRemoveStop(idx)}
                  title="Remove stop"
                  className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded hover:bg-gray-200 focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="h-4 w-4 text-red-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 6h18M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2m1 0l1 14a2 2 0 01-2 2H8a2 2 0 01-2-2l1-14m3 0v12m4-12v12"
                    />
                  </svg>
                </button>
              </div>
  
              <input
                id={`stop-${idx}`}
                type="text"
                className="mt-1 w-full rounded border border-gray-300 p-2 text-black"
                value={stop}
                onChange={(e) => setStop(idx, e.target.value)}
              />
            </div>
          ))}
  
          {/* Delivery */}
          <TextField
            label="Delivery"
            value={delivery}
            setValue={props.setDelivery}
          />
        </div>
      </div>
  
      {/* Miles / Hours / Tolls / Gas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <NumberField
          label="Total Miles"
          value={totalMiles}
          setValue={setTotalMiles}
        />
        <NumberField
          label="GPS Drive Hours"
          value={gpsDriveHours}
          setValue={setGpsDriveHours}
        />
        <NumberField
          label="# Tolls"
          value={numTolls}
          setValue={setNumTolls}
        />
        <NumberField
          label="Gas Price ($/gallon)"
          value={gasPrice}
          setValue={setGasPrice}
        />
      </div>
  
      {/* Drivers | Labor */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Drivers card */}
        <div className="rounded border p-3 space-y-2">
          <h3 className="font-semibold text-black">Drivers</h3>
          <NumberField
            label="# of Drivers"
            value={numDrivers}
            setValue={setNumDrivers}
          />
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
  
        {/* Labor card */}
        <div className="rounded border p-3 space-y-2">
          <h3 className="font-semibold text-black">Labor</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NumberField label="# of Loaders" value={numWorkers} setValue={setNumWorkers} />
            <NumberField label="# of Days"    value={numLaborDays} setValue={setNumLaborDays} />
          </div>

          <NumberField
            label="Daily Rate ($/day/guy)"
            value={laborRate}
            setValue={setLaborRate}
          />

          {/* 3rd-party unloaders */}
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              checked={needsUnloaders}
              onChange={(e) => setNeedsUnloaders(e.target.checked)}
            />
            <span className="text-black">3rd Party Unloaders Needed?</span>
          </div>

          {needsUnloaders && (
            <NumberField
              label="Unloaders Rate ($)"
              value={unloadersRate}
              setValue={setUnloadersRate}
            />
          )}
        </div>
      </div>
  
      {/* Truck rental & (return flights if one-way) */}
      {moveType === 'round-trip' ? (
        <div className="rounded border p-3 space-y-2">
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
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* One-way truck rental */}
          <div className="rounded border p-3 space-y-2">
            <h3 className="font-semibold text-black">One-Way Truck Rental</h3>
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
          </div>

  
          {/* Return flights */}
          <div className="rounded border p-3 space-y-3">
            <h3 className="font-semibold text-black">Return Flights</h3>
  
            {nearestAirportName && (
              <div className="space-y-2">
                <label className="block text-black">
                  <span className="font-medium">Nearest Airport:</span>
                  <input
                    readOnly
                    value={`${nearestAirportName} (${nearestAirportCode})`}
                    className="mt-1 w-full rounded border border-gray-300 bg-gray-50 p-2 text-black"
                  />
                </label>
                <button
                  onClick={handleCheckFlightPrice}
                  className="w-full rounded bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
                >
                  Get Flight Price
                </button>
              </div>
            )}
  
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
        </div>
      )}
  
      {/* Packing supplies | Hotel & Per Diem */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Packing */}
        <div className="rounded border p-3 space-y-2">
          <h3 className="font-semibold text-black">Packing Supplies</h3>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={needsPacking}
              onChange={(e) => setNeedsPacking(e.target.checked)}
            />
            <span className="text-black">Needs packing supplies?</span>
          </div>
  
          {needsPacking && (
            <div className="mt-2 space-y-3">
              {packingItems.map((item, idx) => (
                <div
                  key={item.name}
                  className="grid grid-cols-3 items-center gap-2"
                >
                  <div className="text-black">{item.name}</div>
                  <div>
                    <label className="block text-xs text-gray-600">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      className="mt-1 w-full rounded border border-gray-300 p-1 text-black"
                      value={item.price}
                      onChange={(e) =>
                        updatePackingItem(idx, 'price', parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600">Qty</label>
                    <input
                      type="number"
                      className="mt-1 w-full rounded border border-gray-300 p-1 text-black"
                      value={item.quantity}
                      onChange={(e) =>
                        updatePackingItem(idx, 'quantity', parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
  
        {/* Hotel & Per-Diem */}
        <div className="rounded border p-3 space-y-2">
          <h3 className="font-semibold text-black">Hotel & Per Diem</h3>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={needsHotel}
              onChange={(e) => setNeedsHotel(e.target.checked)}
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
  
      {/* Cost Breakdown */}
      {(() => {
        const costs = calculateCost();
        const totalJobDays = costs.drivingDays + numLaborDays;
        return (
          <div className="rounded border bg-gray-50 p-3 space-y-4">
            <h3 className="text-lg font-bold text-black">Cost Breakdown</h3>
  
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <LineItem label="Driver Pay" value={costs.driverPay} />
              <LineItem label="Fuel" value={costs.fuelCost} />
              <LineItem label="Loading + Unloading Labor" value={costs.laborCost} />
              {needsHotel && <LineItem label="Hotel" value={costs.hotelCost} />}
              {needsHotel && (
                <LineItem label="Per Diem" value={costs.perDiemCost} />
              )}
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
  
            <div className="flex justify-between text-xl font-bold text-black">
              <span>Total</span>
              <span>${costs.total.toFixed(2)}</span>
            </div>
  
            {/* Send to SmartMoving */}
            <div>
              <button
                disabled={!selectedLead}
                onClick={async () => {
                  if (!selectedLead) return;
                  try {
                    const res = await fetch('/services', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ lead: selectedLead, total: costs.total }),
                    });
                    const json = await res.json();
                    if (!json.ok) throw new Error(json.message);
                    alert('✅ Total sent to SmartMoving!');
                  } catch (err) {
                    console.error(err);
                    alert('❌ Failed to send total');
                  }
                }}
                className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:opacity-50"
              >
                Send to SmartMoving
              </button>
            </div>
  
            {/* Extra info */}
            <div className="text-sm text-black">
              <p>
                GPS Drive Hours: {gpsDriveHours.toFixed(1)}, Adjusted:{' '}
                {costs.adjustedDriveHours.toFixed(1)}
              </p>
              <p>Driving Days (9 hr rule): {costs.drivingDays}</p>
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

/** A row for cost breakdown items */
function LineItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between bg-white p-2 rounded text-black">
      <span>{label}</span>
      <span>${value.toFixed(2)}</span>
    </div>
  );
}
