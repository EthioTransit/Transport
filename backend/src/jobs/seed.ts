import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { City } from '../models/City';
import { Route } from '../models/Route';
import { Operator } from '../models/Operator';
import { Vehicle } from '../models/Vehicle';
import { Driver } from '../models/Driver';
import { Trip } from '../models/Trip';
import { Seat } from '../models/Seat';
import { Booking } from '../models/Booking';
import { Ticket } from '../models/Ticket';
import { Payment } from '../models/Payment';
import { UserRole, VehicleType, TripStatus, SeatStatus, BookingStatus, TicketStatus, PaymentStatus } from '../types';
import { TripService } from '../services/trip.service';
import { generateSecureVerificationToken, generateQrCodeDataUrl } from '../utils/qr.utils';

export async function runDatabaseSeed() {
  console.log('[Seed] Checking if database seeding is required...');

  const existingCityCount = await City.countDocuments();
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingTripsCount = await Trip.countDocuments({
    departureDate: { $gte: todayStr },
  });

  if (existingCityCount > 0 && upcomingTripsCount >= 20) {
    console.log(`[Seed] Database already contains ${existingCityCount} cities and ${upcomingTripsCount} upcoming trips from ${todayStr} onwards. Skipping seed.`);
    return;
  }

  console.log(`[Seed] Seeding Ethiopian transportation data (cities: ${existingCityCount}, upcoming trips: ${upcomingTripsCount})...`);

  // 1. Seed Cities
  const citiesData = [
    { name: 'Addis Ababa', amharicName: 'አዲስ አበባ', region: 'Addis Ababa', code: 'ADD', terminalName: 'Autobus Tera / Lam Beret / Lemi Kura' },
    { name: 'Debre Berhan', amharicName: 'ደብረ ብርሃን', region: 'Amhara', code: 'DBR', terminalName: 'Debre Berhan Central Terminal' },
    { name: 'Merhabete', amharicName: 'መርሐቤቴ', region: 'Amhara', code: 'MHB', terminalName: 'Alem Ketema Terminal' },
    { name: 'Bahir Dar', amharicName: 'ባሕር ዳር', region: 'Amhara', code: 'BHD', terminalName: 'Bahir Dar Bus Station' },
    { name: 'Gondar', amharicName: 'ጎንደር', region: 'Amhara', code: 'GDR', terminalName: 'Gondar Azezo Bus Terminal' },
    { name: 'Hawassa', amharicName: 'ሀዋሳ', region: 'Sidama', code: 'HWS', terminalName: 'Hawassa Intercity Bus Station' },
    { name: 'Dessie', amharicName: 'ደሴ', region: 'Amhara', code: 'DSS', terminalName: 'Dessie Menafesha Bus Terminal' },
    { name: 'Kombolcha', amharicName: 'ኮምቦልቻ', region: 'Amhara', code: 'KMB', terminalName: 'Kombolcha Central Terminal' },
    { name: 'Jimma', amharicName: 'ጅማ', region: 'Oromia', code: 'JMA', terminalName: 'Jimma Kochi Bus Station' },
    { name: 'Adama', amharicName: 'አዳማ', region: 'Oromia', code: 'ADM', terminalName: 'Adama Wonji Road Terminal' },
    { name: 'Mekelle', amharicName: 'መቐለ', region: 'Tigray', code: 'MKL', terminalName: 'Mekelle Romanat Terminal' },
  ];

  const cityMap: Record<string, any> = {};
  for (const c of citiesData) {
    const city = await City.findOneAndUpdate(
      { code: c.code },
      { ...c, status: 'ACTIVE', country: 'Ethiopia' },
      { upsert: true, new: true }
    );
    cityMap[c.code] = city;
  }
  console.log(`[Seed] Seeded ${Object.keys(cityMap).length} Ethiopian cities.`);

  // 2. Seed Operators
  const operatorsData = [
    {
      name: 'Selam Bus Line S.C.',
      legalName: 'Selam Bus Line Share Company',
      licenseNumber: 'ETH-MTO-001',
      contactPhone: '+251 11 551 2828',
      contactEmail: 'contact@selambus.et',
      address: 'Meskel Square, Addis Ababa',
      rating: 4.8,
      status: 'ACTIVE',
    },
    {
      name: 'Sky Bus Transport System',
      legalName: 'Sky Bus Transport System S.C.',
      licenseNumber: 'ETH-MTO-002',
      contactPhone: '+251 11 156 8180',
      contactEmail: 'info@skybusethiopia.com',
      address: 'Piazza, Addis Ababa',
      rating: 4.7,
      status: 'ACTIVE',
    },
    {
      name: 'Oda Bus Transport S.C.',
      legalName: 'Oda Integrated Transport Share Company',
      licenseNumber: 'ETH-MTO-003',
      contactPhone: '+251 11 470 9999',
      contactEmail: 'info@odabus.et',
      address: 'Bole Medhanialem, Addis Ababa',
      rating: 4.9,
      status: 'ACTIVE',
    },
    {
      name: 'Golden Bus Express',
      legalName: 'Golden Bus Intercity Services PLC',
      licenseNumber: 'ETH-MTO-004',
      contactPhone: '+251 11 663 4400',
      contactEmail: 'service@goldenbus.et',
      address: 'Megenagna, Addis Ababa',
      rating: 4.6,
      status: 'ACTIVE',
    },
  ];

  const operatorMap: Record<string, any> = {};
  for (const op of operatorsData) {
    const created = await Operator.findOneAndUpdate(
      { licenseNumber: op.licenseNumber },
      op,
      { upsert: true, new: true }
    );
    operatorMap[op.name] = created;
  }
  console.log(`[Seed] Seeded ${Object.keys(operatorMap).length} transport operators.`);

  // 3. Seed Users & RBAC
  const defaultPasswordHash = await bcrypt.hash('EthioTransit@2026', 10);

  const usersData = [
    {
      firstName: 'Alula',
      lastName: 'Aba Nega',
      email: 'superadmin@ethiotransit.et',
      phone: '+251911000001',
      passwordHash: defaultPasswordHash,
      role: UserRole.SUPER_ADMIN,
    },
    {
      firstName: 'Tewodros',
      lastName: 'Kassa',
      email: 'admin@ethiotransit.et',
      phone: '+251911000002',
      passwordHash: defaultPasswordHash,
      role: UserRole.ADMIN,
    },
    {
      firstName: 'Dawit',
      lastName: 'Haile',
      email: 'selam.operator@ethiotransit.et',
      phone: '+251911000003',
      passwordHash: defaultPasswordHash,
      role: UserRole.OPERATOR,
      operatorId: operatorMap['Selam Bus Line S.C.']._id,
    },
    {
      firstName: 'Abebe',
      lastName: 'Bikila',
      email: 'driver.abebe@ethiotransit.et',
      phone: '+251911000004',
      passwordHash: defaultPasswordHash,
      role: UserRole.DRIVER,
      operatorId: operatorMap['Selam Bus Line S.C.']._id,
    },
    {
      firstName: 'Almaz',
      lastName: 'Ayana',
      email: 'passenger.almaz@ethiotransit.et',
      phone: '+251911000005',
      passwordHash: defaultPasswordHash,
      role: UserRole.PASSENGER,
    },
  ];

  const userMap: Record<string, any> = {};
  for (const u of usersData) {
    const user = await User.findOneAndUpdate(
      { email: u.email },
      u,
      { upsert: true, new: true }
    );
    userMap[u.role] = user;
  }
  console.log(`[Seed] Seeded RBAC platform users.`);

  // 4. Seed Vehicles
  const vehiclesData = [
    {
      plateNumber: 'ET-3-89102-AA',
      vehicleType: VehicleType.COACH,
      operator: operatorMap['Selam Bus Line S.C.']._id,
      seatCapacity: 44,
      seatLayout: { layoutType: '2x2', rows: 11, columns: 4, aislePosition: [2] },
      vehicleModel: 'Yutong Luxury VIP Coach',
      year: 2024,
      features: ['Air Conditioning', 'High-Speed Wi-Fi', 'USB Charging Port', 'Onboard Restroom', 'Reclining Seats'],
      status: 'ACTIVE',
    },
    {
      plateNumber: 'ET-3-55421-AA',
      vehicleType: VehicleType.COACH,
      operator: operatorMap['Sky Bus Transport System']._id,
      seatCapacity: 44,
      seatLayout: { layoutType: '2x2', rows: 11, columns: 4, aislePosition: [2] },
      vehicleModel: 'Scania Touring Luxury',
      year: 2023,
      features: ['Air Conditioning', 'USB Charging', 'Overhead Luggage', 'Comfort Suspension'],
      status: 'ACTIVE',
    },
    {
      plateNumber: 'ET-3-12890-OR',
      vehicleType: VehicleType.BUS,
      operator: operatorMap['Oda Bus Transport S.C.']._id,
      seatCapacity: 40,
      seatLayout: { layoutType: '2x2', rows: 10, columns: 4, aislePosition: [2] },
      vehicleModel: 'Golden Dragon Express',
      year: 2024,
      features: ['Air Conditioning', 'Reading Light', 'Music System'],
      status: 'ACTIVE',
    },
  ];

  const vehicleList: any[] = [];
  for (const v of vehiclesData) {
    const vehicle = await Vehicle.findOneAndUpdate(
      { plateNumber: v.plateNumber },
      v,
      { upsert: true, new: true }
    );
    vehicleList.push(vehicle);
  }

  // 5. Seed Driver linked to driver user
  const driverRecord = await Driver.findOneAndUpdate(
    { phone: '+251911000004' },
    {
      user: userMap[UserRole.DRIVER]._id,
      operator: operatorMap['Selam Bus Line S.C.']._id,
      name: 'Abebe Bikila',
      phone: '+251911000004',
      licenseNumber: 'DRV-ETH-98721',
      licenseCategory: 'Public Transport Category 1',
      status: 'ACTIVE',
      rating: 4.95,
    },
    { upsert: true, new: true }
  );

  // 6. Seed Routes
  const routesData = [
    {
      originCode: 'ADD',
      destCode: 'DBR',
      distanceKm: 130,
      estimatedDurationHours: 2.5,
      popularityScore: 95,
      pickupPoints: [{ name: 'Lam Beret Bus Terminal', timeOffsetMinutes: 0 }, { name: 'Kotebe 02 Station', timeOffsetMinutes: 20 }],
      dropOffPoints: [{ name: 'Debre Berhan Main Terminal' }],
    },
    {
      originCode: 'DBR',
      destCode: 'ADD',
      distanceKm: 130,
      estimatedDurationHours: 2.5,
      popularityScore: 90,
      pickupPoints: [{ name: 'Debre Berhan Main Terminal', timeOffsetMinutes: 0 }],
      dropOffPoints: [{ name: 'Lam Beret Bus Terminal' }],
    },
    {
      originCode: 'ADD',
      destCode: 'MHB',
      distanceKm: 215,
      estimatedDurationHours: 4.5,
      popularityScore: 85,
      pickupPoints: [{ name: 'Autobus Tera Terminal', timeOffsetMinutes: 0 }],
      dropOffPoints: [{ name: 'Alem Ketema Central Bus Station' }],
    },
    {
      originCode: 'ADD',
      destCode: 'BHD',
      distanceKm: 565,
      estimatedDurationHours: 8.5,
      popularityScore: 98,
      pickupPoints: [{ name: 'Autobus Tera North Wing', timeOffsetMinutes: 0 }, { name: 'Sululta Toll Station', timeOffsetMinutes: 40 }],
      dropOffPoints: [{ name: 'Bahir Dar Giyorgis Terminal' }],
    },
    {
      originCode: 'BHD',
      destCode: 'ADD',
      distanceKm: 565,
      estimatedDurationHours: 8.5,
      popularityScore: 92,
      pickupPoints: [{ name: 'Bahir Dar Giyorgis Terminal', timeOffsetMinutes: 0 }],
      dropOffPoints: [{ name: 'Autobus Tera Terminal' }],
    },
    {
      originCode: 'ADD',
      destCode: 'GDR',
      distanceKm: 735,
      estimatedDurationHours: 11.0,
      popularityScore: 90,
      pickupPoints: [{ name: 'Autobus Tera North Wing', timeOffsetMinutes: 0 }],
      dropOffPoints: [{ name: 'Gondar Piassa Station' }],
    },
    {
      originCode: 'ADD',
      destCode: 'HWS',
      distanceKm: 275,
      estimatedDurationHours: 3.5,
      popularityScore: 96,
      pickupPoints: [{ name: 'Kality Intercity Terminal', timeOffsetMinutes: 0 }],
      dropOffPoints: [{ name: 'Hawassa Menhariya' }],
    },
    {
      originCode: 'ADD',
      destCode: 'DSS',
      distanceKm: 400,
      estimatedDurationHours: 6.5,
      popularityScore: 88,
      pickupPoints: [{ name: 'Lam Beret Bus Terminal', timeOffsetMinutes: 0 }],
      dropOffPoints: [{ name: 'Dessie Central Station' }],
    },
    {
      originCode: 'ADD',
      destCode: 'JMA',
      distanceKm: 350,
      estimatedDurationHours: 5.5,
      popularityScore: 87,
      pickupPoints: [{ name: 'Autobus Tera West Terminal', timeOffsetMinutes: 0 }],
      dropOffPoints: [{ name: 'Jimma Kochi Terminal' }],
    },
    {
      originCode: 'ADD',
      destCode: 'ADM',
      distanceKm: 99,
      estimatedDurationHours: 1.2,
      popularityScore: 94,
      pickupPoints: [{ name: 'Kality Expressway Terminal', timeOffsetMinutes: 0 }],
      dropOffPoints: [{ name: 'Adama Posta Bet Station' }],
    },
  ];

  const routeList: any[] = [];
  for (const r of routesData) {
    const origin = cityMap[r.originCode];
    const destination = cityMap[r.destCode];
    if (origin && destination) {
      const route = await Route.findOneAndUpdate(
        { origin: origin._id, destination: destination._id },
        {
          origin: origin._id,
          destination: destination._id,
          distanceKm: r.distanceKm,
          estimatedDurationHours: r.estimatedDurationHours,
          popularityScore: r.popularityScore,
          pickupPoints: r.pickupPoints,
          dropOffPoints: r.dropOffPoints,
          status: 'ACTIVE',
          operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          departureTimes: ['05:30 AM', '06:00 AM', '07:30 AM', '11:00 AM', '01:30 PM'],
          baseFare: Math.max(120, Math.round(r.distanceKm * 2.2)),
          operator: operatorMap['Selam Bus Line S.C.']?._id,
        },
        { upsert: true, new: true }
      );
      routeList.push(route);
    }
  }
  console.log(`[Seed] Seeded ${routeList.length} intercity routes.`);

  // 7. Seed Dynamic Trips for Today and next 7 days
  const today = new Date();
  const formatYMD = (d: Date) => d.toISOString().split('T')[0];

  const departureSlots = [
    { time: '05:30 AM', arrivalOffset: 2.5, fareModifier: 0 },
    { time: '06:00 AM', arrivalOffset: 3.0, fareModifier: 20 },
    { time: '07:30 AM', arrivalOffset: 3.0, fareModifier: 30 },
    { time: '11:00 AM', arrivalOffset: 2.5, fareModifier: 10 },
    { time: '01:30 PM', arrivalOffset: 2.5, fareModifier: 0 },
  ];

  let tripsCreatedCount = 0;

  for (let dayOffset = 0; dayOffset <= 5; dayOffset++) {
    const tripDateObj = new Date(today);
    tripDateObj.setDate(tripDateObj.getDate() + dayOffset);
    const dateStr = formatYMD(tripDateObj);

    const allActiveRoutes = await Route.find({ status: 'ACTIVE' });
    const targetRoutes = allActiveRoutes.length > 0 ? allActiveRoutes : routeList;

    for (let rIndex = 0; rIndex < targetRoutes.length; rIndex++) {
      const route = targetRoutes[rIndex];
      // Pick vehicle & operator alternately
      const vehicle = vehicleList[rIndex % vehicleList.length];
      const operator = vehicle.operator;

      // Create 2 trips per route per day
      for (let sIndex = 0; sIndex < 2; sIndex++) {
        const slot = departureSlots[(rIndex + sIndex) % departureSlots.length];
        const baseFare = Math.round(route.distanceKm * 2.2 + slot.fareModifier); // realistic ETB calculation
        const routeSeq = (rIndex + 1).toString().padStart(2, '0');
        const slotSeq = (sIndex + 1).toString().padStart(2, '0');
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const tripCode = `ET-${dateStr.replace(/-/g, '')}-${routeSeq}${slotSeq}-${randomSuffix}`;

        const originPickup = route.pickupPoints?.[0]?.name || 'Main Intercity Terminal';
        const destDropoff = route.dropOffPoints?.[0]?.name || 'Destination Terminal';

        const existingTrip = await Trip.findOne({
          $or: [
            { route: route._id, departureDate: dateStr, departureTime: slot.time },
            { tripCode },
          ],
        });

        if (!existingTrip) {
          try {
            const trip = await Trip.create({
              tripCode,
              route: route._id,
              operator: operator,
              vehicle: vehicle._id,
              driver: driverRecord._id,
              departureDate: dateStr,
              departureTime: slot.time,
              estimatedArrival: 'In transit',
              fare: baseFare,
              serviceFee: 15,
              status: TripStatus.SCHEDULED,
              pickupLocation: originPickup,
              dropOffLocation: destDropoff,
              totalSeatsCount: vehicle.seatCapacity,
              availableSeatsCount: vehicle.seatCapacity,
              amenities: vehicle.features,
              boardingNotes: 'Please arrive 30 minutes before departure with your digital QR ticket.',
            });

            await TripService.generateSeatsForTrip(trip._id.toString(), vehicle);
            tripsCreatedCount++;
          } catch (createErr: any) {
            if (createErr.code === 11000) {
              console.warn(`[Seed] Trip already seeded or code collision: ${tripCode}`);
            } else {
              throw createErr;
            }
          }
        }
      }
    }
  }

  console.log(`[Seed] Seeded ${tripsCreatedCount} trips across multiple dynamic dates with complete seat layouts!`);
}

if (process.argv[1]?.includes('seed.ts')) {
  import('dotenv').then((dotenv) => {
    dotenv.config();
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ethiotransit';
    mongoose.connect(uri).then(async () => {
      await runDatabaseSeed();
      await mongoose.disconnect();
      process.exit(0);
    }).catch((err) => {
      console.error('[Seed] Direct run failed:', err);
      process.exit(1);
    });
  });
}
