const CACHE_KEY = "cest_offline_data_v1";
const ADMIN_SCOPE = "admin";

export const offlineDataCache = {
  save({ projects = [], equipment = [], starbooksUnits = [], archivedProjects = [] }) {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          scope: ADMIN_SCOPE,
          projects,
          equipment,
          starbooksUnits,
          archivedProjects,
          cachedAt: new Date().toISOString(),
        })
      );
    } catch (err) {
      console.warn("offlineDataCache.save failed:", err);
    }
  },

  load() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed?.scope !== ADMIN_SCOPE) return null;
      return parsed;
    } catch {
      return null;
    }
  },

  hasData() {
    const cached = this.load();
    if (!cached) return false;
    return !!(
      cached.projects?.length ||
      cached.equipment?.length ||
      cached.starbooksUnits?.length ||
      cached.archivedProjects?.length
    );
  },

  clear() {
    localStorage.removeItem(CACHE_KEY);
  },
};
