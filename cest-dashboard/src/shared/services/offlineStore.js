const DB_NAME = 'cest-dashboard-offline';
const DB_VERSION = 1;

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not available'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache');
      }
      if (!db.objectStoreNames.contains('queue')) {
        db.createObjectStore('queue', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore(storeName, mode, fn) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const result = fn(store);
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
  });
}

export const offlineStore = {
  async getCacheKey(key) {
    try {
      return await withStore('cache', 'readonly', (store) => {
        return new Promise((resolve, reject) => {
          const req = store.get(key);
          req.onsuccess = () => resolve(req.result ?? null);
          req.onerror = () => reject(req.error);
        });
      });
    } catch {
      return null;
    }
  },

  async setCacheKey(key, value) {
    try {
      await withStore('cache', 'readwrite', (store) => {
        store.put(value, key);
      });
    } catch (err) {
      console.warn('Failed to write offline cache:', err);
    }
  },

  async getFullCache() {
    const keys = ['projects', 'equipment', 'starbooksUnits', 'archivedProjects', 'trainings'];
    const cache = {};
    for (const key of keys) {
      cache[key] = (await this.getCacheKey(key)) || [];
    }
    return cache;
  },

  async saveFullCache(data) {
    const entries = [
      ['projects', data.projects],
      ['equipment', data.equipment],
      ['starbooksUnits', data.starbooksUnits],
      ['archivedProjects', data.archivedProjects],
      ['trainings', data.trainings],
    ];
    for (const [key, value] of entries) {
      if (value !== undefined) {
        await this.setCacheKey(key, value);
      }
    }
    await this.setCacheKey('cachedAt', new Date().toISOString());
  },

  async getQueue() {
    try {
      return await withStore('queue', 'readonly', (store) => {
        return new Promise((resolve, reject) => {
          const req = store.getAll();
          req.onsuccess = () => {
            const items = (req.result || []).sort(
              (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
            );
            resolve(items);
          };
          req.onerror = () => reject(req.error);
        });
      });
    } catch {
      return [];
    }
  },

  async addToQueue(item) {
    await withStore('queue', 'readwrite', (store) => {
      store.put(item);
    });
    return item;
  },

  async updateQueueItem(id, updates) {
    const queue = await this.getQueue();
    const item = queue.find((q) => q.id === id);
    if (!item) return null;
    const updated = { ...item, ...updates };
    await withStore('queue', 'readwrite', (store) => {
      store.put(updated);
    });
    return updated;
  },

  async removeFromQueue(id) {
    await withStore('queue', 'readwrite', (store) => {
      store.delete(id);
    });
  },

  async clearQueue() {
    await withStore('queue', 'readwrite', (store) => {
      store.clear();
    });
  },
};

export function generateTempId(entity) {
  return `pending-${entity}-${crypto.randomUUID()}`;
}
