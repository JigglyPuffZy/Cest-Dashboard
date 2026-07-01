const QUEUE_KEY = "cest_offline_sync_queue_v1";

function readQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeQueue(items) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

function makeId() {
  return `sync_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const listeners = new Set();

function notify() {
  listeners.forEach((fn) => {
    try {
      fn(readQueue());
    } catch {
      /* ignore */
    }
  });
}

export const offlineSyncQueue = {
  getAll() {
    return readQueue();
  },

  getCount() {
    return readQueue().length;
  },

  getPending() {
    return readQueue().filter((item) => item.status !== "failed");
  },

  enqueue({ type, payload, label }) {
    const item = {
      id: makeId(),
      type,
      payload,
      label: label || type,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    const next = [...readQueue(), item];
    writeQueue(next);
    notify();
    return item;
  },

  remove(id) {
    const next = readQueue().filter((item) => item.id !== id);
    writeQueue(next);
    notify();
  },

  markFailed(id, errorMessage) {
    const next = readQueue().map((item) =>
      item.id === id ? { ...item, status: "failed", errorMessage } : item
    );
    writeQueue(next);
    notify();
  },

  clear() {
    writeQueue([]);
    notify();
  },

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
