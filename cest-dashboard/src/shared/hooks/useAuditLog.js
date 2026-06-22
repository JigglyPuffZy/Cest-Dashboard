import { useState, useEffect, useCallback } from 'react';
import { auditService } from '../services/auditService';
import { db } from '../services/supabaseClient';

const MAX_LOGS = 100;

export const useAuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const dbLogs = await db.getAuditLogs(MAX_LOGS);
      setLogs(dbLogs || []);
    } catch (error) {
      console.warn('Audit logs unavailable:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    return auditService.subscribe((newLog) => {
      setLogs((prevLogs) => [newLog, ...prevLogs].slice(0, MAX_LOGS));
    });
  }, []);

  const refreshLogs = useCallback(async () => {
    await loadLogs();
  }, [loadLogs]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const deleteLog = useCallback((logId) => {
    setLogs((prevLogs) => prevLogs.filter((log) => log.id !== logId));
  }, []);

  const getLogsByAction = useCallback((action) => {
    return logs.filter((log) => log.action === action);
  }, [logs]);

  const getLogsByEntity = useCallback((entityType) => {
    return logs.filter((log) => log.entityType === entityType || log.entity_type === entityType);
  }, [logs]);

  const getLogsByDateRange = useCallback((startDate, endDate) => {
    return logs.filter((log) => {
      const logDate = new Date(log.timestamp || log.created_at);
      return logDate >= startDate && logDate <= endDate;
    });
  }, [logs]);

  const getRecentLogs = useCallback((count = 10) => {
    return logs.slice(0, count);
  }, [logs]);

  const getUnreadCount = useCallback(() => {
    return logs.filter((log) => !log.is_read).length;
  }, [logs]);

  return {
    logs,
    loading,
    refreshLogs,
    clearLogs,
    deleteLog,
    getLogsByAction,
    getLogsByEntity,
    getLogsByDateRange,
    getRecentLogs,
    getUnreadCount,
  };
};
