export type Role = 'admin' | 'fan' | 'security';

export interface User {
  id: string;
  name: string;
  role: Role;
  seatZoneId?: string; // Fan's designated seating section
}

export type ZoneType = 'gate' | 'gallery' | 'snack' | 'seating';

export interface Zone {
  id: string;
  name: string;
  type: ZoneType;
  capacity: number;
  currentCount: number;
  status: 'open' | 'closed' | 'redirecting';
  nearestGateId?: string; // Links a seating zone to its closest gate
}

export interface ParkingSpot {
  id: string;
  isOccupied: boolean;
  isLocked?: boolean;
  vehicleType?: 'car' | 'bike';
  reservedBy?: string;
  gateId: string; // Associated gate for this spot
}

export interface Stadium {
  id: string;
  name: string;
  location: string;
  description: string;
  zones: Zone[];
  parkingSpots: ParkingSpot[];
}

export interface Message {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  target: 'security' | 'fans' | 'all';
}
