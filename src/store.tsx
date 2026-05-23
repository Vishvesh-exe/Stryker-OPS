import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { User, Stadium, Message, Zone } from './types';
import { INITIAL_STADIUMS } from './data';

interface AppState {
  user: User | null;
  selectedStadiumId: string;
  stadiums: Stadium[];
  messages: Message[];
  weather: {
    condition: string;
    temp: number;
    alert: string | null;
    reroutePlan: string | null;
  };
  setUser: (user: User | null) => void;
  setSelectedStadiumId: (id: string) => void;
  updateZoneStatus: (stadiumId: string, zoneId: string, status: Zone['status']) => void;
  sendMessage: (title: string, content: string, target: Message['target']) => void;
  reserveParkingSpot: (stadiumId: string, spotId: string, vehicleType: 'car' | 'bike') => void;
  executeReroutePlan: () => void;
  dismissWeatherAlert: () => void;
  lockParkingSpot: (stadiumId: string, spotId: string) => void;
  isEvacuationMode: boolean;
  toggleEvacuationMode: () => void;
  activeStadium: Stadium | undefined;
}

const AppContext = createContext<AppState | null>(null);

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used within AppProvider');
  return context;
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedStadiumId, setSelectedStadiumId] = useState<string>(INITIAL_STADIUMS[0].id);
  const [stadiums, setStadiums] = useState<Stadium[]>(INITIAL_STADIUMS);
  const [weather, setWeather] = useState<{
    condition: string;
    temp: number;
    alert: string | null;
    reroutePlan: string | null;
  }>({
    condition: 'Clear',
    temp: 28,
    alert: null,
    reroutePlan: null
  });
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'mock-1',
      title: 'Gate 3 Turnstile Malfunction',
      content: 'CRITICAL - 6 Turnstiles broken down due to physical damage. Expect delays at Gate 3.',
      target: 'security',
      timestamp: Date.now() - 300000 // 5 mins ago
    },
    {
      id: 'mock-2',
      title: 'Heavy Thunderstorm Warning',
      content: 'Heavy thunderstorm initialized, local flooding outside Gate 3 gates.',
      target: 'all',
      timestamp: Date.now() - 150000 // 2.5 mins ago
    },
    {
      id: 'mock-3',
      title: 'Crowd Reroute Advisory',
      content: 'Please avoid Gate 3 and use alternate gates. Security staff deploy to Stand G.',
      target: 'fans',
      timestamp: Date.now() - 60000 // 1 min ago
    }
  ]);
  const [isEvacuationMode, setIsEvacuationMode] = useState(false);
  const toggleEvacuationMode = useCallback(() => setIsEvacuationMode(p => !p), []);

  // Simulate real-time crowd movement every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStadiums(currentStadiums => 
        currentStadiums.map(stadium => ({
          ...stadium,
          zones: stadium.zones.map(zone => {
            // Fluctuate count by -5% to +5%
            const change = Math.floor(zone.capacity * (Math.random() * 0.1 - 0.05));
            let newCount = zone.currentCount + change;
            if (newCount < 0) newCount = 0;
            if (newCount > zone.capacity) newCount = zone.capacity;
            
            // If closed/redirecting, count drops faster
            if (zone.status !== 'open') {
               newCount = Math.floor(zone.currentCount * 0.9);
            }
            
            return { ...zone, currentCount: newCount };
          })
        }))
      );
    }, 10000); // 10 seconds

    const weatherInterval = setInterval(() => {
      setWeather(current => {
        // Only trigger randomly over time to simulate dynamic changes
        const rand = Math.random();
        if (rand > 0.8 && current.condition === 'Clear') {
          return {
             condition: 'Heavy Rain',
             temp: 24,
             alert: 'Heavy Rain detected near Gate 3. Flooding risk high.',
             reroutePlan: 'Auto-suggestion: Divert upcoming crowds at Stand G towards Gate 1 and Gate 2.'
          };
        } else if (rand > 0.6 && (current.condition === 'Clear' || current.condition === 'Heavy Rain')) {
           return {
             condition: 'Thunderstorm',
             temp: 22,
             alert: 'Severe Thunderstorms. Electrical storm in vicinity.',
             reroutePlan: 'Evacuation Protocol: Advise fans to seek covered shelter (Pavilion) immediately.'
           };
        } else if (rand < 0.2 && current.condition !== 'Clear') {
           return { condition: 'Clear', temp: 28, alert: null, reroutePlan: null };
        }
        return current;
      });
    }, 15000); // Check every 15 seconds

    return () => {
      clearInterval(interval);
      clearInterval(weatherInterval);
    };
  }, []);

  const updateZoneStatus = useCallback((stadiumId: string, zoneId: string, status: Zone['status']) => {
    setStadiums(stadiums => stadiums.map(s => {
      if (s.id !== stadiumId) return s;
      return {
        ...s,
        zones: s.zones.map(z => z.id === zoneId ? { ...z, status } : z)
      };
    }));
  }, []);

  const sendMessage = useCallback((title: string, content: string, target: Message['target']) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      title,
      content,
      target,
      timestamp: Date.now()
    };
    setMessages(prev => [newMessage, ...prev]);
  }, []);

  const reserveParkingSpot = useCallback((stadiumId: string, spotId: string, vehicleType: 'car' | 'bike') => {
    setStadiums(stadiums => stadiums.map(s => {
      if (s.id !== stadiumId) return s;
      return {
        ...s,
        parkingSpots: s.parkingSpots.map(p => {
          if (p.id === spotId && !p.isOccupied) {
            return { ...p, isOccupied: true, vehicleType, reservedBy: user?.id, isLocked: false };
          }
          return p;
        })
      }
    }));
  }, [user]);

  const lockParkingSpot = useCallback((stadiumId: string, spotId: string) => {
    setStadiums(stadiums => stadiums.map(s => {
      if (s.id !== stadiumId) return s;
      return {
        ...s,
        parkingSpots: s.parkingSpots.map(p => {
          if (p.id === spotId && p.reservedBy === user?.id) {
            return { ...p, isLocked: true };
          }
          return p;
        })
      }
    }));
  }, [user]);

  const dismissWeatherAlert = useCallback(() => {
    setWeather(prev => ({ ...prev, alert: null, reroutePlan: null }));
  }, []);

  const executeReroutePlan = useCallback(() => {
    setWeather(prev => {
      if (prev.reroutePlan) {
        sendMessage('Command Action Executed', prev.reroutePlan, 'security');
        sendMessage('Emergency Protocol Active', 'Please follow security directions and avoid affected zones.', 'all');
      }
      return { ...prev, alert: null, reroutePlan: null };
    });
  }, [sendMessage]);

  const activeStadium = stadiums.find(s => s.id === selectedStadiumId);

  const value = {
    user,
    setUser,
    selectedStadiumId,
    setSelectedStadiumId,
    stadiums,
    activeStadium,
    messages,
    weather,
    updateZoneStatus,
    sendMessage,
    reserveParkingSpot,
    lockParkingSpot,
    executeReroutePlan,
    dismissWeatherAlert,
    isEvacuationMode,
    toggleEvacuationMode
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
