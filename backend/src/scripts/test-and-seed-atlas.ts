import mongoose from 'mongoose';
import { runDatabaseSeed } from '../jobs/seed';
import { City } from '../models/City';
import { Route } from '../models/Route';
import { Operator } from '../models/Operator';
import { User } from '../models/User';
import { Vehicle } from '../models/Vehicle';
import { Driver } from '../models/Driver';
import { Trip } from '../models/Trip';
import { Seat } from '../models/Seat';

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from backend/.env if present
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const ATLAS_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://<username>:<password>@cluster.mongodb.net/ethiotransit?retryWrites=true&w=majority';

async function main() {
  console.log('[Atlas Setup] Attempting to connect to MongoDB Atlas...');
  console.log(`[Atlas Setup] Target URI: ${ATLAS_URI.replace(/:[^:@]+@/, ':****@')}`);

  try {
    await mongoose.connect(ATLAS_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log('✅ Successfully connected to MongoDB Atlas cluster: ethiotransit.rvl49tz.mongodb.net');

    console.log('[Atlas Setup] Starting database seeding on Atlas...');
    await runDatabaseSeed();

    // Verify document counts
    const [citiesCount, operatorsCount, usersCount, routesCount, vehiclesCount, driversCount, tripsCount, seatsCount] =
      await Promise.all([
        City.countDocuments(),
        Operator.countDocuments(),
        User.countDocuments(),
        Route.countDocuments(),
        Vehicle.countDocuments(),
        Driver.countDocuments(),
        Trip.countDocuments(),
        Seat.countDocuments(),
      ]);

    console.log('====================================================');
    console.log('🎉 MongoDB Atlas Seeding & Verification Complete:');
    console.log(` - Cities:     ${citiesCount}`);
    console.log(` - Operators:  ${operatorsCount}`);
    console.log(` - Users:      ${usersCount}`);
    console.log(` - Routes:     ${routesCount}`);
    console.log(` - Vehicles:   ${vehiclesCount}`);
    console.log(` - Drivers:    ${driversCount}`);
    console.log(` - Trips:      ${tripsCount}`);
    console.log(` - Seats:      ${seatsCount}`);
    console.log('====================================================');

    await mongoose.disconnect();
    console.log('Disconnected cleanly from MongoDB Atlas.');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Failed to connect or seed MongoDB Atlas:', err);
    process.exit(1);
  }
}

main();
