import { supabase } from "./supabaseClient";

const GUEST_PROFILE_KEY = "cest_guest_profile";

const defaultStats = () => ({
  pendingRequests: 0,
  approvedUsers: 0,
  declinedUsers: 0,
  totalVisitors: 0,
  filesAccessedToday: 0,
});

function readGuestProfile() {
  try {
    const raw = sessionStorage.getItem(GUEST_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeGuestProfile(profile) {
  if (profile) {
    sessionStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(profile));
  } else {
    sessionStorage.removeItem(GUEST_PROFILE_KEY);
  }
}

function mapRequest(row) {
  if (!row) return null;
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    fullName: row.full_name,
    initials: `${(row.first_name?.[0] || "").toUpperCase()}${(row.last_name?.[0] || "").toUpperCase()}` || "?",
    status: row.status,
    requestedAt: row.requested_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    accessToken: row.access_token,
  };
}

function mapLog(row) {
  return {
    id: row.id,
    type: row.log_type,
    message: row.message,
    userName: row.user_name,
    actor: row.actor,
    meta: row.meta,
    timestamp: row.created_at,
    requestId: row.request_id,
  };
}

export const accessRequestService = {
  getGuestProfile() {
    return readGuestProfile();
  },

  setGuestProfile(profile) {
    writeGuestProfile(profile);
  },

  async fetchGuestStatus(accessToken) {
    if (!accessToken) return null;
    const { data, error } = await supabase.rpc("get_guest_request_status", {
      p_access_token: accessToken,
    });
    if (error) {
      console.error("fetchGuestStatus:", error);
      return null;
    }
    const row = Array.isArray(data) ? data[0] : data;
    return row ? mapRequest(row) : null;
  },

  async syncGuestProfileFromServer() {
    const profile = readGuestProfile();
    if (!profile?.accessToken) return profile;

    const server = await this.fetchGuestStatus(profile.accessToken);
    if (!server) return profile;

    const updated = {
      ...profile,
      requestId: server.id,
      firstName: server.firstName,
      lastName: server.lastName,
      fullName: server.fullName,
      status: server.status,
    };
    if (updated.status !== profile.status) {
      writeGuestProfile(updated);
    }
    return updated;
  },

  async getRequests() {
    const { data, error } = await supabase
      .from("guest_access_requests")
      .select("*")
      .order("requested_at", { ascending: false });

    if (error) {
      console.error("getRequests:", error);
      return [];
    }
    return (data || []).map(mapRequest);
  },

  async getStats() {
    const { data, error } = await supabase.from("guest_access_stats").select("*").maybeSingle();

    if (error) {
      console.error("getStats:", error);
      const requests = await this.getRequests();
      return {
        ...defaultStats(),
        pendingRequests: requests.filter((r) => r.status === "pending").length,
        approvedUsers: requests.filter((r) => r.status === "approved").length,
        declinedUsers: requests.filter((r) => r.status === "declined").length,
        totalVisitors: requests.length,
      };
    }

    return {
      pendingRequests: data?.pending_requests ?? 0,
      approvedUsers: data?.approved_users ?? 0,
      declinedUsers: data?.declined_users ?? 0,
      totalVisitors: data?.total_visitors ?? 0,
      filesAccessedToday: data?.files_accessed_today ?? 0,
    };
  },

  async getLogs() {
    const { data, error } = await supabase
      .from("guest_access_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      console.error("getLogs:", error);
      return [];
    }
    return (data || []).map(mapLog);
  },

  async submitRequest(firstName, lastName) {
    const first = firstName.trim();
    const last = lastName.trim();
    if (!first || !last) throw new Error("First name and last name are required.");

    const { data, error } = await supabase.rpc("submit_guest_access_request", {
      p_first_name: first,
      p_last_name: last,
    });

    if (error) throw new Error(error.message || "Failed to submit access request.");

    const row = Array.isArray(data) ? data[0] : data;
    const request = mapRequest(row);

    const profile = {
      requestId: request.id,
      accessToken: request.accessToken,
      firstName: request.firstName,
      lastName: request.lastName,
      fullName: request.fullName,
      status: request.status,
    };
    writeGuestProfile(profile);

    await this.logEvent({
      type: "request_submitted",
      message: `${request.fullName} requested guest access`,
      userName: request.fullName,
      requestId: request.id,
    });

    return request;
  },

  async approveRequest(requestId, reviewedBy = "Administrator") {
    return this._review(requestId, "approved", reviewedBy);
  },

  async declineRequest(requestId, reviewedBy = "Administrator") {
    return this._review(requestId, "declined", reviewedBy);
  },

  async _review(requestId, status, reviewedBy) {
    const { data, error } = await supabase
      .from("guest_access_requests")
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewedBy,
      })
      .eq("id", requestId)
      .select("*")
      .single();

    if (error) throw new Error(error.message || "Failed to update request.");

    const request = mapRequest(data);
    const profile = readGuestProfile();
    if (profile?.requestId === requestId) {
      writeGuestProfile({ ...profile, status });
    }

    await this.logEvent({
      type: status === "approved" ? "request_approved" : "request_declined",
      message: `${request.fullName} was ${status}`,
      userName: request.fullName,
      actor: reviewedBy,
      requestId,
    });

    return request;
  },

  async logEvent({ type, message, userName, actor, meta, requestId }) {
    const profile = readGuestProfile();
    const { error } = await supabase.from("guest_access_logs").insert({
      log_type: type,
      message,
      user_name: userName || "Unknown",
      actor: actor || null,
      meta: meta || {},
      request_id: requestId || profile?.requestId || null,
    });
    if (error) console.error("logEvent:", error);
  },

  async recordFileAccess(userName = "Guest") {
    await this.logEvent({
      type: "file_access",
      message: "Viewed project or equipment record",
      userName,
    });
  },

  async recordPageVisit(userName = "Guest") {
    await this.logEvent({
      type: "page_visit",
      message: "Opened dashboard page",
      userName,
    });
  },
};
