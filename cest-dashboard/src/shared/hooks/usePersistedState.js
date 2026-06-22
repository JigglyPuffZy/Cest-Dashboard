import { useState } from "react";

// LocalStorage helpers
export const loadFromStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("localStorage save error:", e);
  }
};

// Custom hook for persisted state
export const usePersistedState = (lsKey, fallback) => {
  const [state, setState] = useState(() => loadFromStorage(lsKey, fallback));

  const setAndPersist = (updater) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveToStorage(lsKey, next);
      return next;
    });
  };

  return [state, setAndPersist];
};
