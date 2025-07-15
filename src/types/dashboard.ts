export type MoveType = 'one-way' | 'round-trip';

export interface CostSummary {
  adjustedDriveHours: number;
  drivingDays: number;
  driverPay: number;
  fuelCost: number;
  laborCost: number;
  hotelCost: number;
  perDiemCost: number;
  packingCost: number;
  truckCost: number;
  shuttleCost: number;
  flightCost: number;
  tollCost: number;
  total: number;
}

export interface PackingItem {
  name: string;
  price: number;
  quantity: number;
}

export interface RouteAlternative {
  index: number;
  summary: string;
  distance: number;
  duration: number;
  distanceText: string;
  durationText: string;
  tolls: number;
}

export interface SmartMovingLead {
  id: string;
  customerName?: string;
  originAddressFull?: string;
  destinationAddressFull?: string;
  originStreet?: string;
  originCity?: string;
  destinationStreet?: string;
  destinationCity?: string;
  serviceDate?: string;
  salesPersonId?: string;
}

export const AIRLINE_NAMES: Record<string, string> = {
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

export const DEFAULT_PACKING_ITEMS: PackingItem[] = [
  { name: 'Small Box', price: 3.25, quantity: 0 },
  { name: 'Medium Box', price: 4.25, quantity: 0 },
  { name: 'Large Box', price: 5.25, quantity: 0 },
  { name: 'Dish Box', price: 10, quantity: 0 },
  { name: 'Dish Pack Inserts', price: 12, quantity: 0 },
  { name: 'TV Box', price: 25, quantity: 0 },
  { name: 'Wardrobe Box', price: 20, quantity: 0 },
  { name: 'Mattress Bag (King)', price: 15, quantity: 0 },
  { name: 'Speed Pack', price: 60, quantity: 0 },
  { name: 'Paper Pad (Brown)', price: 3, quantity: 0 },
  { name: 'Packing Paper (200)', price: 40, quantity: 0 },
  { name: 'Furniture Pad', price: 20, quantity: 0 },
  { name: '4 Pack Mirror Carton', price: 25, quantity: 0 },
  { name: 'Lamp Box', price: 5, quantity: 0 },
  { name: 'Piano Board', price: 200, quantity: 0 },
  { name: 'Straps/Tie Downs', price: 10, quantity: 0 },
  { name: 'Floor Protection', price: 100, quantity: 0 },
  { name: 'Mattress Box', price: 45, quantity: 0 },
  { name: 'Pre Move Package', price: 100, quantity: 0 },
  { name: 'French Cleat', price: 20, quantity: 0 },
];

// Default values for hourly rates (to be confirmed with Anthony)
export const DEFAULT_HOURLY_RATES = {
  loaders: 25, // Default hourly rate for loaders
  unloaders: 25, // Default hourly rate for unloaders
}; 