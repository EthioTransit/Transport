import React, { useState } from 'react';
import {
  Search,
  Ticket,
  CreditCard,
  Armchair,
  QrCode,
  RefreshCw,
  User,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  MessageSquare,
  Bus,
  HelpCircle,
  MapPin,
} from 'lucide-react';
import { BRAND } from '../config/brand';
import { useTranslation } from 'react-i18next';

const getTopics = (isAmharic: boolean) => [
  {
    id: 'booking',
    icon: Ticket,
    title: isAmharic ? 'ቦታ ማስያዝ' : 'Booking',
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    faqs: [
      {
        q: isAmharic ? 'በኢትዮትራንዚት እንዴት የአውቶቡስ ቲኬት መቁረጥ እችላለሁ?' : 'How do I book a bus ticket on EthioTransit?',
        a: isAmharic
          ? 'ወደ መነሻ ገጽ ይሂዱ፣ መነሻዎን፣ መድረሻዎን፣ የጉዞ ቀንዎን እና የተጓዦች ብዛት ያስገቡ። "ጉዞዎችን ፈልግ" የሚለውን ይጫኑ፣ የተመደቡ አውቶቡሶችን ይመልከቱ፣ ወንበርዎን ይምረጡ፣ የተጓዥ መረጃ ይሙሉና ክፍያውን ያጠናቅቁ።'
          : 'Go to the homepage, enter your origin city, destination, travel date, and number of passengers. Click "Search Trips", browse available trips, select your seat, fill in passenger details, and complete payment.',
      },
      {
        q: isAmharic ? 'ለብዙ ተጓዦች በአንድ ጊዜ መቁረጥ ይቻላል?' : 'Can I book for multiple passengers?',
        a: isAmharic
          ? 'አዎ! በፍለጋ ገጹ ላይ የተጓዦችን ቁጥር ይምረጡ። ወንበር በሚመርጡበት ወቅትም የፈለጉትን ያህል ወንበሮች መርጠው በክፍያ ወቅት የእያንዳንዳቸውን መረጃ መሙላት ይችላሉ።'
          : 'Yes! On the search page, set the number of passengers. During seat selection, you can choose multiple seats and fill in each passenger\'s information at checkout.',
      },
      {
        q: isAmharic ? 'የያዝኩትን ጉዞ መሰረዝ እችላለሁ?' : 'Can I cancel my booking?',
        a: isAmharic
          ? 'አዎ፣ በዳሽቦርድዎ ውስጥ "የእኔ ጉዞዎች" በሚለው ስር ገብተው መሰረዝ ይችላሉ። የተመላሽ ገንዘብ እንደ ድርጅቱ መመሪያ የሚፈጸም ይሆናል።'
          : 'Yes, you can cancel from your dashboard under "My Trips". Cancellation policies vary by operator. Refunds are processed according to the fare policy.',
      },
    ],
  },
  {
    id: 'payment',
    icon: CreditCard,
    title: isAmharic ? 'ክፍያ' : 'Payment',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    faqs: [
      {
        q: isAmharic ? 'ምን ዓይነት የመክፈያ ዘዴዎች ይሰራሉ?' : 'What payment methods are accepted?',
        a: isAmharic
          ? 'ኢትዮትራንዚት ቻፓ (Chapa)፣ ቴሌብር፣ የኢትዮጵያ ንግድ ባንክ (CBE Birr) እና የሙከራ ሳንድቦክስ ክፍያዎችን ይደግፋል። ሁሉም ክፍያዎች በከፍተኛ ደህንነት የተመሰጠሩ ናቸው።'
          : 'EthioTransit supports Telebirr, CBE Birr, Chapa, and an instant sandbox payment for testing. All payment gateways use secure, encrypted connections.',
      },
      {
        q: isAmharic ? 'ምንም ዓይነት ድብቅ ወይም ተጨማሪ ክፍያ አለ?' : 'Are there any hidden fees?',
        a: isAmharic
          ? 'በፍጹም የለም። ኢትዮትራንዚት ትክክለኛውን የመንግስት ታሪፍ እና ግልጽ የሲስተም አገልግሎት ክፍያ ብቻ ያሳያል። ምንም ዓይነት ድብቅ ተጨማሪ ክፍያ የለም።'
          : 'No. EthioTransit displays the exact official operator fare plus a transparent platform service fee before you pay. There are absolutely no hidden surcharges.',
      },
      {
        q: isAmharic ? 'ክፍያዬ ባይሳካ ምን ማድረግ አለብኝ?' : 'My payment failed. What should I do?',
        a: isAmharic
          ? 'የመረጡት ወንበር ለ10 ደቂቃ ተይዞ ይቆያል። በማረጋገጫው ገጽ ላይ ክፍያውን በድጋሚ ይሞክሩ ወይም ሌላ የክፍያ አማራጭ ይጠቀሙ።'
          : 'Your seat reservation is held for 10 minutes. Retry payment on the verification page. If the issue persists, try a different payment method or contact support.',
      },
    ],
  },
  {
    id: 'seats',
    icon: Armchair,
    title: isAmharic ? 'ወንበር መምረጥ' : 'Seat Selection',
    color: 'bg-purple-50 text-purple-600 border-purple-100',
    faqs: [
      {
        q: isAmharic ? 'የወንበር ምርጫ እንዴት ይሰራል?' : 'How does seat selection work?',
        a: isAmharic
          ? 'በወንበር ካርታው ላይ አረንጓዴ ወንበሮች ክፍት ናቸው፣ ቢጫዎች በሌሎች ለጊዜው የተያዙ ናቸው፣ ግራጫዎች ደግሞ የተሸጡ ናቸው። የሚፈልጉትን አረንጓዴ ወንበር ይጫኑ።'
          : 'On the seat map, green seats are available, orange seats are temporarily locked by others, and black seats are already booked. Click a green seat to select it. You have 10 minutes to complete your booking.',
      },
      {
        q: isAmharic ? 'የወንበር መያዣ ሰዓት ገደብ ቢያልፍ ምን ይሆናል?' : 'What happens if my seat lock expires?',
        a: isAmharic
          ? 'በ10 ደቂቃ ውስጥ ክፍያውን ካላጠናቀቁ፣ ወንበሩ ለሌሎች ተጓዦች ክፍት እንዲሆን በራስ-ሰር ይለቀቃል።'
          : 'If you don\'t complete payment within 10 minutes, your seat reservation is automatically released back to availability so other passengers can book it.',
      },
      {
        q: isAmharic ? 'ሁለት ሰዎች አንድ ወንበር በአንድ ጊዜ መያዝ ይችላሉ?' : 'Can two people book the same seat simultaneously?',
        a: isAmharic
          ? 'አይችሉም። ሲስተማችን አቶሚክ ቴክኖሎጂን ስለሚጠቀም ቀድሞ የነካው ሰው ብቻ ወንበሩን ይቆልፋል፤ ለሁለተኛው ሰው ወዲያውኑ መልእክት ይደርሰዋል።'
          : 'No. EthioTransit uses atomic seat locking. The first person to lock the seat wins. The second request is immediately rejected with a conflict notification.',
      },
    ],
  },
  {
    id: 'tickets',
    icon: QrCode,
    title: isAmharic ? 'ቲኬቶች እና QR ኮድ' : 'Tickets & QR Code',
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    faqs: [
      {
        q: isAmharic ? 'ቦታ ከያዝኩ በኋላ ቲኬቴን የት ማግኘት እችላለሁ?' : 'Where can I find my ticket after booking?',
        a: isAmharic
          ? 'በላይኛው ማውጫ ውስጥ "የእኔ ቲኬቶች" የሚለውን ይጫኑ። የትኛውንም ቲኬት በመጫን ሙሉውን ዲጂታል ቲኬት ከQR ኮድ ጋር ማየት ይችላሉ።'
          : 'Go to "My Tickets" in the navigation. Click any ticket to view the full digital ticket with QR code. You can also access tickets from your dashboard.',
      },
      {
        q: isAmharic ? 'የQR ኮዱ አስተማማኝ ነው?' : 'Is the QR code secure?',
        a: isAmharic
          ? 'አዎ። እያንዳንዱ QR ኮድ በምስጠራ የተጠበቀ ነው። ሹፌሩ በተርሚናል ሲቃኘው ወዲያውኑ ያረጋግጣል፤ አንድ ቲኬት በድጋሚ ጥቅም ላይ መዋል አይችልም።'
          : 'Yes. Each QR code contains a cryptographically verified token. The driver scanner validates the token server-side. Duplicate scan attempts are rejected with an "ALREADY_USED" response.',
      },
      {
        q: isAmharic ? 'ቲኬቴን ማውረድ ወይም ማተም እችላለሁ?' : 'Can I download or print my ticket?',
        a: isAmharic
          ? 'አዎ። በቲኬት ገጹ ላይ "አትም" (Print) የሚለውን በመጫን የወረቀት ቲኬት ማዘጋጀት ወይም በስልክዎ ማስቀመጥ ይችላሉ።'
          : 'Yes. On the ticket page, click the "Print" button to print your boarding pass. The print view is optimized for letter-size paper.',
      },
    ],
  },
  {
    id: 'cancellation',
    icon: RefreshCw,
    title: isAmharic ? 'ስረዛ እና ተመላሽ' : 'Cancellation & Refund',
    color: 'bg-red-50 text-red-600 border-red-100',
    faqs: [
      {
        q: isAmharic ? 'የያዝኩትን ጉዞ እንዴት መሰረዝ እችላለሁ?' : 'How do I cancel my booking?',
        a: isAmharic
          ? 'ወደ "የእኔ ጉዞዎች" ይሂዱ፣ መሰረዝ የሚፈልጉትን ጉዞ ይምረጡ እና "ጉዞ ሰርዝ" የሚለውን ይጫኑ። የማረጋገጫ እና የተመላሽ ዝርዝር ይደርስዎታል።'
          : 'Go to My Trips, find the booking you want to cancel, and click "Cancel Booking". You\'ll receive a confirmation and refund details.',
      },
      {
        q: isAmharic ? 'የተመላሽ ገንዘብ በስንት ጊዜ ውስጥ ይደርሳል?' : 'How long does a refund take?',
        a: isAmharic
          ? 'ተመላሽ ክፍያዎች ባሉበት የክፍያ መንገድ ከ3 እስከ 5 የስራ ቀናት ውስጥ ይፈጸማሉ። በቴሌብር እና በሲቢኢ ብር አብዛኛውን ጊዜ ፈጣን ነው።'
          : 'Refunds are processed within 3–5 business days to your original payment method. Telebirr and CBE Birr refunds are typically faster.',
      },
    ],
  },
  {
    id: 'account',
    icon: User,
    title: isAmharic ? 'መለያ' : 'Account',
    color: 'bg-gray-50 text-gray-600 border-gray-200',
    faqs: [
      {
        q: isAmharic ? 'አዲስ መለያ እንዴት መክፈት እችላለሁ?' : 'How do I create an account?',
        a: isAmharic
          ? 'በላይኛው አሞሌ ላይ "ይመዝገቡ" የሚለውን ይጫኑ፣ ስምዎን፣ ኢሜይል፣ ስልክ እና የይለፍ ቃል ያስገቡ። ወዲያውኑ መለያዎ ዝግጁ ይሆናል።'
          : 'Click "Sign Up" on the navbar, fill in your name, email, phone, and password. After registration, you\'ll be redirected to sign in with your new credentials.',
      },
      {
        q: isAmharic ? 'የይለፍ ቃሌን ከረሳሁት እንዴት መቀየር እችላለሁ?' : 'I forgot my password. How can I reset it?',
        a: isAmharic
          ? 'በአሁኑ ወቅት የይለፍ ቃል ለመቀየር የድጋፍ ሰጪ ቡድናችንን በ ' + BRAND.supportEmail + ' ያግኙ። ራሱን የቻለ የይለፍ ቃል መቀየሪያ በቅርቡ ይለቀቃል።'
          : 'Currently, password reset requires contacting support at ' + BRAND.supportEmail + '. We\'re building self-service password reset — coming soon.',
      },
      {
        q: isAmharic ? 'ቋንቋን ከአማርኛ ወደ እንግሊዝኛ መቀየር እችላለሁ?' : 'Can I switch between English and Amharic?',
        a: isAmharic
          ? 'አዎ! በማውጫው ላይ ያለውን የቋንቋ መቀየሪያ (EN | አማ) ይጫኑ። ገጹ ሳይታደስ ወዲያውኑ ይቀየራል።'
          : 'Yes! Click the EN | አማ toggle in the navbar or in your profile settings. The language switches instantly without any page reload.',
      },
    ],
  },
];

const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between text-left py-4 gap-3 hover:text-brand-emerald transition-colors group"
      >
        <span className="text-sm font-bold text-brand-dark group-hover:text-brand-emerald transition-colors">
          {q}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-brand-emerald flex-shrink-0 mt-0.5" />
        ) : (
          <ChevronDown className="w-4 h-4 text-brand-textLight flex-shrink-0 mt-0.5" />
        )}
      </button>
      {open && (
        <p className="text-sm text-brand-textMuted pb-4 leading-relaxed">{a}</p>
      )}
    </div>
  );
};

export const HelpPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isAmharic = i18n.language === 'am';

  const [search, setSearch] = useState('');
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  const topics = getTopics(isAmharic);

  const filteredTopics = topics
    .map((topic) => ({
      ...topic,
      faqs: topic.faqs.filter(
        (faq) =>
          !search ||
          faq.q.toLowerCase().includes(search.toLowerCase()) ||
          faq.a.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((topic) => !search || topic.faqs.length > 0);

  return (
    <div className="min-h-screen bg-[#F4F7FB]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#031d12] via-[#052d1a] to-[#0a4729] text-white py-14 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4 border border-white/10">
            <HelpCircle className="w-7 h-7 text-emerald-300" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">
            {isAmharic ? 'እንዴት ልንረዳዎ እንችላለን?' : 'How can we help?'}
          </h1>
          <p className="text-emerald-200/70 text-sm mt-2">
            {isAmharic
              ? 'ስለ ኢትዮትራንዚት ለተደጋጋሚ ጥያቄዎች መልስ ያግኙ።'
              : 'Find answers to common questions about EthioTransit.'}
          </p>

          {/* Search */}
          <div className="relative mt-8 max-w-lg mx-auto">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAmharic ? 'የእገዛ ርዕሶችን ይፈልጉ...' : 'Search help topics...'}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-brand-dark text-sm font-semibold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Topic Grid */}
        {!search && (
          <div>
            <h2 className="text-lg font-black text-brand-dark mb-4">
              {isAmharic ? 'ዋና ዋና ርዕሶች' : 'Popular Topics'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {topics.map((topic) => {
                const Icon = topic.icon;
                return (
                  <button
                    key={topic.id}
                    onClick={() =>
                      setActiveTopic(activeTopic === topic.id ? null : topic.id)
                    }
                    className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all hover:shadow-md ${
                      activeTopic === topic.id
                        ? 'bg-brand-emerald text-white border-brand-emerald shadow-md'
                        : `bg-white border-gray-100 hover:border-gray-200 ${topic.color}`
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        activeTopic === topic.id ? 'bg-white/20' : topic.color
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        activeTopic === topic.id ? 'text-white' : 'text-brand-dark'
                      }`}
                    >
                      {topic.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* FAQs */}
        <div className="space-y-4">
          {(search ? filteredTopics : activeTopic ? filteredTopics.filter((t) => t.id === activeTopic) : filteredTopics).map(
            (topic) => {
              const Icon = topic.icon;
              if (topic.faqs.length === 0) return null;
              return (
                <div key={topic.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className={`flex items-center gap-3 px-6 py-4 border-b border-gray-100`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${topic.color} border`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-black text-brand-dark">{topic.title}</h3>
                  </div>
                  <div className="px-6">
                    {topic.faqs.map((faq, i) => (
                      <FaqItem key={i} q={faq.q} a={faq.a} />
                    ))}
                  </div>
                </div>
              );
            }
          )}
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-[#031d12] to-[#0a4729] rounded-2xl p-6 sm:p-8 text-white">
          <h2 className="text-xl font-black mb-2">
            {isAmharic ? 'ተጨማሪ እገዛ ይፈልጋሉ?' : 'Still need help?'}
          </h2>
          <p className="text-emerald-200/70 text-sm mb-6">
            {isAmharic
              ? 'የደንበኞች አገልግሎት ቡድናችን ከሰኞ - አርብ ከጠዋቱ 2:00 - ማታ 12:00 ዝግጁ ነው።'
              : 'Our support team is available Sunday–Thursday, 8AM–6PM EAT.'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href={`tel:${BRAND.supportPhone}`}
              className="flex items-center gap-3 p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/10"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-900/60 flex items-center justify-center">
                <Phone className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <p className="text-[11px] text-emerald-300 font-bold uppercase tracking-wider">
                  {isAmharic ? 'ይደውሉልን' : 'Call Us'}
                </p>
                <p className="text-sm font-bold text-white">{BRAND.supportPhone}</p>
              </div>
            </a>
            <a
              href={`mailto:${BRAND.supportEmail}`}
              className="flex items-center gap-3 p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/10"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-900/60 flex items-center justify-center">
                <Mail className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <p className="text-[11px] text-emerald-300 font-bold uppercase tracking-wider">
                  {isAmharic ? 'ኢሜይል ይላኩልን' : 'Email Us'}
                </p>
                <p className="text-sm font-bold text-white">{BRAND.supportEmail}</p>
              </div>
            </a>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/10 border border-white/10">
              <div className="w-9 h-9 rounded-xl bg-emerald-900/60 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <p className="text-[11px] text-emerald-300 font-bold uppercase tracking-wider">
                  {isAmharic ? 'ቢሮ' : 'Office'}
                </p>
                <p className="text-sm font-bold text-white">
                  {isAmharic ? 'ቦሌ፣ አዲስ አበባ' : 'Bole, Addis Ababa'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
