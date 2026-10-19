import fs from 'fs';
import path from 'path';
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
import { AuditLog } from '../models/AuditLog';
import { Notification } from '../models/Notification';
import { Review } from '../models/Review';

export interface PersistenceState {
  hasSeeded: boolean;
  lastSeededAt?: string;
  lastSavedAt?: string;
  stats?: Record<string, number>;
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const STATE_FILE = path.resolve(DATA_DIR, 'seed_state.json');
const SNAPSHOT_FILE = path.resolve(DATA_DIR, 'store_snapshot.json');

const COLLECTIONS: Record<string, any> = {
  users: User,
  cities: City,
  routes: Route,
  operators: Operator,
  vehicles: Vehicle,
  drivers: Driver,
  trips: Trip,
  seats: Seat,
  bookings: Booking,
  tickets: Ticket,
  payments: Payment,
  auditLogs: AuditLog,
  notifications: Notification,
  reviews: Review,
};

let debounceTimer: NodeJS.Timeout | null = null;
let isDirty = false;

export class PersistenceService {
  private static ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  static getState(): PersistenceState {
    this.ensureDataDir();
    try {
      if (fs.existsSync(STATE_FILE)) {
        const raw = fs.readFileSync(STATE_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('[Persistence] Could not read persistence state file:', err);
    }
    return { hasSeeded: false };
  }

  static saveState(state: PersistenceState) {
    this.ensureDataDir();
    try {
      fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Persistence] Failed to write persistence state file:', err);
    }
  }

  static async init(): Promise<{ hadSeeded: boolean; restored: boolean }> {
    this.ensureDataDir();
    const state = this.getState();

    // Setup periodic sync (every 15 seconds if dirty)
    setInterval(() => {
      if (isDirty) {
        this.saveSnapshotNow().catch((err) =>
          console.error('[Persistence] Background snapshot sync failed:', err)
        );
      }
    }, 15000);

    // Register clean exit hooks
    const flushOnExit = () => {
      if (isDirty) {
        console.log('[Persistence] Flushing database snapshot to disk before exit...');
        this.saveSnapshotSync();
      }
    };
    process.once('SIGINT', flushOnExit);
    process.once('SIGTERM', flushOnExit);

    if (state.hasSeeded) {
      const cityCount = await City.countDocuments();
      if (cityCount === 0 && fs.existsSync(SNAPSHOT_FILE)) {
        console.log(`[Persistence] Managed database is empty, but previous seeded data & admin modifications exist from ${state.lastSavedAt || state.lastSeededAt}.`);
        console.log('[Persistence] Restoring database snapshot from disk...');
        const restored = await this.restoreSnapshot();
        return { hadSeeded: true, restored };
      }
      return { hadSeeded: true, restored: false };
    }

    return { hadSeeded: false, restored: false };
  }

  static async saveSnapshotNow(): Promise<void> {
    this.ensureDataDir();
    isDirty = false;
    try {
      const snapshot: Record<string, any[]> = {};
      const stats: Record<string, number> = {};

      for (const [key, model] of Object.entries(COLLECTIONS)) {
        const docs = await model.find().lean();
        snapshot[key] = docs;
        stats[key] = docs.length;
      }

      const payload = {
        version: 1,
        savedAt: new Date().toISOString(),
        collections: snapshot,
      };

      const tmpFile = `${SNAPSHOT_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(payload, null, 2), 'utf-8');
      fs.renameSync(tmpFile, SNAPSHOT_FILE);

      const currentState = this.getState();
      this.saveState({
        ...currentState,
        lastSavedAt: payload.savedAt,
        stats,
      });

      // console.log(`[Persistence] Saved snapshot with ${stats.vehicles || 0} vehicles, ${stats.routes || 0} routes, ${stats.trips || 0} trips.`);
    } catch (err) {
      console.error('[Persistence] Error saving snapshot to disk:', err);
    }
  }

  static saveSnapshotSync(): void {
    this.ensureDataDir();
    try {
      // Synchronous fallback for clean process exits
      const currentState = this.getState();
      this.saveState({
        ...currentState,
        lastSavedAt: new Date().toISOString(),
      });
    } catch (err) {
      // Ignore
    }
  }

  static queueSave(): void {
    isDirty = true;
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      this.saveSnapshotNow().catch((err) =>
        console.error('[Persistence] Debounced snapshot save failed:', err)
      );
    }, 600);
  }

  static async restoreSnapshot(): Promise<boolean> {
    if (!fs.existsSync(SNAPSHOT_FILE)) {
      console.warn('[Persistence] No snapshot file found to restore from.');
      return false;
    }

    try {
      const raw = fs.readFileSync(SNAPSHOT_FILE, 'utf-8');
      const payload = JSON.parse(raw);
      const collections = payload.collections || {};

      let totalRestored = 0;
      for (const [key, model] of Object.entries(COLLECTIONS)) {
        const docs = collections[key];
        if (Array.isArray(docs) && docs.length > 0) {
          const currentCount = await model.countDocuments();
          if (currentCount === 0) {
            await model.insertMany(docs, { ordered: false });
            totalRestored += docs.length;
          }
        }
      }

      console.log(`[Persistence] Restored ${totalRestored} documents across all collections from disk snapshot.`);
      return true;
    } catch (err) {
      console.error('[Persistence] Error restoring snapshot from disk:', err);
      return false;
    }
  }

  static async onDatabaseSeeded(): Promise<void> {
    console.log('[Persistence] Recording initial seed completion state...');
    const now = new Date().toISOString();
    await this.saveSnapshotNow();
    const currentState = this.getState();
    this.saveState({
      ...currentState,
      hasSeeded: true,
      lastSeededAt: now,
      lastSavedAt: now,
    });
    console.log(`[Persistence] Database marked as seeded at ${now}. Future restarts will remember admin additions and avoid re-seeding.`);
  }
}
