import { openDB, type IDBPDatabase } from 'idb';
import type { License, Role, User, Startup, Cohort, Milestone, MentorSession, Funding, Resource, Evaluation, AuditLog, Backup } from './types';
import { DEFAULT_ROLES } from './types';

const DB_NAME = 'IncubatorDB';
const DB_VERSION = 1;

// Valid license keys (hardcoded for offline use)
const VALID_KEYS = [
  '8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B',
  'A1B2C3D4-E5F6-7890-ABCD-EF1234567890',
  'SVALA-2024-INCUBATOR-PRO-LICENSE-KEY',
];

let dbInstance: IDBPDatabase | null = null;

export async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // License store
      if (!db.objectStoreNames.contains('license')) {
        db.createObjectStore('license', { keyPath: 'id' });
      }
      // Roles
      if (!db.objectStoreNames.contains('roles')) {
        db.createObjectStore('roles', { keyPath: 'id' });
      }
      // Users
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id' });
        userStore.createIndex('username', 'username', { unique: true });
        userStore.createIndex('roleId', 'roleId');
      }
      // Startups
      if (!db.objectStoreNames.contains('startups')) {
        const startupStore = db.createObjectStore('startups', { keyPath: 'id' });
        startupStore.createIndex('cohortId', 'cohortId');
      }
      // Cohorts
      if (!db.objectStoreNames.contains('cohorts')) {
        db.createObjectStore('cohorts', { keyPath: 'id' });
      }
      // Milestones
      if (!db.objectStoreNames.contains('milestones')) {
        const msStore = db.createObjectStore('milestones', { keyPath: 'id' });
        msStore.createIndex('startupId', 'startupId');
      }
      // Mentor Sessions
      if (!db.objectStoreNames.contains('mentorSessions')) {
        const mentorStore = db.createObjectStore('mentorSessions', { keyPath: 'id' });
        mentorStore.createIndex('startupId', 'startupId');
        mentorStore.createIndex('mentorId', 'mentorId');
      }
      // Funding
      if (!db.objectStoreNames.contains('funding')) {
        const fundStore = db.createObjectStore('funding', { keyPath: 'id' });
        fundStore.createIndex('startupId', 'startupId');
      }
      // Resources
      if (!db.objectStoreNames.contains('resources')) {
        db.createObjectStore('resources', { keyPath: 'id' });
      }
      // Evaluations
      if (!db.objectStoreNames.contains('evaluations')) {
        const evalStore = db.createObjectStore('evaluations', { keyPath: 'id' });
        evalStore.createIndex('startupId', 'startupId');
      }
      // Audit Logs
      if (!db.objectStoreNames.contains('auditLogs')) {
        const auditStore = db.createObjectStore('auditLogs', { keyPath: 'id' });
        auditStore.createIndex('userId', 'userId');
      }
      // Backups
      if (!db.objectStoreNames.contains('backups')) {
        db.createObjectStore('backups', { keyPath: 'id' });
      }
      // App state
      if (!db.objectStoreNames.contains('appState')) {
        db.createObjectStore('appState', { keyPath: 'id' });
      }
    },
  });

  return dbInstance;
}

// Generate unique ID
export function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ============= License =============
export async function validateLicenseKey(key: string): Promise<boolean> {
  return VALID_KEYS.includes(key.trim().toUpperCase());
}

export async function storeLicense(key: string): Promise<void> {
  const db = await getDB();
  const license: License = {
    id: 'main',
    key: key.trim().toUpperCase(),
    device: navigator.userAgent,
    expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    modules: ['all'],
    seats: 50,
    activated: true,
  };
  await db.put('license', license);
}

export async function getLicense(): Promise<License | undefined> {
  const db = await getDB();
  return db.get('license', 'main');
}

// ============= Roles =============
export async function seedRoles(): Promise<void> {
  const db = await getDB();
  const existing = await db.getAll('roles');
  if (existing.length > 0) return;
  
  for (const name of DEFAULT_ROLES) {
    const role: Role = { id: generateId(), name };
    await db.put('roles', role);
  }
}

export async function getRoles(): Promise<Role[]> {
  const db = await getDB();
  return db.getAll('roles');
}

export async function getRoleByName(name: string): Promise<Role | undefined> {
  const roles = await getRoles();
  return roles.find(r => r.name === name);
}

// ============= Users =============
export async function createUser(user: User): Promise<void> {
  const db = await getDB();
  await db.put('users', user);
}

export async function getUsers(): Promise<User[]> {
  const db = await getDB();
  return db.getAll('users');
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  const db = await getDB();
  const users = await db.getAll('users');
  return users.find(u => u.username === username);
}

export async function updateUser(user: User): Promise<void> {
  const db = await getDB();
  await db.put('users', user);
}

export async function deleteUser(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('users', id);
}

// ============= App State =============
export async function getAppState(): Promise<{ licenseValid: boolean; superAdminCreated: boolean; sessionUser: string | null }> {
  const db = await getDB();
  const state = await db.get('appState', 'main');
  return state || { id: 'main', licenseValid: false, superAdminCreated: false, sessionUser: null };
}

export async function setAppState(updates: Partial<{ licenseValid: boolean; superAdminCreated: boolean; sessionUser: string | null }>): Promise<void> {
  const db = await getDB();
  const current = await getAppState();
  await db.put('appState', { ...current, id: 'main', ...updates });
}

// ============= Audit =============
export async function logAudit(userId: string, action: string, details: string = ''): Promise<void> {
  const db = await getDB();
  const entry: AuditLog = {
    id: generateId(),
    userId,
    action,
    details,
    date: new Date().toISOString(),
  };
  await db.put('auditLogs', entry);
}

// ============= Generic CRUD helpers =============
export async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await getDB();
  return db.getAll(storeName);
}

export async function putItem<T>(storeName: string, item: T): Promise<void> {
  const db = await getDB();
  await db.put(storeName, item);
}

export async function deleteItem(storeName: string, id: string): Promise<void> {
  const db = await getDB();
  await db.delete(storeName, id);
}
