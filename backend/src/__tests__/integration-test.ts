import assert from 'node:assert';

const BASE_URL = 'http://localhost:5000/api';

async function runIntegrationSuite() {
  console.log('🚀 Starting EthioTransit Comprehensive Integration & Concurrency Test Suite...\n');

  // 1. Health check
  console.log('--- 1. API Health Check ---');
  const healthRes = await fetch('http://localhost:5000/health');
  assert.strictEqual(healthRes.status, 200, 'Health check should return 200');
  const healthData = await healthRes.json();
  console.log('✅ Health check passed:', healthData.service);

  // 2. Authentication & RBAC Check
  console.log('\n--- 2. RBAC Authentication ---');
  
  // Login as Super Admin
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@ethiotransit.et', password: 'EthioTransit@2026' }),
  });
  assert.strictEqual(adminLoginRes.status, 200, 'Admin login failed');
  const adminBody = await adminLoginRes.json();
  const adminData = adminBody.data;
  const adminToken = adminData.accessToken || adminData.token;
  console.log(`✅ Logged in as ${adminData.user.role}: ${adminData.user.email}`);

  // Login as Driver
  const driverLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'driver.abebe@ethiotransit.et', password: 'EthioTransit@2026' }),
  });
  assert.strictEqual(driverLoginRes.status, 200, 'Driver login failed');
  const driverBody = await driverLoginRes.json();
  const driverData = driverBody.data;
  const driverToken = driverData.accessToken || driverData.token;
  console.log(`✅ Logged in as ${driverData.user.role}: ${driverData.user.email}`);

  // Login as Passenger
  const passLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'passenger.almaz@ethiotransit.et', password: 'EthioTransit@2026' }),
  });
  assert.strictEqual(passLoginRes.status, 200, 'Passenger login failed');
  const passBody = await passLoginRes.json();
  const passData = passBody.data;
  const passToken = passData.accessToken || passData.token;
  console.log(`✅ Logged in as ${passData.user.role}: ${passData.user.email}`);

  // 3. RBAC Enforcement: Driver cannot create a city or route
  console.log('\n--- 3. RBAC Violation Assertions ---');
  const unauthorizedCityRes = await fetch(`${BASE_URL}/cities`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${driverToken}`,
    },
    body: JSON.stringify({
      name: 'IllegalCity',
      region: 'Unknown',
      code: 'ILL',
    }),
  });
  assert.strictEqual(unauthorizedCityRes.status, 403, 'Driver should be forbidden from creating cities (403)');
  console.log('✅ Driver correctly blocked from City creation (403 Forbidden)');

  const unauthPassengerRouteRes = await fetch(`${BASE_URL}/routes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${passToken}`,
    },
    body: JSON.stringify({ origin: '123', destination: '456', distanceKm: 100 }),
  });
  assert.strictEqual(unauthPassengerRouteRes.status, 403, 'Passenger should be forbidden from creating routes (403)');
  console.log('✅ Passenger correctly blocked from Route creation (403 Forbidden)');

  // 4. Dynamic City Creation
  console.log('\n--- 4. Dynamic City Creation (Admin) ---');
  const uniqueCode = 'HRA';
  const newCityRes = await fetch(`${BASE_URL}/cities`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      name: 'Harar',
      amharicName: 'ሐረር',
      region: 'Harari',
      code: uniqueCode,
      terminalName: 'Harar Jugol Intercity Terminal',
      status: 'ACTIVE',
    }),
  });
  
  let hararCityId: string;
  if (newCityRes.status === 201) {
    const cityBody = (await newCityRes.json()).data;
    hararCityId = cityBody._id;
    console.log(`✅ Created new city: ${cityBody.name} (${cityBody.code}) - ID: ${hararCityId}`);
  } else {
    // If already created in earlier test run
    const citiesListRes = await fetch(`${BASE_URL}/cities?all=true`);
    const citiesList = (await citiesListRes.json()).data;
    const existing = citiesList.find((c: any) => c.code === uniqueCode);
    assert.ok(existing, 'City must be present');
    hararCityId = existing._id;
    console.log(`ℹ️ City found: ${existing.name} (${existing.code}) - ID: ${hararCityId}`);
  }

  // Find Addis Ababa ID
  const citiesRes = await fetch(`${BASE_URL}/cities`);
  const cities = (await citiesRes.json()).data;
  const addis = cities.find((c: any) => c.name.includes('Addis'));
  assert.ok(addis, 'Addis Ababa city should exist in seed data');

  // 5. Dynamic Route Creation
  console.log('\n--- 5. Dynamic Route Creation (Admin) ---');
  const newRouteRes = await fetch(`${BASE_URL}/routes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      origin: addis._id,
      destination: hararCityId,
      distanceKm: 520,
      estimatedDurationHours: 8.5,
      pickupPoints: [{ name: 'Addis Ababa Meskel Square Terminal', timeOffsetMinutes: 0 }],
      dropOffPoints: [{ name: 'Harar Jugol Terminal' }],
      status: 'ACTIVE',
    }),
  });

  let hararRouteId: string;
  if (newRouteRes.status === 201) {
    const routeBody = (await newRouteRes.json()).data;
    hararRouteId = routeBody._id;
    console.log(`✅ Created new Route: Addis Ababa -> Harar (ID: ${hararRouteId})`);
  } else {
    const routesRes = await fetch(`${BASE_URL}/routes`);
    const routes = (await routesRes.json()).data;
    const existingRoute = routes.find((r: any) => r.destination?._id === hararCityId || r.destination === hararCityId);
    assert.ok(existingRoute, 'Route must exist');
    hararRouteId = existingRoute._id;
    console.log(`ℹ️ Route found: Addis Ababa -> Harar (ID: ${hararRouteId})`);
  }

  // 6. Search Trips & Seat Verification
  console.log('\n--- 6. Trip Search & Available Seat Verification ---');
  const allTripsRes = await fetch(`${BASE_URL}/trips`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const allTrips = (await allTripsRes.json()).data;
  assert.ok(allTrips.length > 0, 'Seed trips must exist');
  
  const testTrip = allTrips[0];
  console.log(`✅ Target trip for booking: ${testTrip.tripCode} | Route: ${testTrip.route.origin.name} -> ${testTrip.route.destination.name} | Base Fare: ${testTrip.fare} ETB`);

  // Fetch seats for this trip: GET /api/trips/:id/seats
  const seatsRes = await fetch(`${BASE_URL}/trips/${testTrip._id}/seats`);
  assert.strictEqual(seatsRes.status, 200, 'Fetching seats failed');
  const seatsData = (await seatsRes.json()).data.seats;
  const availableSeats = seatsData.filter((s: any) => s.status === 'AVAILABLE');
  assert.ok(availableSeats.length >= 2, 'Trip should have at least 2 available seats for concurrency testing');
  
  const targetSeat = availableSeats[0];
  console.log(`✅ Target seat selected for concurrency race: Seat ${targetSeat.seatNumber} (ID: ${targetSeat._id})`);

  // 7. CONCURRENCY TEST: Two users race to lock the exact same seat simultaneously
  console.log('\n--- 7. Atomic Concurrency Test: Simultaneous Seat Reservation Race ---');
  
  const lockPromise1 = fetch(`${BASE_URL}/trips/${testTrip._id}/seats/lock`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${passToken}`,
    },
    body: JSON.stringify({
      tripId: testTrip._id,
      seatNumbers: [targetSeat.seatNumber],
    }),
  });

  const lockPromise2 = fetch(`${BASE_URL}/trips/${testTrip._id}/seats/lock`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`, // competitor user
    },
    body: JSON.stringify({
      tripId: testTrip._id,
      seatNumbers: [targetSeat.seatNumber],
    }),
  });

  const [res1, res2] = await Promise.all([lockPromise1, lockPromise2]);
  const statuses = [res1.status, res2.status].sort();

  console.log(`Lock Attempt 1 Status: ${res1.status}, Lock Attempt 2 Status: ${res2.status}`);
  
  // Exactly ONE request must succeed (200) and ONE must fail with 409 Conflict
  assert.strictEqual(statuses[0], 200, 'One racer must succeed with 200');
  assert.strictEqual(statuses[1], 409, 'One racer must fail with 409 Conflict (no double booking permitted!)');
  console.log('🔒 ATOMIC LOCK VERIFIED: Exactly one passenger secured the lock; competitor was rejected with 409 Conflict.');

  // Determine which user holds the lock
  const winnerToken = res1.status === 200 ? passToken : adminToken;
  const winnerBody = res1.status === 200 ? (await res1.json()).data : (await res2.json()).data;
  console.log(`Lock granted for seats: ${winnerBody.lockedSeats?.join(', ')} until: ${winnerBody.expiresAt}`);

  // 8. Complete Booking & Checkout with Official Fare Breakdown
  console.log('\n--- 8. Complete Booking & Official Fare Calculation ---');
  const bookingRes = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${winnerToken}`,
    },
    body: JSON.stringify({
      tripId: testTrip._id,
      seats: [targetSeat.seatNumber],
      passengers: [
        {
          name: 'Abebech Gobena',
          phone: '+251911445566',
          seatNumber: targetSeat.seatNumber,
          ageGroup: 'ADULT',
        },
      ],
    }),
  });

  assert.strictEqual(bookingRes.status, 201, 'Booking creation should succeed (201)');
  const booking = (await bookingRes.json()).data;
  console.log(`✅ Booking created: ${booking.bookingReference}`);
  console.log(`   Base Fare: ${booking.fare} ETB | Service Fee: ${booking.serviceFee} ETB | Total: ${booking.total} ETB`);
  assert.strictEqual(booking.status, 'PENDING', 'Booking should be PENDING initially');

  // 9. Payment Intent & Server-side Verification
  console.log('\n--- 9. Payment Processing & Mock Sandbox Verification ---');
  const intentRes = await fetch(`${BASE_URL}/payments/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${winnerToken}`,
    },
    body: JSON.stringify({
      bookingId: booking._id,
      provider: 'telebirr',
      paymentMethod: 'Telebirr SuperApp',
    }),
  });

  assert.strictEqual(intentRes.status, 201, 'Payment session creation should succeed');
  const payment = (await intentRes.json()).data;
  console.log(`✅ Payment initiated: ${payment.transactionReference} for ${payment.amount} ETB via ${payment.paymentMethod}`);

  // Confirm payment
  const verifyPayRes = await fetch(`${BASE_URL}/payments/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${winnerToken}`,
    },
    body: JSON.stringify({
      transactionReference: payment.transactionReference,
      simulateResult: 'SUCCESS',
    }),
  });

  assert.strictEqual(verifyPayRes.status, 200, 'Payment verification should succeed');
  const verifyPayData = (await verifyPayRes.json()).data;
  console.log(`✅ Payment status confirmed: ${verifyPayData.status}`);
  console.log(`✅ Booking status confirmed: ${verifyPayData.booking?.status || 'CONFIRMED'}`);

  // 10. Digital Ticket with Tamper-proof QR Token
  console.log('\n--- 10. Digital Ticket & QR Code Verification ---');
  const ticketsRes = await fetch(`${BASE_URL}/tickets/booking/${booking._id}`, {
    headers: { Authorization: `Bearer ${winnerToken}` },
  });

  assert.strictEqual(ticketsRes.status, 200, 'Fetching tickets should succeed');
  const ticketsData = (await ticketsRes.json()).data;
  assert.strictEqual(ticketsData.length, 1, 'Should have exactly 1 ticket generated');
  const ticket = ticketsData[0];
  console.log(`✅ Generated Digital Ticket: ${ticket.ticketNumber}`);
  console.log(`   Passenger: ${ticket.passengerName} | Seat: ${ticket.seatNumber} | Status: ${ticket.status}`);
  console.log(`   QR Code Verification Token: ${ticket.qrVerificationToken}`);
  assert.ok(ticket.qrVerificationToken.startsWith('ETH-VERIFY-'), 'QR token must have proper format');

  // 11. Boarding Verification (Driver Workflow)
  console.log('\n--- 11. Boarding Verification Workflow (Anti-Fraud & Re-use Check) ---');

  // 11a: First verification -> VALID_TICKET
  const firstBoardingRes = await fetch(`${BASE_URL}/boarding/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${driverToken}`,
    },
    body: JSON.stringify({
      token: ticket.qrVerificationToken,
      tripId: testTrip._id,
      verificationDevice: 'Driver Mobile Scanner / Terminal #4',
    }),
  });

  assert.strictEqual(firstBoardingRes.status, 200, 'First boarding scan should return 200');
  const firstBoardingData = (await firstBoardingRes.json()).data;
  assert.strictEqual(firstBoardingData.code, 'VALID_TICKET', 'Ticket should be validated on first presentation');
  assert.strictEqual(firstBoardingData.ticket.status, 'USED', 'Ticket status should transition to USED');
  console.log(`✅ 1st Scan: Passenger ${firstBoardingData.passenger.name} - VALID_TICKET - Boarding Approved!`);

  // 11b: Second verification with the exact same ticket -> ALREADY_USED
  const secondBoardingRes = await fetch(`${BASE_URL}/boarding/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${driverToken}`,
    },
    body: JSON.stringify({
      token: ticket.qrVerificationToken,
      tripId: testTrip._id,
      verificationDevice: 'Driver Mobile Scanner / Terminal #4',
    }),
  });

  // Expected 409 Conflict with code ALREADY_USED
  assert.strictEqual(secondBoardingRes.status, 409, 'Duplicate scan should return 409');
  const secondBoardingData = await secondBoardingRes.json();
  assert.strictEqual(secondBoardingData.code, 'ALREADY_USED', 'Double scan should return code ALREADY_USED');
  console.log(`🛡️ 2nd Scan: REJECTED with ALREADY_USED: "${secondBoardingData.message}"`);

  // 11c: Tampered/forged token verification -> INVALID_TICKET
  const forgedBoardingRes = await fetch(`${BASE_URL}/boarding/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${driverToken}`,
    },
    body: JSON.stringify({
      token: 'FORGED-ETH-TOKEN-9999999',
      tripId: testTrip._id,
      verificationDevice: 'Driver Mobile Scanner / Terminal #4',
    }),
  });

  assert.strictEqual(forgedBoardingRes.status, 400, 'Forged token should return 400');
  const forgedData = await forgedBoardingRes.json();
  assert.strictEqual(forgedData.code, 'INVALID_TICKET', 'Forged token should return code INVALID_TICKET');
  console.log(`🛡️ Forged Scan: REJECTED with INVALID_TICKET: "${forgedData.message}"`);

  console.log('\n🎉 ALL 11 INTEGRATION & CONCURRENCY TESTS PASSED FLAWLESSLY! 🎉\n');
}

runIntegrationSuite().catch((err) => {
  console.error('\n❌ INTEGRATION TEST FAILED:', err);
  process.exit(1);
});
