// page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { SmartMovingLead } from '../services/smartMoving';
import { toast, Toaster } from 'react-hot-toast';

type MoveType = 'one-way' | 'round-trip';

// flag so we don’t show stack-traces in production
const isDevelopment = process.env.NODE_ENV === 'development';

/* Simple error boundary so the whole dashboard doesn’t explode on a render bug */

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error('Caught by ErrorBoundary:', error, info);
    // send to Sentry / LogRocket / Datadog here
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Something went wrong
          </h2>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* Default packing list */
const defaultPackingItems = [
  { name: 'Small Box',            price: 3.25,  quantity: 0 },
  { name: 'Medium Box',           price: 4.25,  quantity: 0 },
  { name: 'Large Box',            price: 5.25,  quantity: 0 },
  { name: 'Dish Box',             price: 10,    quantity: 0 },
  { name: 'Dish Pack Inserts',    price: 12,    quantity: 0 },
  { name: 'TV Box',               price: 25,    quantity: 0 },
  { name: 'Wardrobe Box',         price: 20,    quantity: 0 },
  { name: 'Mattress Bag (King)',  price: 15,    quantity: 0 },
  { name: 'Speed Pack',           price: 60,    quantity: 0 },
  { name: 'Paper Pad (Brown)',    price: 3,     quantity: 0 },
  { name: 'Packing Paper (200)',  price: 40,    quantity: 0 },
  { name: 'Furniture Pad',        price: 20,    quantity: 0 },
  { name: '4 Pack Mirror Carton', price: 25,    quantity: 0 },
  { name: 'Lamp Box',             price: 5,     quantity: 0 },
  { name: 'Piano Board',          price: 200,   quantity: 0 },
  { name: 'Straps/Tie Downs',     price: 10,    quantity: 0 },
  { name: 'Floor Protection',     price: 100,   quantity: 0 },
  { name: 'Mattress Box',         price: 45,    quantity: 0 },
  { name: 'Pre Move Package',     price: 100,   quantity: 0 },
  { name: 'French Cleat',         price: 20,    quantity: 0 },
];

const AIRLINE_NAMES: Record<string, string> = {
  AA: 'American Airlines',
  DL: 'Delta Air Lines',
  UA: 'United Airlines',
  WN: 'Southwest Airlines',
  AS: 'Alaska Airlines',
  B6: 'JetBlue Airways',
  F9: 'Frontier Airlines',
  NK: 'Spirit Airlines',
  G4: 'Allegiant Air',
  HA: 'Hawaiian Airlines',
  SY: 'Sun Country Airlines',
  AAY: 'Allegiant Air', 
  VX: 'Virgin America', 
  YX: 'Republic Airways',
  OO: 'SkyWest Airlines',
  EV: 'ExpressJet Airlines', 
  MQ: 'Envoy Air',
  OH: 'PSA Airlines',
  QX: 'Horizon Air',
  ZW: 'Air Wisconsin',
  G7: 'GoJet Airlines',
};


interface CostSummary {
  adjustedDriveHours: number;
  drivingDays:       number;
  driverPay:          number;
  fuelCost:           number;
  laborCost:          number;
  hotelCost:          number;
  perDiemCost:        number;
  packingCost:        number;
  truckCost:          number;
  flightCost:         number;
  tollCost:           number;
  total:              number;
}

/* Main dashboard component */
function DashboardPage() {
  // which view is visible
  const [view, setView] = useState<'split' | 'leads' | 'calculator'>('split');

  // lead data
  const [leads, setLeads] = useState<SmartMovingLead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<SmartMovingLead | null>(null);

  // loading flags for the three async actions
  const [calculatingRoute, setCalculatingRoute]   = useState(false);
  const [checkingFlight, setCheckingFlight]       = useState(false);
  const [submittingQuote, setSubmittingQuote]     = useState(false);

  // calculator state
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

  // hotel and per-diem
  const [needsHotel, setNeedsHotel] = useState(false);
  const [hotelRate, setHotelRate] = useState(150);
  const [perDiemRate, setPerDiemRate] = useState(50);

  // driver rates
  const [oneWayDriverHourly, setOneWayDriverHourly] = useState(40);
  const [roundTripDriverHourly, setRoundTripDriverHourly] = useState(50);

  // labor
  const [numDrivers, setNumDrivers] = useState(1);
  const [numWorkers, setNumWorkers] = useState(2);
  const [numLaborDays, setNumLaborDays] = useState(1);
  const [needsUnloaders, setNeedsUnloaders] = useState(false);
  const [unloadersRate, setUnloadersRate]   = useState(0);

  // packing
  const [needsPacking, setNeedsPacking] = useState(false);

  // move-start date derived from SmartMoving serviceDate (yyyy-mm-dd)
  const [moveDate, setMoveDate] = useState<string | null>(null);

  const [packingItems, setPackingItems] = useState(() => defaultPackingItems);
  function updatePackingItem(
    idx: number,
    field: 'price' | 'quantity',
    val: number,
  ) {
    setPackingItems(items =>
      items.map((it, i) => (i === idx ? { ...it, [field]: val } : it)),
    );
  }

  // truck rental
  const [penskeCity, setPenskeCity] = useState('');
  const [oneWayTruckCost, setOneWayTruckCost] = useState(0);
  const [truckDailyRate, setTruckDailyRate] = useState(300);
  const [truckMileageRate, setTruckMileageRate] = useState(0.3);

  // return flights
  const [numReturnFlights, setNumReturnFlights] = useState(2);
  const [flightTicketRate, setFlightTicketRate] = useState(0);
  const [flightAirline,     setFlightAirline]     = useState('');
  const [flightDepartTime,  setFlightDepartTime]  = useState('');

  // stops for multi-leg moves
  const [stops, setStops] = useState<string[]>([]);
  const handleAddStop    = () => setStops(s => [...s, '']);
  const handleRemoveStop = (idx: number) => setStops(s => s.filter((_, i) => i !== idx));
  const setStop          = (idx: number, val: string) => setStops(s => s.map((v, i) => i === idx ? val : v)); 

  // nearest airport (one-way only)
  const [nearestAirportName, setNearestAirportName] = useState('');
  const [nearestAirportCode, setNearestAirportCode] = useState('');

  /* Load leads on mount */
  useEffect(() => {
    (async () => {
      try {
        setLoadingLeads(true);
        const res = await fetch('/services');
        if (!res.ok) {
          throw new Error(`Failed to fetch leads. Status: ${res.status}`);
        }
        setLeads(await res.json());
        setError(null);
      } catch (err: any) {
        console.error('Error fetching leads:', err);
        const msg = isDevelopment
          ? `Error: ${err.message}`
          : 'Could not load leads.';
        toast.error(msg);
        setError(msg);
      } finally {
        setLoadingLeads(false);
      }
    })();
  }, []);

  /* Route calculation */
  async function handleDistanceCalc() {
    if (!moveType || !warehouseStart || !pickup || !delivery) {
      return toast.error('Fill move type, warehouse, pickup and delivery first.');
    }
    try {
      setCalculatingRoute(true);

      const body = {
        moveType,
        warehouse: warehouseStart,
        pickup,
        stops: stops.filter(s => s.trim() !== ''),
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
        throw new Error(err.error || `Status ${res.status}`);
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Route calculation failed.');

      const { distance, duration, tolls, nearestAirportName: apName, nearestAirportCode: apCode } = data.data;

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

      toast.success(
        `Route: ${distance.toFixed(1)} miles • ${(duration / 60).toFixed(1)} hrs • ${tolls} tolls`
      );
    } catch (err: any) {
      console.error(err);
      const msg = isDevelopment ? `Route error: ${err.message}` : 'Could not calculate route.';
      toast.error(msg);
    } finally {
      setCalculatingRoute(false);
    }
  }

  /* Flight price lookup */
  async function handleCheckFlightPrice() {
    if (!nearestAirportCode) return toast.error('No nearest airport found.');
    if (!moveDate)           return toast.error('Lead has no move date.');

    const start = new Date(moveDate);                 
    const last  = new Date(start);
    last.setDate(start.getDate() + totalJobDays);     
    const departureDate = last.toISOString().split('T')[0];

    const originCode = nearestAirportCode;

    try {
      setCheckingFlight(true);
      const res = await fetch('/api/calculate-flight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originAirport: originCode,
          departureDate,
          adults: numReturnFlights || 1,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Status ${res.status}`);
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Amadeus error');

      const { flightPrice, airline, departTime } = data;   
      setFlightTicketRate(flightPrice);                    
      setFlightAirline(airline || '');                     
      setFlightDepartTime(departTime || '');

      toast.success(`Flight ${originCode} → PHX: $${flightPrice}`);
    } catch (err: any) {
      console.error(err);
      const msg = isDevelopment ? `Flight error: ${err.message}` : 'Could not get flight price.';
      toast.error(msg);
    } finally {
      setCheckingFlight(false);
    }
  }

  /* Send quote to SmartMoving */
  async function handleSubmitQuote() {
    if (!selectedLead) return;
    try {
      setSubmittingQuote(true);
      const res = await fetch('/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead: selectedLead, total: calculateCost().total }),
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      toast.success('Total sent to SmartMoving!');
    } catch (err: any) {
      console.error(err);
      const msg = isDevelopment ? `Submit error: ${err.message}` : 'Could not send total.';
      toast.error(msg);
    } finally {
      setSubmittingQuote(false);
    }
  }

  /* Import a lead into the calculator */
  function handleImportLead(lead: SmartMovingLead) {
    const pickupAddr =
      lead.originAddressFull?.trim() ||
      `${lead.originStreet || ''} ${lead.originCity || ''}`.trim();
    const deliveryAddr =
      lead.destinationAddressFull?.trim() ||
      `${lead.destinationStreet || ''} ${lead.destinationCity || ''}`.trim();

    setPickup(pickupAddr);
    setDelivery(deliveryAddr);

    /* ▶ convert serviceDate (20250606 ➜ "2025-06-06"); save null if missing */
    if (lead.serviceDate) {
      const s = lead.serviceDate.toString();       
      if (s.length === 8) {
        setMoveDate(`${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6)}`); 
      } else {
        setMoveDate(null);
      }
      } else {
        setMoveDate(null);
    }

    setSelectedLead(lead);
    setView('calculator');
  }

  /* Cost calculations (untouched except removed comments) */
  function calculateCost() {
    const extraHours = Math.floor(gpsDriveHours / 6) * 2;
    const adjustedDriveHours = gpsDriveHours + extraHours;
    const drivingDays = Math.ceil(gpsDriveHours / 9);
    const driverRate = moveType === 'one-way' ? oneWayDriverHourly : roundTripDriverHourly;
    const driverPay = numDrivers * adjustedDriveHours * driverRate;

    const gallons = totalMiles / 5;
    const fuelCost = gallons * gasPrice;
    const laborCost =
      numWorkers * numLaborDays * laborRate + (needsUnloaders ? unloadersRate : 0);

    let hotelCost = 0;
    let perDiemCost = 0;
    if (needsHotel) {
      hotelCost = drivingDays * hotelRate;
      perDiemCost = drivingDays * perDiemRate;
    }

    const packingTotal = needsPacking
      ? packingItems.reduce((sum, it) => sum + it.price * it.quantity, 0)
      : 0;

    const truckDays = numLaborDays + drivingDays;
    const truckCost =
      truckDays * truckDailyRate + totalMiles * truckMileageRate;

    const flightCost =
      moveType === 'one-way' ? numReturnFlights * flightTicketRate : 0;

    const baseToll = numTolls * 100;
    const tollCost = moveType === 'round-trip' ? baseToll * 2 : baseToll;

    const total =
      driverPay +
      fuelCost +
      laborCost +
      hotelCost +
      perDiemCost +
      packingTotal +
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
      packingCost: packingTotal,
      truckCost,
      flightCost,
      tollCost,
      total,
    };
  }

  const costs = calculateCost();
  const totalJobDays = costs.drivingDays + numLaborDays;

  /* Render */
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* toast notifications go at the very top */}
      <Toaster position="top-right" />

      {/* header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Poindexter Quote Calculator
          </h1>
        </div>
      </header>

      {/* view toggle */}
      <nav className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-2 flex space-x-3 justify-center">
          <ViewToggle label="Split View" current={view} setView={setView} mode="split" />
          <ViewToggle label="Full Leads" current={view} setView={setView} mode="leads" />
          <ViewToggle label="Full Calculator" current={view} setView={setView} mode="calculator" />
        </div>
      </nav>

      {/* main content */}
      <main className="flex-1 overflow-auto p-4">
        <div className={view === 'split' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6 h-full' : 'h-full'}>
          {/*  leads panel  */}
          {(view === 'split' || view === 'leads') && (
            <div className="bg-white p-4 rounded-md shadow flex flex-col h-full">
              <h2 className="text-xl font-bold text-black mb-4">Leads</h2>

              {loadingLeads ? (
                <p className="text-black">Loading leads…</p>
              ) : error ? (
                <p className="text-red-600">{error}</p>
              ) : (
                <div className="flex-1 min-h-0 overflow-y-auto">
                  <div className="shadow ring-1 ring-gray-200 md:rounded-lg">
                    <table className="min-w-full table-fixed divide-y divide-gray-200 text-sm">
                      <colgroup>
                        <col className="w-40" />
                        <col className="w-60" />
                        <col className="w-60" />
                        <col className="w-28" />
                      </colgroup>

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
                            <td className="px-4 py-3 text-gray-700">{lead.originAddressFull ?? 'N/A'}</td>
                            <td className="px-4 py-3 text-gray-700">{lead.destinationAddressFull ?? 'N/A'}</td>
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

          {/* calculator panel */}
          {(view === 'split' || view === 'calculator') && (
            <div className="bg-white p-4 rounded-md shadow flex flex-col">
              <SinglePageCalculator
                /* all the props */
                moveType={moveType} setMoveType={setMoveType}
                warehouseStart={warehouseStart} setWarehouseStart={setWarehouseStart}
                warehouseReturn={warehouseReturn} setWarehouseReturn={setWarehouseReturn}
                pickup={pickup} setPickup={setPickup}
                delivery={delivery} setDelivery={setDelivery}
                totalMiles={totalMiles} setTotalMiles={setTotalMiles}
                gpsDriveHours={gpsDriveHours} setGpsDriveHours={setGpsDriveHours}
                numTolls={numTolls} setNumTolls={setNumTolls}
                gasPrice={gasPrice} setGasPrice={setGasPrice}
                laborRate={laborRate} setLaborRate={setLaborRate}
                needsUnloaders={needsUnloaders} setNeedsUnloaders={setNeedsUnloaders}
                unloadersRate={unloadersRate} setUnloadersRate={setUnloadersRate}
                needsHotel={needsHotel} setNeedsHotel={setNeedsHotel}
                hotelRate={hotelRate} setHotelRate={setHotelRate}
                perDiemRate={perDiemRate} setPerDiemRate={setPerDiemRate}
                oneWayDriverHourly={oneWayDriverHourly} setOneWayDriverHourly={setOneWayDriverHourly}
                roundTripDriverHourly={roundTripDriverHourly} setRoundTripDriverHourly={setRoundTripDriverHourly}
                numDrivers={numDrivers} setNumDrivers={setNumDrivers}
                numWorkers={numWorkers} setNumWorkers={setNumWorkers}
                numLaborDays={numLaborDays} setNumLaborDays={setNumLaborDays}
                needsPacking={needsPacking} setNeedsPacking={setNeedsPacking}
                penskeCity={penskeCity} setPenskeCity={setPenskeCity}
                oneWayTruckCost={oneWayTruckCost} setOneWayTruckCost={setOneWayTruckCost}
                truckDailyRate={truckDailyRate} setTruckDailyRate={setTruckDailyRate}
                truckMileageRate={truckMileageRate} setTruckMileageRate={setTruckMileageRate}
                numReturnFlights={numReturnFlights} setNumReturnFlights={setNumReturnFlights}
                flightTicketRate={flightTicketRate} setFlightTicketRate={setFlightTicketRate}
                flightAirline={flightAirline}
                flightDepartTime={flightDepartTime}
                selectedLead={selectedLead}
                packingItems={packingItems}
                updatePackingItem={updatePackingItem}


                onCalculateRoute={handleDistanceCalc}
                calculatingRoute={calculatingRoute}
                onCheckFlight={handleCheckFlightPrice}
                checkingFlight={checkingFlight}
                nearestAirportName={nearestAirportName}
                nearestAirportCode={nearestAirportCode}
                onSubmitQuote={handleSubmitQuote}
                submittingQuote={submittingQuote}
                costs={costs}
                totalJobDays={totalJobDays}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* View toggle button */
function ViewToggle({
  label,
  current,
  setView,
  mode,
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
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow'
          : 'bg-white border border-gray-300 text-black hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}

/* Packing item row component – unchanged */
function PackingItemRow({
  item,
  idx,
  updatePackingItem,
}: {
  item: { name: string; price: number; quantity: number };
  idx: number;
  updatePackingItem: (idx: number, field: 'price' | 'quantity', val: number) => void;
}) {
  const [localQuantity, setLocalQuantity] = useState(String(item.quantity));

  useEffect(() => {
    if (item.quantity !== 0) {
      setLocalQuantity(String(item.quantity));
    }
  }, [item.quantity]);

  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <p className="font-medium text-gray-800 text-sm mb-2">{item.name}</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-600">Price</label>
          <input
            type="number"
            step="0.01"
            onWheel={(e) => e.currentTarget.blur()}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1 text-sm text-black focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
            value={item.price}
            onChange={(e) => updatePackingItem(idx, 'price', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="text-xs text-gray-600">Quantity</label>
          <input
            type="number"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1 text-sm text-black focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
            value={localQuantity}
            onChange={(e) => {
              const raw = e.target.value;
              setLocalQuantity(raw);

              if (raw.trim() === '') {
                updatePackingItem(idx, 'quantity', 0);
              } else {
                const parsed = parseInt(raw);
                if (!isNaN(parsed)) {
                  updatePackingItem(idx, 'quantity', parsed);
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* TextField – unchanged */
function TextField({
  label,
  value,
  setValue,
  icon = '',
}: {
  label: string;
  value: string;
  setValue: (val: string) => void;
  icon?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {label}
      </label>
      <input
        type="text"
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}

/* NumberField – unchanged */
function NumberField({
  label,
  value,
  setValue,
  icon = '',
  prefix = '',
  suffix = '',
  compact = false,
}: {
  label: string;
  value: number;
  setValue: (val: number) => void;
  icon?: string;
  prefix?: string;
  suffix?: string;
  compact?: boolean;
}) {
  const [localValue, setLocalValue] = useState(value === 0 ? '' : String(value));

  useEffect(() => {
    setLocalValue(value === 0 ? '' : String(value));
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
    <div className={`space-y-1 ${compact ? '' : ''}`}>
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{prefix}</span>
        )}
        <input
          type="number"
          onWheel={(e) => e.currentTarget.blur()}
          className={`w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
            prefix ? 'pl-8' : ''
          } ${suffix ? 'pr-12' : ''}`}
          value={localValue}
          onChange={handleChange}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{suffix}</span>
        )}
      </div>
    </div>
  );
}

/* MetricCard – unchanged */
function MetricCard({
  label,
  value,
  setValue,
  icon,
  unit,
  prefix = '',
}: {
  label: string;
  value: number;
  setValue: (val: number) => void;
  icon: string;
  unit: string;
  prefix?: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs text-gray-500 uppercase">{unit}</span>
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <NumberField label="" value={value} setValue={setValue} prefix={prefix} compact />
    </div>
  );
}

/* CostItem – unchanged */
function CostItem({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-white/10 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-sm text-gray-300">{label}</span>
      </div>
      <p className="text-xl font-semibold">${value.toFixed(2)}</p>
    </div>
  );
}

/* ToggleSwitch – unchanged */
function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

/* SinglePageCalculator */
function SinglePageCalculator(
  props: {
    moveType: MoveType;
    setMoveType: (v: MoveType) => void;

    warehouseStart: string;
    setWarehouseStart: (v: string) => void;
    warehouseReturn: string;
    setWarehouseReturn: (v: string) => void;
    pickup: string;
    setPickup: (v: string) => void;
    delivery: string;
    setDelivery: (v: string) => void;

    totalMiles: number;
    setTotalMiles: (v: number) => void;
    gpsDriveHours: number;
    setGpsDriveHours: (v: number) => void;
    numTolls: number;
    setNumTolls: (v: number) => void;

    gasPrice: number;
    setGasPrice: (v: number) => void;
    laborRate: number;
    setLaborRate: (v: number) => void;

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

    needsPacking: boolean;
    setNeedsPacking: (v: boolean) => void;

    penskeCity: string;
    setPenskeCity: (v: string) => void;
    oneWayTruckCost: number;
    setOneWayTruckCost: (v: number) => void;
    truckDailyRate: number;
    setTruckDailyRate: (v: number) => void;
    truckMileageRate: number;
    setTruckMileageRate: (v: number) => void;

    numReturnFlights: number;
    setNumReturnFlights: (v: number) => void;
    flightTicketRate: number;
    setFlightTicketRate: (v: number) => void;
    flightAirline: string;
    flightDepartTime: string;

    selectedLead: SmartMovingLead | null;

    onCalculateRoute: () => void;
    calculatingRoute: boolean;
    onCheckFlight: () => void;
    checkingFlight: boolean;
    onSubmitQuote: () => void;
    submittingQuote: boolean;
    nearestAirportName: string;     
    nearestAirportCode: string;

    packingItems: typeof defaultPackingItems;
    updatePackingItem: (
      idx: number,
      field: 'price' | 'quantity',
      val: number,
    ) => void;

    costs: CostSummary;
    totalJobDays: number;
  },
) {
  const {
    moveType,
    setMoveType,
    warehouseStart,
    warehouseReturn,
    pickup,
    delivery,
    totalMiles,
    gpsDriveHours,
    numTolls,
    gasPrice,
    laborRate,
    needsHotel,
    hotelRate,
    perDiemRate,
    oneWayDriverHourly,
    roundTripDriverHourly,
    numDrivers,
    numWorkers,
    numLaborDays,
    needsUnloaders,
    unloadersRate,
    needsPacking,
    truckDailyRate,
    truckMileageRate,
    numReturnFlights,
    flightTicketRate,
    flightAirline,
    flightDepartTime,
    onCalculateRoute,
    calculatingRoute,
    onCheckFlight,
    checkingFlight,
    nearestAirportName,
    nearestAirportCode,
    packingItems,
    updatePackingItem,
    onSubmitQuote,
    submittingQuote,
    selectedLead,
    costs,
    totalJobDays,
    // setters
    setWarehouseStart,
    setWarehouseReturn,
    setPickup,
    setDelivery,
    setTotalMiles,
    setGpsDriveHours,
    setNumTolls,
    setGasPrice,
    setLaborRate,
    setNeedsHotel,
    setHotelRate,
    setPerDiemRate,
    setOneWayDriverHourly,
    setRoundTripDriverHourly,
    setNumDrivers,
    setNumWorkers,
    setNumLaborDays,
    setNeedsUnloaders,
    setUnloadersRate,
    setNeedsPacking,
    setPenskeCity,
    setOneWayTruckCost,
    setTruckDailyRate,
    setTruckMileageRate,
    setNumReturnFlights,
    setFlightTicketRate,
  } = props;

  // all the original local state for stops etc.
  const [stops, setStops] = useState<string[]>([]);
  const handleAddStop    = () => setStops(s => [...s, '']);
  const handleRemoveStop = (idx: number) => setStops(s => s.filter((_, i) => i !== idx));
  const setStop          = (idx: number, val: string) => setStops(s => s.map((v, i) => i === idx ? val : v));

  return (
    <div className="space-y-6 p-2">
      {/* header */}
      <div className="bg-gradient-to-r from-orange-100 to-orange-50 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Move Calculator</h2>
            <p className="text-gray-600 text-sm">Configure your move details and get an instant quote</p>
          </div>
          <div className="flex gap-2">
            {(['one-way', 'round-trip'] as const).map(type => (
              <button
                key={type}
                onClick={() => setMoveType(type)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  moveType === type
                    ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {type === 'one-way' ? '🚚 One-Way' : '🔄 Round-Trip'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* route info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-lg p-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white">Route Details</h3>
          </div>
          <button
            onClick={onCalculateRoute}
            disabled={calculatingRoute}
            className={`bg-white/20 text-white px-6 py-2 rounded-lg transition-colors font-medium backdrop-blur-sm ${
              calculatingRoute ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/30'
            }`}
          >
            {calculatingRoute ? 'Calculating…' : 'Calculate Route →'}
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Address Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="📍 Warehouse (Start)"
              value={warehouseStart}
              setValue={props.setWarehouseStart}
              icon="🏭"
            />

            {moveType === 'round-trip' && (
              <TextField
                label="📍 Warehouse (Return)"
                value={warehouseReturn}
                setValue={props.setWarehouseReturn}
                icon="🏭"
              />
            )}

            <TextField
              label="📦 Pick-up Location"
              value={pickup}
              setValue={props.setPickup}
              icon="📍"
            />

            {/* Dynamic stops */}
            {stops.map((stop, idx) => (
              <div key={idx} className="relative">
                <TextField
                  label={`🚏 Stop ${idx + 1}`}
                  value={stop}
                  setValue={(val) => setStop(idx, val)}
                  icon="📍"
                />
                <button
                  onClick={() => handleRemoveStop(idx)}
                  className="absolute right-2 top-8 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                  title="Remove stop"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}

            <TextField
              label="🏠 Delivery Location"
              value={delivery}
              setValue={props.setDelivery}
              icon="📍"
            />
          </div>

          {/* Add Stop button */}
          <button
            onClick={handleAddStop}
            className="mt-2 text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Stop
          </button>
        </div>

        {/* Route Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Total Miles"
            value={totalMiles}
            setValue={setTotalMiles}
            icon="🛣️"
            unit="miles"
          />
          <MetricCard
            label="Drive Hours"
            value={gpsDriveHours}
            setValue={setGpsDriveHours}
            icon="⏱️"
            unit="hours"
          />
          <MetricCard
            label="Toll Count"
            value={numTolls}
            setValue={setNumTolls}
            icon="🎫"
            unit="tolls"
          />
          <MetricCard
            label="Gas Price"
            value={gasPrice}
            setValue={setGasPrice}
            icon="⛽"
            unit="$/gal"
            prefix="$"
          />
        </div>
      </div>

      {/* Personnel Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Drivers Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-700 to-green-900 p-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>👷 Drivers</span>
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <NumberField
              label="Number of Drivers"
              value={numDrivers}
              setValue={setNumDrivers}
              icon="👥"
            />
            {moveType === 'one-way' ? (
              <NumberField
                label="One-Way Rate"
                value={oneWayDriverHourly}
                setValue={setOneWayDriverHourly}
                icon="💵"
                prefix="$"
                suffix="/hr"
              />
            ) : (
              <NumberField
                label="Round-Trip Rate"
                value={roundTripDriverHourly}
                setValue={setRoundTripDriverHourly}
                icon="💵"
                prefix="$"
                suffix="/hr"
              />
            )}
          </div>
        </div>

        {/* Labor Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-900 p-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>💪 Labor</span>
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <NumberField
                label="Loaders"
                value={numWorkers}
                setValue={setNumWorkers}
                icon="👥"
                compact
              />
              <NumberField
                label="Days"
                value={numLaborDays}
                setValue={setNumLaborDays}
                icon="📅"
                compact
              />
            </div>
            <NumberField
              label="Daily Rate per Person"
              value={laborRate}
              setValue={setLaborRate}
              icon="💰"
              prefix="$"
              suffix="/day"
            />
            
            <div className="pt-4 border-t border-gray-100">
              <label className="flex items-center justify-between group cursor-pointer">
                <span className="text-gray-700 font-medium">3rd Party Unloaders</span>
                <ToggleSwitch
                  checked={needsUnloaders}
                  onChange={setNeedsUnloaders}
                />
              </label>
              {needsUnloaders && (
                <div className="mt-3">
                  <NumberField
                    label="Unloaders Rate"
                    value={unloadersRate}
                    setValue={setUnloadersRate}
                    icon="💵"
                    prefix="$"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Truck & Travel Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Truck Rental Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-700 to-orange-900 p-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>🚚 Truck Rental</span>
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              📊 Truck Days = Loading Days + Driving Days
            </p>
            <NumberField
              label="Daily Rate"
              value={truckDailyRate}
              setValue={setTruckDailyRate}
              icon="💳"
              prefix="$"
              suffix="/day"
            />
            <NumberField
              label="Mileage Rate"
              value={truckMileageRate}
              setValue={setTruckMileageRate}
              icon="🛣️"
              prefix="$"
              suffix="/mile"
            />
          </div>
        </div>

        {/* Return Flights (One-Way) or Hotel (Both) */}
        {moveType === 'one-way' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-sky-600 to-sky-800 p-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span>✈️ Return Flights</span>
              </h3>
            </div>
            <div className="p-6 space-y-4">
            {nearestAirportName && (
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium text-gray-700">Nearest Airport</p>
                <p className="font-semibold text-gray-900">
                  {nearestAirportName} ({nearestAirportCode})
                </p>
                <button
                  onClick={onCheckFlight}
                  disabled={checkingFlight}
                  className={`w-full mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors ${
                    checkingFlight ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                  }`}
                >
                  {checkingFlight ? 'Checking…' : 'Get Flight Price →'}
                </button>
              </div>
            )}
              <NumberField
                label="Returning Staff"
                value={numReturnFlights}
                setValue={setNumReturnFlights}
                icon="👥"
                suffix="people"
              />
              <NumberField
                label="Ticket Rate"
                value={flightTicketRate}
                setValue={setFlightTicketRate}
                icon="💵"
                prefix="$"
                suffix="/ticket"
              />

              {flightAirline && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Airline:</span>{' '}
                  {AIRLINE_NAMES[flightAirline] ?? flightAirline}
                  {flightDepartTime && (
                    <span className="ml-2"> Departs: 
                      ({new Date(flightDepartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-900 p-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span>🏨 Accommodation</span>
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <label className="flex items-center justify-between group cursor-pointer">
                <span className="text-gray-700 font-medium">Need Hotel?</span>
                <ToggleSwitch
                  checked={needsHotel}
                  onChange={setNeedsHotel}
                />
              </label>
              {needsHotel && (
                <div className="space-y-4 mt-4">
                  <NumberField
                    label="Hotel Rate"
                    value={hotelRate}
                    setValue={setHotelRate}
                    icon="🏨"
                    prefix="$"
                    suffix="/night"
                  />
                  <NumberField
                    label="Per Diem"
                    value={perDiemRate}
                    setValue={setPerDiemRate}
                    icon="🍽️"
                    prefix="$"
                    suffix="/day"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Additional Services Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Packing Supplies */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-pink-700 to-pink-900 p-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>📦 Packing Supplies</span>
            </h3>
          </div>
          <div className="p-6">
            <label className="flex items-center justify-between group cursor-pointer mb-4">
              <span className="text-gray-700 font-medium">Need Packing Supplies?</span>
              <ToggleSwitch
                checked={needsPacking}
                onChange={setNeedsPacking}
              />
            </label>
            
            {needsPacking && (
              <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                {needsPacking && (
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                  {needsPacking && (
                    <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                      {packingItems.map((item, idx) => (
                        <PackingItemRow
                          key={item.name}
                          item={item}
                          idx={idx}
                          updatePackingItem={updatePackingItem}
                        />
                      ))}
                    </div>
                  )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Hotel & Per Diem (if one-way) */}
        {moveType === 'one-way' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span>🏨 Accommodation</span>
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <label className="flex items-center justify-between group cursor-pointer">
                <span className="text-gray-700 font-medium">Need Hotel?</span>
                <ToggleSwitch
                  checked={needsHotel}
                  onChange={setNeedsHotel}
                />
              </label>
              {needsHotel && (
                <div className="space-y-4 mt-4">
                  <NumberField
                    label="Hotel Rate"
                    value={hotelRate}
                    setValue={setHotelRate}
                    icon="🏨"
                    prefix="$"
                    suffix="/night"
                  />
                  <NumberField
                    label="Per Diem"
                    value={perDiemRate}
                    setValue={setPerDiemRate}
                    icon="🍽️"
                    prefix="$"
                    suffix="/day"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Cost Summary */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl overflow-hidden">
        <div className="p-6 text-white">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="bg-white/20 rounded-lg p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </span>
            Cost Breakdown
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <CostItem label="Driver Pay" value={costs.driverPay} icon="👷" />
            <CostItem label="Fuel" value={costs.fuelCost} icon="⛽" />
            <CostItem label="Labor" value={costs.laborCost} icon="💪" />
            {needsHotel && <CostItem label="Hotel" value={costs.hotelCost} icon="🏨" />}
            {needsHotel && <CostItem label="Per Diem" value={costs.perDiemCost} icon="🍽️" />}
            {needsPacking && <CostItem label="Packing" value={costs.packingCost} icon="📦" />}
            <CostItem label="Truck" value={costs.truckCost} icon="🚚" />
            {moveType === 'one-way' && <CostItem label="Flights" value={costs.flightCost} icon="✈️" />}
            <CostItem label="Tolls" value={costs.tollCost} icon="🎫" />
          </div>
          
          <div className="border-t border-white/20 pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold">Total Quote</span>
              <span className="text-4xl font-bold text-green-400">
                ${costs.total.toFixed(2)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm opacity-80">
              <div>
                <span className="block text-gray-400">GPS Hours</span>
                <span className="font-semibold">{gpsDriveHours.toFixed(1)}h</span>
              </div>
              <div>
                <span className="block text-gray-400">Adjusted Hours</span>
                <span className="font-semibold">{costs.adjustedDriveHours.toFixed(1)}h</span>
              </div>
              <div>
                <span className="block text-gray-400">Driving Days</span>
                <span className="font-semibold">{costs.drivingDays}</span>
              </div>
              <div>
                <span className="block text-gray-400">Total Job Days</span>
                <span className="font-semibold">{totalJobDays}</span>
              </div>
            </div>
            
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
              className={`w-full mt-6 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                selectedLead
                  ? 'bg-green-500 hover:bg-green-600 text-white transform hover:scale-105'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {selectedLead ? '📤 Send to SmartMoving' : '⚠️ Import a Lead First'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Export with the error boundary wrapped around the page */
export default function DashboardPageWithBoundary() {
  return (
    <ErrorBoundary>
      <DashboardPage />
    </ErrorBoundary>
  );
}
