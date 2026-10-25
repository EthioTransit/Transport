import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, Ticket, ShieldCheck, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { paymentsApi } from '../api/endpoints';
import { Ticket as TicketType } from '../types';
import { BRAND } from '../config/brand';

export const PaymentVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isAmharic = i18n.language === 'am';

  const rawRef =
    searchParams.get('ref') ||
    searchParams.get('tx_ref') ||
    searchParams.get('trx_ref') ||
    searchParams.get('amp;ref') ||
    '';
  const ref = rawRef.trim();
  const bookingId = searchParams.get('bookingId') || searchParams.get('amp;bookingId') || '';
  const simulateParam = (searchParams.get('simulateResult') as 'SUCCESS' | 'FAILED') || 'SUCCESS';

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [bookingReference, setBookingReference] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const performVerification = async () => {
    if (!ref) {
      setError(isAmharic ? 'የክፍያ መለያ ቁጥር አልተገኘም።' : 'Missing transaction reference.');
      setVerifying(false);
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const res = await paymentsApi.verify({
        transactionReference: ref,
        simulateResult: simulateParam,
      });

      setSuccess(true);
      if (res.tickets) setTickets(res.tickets);
      if (res.bookingReference) setBookingReference(res.bookingReference);
    } catch (err: any) {
      setError(err.message || (isAmharic ? 'የክፍያ ማረጋገጫው አልተሳካም።' : 'Payment verification failed.'));
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    performVerification();
  }, [ref]);

  return (
    <div className="bg-brand-bg min-h-screen py-16 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-cardLg p-8 border border-gray-100 shadow-2xl text-center">
          {verifying ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-16 h-16 border-4 border-brand-emerald border-t-transparent rounded-full animate-spin" />
              <div className="flex flex-col gap-1">
                <h3 className="font-extrabold text-xl text-brand-dark">
                  {isAmharic ? 'ክፍያውን በማረጋገጥ ላይ' : 'Verifying Official Payment'}
                </h3>
                <p className="text-xs text-brand-textMuted max-w-xs">
                  {isAmharic
                    ? 'የክፍያ ደረሰኝን ለማረጋገጥ እና ዲጂታል የመሳፈሪያ ቲኬቶችን ለማዘጋጀት ከክፍያ ስርዓቱ ጋር በመገናኘት ላይ...'
                    : 'Connecting to payment gateway to confirm official fare receipt and generate digital boarding tickets...'}
                </p>
              </div>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center gap-4 py-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-status-success flex items-center justify-center shadow-md shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-emerald">
                  {isAmharic ? 'ክፍያው ተረጋግጧል' : 'Transaction Verified'}
                </span>
                <h2 className="text-2xl font-black text-brand-dark">
                  {isAmharic ? 'ክፍያው በተሳካ ሁኔታ ተፈጽሟል!' : 'Payment Confirmed!'}
                </h2>
                <p className="text-xs text-brand-textMuted max-w-xs mt-1">
                  {isAmharic
                    ? 'የያዙት ወንበር በይፋ ተረጋግጧል። የማይደለዝ QR ኮድ ያለው ዲጂታል ቲኬት ተዘጋጅቷል።'
                    : 'Your seat booking is officially secured. Digital tickets with tamper-proof QR codes have been issued.'}
                </p>
              </div>

              {bookingReference && (
                <div className="w-full my-2 p-3 bg-gray-50 rounded-btn border border-gray-200 text-xs flex justify-between items-center">
                  <span className="text-brand-textMuted font-semibold">
                    {isAmharic ? 'የማስያዣ መለያ' : 'Booking Reference'}
                  </span>
                  <span className="font-mono font-bold text-brand-dark text-sm">{bookingReference}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-2.5 mt-4">
                {tickets.length > 0 ? (
                  <Link
                    to={`/tickets/${tickets[0]._id}`}
                    id="view-digital-ticket-btn"
                    className="w-full py-3.5 rounded-btn bg-brand-emerald hover:bg-brand-deep text-white font-extrabold text-sm shadow-md shadow-brand-emerald/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>{isAmharic ? 'ዲጂታል ቲኬትን ይመልከቱ' : 'View Digital Ticket'}</span>
                  </Link>
                ) : (
                  <Link
                    to="/my-tickets"
                    className="w-full py-3.5 rounded-btn bg-brand-emerald text-white font-extrabold text-sm shadow-md"
                  >
                    {isAmharic ? 'የእኔ ቲኬቶችን ይመልከቱ' : 'View My Tickets'}
                  </Link>
                )}

                <Link
                  to="/"
                  className="w-full py-3 rounded-btn text-xs font-bold text-brand-textMuted hover:bg-gray-100 transition-colors"
                >
                  {isAmharic ? 'ወደ መነሻ ገጽ ተመለስ' : 'Return to Home'}
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-16 h-16 rounded-full bg-red-50 text-status-error flex items-center justify-center">
                <XCircle className="w-10 h-10" />
              </div>

              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-black text-brand-dark">
                  {isAmharic ? 'ክፍያውን ማረጋገጥ አልተቻለም' : 'Payment Authorization Failed'}
                </h2>
                <p className="text-xs text-brand-textMuted">{error}</p>
              </div>

              <div className="flex flex-col gap-2 w-full mt-4">
                <button
                  onClick={performVerification}
                  className="w-full py-3 rounded-btn bg-brand-emerald text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{isAmharic ? 'እንደገና ሞክር' : 'Retry Verification'}</span>
                </button>
                <Link
                  to="/search"
                  className="w-full py-2.5 rounded-btn text-xs font-semibold text-gray-500 hover:bg-gray-50"
                >
                  {isAmharic ? 'ወደ ፍለጋ ተመለስ' : 'Return to Search'}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

