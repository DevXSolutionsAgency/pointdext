'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { MoveType, SmartMovingLead, PackingItem, CostSummary, DEFAULT_PACKING_ITEMS, DEFAULT_HOURLY_RATES } from '@/types/dashboard';
import { isDevelopment } from '@/utils/constants';

export function useDashboard() {
  // which view is visible
  const [view, setView] = useState<'split' | 'leads' | 'calculator'>('split');

  // lead data
  const [leads, setLeads] = useState<SmartMovingLead[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [leadsPerPage, setLeadsPerPage] = useState(25); 
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<SmartMovingLead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // loading flags for the three async actions
  const [calculatingRoute, setCalculatingRoute] = useState(false);
  const [checkingFlight, setCheckingFlight] = useState(false);
  const [submittingQuote, setSubmittingQuote] = useState(false);

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
  const [hotelNights, setHotelNights] = useState(0);
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
  const [numUnloaders, setNumUnloaders] = useState(2);
  const [numUnloaderDays, setNumUnloaderDays] = useState(1);
  const [unloaderDailyRate, setUnloaderDailyRate] = useState(300);
  const [unloadersRate, setUnloadersRate] = useState(0);

  // hourly rate toggles
  const [useHourlyRate, setUseHourlyRate] = useState(false);
  const [useUnloaderHourlyRate, setUseUnloaderHourlyRate] = useState(false);
  const [loaderHours, setLoaderHours] = useState(8);
  const [unloaderHours, setUnloaderHours] = useState(8);
  const [loaderHourlyRate, setLoaderHourlyRate] = useState(DEFAULT_HOURLY_RATES.loaders);
  const [unloaderHourlyRate, setUnloaderHourlyRate] = useState(DEFAULT_HOURLY_RATES.unloaders);

  // packing
  const [needsPacking, setNeedsPacking] = useState(false);

  // move-start date derived from SmartMoving serviceDate (yyyy-mm-dd)
  const [moveDate, setMoveDate] = useState<string | null>(null);

  const [packingItems, setPackingItems] = useState(() => DEFAULT_PACKING_ITEMS);
  
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
  const [truckDaysNeeded, setTruckDaysNeeded] = useState(1);

  // shuttle
  const [needsShuttle, setNeedsShuttle] = useState(false);
  const [shuttleDays, setShuttleDays] = useState(1);
  const [shuttleDailyRate, setShuttleDailyRate] = useState(200);
  const [shuttleMiles, setShuttleMiles] = useState(0);
  const [shuttleMileageRate, setShuttleMileageRate] = useState(0.5);

  // return flights
  const [numReturnFlights, setNumReturnFlights] = useState(2);
  const [flightTicketRate, setFlightTicketRate] = useState(0);
  const [flightAirline, setFlightAirline] = useState('');
  const [flightDepartTime, setFlightDepartTime] = useState('');

  // stops for multi-leg moves
  const [stops, setStops] = useState<string[]>([]);
  const handleAddStop = () => setStops(s => [...s, '']);
  const handleRemoveStop = (idx: number) => setStops(s => s.filter((_, i) => i !== idx));
  const setStop = (idx: number, val: string) => setStops(s => s.map((v, i) => i === idx ? val : v)); 

  // nearest airport (one-way only)
  const [nearestAirportName, setNearestAirportName] = useState('');
  const [nearestAirportCode, setNearestAirportCode] = useState('');

  const [showRouteModal, setShowRouteModal] = useState(false);
  const [routeAlternatives, setRouteAlternatives] = useState<any[]>([]);
  const [pendingRouteData, setPendingRouteData] = useState<any>(null);

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

  useEffect(() => {
    if (gpsDriveHours > 0) {  // Only update if we have calculated a route
      const extraHours = Math.floor(gpsDriveHours / 6) * 2;
      const adjustedHours = gpsDriveHours + extraHours;
      const drivingDays = Math.ceil(adjustedHours / 9);
      
      // Calculate labor hours contribution to truck days
      let laborHoursContribution = 0;
      if (useHourlyRate) {
        laborHoursContribution = Math.ceil(loaderHours / 8); // 8 hours = 1 day
      } else {
        laborHoursContribution = numLaborDays;
      }

      // Calculate unloader hours contribution to truck days
      let unloaderHoursContribution = 0;
      if (needsUnloaders) {
        if (useUnloaderHourlyRate) {
          unloaderHoursContribution = Math.ceil(unloaderHours / 8); // 8 hours = 1 day
        } else {
          unloaderHoursContribution = numUnloaderDays;
        }
      }

      // Calculate shuttle days contribution
      const shuttleDaysContribution = needsShuttle ? shuttleDays : 0;

      const newTruckDays = drivingDays + laborHoursContribution + unloaderHoursContribution + shuttleDaysContribution;
      setTruckDaysNeeded(newTruckDays);

      setHotelNights(Math.max(0, newTruckDays - 1));
    }
  }, [numLaborDays, numUnloaderDays, needsUnloaders, gpsDriveHours, useHourlyRate, loaderHours, useUnloaderHourlyRate, unloaderHours, needsShuttle, shuttleDays]);

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
        selectedRouteIndex: -1,
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

      if (data.requiresSelection && data.alternatives) {
        // Store the request data for later
        setPendingRouteData(body);
        setRouteAlternatives(data.alternatives);
        setShowRouteModal(true);
        setCalculatingRoute(false);
        return;
      }

      if (!data.success) throw new Error(data.error || 'Route calculation failed.');

      const { distance, duration, tolls, nearestAirportName: apName, nearestAirportCode: apCode } = data.data;

      setTotalMiles(Math.ceil(distance));
      setGpsDriveHours(Math.ceil(duration / 60));
      setNumTolls(tolls);

      // Calculate adjusted hours (add 2 hours for every 6 hours of GPS time)
      const gpsHours = Math.ceil(duration / 60);
      const extraHours = Math.floor(gpsHours / 6) * 2;
      const adjustedHours = gpsHours + extraHours;

      const calculatedDrivingDays = Math.ceil(adjustedHours / 9);
      // Calculate total truck days: driving days + current labor days + current unloader days
      const calculatedTruckDays = calculatedDrivingDays + numLaborDays + (needsUnloaders ? numUnloaderDays : 0);       
      setTruckDaysNeeded(calculatedTruckDays);  

      setHotelNights(Math.max(0, calculatedTruckDays - 1));

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

  async function handleRouteSelection(routeIndex: number) {
    setShowRouteModal(false);
    setCalculatingRoute(true);

    try {
      const body = {
        ...pendingRouteData,
        selectedRouteIndex: routeIndex
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

      // Calculate adjusted hours (add 2 hours for every 6 hours of GPS time)
      const gpsHours = Math.ceil(duration / 60);
      const extraHours = Math.floor(gpsHours / 6) * 2;
      const adjustedHours = gpsHours + extraHours;

      const calculatedDrivingDays = Math.ceil(adjustedHours / 9);
      const calculatedTruckDays = calculatedDrivingDays + numLaborDays + (needsUnloaders ? numUnloaderDays : 0);       
      setTruckDaysNeeded(calculatedTruckDays);
      setHotelNights(Math.max(0, calculatedTruckDays - 1));

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
      setPendingRouteData(null);
    }
  }

  /* Flight price lookup */
  async function handleCheckFlightPrice() {
    if (!nearestAirportCode) return toast.error('No nearest airport found.');
    if (!moveDate) return toast.error('Lead has no move date.');

    const start = new Date(moveDate);                 
    const last = new Date(start);
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

  const warnNoSalesPerson = (lead: SmartMovingLead) => {
    if (!lead.salesPersonId) {
      toast.error(
        '⚠️ Sales Person Missing. ' +
        'Please add Sales Person in SmartMoving.', {position: 'top-center', duration: 8000,});
    }
  };
  
  /* Import a lead into the calculator */
  function handleImportLead(lead: SmartMovingLead) {
    // warn immediately if the lead is missing its salesperson
    warnNoSalesPerson(lead);
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

  /* Cost calculations */
  function calculateCost(): CostSummary {
    const extraHours = Math.floor(gpsDriveHours / 6) * 2;
    const adjustedDriveHours = gpsDriveHours + extraHours;
    const drivingDays = Math.ceil(adjustedDriveHours / 9);
    const driverRate = moveType === 'one-way' ? oneWayDriverHourly : roundTripDriverHourly;
    const driverPay = numDrivers * adjustedDriveHours * driverRate;

    const gallons = totalMiles / 5;
    const fuelCost = gallons * gasPrice;
    
    // Updated labor cost calculation with hourly rate support
    let loadersCost = 0;
    if (useHourlyRate) {
      loadersCost = numWorkers * loaderHours * loaderHourlyRate;
    } else {
      loadersCost = numWorkers * numLaborDays * laborRate;
    }

    let unloadersCost = 0;
    if (needsUnloaders) {
      if (useUnloaderHourlyRate) {
        unloadersCost = numUnloaders * unloaderHours * unloaderHourlyRate;
      } else {
        unloadersCost = numUnloaders * numUnloaderDays * unloaderDailyRate;
      }
    }
    const laborCost = loadersCost + unloadersCost;

    let hotelCost = 0;
    let perDiemCost = 0;
    if (needsHotel) {
      hotelCost = hotelNights * hotelRate;
      perDiemCost = drivingDays * perDiemRate;
    }

    const packingTotal = needsPacking
      ? packingItems.reduce((sum, it) => sum + it.price * it.quantity, 0)
      : 0;

    const truckDays = truckDaysNeeded;
    const truckCost =
      truckDays * truckDailyRate + totalMiles * truckMileageRate;

    // Shuttle cost calculation
    const shuttleCost = needsShuttle 
      ? (shuttleDays * shuttleDailyRate + shuttleMiles * shuttleMileageRate)
      : 0;

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
      shuttleCost +
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
      shuttleCost,
      flightCost,
      tollCost,
      total,
    };
  }

  const costs = calculateCost();
  const totalJobDays = costs.drivingDays + numLaborDays + (needsUnloaders ? numUnloaderDays : 0);

  return {
    // View state
    view,
    setView,
    
    // Leads state
    leads,
    currentPage,
    setCurrentPage,
    leadsPerPage,
    setLeadsPerPage,
    loadingLeads,
    error,
    selectedLead,
    searchTerm,
    setSearchTerm,
    
    // Loading states
    calculatingRoute,
    checkingFlight,
    submittingQuote,
    
    // Calculator state
    moveType,
    setMoveType,
    warehouseStart,
    setWarehouseStart,
    warehouseReturn,
    setWarehouseReturn,
    pickup,
    setPickup,
    delivery,
    setDelivery,
    stops,
    handleAddStop,
    handleRemoveStop,
    setStop,
    totalMiles,
    setTotalMiles,
    gpsDriveHours,
    setGpsDriveHours,
    numTolls,
    setNumTolls,
    gasPrice,
    setGasPrice,
    laborRate,
    setLaborRate,
    needsHotel,
    setNeedsHotel,
    hotelNights,
    setHotelNights,
    hotelRate,
    setHotelRate,
    perDiemRate,
    setPerDiemRate,
    oneWayDriverHourly,
    setOneWayDriverHourly,
    roundTripDriverHourly,
    setRoundTripDriverHourly,
    numDrivers,
    setNumDrivers,
    numWorkers,
    setNumWorkers,
    numLaborDays,
    setNumLaborDays,
    needsUnloaders,
    setNeedsUnloaders,
    numUnloaders,
    setNumUnloaders,
    numUnloaderDays,
    setNumUnloaderDays,
    unloaderDailyRate,
    setUnloaderDailyRate,
    unloadersRate,
    setUnloadersRate,
    useHourlyRate,
    setUseHourlyRate,
    useUnloaderHourlyRate,
    setUseUnloaderHourlyRate,
    loaderHours,
    setLoaderHours,
    unloaderHours,
    setUnloaderHours,
    loaderHourlyRate,
    setLoaderHourlyRate,
    unloaderHourlyRate,
    setUnloaderHourlyRate,
    needsPacking,
    setNeedsPacking,
    moveDate,
    setMoveDate,
    packingItems,
    updatePackingItem,
    penskeCity,
    setPenskeCity,
    oneWayTruckCost,
    setOneWayTruckCost,
    truckDailyRate,
    setTruckDailyRate,
    truckMileageRate,
    setTruckMileageRate,
    truckDaysNeeded,
    setTruckDaysNeeded,
    needsShuttle,
    setNeedsShuttle,
    shuttleDays,
    setShuttleDays,
    shuttleDailyRate,
    setShuttleDailyRate,
    shuttleMiles,
    setShuttleMiles,
    shuttleMileageRate,
    setShuttleMileageRate,
    numReturnFlights,
    setNumReturnFlights,
    flightTicketRate,
    setFlightTicketRate,
    flightAirline,
    setFlightAirline,
    flightDepartTime,
    setFlightDepartTime,
    nearestAirportName,
    setNearestAirportName,
    nearestAirportCode,
    setNearestAirportCode,
    
    // Modal state
    showRouteModal,
    setShowRouteModal,
    routeAlternatives,
    setRouteAlternatives,
    pendingRouteData,
    
    // Functions
    handleDistanceCalc,
    handleRouteSelection,
    handleCheckFlightPrice,
    handleSubmitQuote,
    handleImportLead,
    calculateCost,
    
    // Computed values
    costs,
    totalJobDays,
  };
} 