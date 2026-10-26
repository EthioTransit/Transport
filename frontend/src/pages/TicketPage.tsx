import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, Download, Share2, Bus, Check, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ticketsApi } from '../api/endpoints';
import { DigitalTicketCard } from '../features/tickets/DigitalTicketCard';
import { Ticket } from '../types';

export const TicketPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { t, i18n } = useTranslation();
  const isAmharic = i18n.language === 'am';

  useEffect(() => {
    if (!ticketId) return;

    const fetchTicket = async () => {
      setLoading(true);
      try {
        const data = await ticketsApi.getById(ticketId);
        setTicket(data);
      } catch (err: any) {
        setError(err.message || 'Ticket not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId]);

  const handleShare = async () => {
    const url = window.location.href;
    const shareTitle = `EthioTransit Boarding Pass - ${ticket?.routeTitle || 'Ticket'}`;
    const shareText = `Digital ticket for ${ticket?.passengerName} (${ticket?.routeTitle}) on ${ticket?.departureDate}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to copy
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    if (ticket?.ticketNumber) {
      document.title = `EthioTransit-Ticket-${ticket.ticketNumber}`;
    }
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-emerald border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <p className="text-sm font-black text-brand-textMain">
              {isAmharic ? 'ቲኬትዎን በመጫን ላይ...' : 'Loading your ticket...'}
            </p>
            <p className="text-xs text-brand-textMuted mt-1">
              {isAmharic ? 'ዲጂታል የመሳፈሪያ ፈቃድ በማዘጋጀት ላይ' : 'Fetching digital boarding pass'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Bus className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-lg font-black text-brand-dark mb-2">
            {isAmharic ? 'ቲኬቱ አልተገኘም' : 'Ticket Not Found'}
          </h2>
          <p className="text-sm text-brand-textMuted mb-6">
            {error || (isAmharic ? 'የተጠየቀውን ቲኬት ማግኘት አልቻልንም።' : 'We could not find this ticket.')}
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/my-tickets"
              className="px-6 py-3 rounded-btn bg-brand-emerald text-white font-bold text-sm shadow-md text-center hover:bg-brand-deep transition-colors"
            >
              {isAmharic ? 'የእኔ ቲኬቶች' : 'View My Tickets'}
            </Link>
            <Link
              to="/"
              className="px-6 py-2.5 rounded-btn text-sm font-semibold text-brand-textMuted hover:bg-gray-50 text-center transition-colors"
            >
              {isAmharic ? 'ወደ መነሻ ገጽ ተመለስ' : 'Return to Home'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-bg min-h-screen">
      {/* Page Header */}
      <div className="no-print print:hidden bg-[#031d12] text-white py-5 sm:py-6 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/50">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/my-tickets"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-white mb-3 sm:mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isAmharic ? 'የእኔ ዲጂታል ቲኬቶች' : 'My Digital Tickets'}</span>
          </Link>
          <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                {isAmharic ? 'የመሳፈሪያ ዲጂታል ቲኬት' : 'Boarding Pass'}
              </h1>
              <p className="text-emerald-200/70 text-xs sm:text-sm mt-0.5 sm:mt-1">
                {ticket.routeTitle} · {ticket.departureDate}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-btn bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-colors shadow-xs"
                title="Share Ticket"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? (isAmharic ? 'ተቀድቷል!' : 'Copied!') : (isAmharic ? 'አጋራ' : 'Share')}</span>
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-emerald hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-md shadow-emerald-950/30 hover:-translate-y-0.5 active:translate-y-0"
                title={isAmharic ? 'ቲኬትዎን ያትሙ ወይም እንደ PDF ያውርዱ' : 'Print ticket or save as PDF'}
              >
                <Printer className="w-3.5 h-3.5" />
                <Download className="w-3.5 h-3.5" />
                <span>{isAmharic ? 'አትም / PDF አውርድ' : 'Print / Download PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <DigitalTicketCard ticket={ticket} onPrint={handlePrint} />

        {/* Download as PDF tip */}
        <div className="no-print print:hidden mt-3 max-w-md mx-auto text-center">
          <p className="text-[11px] text-brand-textMuted flex items-center justify-center gap-1.5 font-medium">
            <Download className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
            <span>
              {isAmharic
                ? 'በማተሚያ ሳጥኑ ላይ "Save as PDF" በመምረጥ ቲኬቱን በስልክዎ ወይም በኮምፒውተርዎ ማስቀመጥ ይችላሉ።'
                : 'Select "Save as PDF" in printer options to download an offline ticket.'}
            </span>
          </p>
        </div>

        {/* Show this QR code instruction */}
        <div className="no-print print:hidden mt-5 max-w-xl mx-auto">

          <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs sm:text-sm text-emerald-800 font-semibold shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-brand-emerald flex items-center justify-center flex-shrink-0">
              <span className="text-white text-base">📱</span>
            </div>
            <span>
              {isAmharic
                ? 'ሲሳፈሩ ይህን QR ኮድ ለአሽከርካሪው ያሳዩ። ስካን እንዲደረግ የስክሪን ብሩህነትዎን ከፍ ያድርጉ።'
                : 'Show this QR code to the driver when boarding. Keep your screen brightness high for easy scanning.'}
            </span>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="no-print print:hidden mt-6 sm:mt-8 max-w-xl mx-auto flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/my-tickets"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm font-bold text-brand-textMain hover:bg-gray-50 transition-colors text-center shadow-xs"
          >
            {isAmharic ? 'ሁሉንም ቲኬቶቼን አሳይ' : 'All My Tickets'}
          </Link>
          <Link
            to="/search"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-emerald text-white text-xs sm:text-sm font-bold hover:bg-brand-deep transition-colors text-center shadow-md shadow-brand-emerald/20"
          >
            {isAmharic ? 'ሌላ ጉዞ ያስይዙ' : 'Book Another Trip'}
          </Link>
        </div>
      </div>
    </div>
  );
};
