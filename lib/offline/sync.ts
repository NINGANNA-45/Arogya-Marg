import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ArogyaMargDB extends DBSchema {
  syncQueue: {
    key: string;
    value: {
      id: string;
      url: string;
      method: string;
      body?: any;
      timestamp: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<ArogyaMargDB>> | null = null;

if (typeof window !== 'undefined') {
  dbPromise = openDB<ArogyaMargDB>('arogya-marg-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id' });
      }
    },
  });
}

export async function addToSyncQueue(request: { url: string; method: string; body?: any }) {
  if (!dbPromise) return;
  const db = await dbPromise;
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
  
  await db.add('syncQueue', {
    id,
    url: request.url,
    method: request.method,
    body: request.body,
    timestamp: Date.now()
  });
  
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const registration = await navigator.serviceWorker.ready;
    try {
      // @ts-ignore
      await registration.sync.register('arogya-marg-sync');
    } catch (err) {
      console.error('Background sync could not be registered!', err);
    }
  }
}

export async function getSyncQueue() {
  if (!dbPromise) return [];
  const db = await dbPromise;
  return await db.getAll('syncQueue');
}

export async function removeFromSyncQueue(id: string) {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.delete('syncQueue', id);
}
