import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function syncVehicleSeats() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found in environment');
    return;
  }

  console.log('[Sync] Connecting to database...');
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) {
    console.error('Database connection failed');
    return;
  }

  console.log('[Sync] Connected. Fetching active/confirmed bookings...');
  const bookings = await db
    .collection('bookings')
    .find({ status: { $in: ['CONFIRMED', 'PENDING'] } })
    .toArray();

  console.log(`[Sync] Found ${bookings.length} active/confirmed bookings.`);

  let totalSynced = 0;
  for (const b of bookings) {
    const trip = await db.collection('trips').findOne({ _id: b.trip });
    if (!trip || !trip.vehicle) continue;

    const vehicleTrips = await db.collection('trips').find({ vehicle: trip.vehicle }).toArray();
    const vTripIds = vehicleTrips.map((t) => t._id);

    console.log(
      `[Sync] Booking ${b.bookingReference} (Seats: ${b.seats.join(', ')}) on vehicle ${trip.vehicle} -> syncing to ${vTripIds.length} trips across all dates`
    );

    const updateRes = await db.collection('seats').updateMany(
      {
        trip: { $in: vTripIds },
        seatNumber: { $in: b.seats },
      },
      {
        $set: {
          status: 'BOOKED',
          booking: b._id,
        },
        $unset: {
          lockExpiresAt: '',
          guestLockId: '',
        },
      }
    );

    totalSynced += updateRes.modifiedCount;

    // Recalculate availableSeatsCount for each trip
    for (const vt of vehicleTrips) {
      const avail = await db.collection('seats').countDocuments({
        trip: vt._id,
        status: 'AVAILABLE',
        $or: [{ booking: { $exists: false } }, { booking: null }],
      });
      await db.collection('trips').updateOne(
        { _id: vt._id },
        { $set: { availableSeatsCount: avail } }
      );
    }
  }

  console.log(`[Sync] SUCCESS! Updated ${totalSynced} seat instances across all dates.`);
  await mongoose.disconnect();
}

syncVehicleSeats().catch((err) => {
  console.error('[Sync] Fatal error:', err);
  process.exit(1);
});
