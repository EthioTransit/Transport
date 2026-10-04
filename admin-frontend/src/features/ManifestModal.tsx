import React, { useState, useEffect } from 'react';
import { Users, Bus, QrCode, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Modal } from '../components/Modal';
import { tripsApi } from '../api/endpoints';
import { Trip } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { BRAND } from '../config/brand';

interface ManifestModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: any | null;
}

export const ManifestModal: React.FC<ManifestModalProps> = ({
  isOpen,
  onClose,
  trip,
}) => {
  const [seatsData, setSeatsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && trip?._id) {
      setLoading(true);
      tripsApi
        .getSeats(trip._id)
        .then((res) => setSeatsData(res))
        .catch((err) => console.error('Error fetching seat layout:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, trip]);

  if (!isOpen || !trip) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Passenger Manifest • ${trip.tripCode}`}
      subtitle={`${trip.route?.origin?.name || 'Origin'} → ${trip.route?.destination?.name || 'Destination'} • ${trip.departureDate} at ${trip.departureTime}`}
      maxWidth="3xl"
    >
      {/* Trip Meta Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-xs mb-6">
        <div>
          <span className="text-gray-400 font-bold uppercase text-[10px]">Operator</span>
          <div className="font-bold text-brand-dark mt-0.5">{trip.operator?.name || 'Operator'}</div>
        </div>
        <div>
          <span className="text-gray-400 font-bold uppercase text-[10px]">Vehicle</span>
          <div className="font-bold text-brand-dark mt-0.5">{trip.vehicle?.plateNumber || 'Bus Fleet'}</div>
        </div>
        <div>
          <span className="text-gray-400 font-bold uppercase text-[10px]">Occupancy</span>
          <div className="font-bold text-brand-emerald mt-0.5">
            {trip.totalSeatsCount - trip.availableSeatsCount} / {trip.totalSeatsCount} Seats Booked
          </div>
        </div>
        <div>
          <span className="text-gray-400 font-bold uppercase text-[10px]">Trip Status</span>
          <div className="mt-0.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
              {trip.status}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400">Loading live seat manifest...</div>
      ) : (
        <div>
          <h4 className="font-bold text-xs text-brand-dark uppercase tracking-wider mb-3">
            Real-Time Seat Occupancy Grid
          </h4>

          {/* Seat Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-4 rounded-xl border border-gray-100 bg-gray-50/50 mb-6">
            {seatsData?.seats?.map((seat: any) => {
              const isBooked = seat.status === 'BOOKED';
              const isLocked = seat.status === 'LOCKED';
              const isAvailable = seat.status === 'AVAILABLE';

              return (
                <div
                  key={seat._id}
                  className={`p-2.5 rounded-lg border text-center text-xs transition-all ${
                    isBooked
                      ? 'bg-rose-50 border-rose-200 text-rose-800 font-bold'
                      : isLocked
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-white border-emerald-200 text-emerald-700 font-medium'
                  }`}
                >
                  <div className="font-bold text-xs">{seat.seatNumber}</div>
                  <div className="text-[9px] uppercase tracking-tighter mt-0.5 opacity-80">
                    {seat.status}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-brand-textMuted pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-white border border-emerald-400" />
                Available ({seatsData?.availableCount || 0})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-200 border border-rose-400" />
                Booked ({seatsData ? seatsData.totalSeats - seatsData.availableCount : 0})
              </span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-btn bg-gray-100 text-brand-dark font-bold text-xs hover:bg-gray-200 transition-colors"
            >
              Close Manifest
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
