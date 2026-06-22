// Audit Log Service
// Tracks all user activities in the system

export const AUDIT_ACTIONS = {
  CREATE: 'create',
  UPLOAD: 'upload',
  EDIT: 'edit',
  UPDATE: 'update',
  DELETE: 'delete',
  ARCHIVE: 'archive',
  RESTORE: 'restore',
};

export const ENTITY_TYPES = {
  PROJECT: 'Project',
  EQUIPMENT: 'Equipment',
  USER: 'User',
  SETTINGS: 'Settings',
  SYSTEM: 'System',
};

class AuditService {
  constructor() {
    this.listeners = [];
  }

  // Subscribe to audit log changes
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners
  notify(log) {
    this.listeners.forEach(listener => listener(log));
  }

  // Create an audit log entry
  createLog({
    action,
    entityType,
    entityId,
    entityName,
    description,
    details,
    user = 'Admin User',
    metadata = {}
  }) {
    const log = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      entityType,
      entityId,
      entityName,
      description,
      details,
      user,
      timestamp: new Date().toISOString(),
      metadata
    };

    this.notify(log);
    return log;
  }

  // Convenience methods for common actions
  logCreate(entityType, entityName, details, metadata) {
    return this.createLog({
      action: AUDIT_ACTIONS.CREATE,
      entityType,
      entityName,
      description: `Created ${entityType.toLowerCase()}: "${entityName}"`,
      details,
      metadata
    });
  }

  logUpload(entityType, entityName, details, metadata) {
    return this.createLog({
      action: AUDIT_ACTIONS.UPLOAD,
      entityType,
      entityName,
      description: `Uploaded ${entityType.toLowerCase()}: "${entityName}"`,
      details,
      metadata
    });
  }

  logEdit(entityType, entityName, changes, metadata) {
    return this.createLog({
      action: AUDIT_ACTIONS.EDIT,
      entityType,
      entityName,
      description: `Edited ${entityType.toLowerCase()}: "${entityName}"`,
      details: changes,
      metadata
    });
  }

  logUpdate(entityType, entityName, changes, metadata) {
    return this.createLog({
      action: AUDIT_ACTIONS.UPDATE,
      entityType,
      entityName,
      description: `Updated ${entityType.toLowerCase()}: "${entityName}"`,
      details: changes,
      metadata
    });
  }

  logDelete(entityType, entityName, metadata) {
    return this.createLog({
      action: AUDIT_ACTIONS.DELETE,
      entityType,
      entityName,
      description: `Deleted ${entityType.toLowerCase()}: "${entityName}"`,
      metadata
    });
  }

  logArchive(entityType, entityName, metadata) {
    return this.createLog({
      action: AUDIT_ACTIONS.ARCHIVE,
      entityType,
      entityName,
      description: `Archived ${entityType.toLowerCase()}: "${entityName}"`,
      metadata
    });
  }

  logRestore(entityType, entityName, metadata) {
    return this.createLog({
      action: AUDIT_ACTIONS.RESTORE,
      entityType,
      entityName,
      description: `Restored ${entityType.toLowerCase()}: "${entityName}"`,
      metadata
    });
  }
}

// Export singleton instance
export const auditService = new AuditService();
