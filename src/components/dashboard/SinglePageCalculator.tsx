'use client';

import { MoveType, SmartMovingLead, PackingItem, CostSummary, AIRLINE_NAMES } from '@/types/dashboard';
import { TextField, NumberField, ToggleSwitch, MetricCard, CostItem } from '@/components/ui';
import { PackingItemRow } from './PackingItemRow';

interface SinglePageCalculatorProps {
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

  stops: string[];
  onAddStop: () => void;
  onRemoveStop: (idx: number) => void;
  onSetStop: (idx: number, v: string) => void;

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
  hotelNights: number;
  setHotelNights: (v: number) => void;
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
    numUnloaders: number;
    setNumUnloaders: (v: number) => void;
    numUnloaderDays: number;
    setNumUnloaderDays: (v: number) => void;
    unloaderDailyRate: number;
    setUnloaderDailyRate: (v: number) => void;
    unloadersRate: number;
    setUnloadersRate: (v: number) => void;
    useHourlyRate: boolean;
    setUseHourlyRate: (v: boolean) => void;
    useUnloaderHourlyRate: boolean;
    setUseUnloaderHourlyRate: (v: boolean) => void;
    loaderHours: number;
    setLoaderHours: (v: number) => void;
    unloaderHours: number;
    setUnloaderHours: (v: number) => void;
    loaderHourlyRate: number;
    setLoaderHourlyRate: (v: number) => void;
    unloaderHourlyRate: number;
    setUnloaderHourlyRate: (v: number) => void;

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
    truckDaysNeeded: number;              
    setTruckDaysNeeded: (v: number) => void;
    needsShuttle: boolean;
    setNeedsShuttle: (v: boolean) => void;
    shuttleDays: number;
    setShuttleDays: (v: number) => void;
    shuttleDailyRate: number;
    setShuttleDailyRate: (v: number) => void;
    shuttleMiles: number;
    setShuttleMiles: (v: number) => void;
    shuttleMileageRate: number;
    setShuttleMileageRate: (v: number) => void;

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

  packingItems: PackingItem[];
  updatePackingItem: (
    idx: number,
    field: 'price' | 'quantity',
    val: number,
  ) => void;

  costs: CostSummary;
  totalJobDays: number;
}

export function SinglePageCalculator(props: SinglePageCalculatorProps) {
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
    hotelNights,
    hotelRate,
    perDiemRate,
    oneWayDriverHourly,
    roundTripDriverHourly,
    numDrivers,
    numWorkers,
    numLaborDays,
    needsUnloaders,
    numUnloaders,        
    numUnloaderDays,     
    unloaderDailyRate,
    unloadersRate,
    useHourlyRate,
    useUnloaderHourlyRate,
    loaderHours,
    unloaderHours,
    loaderHourlyRate,
    unloaderHourlyRate,
    needsPacking,
    truckDailyRate,
    truckMileageRate,
    truckDaysNeeded,
    needsShuttle,
    shuttleDays,
    shuttleDailyRate,
    shuttleMiles,
    shuttleMileageRate,
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
    setHotelNights,
    setHotelRate,
    setPerDiemRate,
    setOneWayDriverHourly,
    setRoundTripDriverHourly,
    setNumDrivers,
    setNumWorkers,
    setNumLaborDays,
    setNeedsUnloaders,
    setNumUnloaders,      
    setNumUnloaderDays,   
    setUnloaderDailyRate,
    setUnloadersRate,
    setUseHourlyRate,
    setUseUnloaderHourlyRate,
    setLoaderHours,
    setUnloaderHours,
    setLoaderHourlyRate,
    setUnloaderHourlyRate,
    setNeedsPacking,
    setPenskeCity,
    setOneWayTruckCost,
    setTruckDailyRate,
    setTruckMileageRate,
    setTruckDaysNeeded,
    setNeedsShuttle,
    setShuttleDays,
    setShuttleDailyRate,
    setShuttleMiles,
    setShuttleMileageRate,
    setNumReturnFlights,
    setFlightTicketRate,
  } = props;

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
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
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
            {props.stops.map((stop, idx) => (
              <div key={idx} className="relative">
                <TextField
                  label={`🚏 Stop ${idx + 1}`}
                  value={stop}
                  setValue={(val) => props.onSetStop(idx, val)}
                  icon="📍"
                />
                <button
                  onClick={() => props.onRemoveStop(idx)}
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
            onClick={props.onAddStop}
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
            {/* Loaders Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Loaders</span>
                <ToggleSwitch
                  checked={useHourlyRate}
                  onChange={setUseHourlyRate}
                />
                <span className="text-sm text-gray-500">
                  {useHourlyRate ? 'Hourly Rate' : 'Daily Rate'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <NumberField
                  label="Loaders"
                  value={numWorkers}
                  setValue={setNumWorkers}
                  icon="👥"
                  compact
                />
                {useHourlyRate ? (
                  <NumberField
                    label="Hours"
                    value={loaderHours}
                    setValue={setLoaderHours}
                    icon="⏱️"
                    compact
                  />
                ) : (
                  <NumberField
                    label="Days"
                    value={numLaborDays}
                    setValue={setNumLaborDays}
                    icon="📅"
                    compact
                  />
                )}
              </div>
              
              {useHourlyRate ? (
                <NumberField
                  label="Hourly Rate per Person"
                  value={loaderHourlyRate}
                  setValue={setLoaderHourlyRate}
                  icon="💰"
                  prefix="$"
                  suffix="/hr"
                />
              ) : (
                <NumberField
                  label="Daily Rate per Person"
                  value={laborRate}
                  setValue={setLaborRate}
                  icon="💰"
                  prefix="$"
                  suffix="/day"
                />
              )}
            </div>
            
            {/* Unloaders Section */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-700 font-medium">Unloaders</span>
                <ToggleSwitch
                  checked={needsUnloaders}
                  onChange={setNeedsUnloaders}
                />
              </div>
              {needsUnloaders && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rate Type</span>
                    <ToggleSwitch
                      checked={useUnloaderHourlyRate}
                      onChange={setUseUnloaderHourlyRate}
                    />
                    <span className="text-sm text-gray-500">
                      {useUnloaderHourlyRate ? 'Hourly Rate' : 'Daily Rate'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <NumberField
                      label="Unloaders"
                      value={numUnloaders}
                      setValue={setNumUnloaders}
                      icon="👥"
                      compact
                    />
                    {useUnloaderHourlyRate ? (
                      <NumberField
                        label="Hours"
                        value={unloaderHours}
                        setValue={setUnloaderHours}
                        icon="⏱️"
                        compact
                      />
                    ) : (
                      <NumberField
                        label="Days"
                        value={numUnloaderDays}
                        setValue={setNumUnloaderDays}
                        icon="📅"
                        compact
                      />
                    )}
                  </div>
                  
                  {useUnloaderHourlyRate ? (
                    <NumberField
                      label="Hourly Rate per Person"
                      value={unloaderHourlyRate}
                      setValue={setUnloaderHourlyRate}
                      icon="💰"
                      prefix="$"
                      suffix="/hr"
                    />
                  ) : (
                    <NumberField
                      label="Daily Rate per Person"
                      value={unloaderDailyRate}
                      setValue={setUnloaderDailyRate}
                      icon="💰"
                      prefix="$"
                      suffix="/day"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Shuttle Section */}
            <div className="pt-4 border-t border-gray-100">
              <label className="flex items-center justify-between group cursor-pointer">
                <span className="text-gray-700 font-medium">Shuttle Fee</span>
                <ToggleSwitch
                  checked={needsShuttle}
                  onChange={setNeedsShuttle}
                />
              </label>
              {needsShuttle && (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <NumberField
                      label="Days Needed"
                      value={shuttleDays}
                      setValue={setShuttleDays}
                      icon="📅"
                      compact
                    />
                    <NumberField
                      label="Daily Rate"
                      value={shuttleDailyRate}
                      setValue={setShuttleDailyRate}
                      icon="💳"
                      prefix="$"
                      compact
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <NumberField
                      label="Miles"
                      value={shuttleMiles}
                      setValue={setShuttleMiles}
                      icon="🛣️"
                      compact
                    />
                    <NumberField
                      label="Mileage Rate"
                      value={shuttleMileageRate}
                      setValue={setShuttleMileageRate}
                      icon="💰"
                      prefix="$"
                      suffix="/mile"
                      compact
                    />
                  </div>
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
              📊 Total days = Driving days (9hrs = 1 day) + Loading days + Unloading days + Shuttle days
            </p>
            <NumberField                   
              label="Days Needed"
              value={truckDaysNeeded}
              setValue={setTruckDaysNeeded}
              icon="📅"
              suffix="days"
            />
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
                <span className="text-gray-700 font-medium">Need Hotel / Per Diem?</span>
                <ToggleSwitch
                  checked={needsHotel}
                  onChange={setNeedsHotel}
                />
              </label>
              {needsHotel && (
                <div className="space-y-4 mt-4">
                  <NumberField
                    label="Number of Nights"
                    value={hotelNights}
                    setValue={setHotelNights}
                    icon="🌙"
                    suffix="nights"
                  />
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
                    label="Number of Nights"
                    value={hotelNights}
                    setValue={setHotelNights}
                    icon="🌙"
                    suffix="nights"
                  />
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
            {needsShuttle && <CostItem label="Shuttle" value={costs.shuttleCost} icon="🚐" />}
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