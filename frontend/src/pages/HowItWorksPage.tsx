import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Armchair, CreditCard, QrCode, ShieldCheck, HelpCircle, ArrowRight } from 'lucide-react';
import { BRAND } from '../config/brand';
import { useTranslation } from 'react-i18next';

export const HowItWorksPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isAmharic = i18n.language === 'am';

  const steps = [
    {
      step: '01',
      title: isAmharic ? 'የጉዞ መስመርዎን እና ቀን ይፈልጉ' : 'Search Your Route & Date',
      desc: isAmharic
        ? 'በቀጥታ የከተሞች ዝርዝር ውስጥ መነሻ እና መድረሻዎን ይምረጡ። የጉዞ ቀንዎን እና የተጓዦች ብዛት (1-10) ያስገቡ። ፍለጋው ሕጋዊ ፈቃድ ካላቸው ድርጅቶች እና የቀጥታ የወንበር ክፍትነት ጋር ያዛምድልዎታል።'
        : 'Select your departure and arrival cities using our dynamic database. Choose your travel date and number of passengers (1-10). Our search engine matches certified operators and real-time seat availability.',
      icon: Search,
      highlight: isAmharic ? 'ቀላል ፍለጋ ከቀጥታ የቀን አማራጮች ጋር።' : 'Debounced search with quick date shortcuts.',
    },
    {
      step: '02',
      title: isAmharic ? 'ጉዞዎችን ያወዳድሩ እና ወንበርዎን ይምረጡ' : 'Compare Trips & Select Your Seat',
      desc: isAmharic
        ? 'የፈቃድ ያላቸውን የትራንስፖርት ድርጅቶች፣ የአውቶቡስ ሞዴል፣ የመነሻና የመድረሻ ሰዓታት ይመልከቱ። በይነተገናኝ የወንበር ካርታ በመጠቀም የሚፈልጉትን የመስኮት ወይም የመተላለፊያ ወንበር ይምረጡ።'
        : 'View licensed bus operators, vehicle models, scheduled departure and arrival times, and amenities like Air Conditioning, Wi-Fi, and USB ports. Use our interactive seat map to select your preferred window or aisle seat.',
      icon: Armchair,
      highlight: isAmharic ? 'የ10 ደቂቃ የወንበር መቆለፊያ ሁለት ሰው እንዳይይዘው ያረጋግጣል።' : 'Atomic 10-minute seat lock guarantees no double-booking.',
    },
    {
      step: '03',
      title: isAmharic ? 'ሕጋዊ የመንግስት ታሪፍ ይክፈሉ' : 'Pay Official Regulated Fares',
      desc: isAmharic
        ? 'ምንም ዓይነት ድብቅ ክፍያ የሌለበትን ትክክለኛውን የመንግስት ታሪፍ አስቀድመው ይመልከቱ። በቻፓ (Chapa) አማካኝነት በደህንነት ይክፈሉ። እያንዳንዱ ግብይት ሕጋዊ ደረሰኝ ይኖረዋል።'
        : 'See the exact official fare breakdown upfront with no hidden surcharges. Pay securely via Telebirr, CBE Birr, Chapa, or instant digital channels. Every transaction produces an immutable financial record.',
      icon: CreditCard,
      highlight: isAmharic ? 'ሹፌሮች ወይም ረዳቶች ከተወሰነው ታሪፍ በላይ መጠየቅ አይችሉም።' : 'Drivers cannot alter or charge above the official fare.',
    },
    {
      step: '04',
      title: isAmharic ? 'ዲጂታል የQR ቲኬት ይቀበሉ እና ይሳፈሩ' : 'Receive Digital QR Ticket & Board',
      desc: isAmharic
        ? 'የቦርዲንግ ቲኬትዎ ከተጓዥ ዝርዝር፣ የወንበር ቁጥር እና አስተማማኝ የማረጋገጫ QR ኮድ ጋር ወዲያውኑ ይዘጋጅልዎታል። ማረፊያ ጣቢያ ሲደርሱ ስልክዎን ለሹፌሩ ያሳዩ።'
        : 'Your digital boarding ticket is generated instantly with passenger details, seat number, and a secure tamper-proof verification QR code. Show your phone to the driver at the terminal for instant validation.',
      icon: QrCode,
      highlight: isAmharic ? 'በተርሚናል በኩል ወዲያውኑ በQR ስካን ይረጋገጣል፤ ድጋሚ መጠቀም አይቻልም።' : 'Verified instantly via driver handheld terminal with anti-reuse protection.',
    },
  ];

  return (
    <div className="bg-brand-bg min-h-screen py-8 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-emerald">
            {isAmharic ? 'የተጓዦች መመሪያ' : 'Passenger Guide'}
          </span>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-brand-dark tracking-tight mt-1">
            {isAmharic ? 'ኢትዮትራንዚት እንዴት ይሰራል?' : 'How EthioTransit Works'}
          </h1>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-brand-textMuted max-w-xl mx-auto">
            {isAmharic
              ? 'የተረጋገጡ የከተማ አቋራጭ ጉዞዎችን ስለማስያዝ፣ ወንበር ስለመምረጥ እና በዲጂታል ቲኬት በኢትዮጵያ ውስጥ ስለመጓዝ ማወቅ የሚፈልጉት ነገር ሁሉ።'
              : 'Everything you need to know about booking verified intercity bus trips, reserving seats, and traveling across Ethiopia with a digital ticket.'}
          </p>
        </div>

        {/* 4 Steps */}
        <div className="flex flex-col gap-4 sm:gap-6">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 sm:p-8 border border-gray-100 shadow-card flex flex-col md:flex-row md:items-start gap-4 sm:gap-6"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-emerald-50 text-brand-emerald flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <span className="text-[10px] sm:text-xs font-black text-brand-emerald uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                      {isAmharic ? `ደረጃ ${s.step}` : `Step ${s.step}`}
                    </span>
                    <h2 className="text-base sm:text-xl font-black text-brand-dark">{s.title}</h2>
                  </div>
                  <p className="text-xs sm:text-sm text-brand-textMuted mt-2 leading-relaxed">{s.desc}</p>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-brand-emerald">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>{s.highlight}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-10 sm:mt-16 bg-[#031d12] rounded-2xl p-6 sm:p-12 text-white text-center flex flex-col items-center shadow-xl">
          <h2 className="text-xl sm:text-3xl font-black tracking-tight">
            {isAmharic ? 'ዘመናዊ የትራንስፖርት አገልግሎት ለማግኘት ዝግጁ ነዎት?' : 'Ready to experience modern Ethiopian transit?'}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200/80 max-w-md mt-2">
            {isAmharic
              ? 'የተመደቡ ጉዞዎችን ይፈልጉ እና በ2 ደቂቃ ውስጥ ወንበርዎን ያስይዙ።'
              : 'Search scheduled departures and book your verified seat in under 2 minutes.'}
          </p>
          <Link
            to="/search"
            className="mt-5 sm:mt-6 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-brand-emerald hover:bg-brand-deep text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-brand-emerald/30 transition-all flex items-center gap-2"
          >
            <span>{isAmharic ? 'ጉዞዎችን ፈልግ' : 'Search Available Trips'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
