import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English translations
import enCommon from './en/common.json';
import enNavigation from './en/navigation.json';
import enSearch from './en/search.json';
import enBooking from './en/booking.json';
import enPayment from './en/payment.json';
import enDashboard from './en/dashboard.json';
import enErrors from './en/errors.json';

// Amharic translations
import amCommon from './am/common.json';
import amNavigation from './am/navigation.json';
import amSearch from './am/search.json';
import amBooking from './am/booking.json';
import amPayment from './am/payment.json';
import amDashboard from './am/dashboard.json';
import amErrors from './am/errors.json';

export const resources = {
  en: {
    common: enCommon,
    navigation: enNavigation,
    search: enSearch,
    booking: enBooking,
    payment: enPayment,
    dashboard: enDashboard,
    errors: enErrors,
  },
  am: {
    common: amCommon,
    navigation: amNavigation,
    search: amSearch,
    booking: amBooking,
    payment: amPayment,
    dashboard: amDashboard,
    errors: amErrors,
  },
} as const;

const getInitialLanguage = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('ethiotransit_language') || localStorage.getItem('i18nextLng');
    if (saved && (saved.startsWith('am') || saved === 'am')) return 'am';
    if (saved && (saved.startsWith('en') || saved === 'en')) return 'en';
  }
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    ns: ['common', 'navigation', 'search', 'booking', 'payment', 'dashboard', 'errors'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // React already escapes XSS
    },
    react: {
      useSuspense: false,
    },
  });

i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ethiotransit_language', lng);
    localStorage.setItem('i18nextLng', lng);
    document.documentElement.lang = lng;
  }
});

export default i18n;
