import { useAppStore } from "../store";
import { Navigation, Car, Bike, Check, MapPin } from "lucide-react";
import { motion } from "motion/react";

export default function ParkingMap() {
  const { activeStadium, reserveParkingSpot, lockParkingSpot, user } =
    useAppStore();

  if (!activeStadium) return null;

  const total = activeStadium.parkingSpots.length;
  const occupied = activeStadium.parkingSpots.filter(
    (p) => p.isOccupied,
  ).length;
  const locked = activeStadium.parkingSpots.filter((p) => p.isLocked).length;
  const available = total - occupied;
  const mySpot = activeStadium.parkingSpots.find(
    (p) => p.reservedBy === user?.id,
  );

  const seatingZones = activeStadium.zones.filter((z) => z.type === "seating");
  const userSeatZone = seatingZones.find((z) => z.id === user?.seatZoneId);
  const recommendedGateId = userSeatZone?.nearestGateId;

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Parking Logistics
          </h3>
          {recommendedGateId && (
            <div className="flex items-center gap-1 mt-2 text-[10px] text-blue-400 font-medium">
              <MapPin className="w-3 h-3" /> Area highlighted in blue is nearest
              to your ticket zone
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 sm:gap-4 md:col-span-2">
          <div className="text-center px-2 py-1.5 sm:px-4 bg-green-500/10 border border-green-500/20 rounded">
            <span className="block text-sm sm:text-lg font-bold text-green-400 leading-none">
              {available}
            </span>
            <span className="text-[8px] sm:text-[9px] text-green-500 uppercase tracking-widest font-bold mt-1">
              Available
            </span>
          </div>
          <div className="text-center px-2 py-1.5 sm:px-4 bg-blue-500/10 border border-blue-500/20 rounded">
            <span className="block text-sm sm:text-lg font-bold text-blue-400 leading-none">
              {locked}
            </span>
            <span className="text-[8px] sm:text-[9px] text-blue-500 uppercase tracking-widest font-bold mt-1">
              Locked
            </span>
          </div>
          <div className="text-center px-2 py-1.5 sm:px-4 bg-slate-800 border border-slate-700 rounded">
            <span className="block text-sm sm:text-lg font-bold text-slate-300 leading-none">
              {total}
            </span>
            <span className="text-[8px] sm:text-[9px] text-slate-500 uppercase tracking-widest font-bold mt-1">
              Total
            </span>
          </div>
        </div>
      </div>

      {mySpot && (
        <div
          className={`mb-6 p-4 border rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${mySpot.isLocked ? "bg-emerald-900/20 border-emerald-500/30" : "bg-blue-600/10 border-blue-500/30"}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 border rounded-lg flex items-center justify-center ${mySpot.isLocked ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50" : "bg-blue-500/20 text-blue-400 border-blue-500/50"}`}
            >
              {mySpot.vehicleType === "car" ? (
                <Car className="w-5 h-5" />
              ) : (
                <Bike className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p
                  className={`text-sm font-bold ${mySpot.isLocked ? "text-emerald-300" : "text-blue-100"}`}
                >
                  Reserved: {mySpot.id.toUpperCase()}
                </p>
                {mySpot.isLocked && (
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Locked
                  </span>
                )}
              </div>
              <p
                className={`text-[10px] uppercase tracking-widest mt-1 ${mySpot.isLocked ? "text-emerald-500/80" : "text-blue-300"}`}
              >
                {mySpot.isLocked
                  ? "Vehicle secured in facility"
                  : "Proceed to designated marking"}
              </p>
            </div>
          </div>
          {mySpot.isLocked ? (
            <Check className="w-6 h-6 text-emerald-400" />
          ) : (
            <button
              onClick={() => lockParkingSpot(activeStadium.id, mySpot.id)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors"
            >
              Lock Facility
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
        {activeStadium.parkingSpots.map((spot) => {
          const isMine = spot.reservedBy === user?.id;
          const isRecommended = recommendedGateId === spot.gateId;

          let stateClass = "";
          if (isMine) {
            stateClass = spot.isLocked
              ? "bg-emerald-900/30 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              : "bg-blue-500 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]";
          } else if (spot.isLocked) {
            stateClass =
              "bg-slate-900 border-emerald-500/30 text-emerald-700/50 cursor-not-allowed opacity-80";
          } else if (spot.isOccupied) {
            stateClass =
              "bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed opacity-80";
          } else if (isRecommended) {
            stateClass =
              "bg-blue-900/30 border-blue-500/50 text-blue-300 hover:bg-blue-800/50 hover:text-white cursor-pointer shadow-[0_0_10px_rgba(59,130,246,0.1)]";
          } else {
            stateClass =
              "bg-slate-800 border-slate-700 text-slate-400 hover:border-blue-500/50 hover:bg-slate-700 hover:text-slate-200 cursor-pointer";
          }

          return (
            <motion.button
              key={spot.id}
              layout
              whileHover={!(spot.isOccupied || mySpot) ? { scale: 1.05 } : {}}
              whileTap={!(spot.isOccupied || mySpot) ? { scale: 0.95 } : {}}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              disabled={spot.isOccupied || !!mySpot}
              onClick={() => {
                if (!spot.isOccupied && !mySpot) {
                  const type = window.confirm(
                    "Reserve for Car? (Cancel for Bike)",
                  )
                    ? "car"
                    : "bike";
                  reserveParkingSpot(activeStadium.id, spot.id, type);
                }
              }}
              className={`aspect-square rounded flex flex-col items-center justify-center gap-1 transition-colors border ${stateClass}`}
              title={spot.isOccupied ? "Occupied" : "Click to Reserve"}
            >
              <span className="text-[10px] font-mono leading-none tracking-widest">
                {spot.id.toUpperCase()}
              </span>
              {spot.isOccupied ? (
                isMine ? (
                  spot.vehicleType === "car" ? (
                    <Car className="w-3 h-3" />
                  ) : (
                    <Bike className="w-3 h-3" />
                  )
                ) : spot.vehicleType === "car" ? (
                  <Car className="w-3 h-3 shrink-0" />
                ) : (
                  <Bike className="w-3 h-3 shrink-0" />
                )
              ) : (
                <Navigation className="w-3 h-3 opacity-30" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
