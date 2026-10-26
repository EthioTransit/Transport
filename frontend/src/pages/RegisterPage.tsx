import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Bus,
  ShieldCheck,
  ArrowRight,
  Clock,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/endpoints';
import { Footer } from '../components/common/Footer';
import { UserRole } from '../types';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isAmharic = i18n.language === 'am';

  // Step state: 'form' (Initial inputs) | 'otp' (Brevo OTP Verification)
  const [step, setStep] = useState<'form' | 'otp'>('form');

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // OTP Fields
  const [otp, setOtp] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Global UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cooldown countdown effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1: Initiate registration and send Brevo OTP
  const handleInitiateRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone || !password) return;

    if (!agreeTerms) {
      setError(
        isAmharic
          ? 'እባክዎ ለመመዝገብ የኢትዮትራንዚትን የአገልግሎት ውሎች እና ደንቦች ይቀበሉ።'
          : 'Please accept the EthioTransit terms and conditions to register.'
      );
      return;
    }

    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      const res = await authApi.initiateRegistration({
        firstName,
        lastName,
        email,
        phone,
        password,
        role: UserRole.PASSENGER,
      });

      if (res.devCode) {
        setDevCode(res.devCode);
      } else {
        setDevCode(null);
      }

      setStep('otp');
      setResendCooldown(60);
      setInfoMessage(
        isAmharic
          ? `የ 6-ዲጂት የማረጋገጫ ኮድ ወደ ${email} ተልኳል።`
          : `A 6-digit verification code has been sent to ${email}.`
      );
    } catch (err: any) {
      setError(
        err.message ||
          (isAmharic
            ? 'ምዝገባው አልተሳካም። እባክዎ መረጃዎን አረጋግጠው እንደገና ይሞክሩ።'
            : 'Registration failed. Please check your information and try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and finalize account creation
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      setError(
        isAmharic
          ? 'እባክዎ ትክክለኛውን የ 6-ዲጂት የማረጋገጫ ኮድ ያስገቡ።'
          : 'Please enter the full 6-digit verification code.'
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authApi.verifyRegistrationOtp({
        email,
        otp: otp.trim(),
      });

      // Redirect to login with success alert
      navigate('/login', {
        state: {
          successMessage: isAmharic
            ? 'ኢሜይልዎ ተረጋግጧል እና መለያዎ በተሳካ ሁኔታ ተፈጥሯል! እባክዎ ለመግባት ይቀጥሉ።'
            : 'Email verified and account created successfully! Please sign in to continue.',
          prefillEmail: email,
        },
      });
    } catch (err: any) {
      setError(
        err.message ||
          (isAmharic
            ? 'የማረጋገጫ ኮዱ ትክክል አይደለም። እባክዎ እንደገና ይሞክሩ።'
            : 'Invalid or expired verification code. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP code
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      const res = await authApi.resendRegistrationOtp({ email });
      if (res.devCode) {
        setDevCode(res.devCode);
      }
      setResendCooldown(60);
      setInfoMessage(
        isAmharic
          ? 'አዲስ የማረጋገጫ ኮድ ወደ ኢሜይልዎ ተልኳል!'
          : 'A fresh verification code has been sent to your email!'
      );
    } catch (err: any) {
      setError(
        err.message ||
          (isAmharic
            ? 'ኮዱን እንደገና መላክ አልተቻለም። እባክዎ ጥቂት ሰከንዶች ቆይተው እንደገና ይሞክሩ።'
            : 'Failed to resend code. Please try again shortly.')
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#FAF8F5]">
      {/* Split-screen Auth Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* LEFT COLUMN: BRAND CINEMATIC PANEL (Deep Emerald with Constellation Network) */}
        <div className="lg:w-1/2 bg-[#031d12] text-white p-6 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden min-h-0 lg:min-h-full">
          {/* Background Constellation Lines */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
            <svg viewBox="0 0 800 800" className="w-full h-full object-cover">
              <circle cx="400" cy="400" r="120" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="400" cy="400" r="240" fill="none" stroke="#D9A441" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="400" y1="400" x2="200" y2="200" stroke="#10b981" strokeWidth="1" />
              <line x1="400" y1="400" x2="650" y2="250" stroke="#D9A441" strokeWidth="1" />
              <line x1="400" y1="400" x2="300" y2="600" stroke="#10b981" strokeWidth="1" />
              <line x1="400" y1="400" x2="600" y2="650" stroke="#10b981" strokeWidth="1" />

              {[
                { name: 'GONDAR', x: 200, y: 200 },
                { name: 'BAHIR DAR', x: 220, y: 320 },
                { name: 'ADDIS ABABA', x: 400, y: 400, isCenter: true },
                { name: 'DIRE DAWA', x: 650, y: 250 },
                { name: 'JIMMA', x: 300, y: 600 },
                { name: 'HAWASSA', x: 600, y: 650 },
              ].map((node, i) => (
                <g key={i} transform={`translate(${node.x}, ${node.y})`}>
                  <circle
                    r={node.isCenter ? 6 : 4}
                    fill={node.isCenter ? '#D9A441' : '#10b981'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <text
                    x={node.x > 400 ? 12 : -12}
                    y={4}
                    textAnchor={node.x > 400 ? 'start' : 'end'}
                    fill="#a7f3d0"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                    letterSpacing="1"
                  >
                    {node.name}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Brand Header */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-emerald to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/40 group-hover:scale-105 transition-transform">
                <Bus className="w-5 h-5 text-brand-dark" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-white leading-none">
                  ETHIOTRANSIT
                </span>
                <span className="text-[10px] tracking-[0.25em] text-emerald-400 font-bold uppercase mt-1">
                  ኢትዮ-ትራንዚት
                </span>
              </div>
            </Link>

            <div className="mt-8 sm:mt-14 max-w-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-bold mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{isAmharic ? 'የኢትዮጵያ ዲጂታል የትኬት ስርዓት' : 'National Digital Transit Network'}</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black font-serif tracking-tight leading-tight text-white">
                {step === 'otp'
                  ? isAmharic
                    ? 'ደህንነቱ የተጠበቀ የማረጋገጫ ሂደት።'
                    : 'Secure OTP email verification.'
                  : isAmharic
                  ? 'የከተማ አቋራጭ ጉዞዎን በደቂቃዎች ውስጥ ያስይዙ።'
                  : 'Modern intercity travel across Ethiopia.'}
              </h1>
              <p className="mt-4 text-sm sm:text-base text-emerald-100/70 leading-relaxed">
                {step === 'otp'
                  ? isAmharic
                    ? 'የመለያዎን ደህንነት ለመጠበቅ በBrevo በኩል የተላከውን የ 6-ዲጂት ሚስጥራዊ ቁጥር ያስገቡ።'
                    : 'We ensure platform safety by verifying each traveler via secure Brevo transactional email.'
                  : isAmharic
                  ? 'ከአዲስ አበባ፣ ባህር ዳር፣ ጎንደር፣ ድሬዳዋ፣ ሐዋሳ እና ጂማ ፈጣን የመቀመጫ ምዝገባ፣ ህጋዊ ታሪፎች እና ፈጣን የQR ዲጂታል ቦርዲንግ ፓስ።'
                  : 'Fast seat reservation, official regulated fares, and tamper-proof digital QR boarding passes for all major routes.'}
              </p>
            </div>
          </div>

          {/* Feature List (Bottom Left) - shown on sm+ */}
          <div className="hidden sm:block relative z-10 space-y-4 pt-10 border-t border-emerald-900/60 mt-8 text-xs font-bold tracking-wider text-emerald-100 uppercase">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-900/60 border border-emerald-700/40 flex items-center justify-center text-emerald-300">
                <Bus className="w-4 h-4" />
              </div>
              <span>{isAmharic ? 'ፈጣን የዲጂታል ወንበር ማረጋገጫ' : 'Instant Digital Seat Confirmation'}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-900/60 border border-emerald-700/40 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>{isAmharic ? 'በመንግስት ቁጥጥር ስር ያሉ ታሪፎች' : 'Official Government Regulated Fares'}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-900/60 border border-emerald-700/40 flex items-center justify-center text-emerald-300">
                <Clock className="w-4 h-4" />
              </div>
              <span>{isAmharic ? 'የማይደለዝ ደህንነቱ የተጠበቀ QR ቲኬት' : 'Tamper-Proof QR Boarding Passes'}</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REGISTRATION & OTP FORM */}
        <div className="lg:w-1/2 p-5 sm:p-12 lg:p-16 flex flex-col justify-center max-w-2xl mx-auto w-full">
          {step === 'form' ? (
            /* STEP 1: FORM INPUTS */
            <>
              {/* Subheader */}
              <div className="mb-6">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  {isAmharic ? 'ኢትዮትራንዚትን ይቀላቀሉ' : 'JOIN ETHIOTRANSIT'}
                </span>
                <h2 className="text-2xl sm:text-4xl font-bold font-serif text-brand-dark tracking-tight mt-2.5 sm:mt-3">
                  {isAmharic ? 'አዲስ መለያ ይክፈቱ' : 'Create account'}
                </h2>
                <p className="text-xs sm:text-sm text-brand-textMuted mt-1">
                  {isAmharic
                    ? 'የአውቶቡስ ወንበሮችን ይያዙ፣ የዲጂታል ቲኬቶችን ያስተዳድሩ እና ጉዞዎችን ይከታተሉ'
                    : 'Book bus seats, manage digital boarding passes, and track trips'}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-status-error text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Main Form */}
              <form onSubmit={handleInitiateRegistration} className="flex flex-col gap-3.5">
                {/* First & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-brand-dark mb-1">
                      {isAmharic ? 'ስም' : 'First Name'}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder={isAmharic ? 'አበበ' : 'Abebe'}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white border border-gray-300 text-sm font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-brand-dark mb-1">
                      {isAmharic ? 'የአባት ስም' : 'Last Name'}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder={isAmharic ? 'ቢቂላ' : 'Bikila'}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white border border-gray-300 text-sm font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-brand-dark mb-1">
                    {isAmharic ? 'ኢሜይል አድራሻ (ለ Brevo OTP ማረጋገጫ)' : 'Email Address (For Brevo OTP Verification)'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="passenger@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-300 text-sm font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-xs"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-brand-dark mb-1">
                    {isAmharic ? 'ስልክ ቁጥር (ለቲኬት SMS እና ቴሌብር)' : 'Phone Number (For Ticket SMS & Telebirr)'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+251 911 234 567"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-300 text-sm font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-xs"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-brand-dark mb-1">
                    {isAmharic ? 'የይለፍ ቃል' : 'Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isAmharic ? 'ቢያንስ 6 ቁምፊዎች' : 'At least 6 characters'}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-gray-300 text-sm font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-start gap-2 my-1">
                  <input
                    type="checkbox"
                    id="agree-terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer"
                  />
                  <label htmlFor="agree-terms" className="text-xs text-brand-textMuted cursor-pointer select-none">
                    {isAmharic ? (
                      <>
                        የኢትዮትራንዚት <span className="font-bold text-emerald-800">የአገልግሎት ውሎች</span>፣ የታሪፍ ግልጽነት ፖሊሲ እና የመንገደኞች መብቶችን እስማማለሁ።
                      </>
                    ) : (
                      <>
                        I agree to the <span className="font-bold text-emerald-800">EthioTransit Terms of Service</span>, Fare Transparency Policy, and Passenger Rights.
                      </>
                    )}
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#07472c] to-[#0a5c39] hover:from-[#0a5c39] hover:to-[#07472c] text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-emerald-950/20 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
                >
                  {loading ? (
                    <span>{isAmharic ? 'የማረጋገጫ ኮድ በመላክ ላይ...' : 'Sending Verification Code...'}</span>
                  ) : (
                    <>
                      <span>{isAmharic ? 'ቀጥል እና ኮድ ተቀበል' : 'Continue & Verify Email'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* OPERATOR / BUS COMPANY NOTICE BOX */}
              <div className="mt-6 p-4 rounded-xl bg-[#F7EFE3] border border-[#E8DCB9] text-xs text-[#523e1f]">
                <div className="font-extrabold text-[#382b13] mb-1">
                  {isAmharic ? 'የትራንስፖርት ድርጅቶች:' : 'Bus Companies:'}{' '}
                  <span className="font-medium text-[#5e4b2d]">
                    {isAmharic
                      ? 'የአውቶቡስ ድርጅት ወይም የተሽከርካሪ መለያ ለመክፈት የኢትዮትራንዚት ድጋፍ ሰጪ ቡድንን ያነጋግሩ።'
                      : 'Contact EthioTransit support to register your fleet or operator account.'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-1.5 font-bold text-[11px] text-[#423118]">
                  <span>📧 Email: support@ethiotransit.et</span>
                  <span>📱 Phone: +251 911 234 567</span>
                </div>
              </div>

              {/* Footer Link to Sign In */}
              <div className="mt-6 text-center text-xs text-brand-textMuted font-medium">
                {isAmharic ? 'ቀደም ሲል መለያ አለዎት?' : 'Already have an account?'}{' '}
                <Link to="/login" className="font-bold text-emerald-800 hover:text-emerald-950 underline transition-colors">
                  {isAmharic ? 'ይግቡ' : 'Sign in'}
                </Link>
              </div>
            </>
          ) : (
            /* STEP 2: BREVO OTP VERIFICATION */
            <div className="animate-fade-in-up">
              {/* Back button */}
              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setError(null);
                  setInfoMessage(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 mb-4 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isAmharic ? 'መረጃ ቀይር / ተመለስ' : 'Edit details / Go back'}</span>
              </button>

              <div className="mb-6">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1.5 w-fit">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isAmharic ? 'የኢሜይል ማረጋገጫ' : 'EMAIL OTP VERIFICATION'}</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-brand-dark tracking-tight mt-2.5">
                  {isAmharic ? 'የማረጋገጫ ኮድዎን ያስገቡ' : 'Enter 6-digit verification code'}
                </h2>
                <p className="text-xs sm:text-sm text-brand-textMuted mt-1.5 leading-relaxed">
                  {isAmharic
                    ? `የ 6-ዲጂት የማረጋገጫ ኮድ ወደ `
                    : `We sent a 6-digit confirmation code via Brevo to `}
                  <strong className="text-brand-dark font-mono font-bold">{email}</strong>
                </p>
              </div>

              {/* Success Info Banner */}
              {infoMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{infoMessage}</span>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-status-error text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Dev mode helper when Brevo API key is not configured */}
              {devCode && (
                <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
                  <span className="font-bold">🔑 Test Code: </span>
                  <span className="font-mono font-extrabold text-sm text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 ml-1">
                    {devCode}
                  </span>
                  <span className="block text-[11px] text-amber-700/80 mt-1">
                    {isAmharic
                      ? '(የ Brevo ቁልፍ በ .env ውስጥ እስካልተሞላ ድረስ ይህን ኮድ ተጠቅመው ማረጋገጥ ይችላሉ)'
                      : '(Available for testing before BREVO_API_KEY is configured in .env)'}
                  </span>
                </div>
              )}

              {/* OTP Form */}
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-brand-dark mb-2">
                    {isAmharic ? 'የ 6-ዲጂት የማረጋገጫ ኮድ' : '6-Digit Verification Code'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      autoFocus
                      required
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtp(val);
                      }}
                      placeholder="• • • • • •"
                      className="w-full text-center tracking-[12px] text-2xl font-mono font-black py-3.5 rounded-xl bg-white border-2 border-emerald-600/60 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 text-brand-dark transition-all shadow-xs"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <button
                  type="submit"
                  disabled={loading || otp.trim().length !== 6}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#07472c] to-[#0a5c39] hover:from-[#0a5c39] hover:to-[#07472c] text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-emerald-950/20 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loading ? (
                    <span>{isAmharic ? 'ኮዱን በማረጋገጥ ላይ...' : 'Verifying code...'}</span>
                  ) : (
                    <>
                      <span>{isAmharic ? 'አረጋግጥ እና መለያ ፍጠር' : 'Verify & Complete Registration'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Resend Code Options */}
                <div className="mt-2 text-center text-xs">
                  {resendCooldown > 0 ? (
                    <span className="text-brand-textMuted font-medium flex items-center justify-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand-emerald" />
                      <span>
                        {isAmharic
                          ? `አዲስ ኮድ ለመላክ: ${resendCooldown} ሰከንድ ይጠብቁ`
                          : `Resend code in ${resendCooldown}s`}
                      </span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={resendLoading}
                      onClick={handleResendOtp}
                      className="font-bold text-emerald-800 hover:text-emerald-950 underline inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
                      <span>
                        {isAmharic
                          ? 'ኮዱ አልደረሰዎትም? እንደገና ላክ'
                          : "Didn't receive the code? Resend OTP"}
                      </span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Platform Rich Footer */}
      <Footer />
    </div>
  );
};
