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

const topics = [
  {
    id: 'booking',
    icon: Ticket,
    title: 'Booking',
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    faqs: [
      {
        q: 'How do I book a bus ticket on EthioTransit?',
        a: 'Go to the homepage, enter your origin city, destination, travel date, and number of passengers. Click "Search Trips", browse available trips, select your seat, fill in passenger details, and complete payment.',
      },
      {
        q: 'Can I book for multiple passengers?',
        a: 'Yes! On the search page, set the number of passengers. During seat selection, you can choose multiple seats and fill in each passenger\'s information at checkout.',
      },
      {
        q: 'Can I cancel my booking?',
        a: 'Yes, you can cancel from your dashboard under "My Trips". Cancellation policies vary by operator. Refunds are processed according to the fare policy.',
      },
    ],
  },
  {
    id: 'payment',
    icon: CreditCard,
    title: 'Payment',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    faqs: [
      {
        q: 'What payment methods are accepted?',
        a: 'EthioTransit supports Telebirr, CBE Birr, Chapa, and an instant sandbox payment for testing. All payment gateways use secure, encrypted connections.',
      },
      {
        q: 'Are there any hidden fees?',
        a: 'No. EthioTransit displays the exact official operator fare plus a transparent platform service fee before you pay. There are absolutely no hidden surcharges.',
      },
      {
        q: 'My payment failed. What should I do?',
        a: 'Your seat reservation is held for 10 minutes. Retry payment on the verification page. If the issue persists, try a different payment method or contact support.',
      },
    ],
  },
  {
    id: 'seats',
    icon: Armchair,
    title: 'Seat Selection',
    color: 'bg-purple-50 text-purple-600 border-purple-100',
    faqs: [
      {
        q: 'How does seat selection work?',
        a: 'On the seat map, green seats are available, orange seats are temporarily locked by others, and black seats are already booked. Click a green seat to select it. You have 10 minutes to complete your booking.',
      },
      {
        q: 'What happens if my seat lock expires?',
        a: 'If you don\'t complete payment within 10 minutes, your seat reservation is automatically released back to availability so other passengers can book it.',
      },
      {
        q: 'Can two people book the same seat simultaneously?',
        a: 'No. EthioTransit uses atomic seat locking. The first person to lock the seat wins. The second request is immediately rejected with a conflict notification.',
      },
    ],
  },
  {
    id: 'tickets',
    icon: QrCode,
    title: 'Tickets & QR Code',
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    faqs: [
      {
        q: 'Where can I find my ticket after booking?',
        a: 'Go to "My Tickets" in the navigation. Click any ticket to view the full digital ticket with QR code. You can also access tickets from your dashboard.',
      },
      {
        q: 'Is the QR code secure?',
        a: 'Yes. Each QR code contains a cryptographically verified token. The driver scanner validates the token server-side. Duplicate scan attempts are rejected with an "ALREADY_USED" response.',
      },
      {
        q: 'Can I download or print my ticket?',
        a: 'Yes. On the ticket page, click the "Print" button to print your boarding pass. The print view is optimized for letter-size paper.',
      },
    ],
  },
  {
    id: 'cancellation',
    icon: RefreshCw,
    title: 'Cancellation & Refund',
    color: 'bg-red-50 text-red-600 border-red-100',
    faqs: [
      {
        q: 'How do I cancel my booking?',
        a: 'Go to My Trips, find the booking you want to cancel, and click "Cancel Booking". You\'ll receive a confirmation and refund details.',
      },
      {
        q: 'How long does a refund take?',
        a: 'Refunds are processed within 3–5 business days to your original payment method. Telebirr and CBE Birr refunds are typically faster.',
      },
    ],
  },
  {
    id: 'account',
    icon: User,
    title: 'Account',
    color: 'bg-gray-50 text-gray-600 border-gray-200',
    faqs: [
      {
        q: 'How do I create an account?',
        a: 'Click "Sign Up" on the navbar, fill in your name, email, phone, and password. After registration, you\'ll be redirected to sign in with your new credentials.',
      },
      {
        q: 'I forgot my password. How can I reset it?',
        a: 'Currently, password reset requires contacting support at ' + BRAND.supportEmail + '. We\'re building self-service password reset — coming soon.',
      },
      {
        q: 'Can I switch between English and Amharic?',
        a: 'Yes! Click the EN | አማ toggle in the navbar or in your profile settings. The language switches instantly without any page reload.',
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
  const [search, setSearch] = useState('');
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

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
          <h1 className="text-3xl sm:text-4xl font-black">How can we help?</h1>
          <p className="text-emerald-200/70 text-sm mt-2">
            Find answers to common questions about EthioTransit.
          </p>

          {/* Search */}
          <div className="relative mt-8 max-w-lg mx-auto">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search help topics..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-brand-dark text-sm font-semibold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Topic Grid */}
        {!search && (
          <div>
            <h2 className="text-lg font-black text-brand-dark mb-4">Popular Topics</h2>
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
          <h2 className="text-xl font-black mb-2">Still need help?</h2>
          <p className="text-emerald-200/70 text-sm mb-6">
            Our support team is available Sunday–Thursday, 8AM–6PM EAT.
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
                <p className="text-[11px] text-emerald-300 font-bold uppercase tracking-wider">Call Us</p>
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
                <p className="text-[11px] text-emerald-300 font-bold uppercase tracking-wider">Email Us</p>
                <p className="text-sm font-bold text-white">{BRAND.supportEmail}</p>
              </div>
            </a>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/10 border border-white/10">
              <div className="w-9 h-9 rounded-xl bg-emerald-900/60 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <p className="text-[11px] text-emerald-300 font-bold uppercase tracking-wider">Office</p>
                <p className="text-sm font-bold text-white">Bole, Addis Ababa</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
