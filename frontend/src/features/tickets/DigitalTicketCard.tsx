import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Bus,
  Calendar,
  Clock,
  MapPin,
  User,
  ShieldCheck,
  Printer,
  CheckCircle,
  Tag,
} from 'lucide-react';
import { Ticket } from '../../types';
import { BRAND } from '../../config/brand';

interface DigitalTicketCardProps {
  ticket: Ticket;
  onPrint?: () => void;
}

export const DigitalTicketCard: React.FC<DigitalTicketCardProps> = ({ ticket, onPrint }) => {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const isUsed = ticket.status === 'USED';
  const isCancelled = ticket.status === 'CANCELLED';

  return (
    <div className="max-w-md mx-auto my-2 sm:my-4 w-full">
      {/* Main Ticket Card */}
      <div
        className={`bg-white rounded-cardLg shadow-2xl overflow-hidden relative transition-all ${
          isCancelled ? 'opacity-70 grayscale' : ''
        }`}
        style={{ boxShadow: '0 20px 60px -10px rgba(11, 143, 85, 0.15), 0 6px 20px -4px rgba(0,0,0,0.08)' }}
      >
        {/* Cancelled overlay */}
        {isCancelled && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <span
              className="text-4xl sm:text-5xl font-black text-red-500/30 uppercase tracking-widest rotate-[-35deg]"
            >
              CANCELLED
            </span>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-br from-[#031d12] via-[#063B2A] to-brand-emerald p-4 sm:p-6 text-white relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg viewBox="0 0 400 160" className="w-full h-full">
              <circle cx="350" cy="80" r="120" fill="#10b981" />
              <circle cx="50" cy="20" r="80" fill="#D9A441" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              {/* Brand */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center">
                  <Bus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-black text-lg tracking-tight leading-none">{BRAND.name}</span>
                  <span className="block text-[10px] text-emerald-300/70 font-bold tracking-widest uppercase leading-none">
                    ኢትዮ-ትራንዚት
                  </span>
                </div>
              </div>

              {/* Status badge */}
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-black ${
                  isUsed
                    ? 'bg-amber-400 text-gray-900'
                    : isCancelled
                    ? 'bg-red-500/80 text-white'
                    : 'bg-emerald-400 text-brand-dark'
                }`}
              >
                {isUsed ? '✓ BOARDED' : isCancelled ? 'CANCELLED' : '✓ CONFIRMED'}
              </span>
            </div>

            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-emerald-300/80">
                {ticket.operatorName}
              </span>
              <h2 className="text-2xl font-black mt-0.5 tracking-tight">{ticket.routeTitle}</h2>
            </div>
          </div>

          {/* Ticket punch holes (decorative) */}
          <div className="absolute -bottom-4 -left-4 w-8 h-8 rounded-full bg-gray-100" />
          <div className="absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-gray-100" />
        </div>

        {/* Perforated separator */}
        <div className="relative mx-4 flex items-center gap-0">
          <div className="w-4 h-4 rounded-full bg-gray-100 -ml-8 flex-shrink-0 border-r border-gray-200" />
          <div className="flex-1 border-t-2 border-dashed border-gray-200" />
          <div className="w-4 h-4 rounded-full bg-gray-100 -mr-8 flex-shrink-0 border-l border-gray-200" />
        </div>

        {/* Ticket Body */}
        <div className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-5">
          {/* Key Info Grid */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-textLight block">
                Ticket No.
              </span>
              <p className="font-mono font-black text-brand-textMain text-sm mt-0.5 tracking-wider">
                {ticket.ticketNumber}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-textLight block">
                Seat
              </span>
              <p className="font-black text-brand-emerald text-2xl mt-0.5 leading-none">
                {ticket.seatNumber}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-textLight block">
                Vehicle Plate
              </span>
              <p className="font-semibold text-brand-textMain text-sm mt-0.5">
                {ticket.vehiclePlate || 'Assigned'}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-textLight block">
                Fare Paid
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-black text-brand-dark text-base">{ticket.amountPaid.toLocaleString()}</span>
                <span className="text-xs font-bold text-brand-textMuted">{BRAND.currency}</span>
              </div>
            </div>
          </div>

          {/* Passenger & Departure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-brand-emerald" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-textLight">Passenger</span>
                <p className="font-bold text-brand-textMain text-sm mt-0.5">{ticket.passengerName}</p>
                <p className="text-xs text-brand-textMuted">{ticket.passengerPhone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-brand-emerald" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-textLight">Departure</span>
                <p className="font-bold text-brand-textMain text-sm mt-0.5">{ticket.departureDate}</p>
                <p className="text-xs text-brand-textMuted">{ticket.departureTime} · {ticket.pickupLocation}</p>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-card p-5 border border-gray-100 flex flex-col items-center text-center">
            <div className="p-3 bg-white rounded-xl shadow-md border border-gray-100 inline-block">
              {ticket.qrCodeDataUrl ? (
                <img
                  src={ticket.qrCodeDataUrl}
                  alt="Boarding QR Code"
                  className="w-44 h-44 object-contain"
                />
              ) : (
                <QRCodeSVG
                  value={ticket.qrVerificationToken}
                  size={176}
                  level="H"
                  fgColor="#087443"
                  bgColor="#ffffff"
                />
              )}
            </div>

            <div className="mt-3">
              <span className="text-[10px] font-mono font-black text-brand-emerald tracking-widest block">
                {ticket.qrVerificationToken.slice(0, 24)}...
              </span>
              <p className="text-xs text-brand-textMuted mt-1.5 max-w-xs">
                Show this QR code to the driver when boarding your bus.
              </p>
            </div>

            {isUsed && (
              <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full border border-amber-200">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Boarded {ticket.boardingTime ? `at ${new Date(ticket.boardingTime).toLocaleTimeString()}` : ''}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <ShieldCheck className="w-4 h-4 text-brand-emerald" />
              <span>Verified Official Ticket</span>
            </div>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-btn bg-gray-100 hover:bg-gray-200 text-brand-textMain text-xs font-bold transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-brand-emerald" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
