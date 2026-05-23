import { Stadium } from './types';

export const INITIAL_STADIUMS: Stadium[] = [
  {
    id: 'eden-gardens',
    name: 'Eden Gardens',
    location: 'Kolkata',
    description: 'The Mecca of Indian Cricket. Known for its massive seating capacity and passionate crowd.',
    zones: [
      { id: 'g1', name: 'Gate 1', type: 'gate', capacity: 1000, currentCount: 200, status: 'open' },
      { id: 'g2', name: 'Gate 2', type: 'gate', capacity: 1000, currentCount: 850, status: 'open' },
      { id: 'g3', name: 'Gate 3', type: 'gate', capacity: 1000, currentCount: 150, status: 'open' },
      { id: 'g4', name: 'Gate 4', type: 'gate', capacity: 1000, currentCount: 500, status: 'open' },
      { id: 's1', name: 'Snack Bar A', type: 'snack', capacity: 200, currentCount: 180, status: 'open' },
      { id: 's2', name: 'Snack Bar B', type: 'snack', capacity: 200, currentCount: 50, status: 'open' },
      { id: 's3', name: 'Snack Bar C', type: 'snack', capacity: 200, currentCount: 10, status: 'open' },
      { id: 'sn1', name: 'North Stand', type: 'seating', capacity: 5000, currentCount: 3000, status: 'open', nearestGateId: 'g1' },
      { id: 'sn2', name: 'South Pavilion', type: 'seating', capacity: 2000, currentCount: 1900, status: 'open', nearestGateId: 'g2' },
    ],
    parkingSpots: Array.from({ length: 64 }, (_, i) => {
      const gates = ['g1', 'g2', 'g3', 'g4'];
      return {
        id: `p-${i}`,
        isOccupied: Math.random() > 0.6,
        vehicleType: Math.random() > 0.5 ? 'car' : 'bike',
        gateId: gates[i % gates.length]
      }
    })
  },
  {
    id: 'wankhede',
    name: 'Wankhede Stadium',
    location: 'Mumbai',
    description: 'Iconic stadium right by the sea. Expect high humidity and an electric atmosphere.',
    zones: [
      { id: 'g1', name: 'Gate 1 (Vinoo Mankad)', type: 'gate', capacity: 800, currentCount: 750, status: 'open' },
      { id: 'g2', name: 'Gate 2', type: 'gate', capacity: 800, currentCount: 120, status: 'open' },
      { id: 's1', name: 'Snack Bar North', type: 'snack', capacity: 150, currentCount: 100, status: 'open' },
      { id: 's2', name: 'Snack Bar South', type: 'snack', capacity: 150, currentCount: 40, status: 'open' },
      { id: 'sn1', name: 'Garware Pavilion', type: 'seating', capacity: 4000, currentCount: 3500, status: 'open', nearestGateId: 'g1' },
      { id: 'sn2', name: 'Vijay Merchant Stand', type: 'seating', capacity: 3000, currentCount: 1500, status: 'open', nearestGateId: 'g2' },
    ],
    parkingSpots: Array.from({ length: 48 }, (_, i) => {
      const gates = ['g1', 'g2'];
      return {
        id: `p-${i}`,
        isOccupied: Math.random() > 0.4,
        vehicleType: Math.random() > 0.5 ? 'car' : 'bike',
        gateId: gates[i % gates.length]
      }
    })
  },
  {
    id: 'chinnaswamy',
    name: 'M. Chinnaswamy Stadium',
    location: 'Bengaluru',
    description: 'Solar-powered stadium in the heart of the city. Fast outfield, smaller boundaries.',
    zones: [
      { id: 'g1', name: 'Gate A', type: 'gate', capacity: 600, currentCount: 500, status: 'open' },
      { id: 'g2', name: 'Gate B', type: 'gate', capacity: 600, currentCount: 550, status: 'open' },
      { id: 'g3', name: 'Gate C', type: 'gate', capacity: 600, currentCount: 100, status: 'open' },
      { id: 's1', name: 'Snack Counter 1', type: 'snack', capacity: 100, currentCount: 90, status: 'open' },
      { id: 's2', name: 'Snack Counter 2', type: 'snack', capacity: 100, currentCount: 20, status: 'open' },
      { id: 'sn1', name: 'Pavilion End', type: 'seating', capacity: 3000, currentCount: 2500, status: 'open', nearestGateId: 'g1' },
    ],
    parkingSpots: Array.from({ length: 56 }, (_, i) => {
      const gates = ['g1', 'g2', 'g3'];
      return {
        id: `p-${i}`,
        isOccupied: Math.random() > 0.7,
        vehicleType: Math.random() > 0.5 ? 'car' : 'bike',
        gateId: gates[i % gates.length]
      }
    })
  }
];
