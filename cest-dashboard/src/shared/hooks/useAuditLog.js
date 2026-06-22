import { useState, useEffect, useCallback } from 'react';
import { auditService } from '../services/auditService';
import { db } from '../services/supabaseClient';
import { usePersistedState } from './usePersistedState';

const MAX_LOGS = 100; // Keep last 100 logs

export const useAuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [localLogs, setLocalLogs] = usePersistedState('cest_audit_logs', []);
  const [loading, setLoading] = useState(true);
  const [useDatabase, setUseDatabase] = useState(true);

  // Load logs from database or fallback to localStorage
  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const dbLogs = await db.getAuditLogs(MAX_LOGS);
      
      if (dbLogs && dbLogs.length > 0) {
        // Database has logs, use them
        setLogs(dbLogs);
        setUseDatabase(true);
      } else {
        // No database logs, use localStorage
        console.log('Using localStorage for audit logs');
        setLogs(localLogs);
        setUseDatabase(false);
      }
    } catch (error) {
      console.warn('Database not available, using localStorage:', error);
      setLogs(localLogs);
      setUseDatabase(false);
    } finally {
      setLoading(false);
    }
  }, [localLogs]);

  // Initial load
  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Subscribe to audit service for new logs
  useEffect(() => {
    const unsubscribe = auditService.subscribe((newLog) => {
      setLogs(prevLogs => {
        const updatedLogs = [newLog, ...prevLogs];
        return updatedLogs.slice(0, MAX_LOGS);
      });
      
      // Also save to localStorage as backup
      setLocalLogs(prevLogs => {
        const updatedLogs = [newLog, ...prevLogs];
        return updatedLogs.slice(0, MAX_LOGS);
      });
    });

    return unsubscribe;
  }, [setLocalLogs]);

  // Refresh logs from database
  const refreshLogs = useCallback(async () => {
    await loadLogs();
  }, [loadLogs]);

  // Clear all logs
  const clearLogs = useCallback(() => {
    setLogs([]);
    setLocalLogs([]);
  }, [setLocalLogs]);

  // Delete a specific log
  const deleteLog = useCallback((logId) => {
    setLogs(prevLogs => prevLogs.filter(log => log.id !== logId));
    setLocalLogs(prevLogs => prevLogs.filter(log => log.id !== logId));
  }, [setLocalLogs]);

  // Get logs by action type
  const getLogsByAction = useCallback((action) => {
    return logs.filter(log => log.action === action);
  }, [logs]);

  // Get logs by entity type
  const getLogsByEntity = useCallback((entityType) => {
    return logs.filter(log => log.entityType === entityType || log.entity_type === entityType);
  }, [logs]);

  // Get logs by date range
  const getLogsByDateRange = useCallback((startDate, endDate) => {
    return logs.filter(log => {
      const logDate = new Date(log.timestamp || log.created_at);
      return logDate >= startDate && logDate <= endDate;
    });
  }, [logs]);

  // Get recent logs (last N logs)
  const getRecentLogs = useCallback((count = 10) => {
    return logs.slice(0, count);
  }, [logs]);

  // Get unread count
  const getUnreadCount = useCallback(() => {
    if (useDatabase) {
      // For database logs, check is_read field
      return logs.filter(log => !log.is_read).length;
    } else {
      // For localStorage logs, check local read status
      const readStatus = JSON.parse(localStorage.getItem('cest_audit_read_status') || '{}');
      return logs.filter(log => !readStatus[log.id]).length;
    }
  }, [logs, useDatabase]);

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
    useDatabase
  };
};
