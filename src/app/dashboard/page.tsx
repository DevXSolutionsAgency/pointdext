// page.tsx
'use client';

import React from 'react';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from '@/components/ui';
import { ViewToggle, LeadsTable, SinglePageCalculator, RouteSelectionModal } from '@/components/dashboard';
import { useDashboard } from '@/hooks/useDashboard';

/* Main dashboard component */
function DashboardPage() {
  const {
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
    flightDepartTime,
    nearestAirportName,
    nearestAirportCode,
    
    // Modal state
    showRouteModal,
    setShowRouteModal,
    routeAlternatives,
    
    // Functions
    handleDistanceCalc,
    handleRouteSelection,
    handleCheckFlightPrice,
    handleSubmitQuote,
    handleImportLead,
    
    // Computed values
    costs,
    totalJobDays,
  } = useDashboard();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* toast notifications go at the very top */}
      <Toaster position="top-right" />

      {/* Route Selection Modal */}
      <RouteSelectionModal
        isOpen={showRouteModal}
        onClose={() => setShowRouteModal(false)}
        alternatives={routeAlternatives}
        onSelect={handleRouteSelection}
      />

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
          
          {/* ── Leads panel ─────────────────────────────────────────────── */}
          {(view === 'split' || view === 'leads') && (
            <LeadsTable
              leads={leads}
              loadingLeads={loadingLeads}
              error={error}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              leadsPerPage={leadsPerPage}
              setLeadsPerPage={setLeadsPerPage}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onImportLead={handleImportLead}
            />
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
                stops={stops}
                onAddStop={handleAddStop}
                onRemoveStop={handleRemoveStop}
                onSetStop={setStop}
                totalMiles={totalMiles} setTotalMiles={setTotalMiles}
                gpsDriveHours={gpsDriveHours} setGpsDriveHours={setGpsDriveHours}
                numTolls={numTolls} setNumTolls={setNumTolls}
                gasPrice={gasPrice} setGasPrice={setGasPrice}
                laborRate={laborRate} setLaborRate={setLaborRate}
                needsUnloaders={needsUnloaders} setNeedsUnloaders={setNeedsUnloaders}
                numUnloaders={numUnloaders} setNumUnloaders={setNumUnloaders}
                numUnloaderDays={numUnloaderDays} setNumUnloaderDays={setNumUnloaderDays}
                unloaderDailyRate={unloaderDailyRate} setUnloaderDailyRate={setUnloaderDailyRate}
                unloadersRate={unloadersRate} setUnloadersRate={setUnloadersRate}
                useHourlyRate={useHourlyRate} setUseHourlyRate={setUseHourlyRate}
                useUnloaderHourlyRate={useUnloaderHourlyRate} setUseUnloaderHourlyRate={setUseUnloaderHourlyRate}
                loaderHours={loaderHours} setLoaderHours={setLoaderHours}
                unloaderHours={unloaderHours} setUnloaderHours={setUnloaderHours}
                loaderHourlyRate={loaderHourlyRate} setLoaderHourlyRate={setLoaderHourlyRate}
                unloaderHourlyRate={unloaderHourlyRate} setUnloaderHourlyRate={setUnloaderHourlyRate}
                needsHotel={needsHotel} setNeedsHotel={setNeedsHotel}
                hotelNights={hotelNights} setHotelNights={setHotelNights}
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
                truckDaysNeeded={truckDaysNeeded} setTruckDaysNeeded={setTruckDaysNeeded}
                needsShuttle={needsShuttle} setNeedsShuttle={setNeedsShuttle}
                shuttleDays={shuttleDays} setShuttleDays={setShuttleDays}
                shuttleDailyRate={shuttleDailyRate} setShuttleDailyRate={setShuttleDailyRate}
                shuttleMiles={shuttleMiles} setShuttleMiles={setShuttleMiles}
                shuttleMileageRate={shuttleMileageRate} setShuttleMileageRate={setShuttleMileageRate}
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

/* Export with the error boundary wrapped around the page */
export default function DashboardPageWithBoundary() {
  return (
    <ErrorBoundary>
      <DashboardPage />
    </ErrorBoundary>
  );
}
