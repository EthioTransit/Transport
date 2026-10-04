export const BRAND = {
  name: 'EthioTransit',
  amharicName: 'ኢትዮ-ትራንዚት',
  tagline: 'Ethiopian Intercity Transport Super Admin Operations Console',
  currency: 'ETB',
  supportPhone: '+251 11 551 2828',
  supportEmail: 'admin@ethiotransit.et',
  platformVersion: '2.5.0-Enterprise',
  buildDate: '2026',
  ports: {
    publicFrontend: 5173,
    adminFrontend: 5174,
    backendApi: 5000,
  },
  demoAccounts: [
    {
      role: 'SUPER_ADMIN',
      name: 'Alula Aba Nega',
      email: 'superadmin@ethiotransit.et',
      password: 'EthioTransit@2026',
      badge: 'Super Admin',
      description: 'Full nationwide system oversight, audit logs, financial ledger & city governance',
    },
    {
      role: 'ADMIN',
      name: 'Tewodros Kassa',
      email: 'admin@ethiotransit.et',
      password: 'EthioTransit@2026',
      badge: 'Operations Admin',
      description: 'Fleet schedules, route optimization, operator verifications & bookings',
    },
  ],
};
