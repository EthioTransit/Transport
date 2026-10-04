import React, { useState } from 'react';
import { Calendar, User, Ticket, CreditCard, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import { bookingsApi } from '../api/endpoints';
import { Booking } from '../types';
import { BRAND } from '../config/brand';

interface BookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onBookingUpdated?: () => void;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  isOpen,
  onClose,
  booking,
  onBookingUpdated,
}) => {
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !booking) return null;

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking? This will release the seats.')) {
      return;
    }
    setCancelling(true);
    setError('');
    try {
      await bookingsApi.cancel(booking._id, reason || 'Admin cancelled');
      if (onBookingUpdated) onBookingUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Booking Record • ${booking.bookingReference}`}
      subtitle={`Created on ${new Date(booking.createdAt).toLocaleString()}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {error && (
          <div className="p-3 rounded-btn bg-red-50 border border-red-200 text-status-error text-xs">
            {error}
          </div>
        )}

        {/* Top Status & Financial Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 text-xs">
          <div>
            <span className="text-gray-400 font-bold uppercase text-[10px]">Status</span>
            <div className="mt-1">
              <StatusBadge status={booking.status} />
            </div>
          </div>
          <div>
            <span className="text-gray-400 font-bold uppercase text-[10px]">Seats</span>
            <div className="font-mono font-bold text-brand-dark mt-1">
              {booking.seats?.join(', ')}
            </div>
          </div>
          <div>
            <span className="text-gray-400 font-bold uppercase text-[10px]">Base Fare</span>
            <div className="font-semibold text-brand-textMain mt-1">
              {booking.fare} {BRAND.currency}
            </div>
          </div>
          <div>
            <span className="text-gray-400 font-bold uppercase text-[10px]">Total Paid</span>
            <div className="font-extrabold text-brand-emerald text-sm mt-0.5">
              {booking.total} {BRAND.currency}
            </div>
          </div>
        </div>

        {/* Trip Overview */}
        <div>
          <h4 className="font-bold text-xs text-brand-dark uppercase tracking-wider mb-2.5">
            Trip & Route Details
          </h4>
          <div className="p-3.5 rounded-xl border border-gray-100 text-xs space-y-1">
            <div className="flex justify-between font-semibold">
              <span className="text-gray-500">Trip Code:</span>
              <span className="font-mono text-brand-dark">{booking.trip?.tripCode || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Departure:</span>
              <span className="text-brand-textMain font-medium">
                {booking.trip?.departureDate} at {booking.trip?.departureTime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Pickup Terminal:</span>
              <span className="text-brand-textMain">{booking.trip?.pickupLocation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Drop-off:</span>
              <span className="text-brand-textMain">{booking.trip?.dropOffLocation}</span>
            </div>
          </div>
        </div>

        {/* Passenger Roster */}
        <div>
          <h4 className="font-bold text-xs text-brand-dark uppercase tracking-wider mb-2.5">
            Passengers Manifest ({booking.passengers?.length || 0})
          </h4>
          <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden text-xs">
            {booking.passengers?.map((p, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between bg-white hover:bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-50 text-brand-emerald font-bold flex items-center justify-center text-xs">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-brand-dark">{p.name}</div>
                    <div className="text-[11px] text-gray-500">Phone: {p.phone}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-brand-emerald">Seat {p.seatNumber}</div>
                  <div className="text-[10px] text-gray-400 uppercase font-semibold">{p.ageGroup}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Cancellation Action */}
        {booking.status !== 'CANCELLED' && (
          <div className="pt-4 border-t border-gray-100">
            <h4 className="font-bold text-xs text-rose-700 uppercase tracking-wider mb-2">
              Administrative Cancellation
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Reason for cancellation (optional)..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="flex-1 px-3 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-rose-400"
              />
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelBooking}
                className="px-4 py-2 rounded-btn bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors shadow-xs disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
