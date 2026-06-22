import { db, supabase } from './supabaseClient';
import { offlineStore, generateTempId } from './offlineStore';

export function isBrowserOnline() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

export function isNetworkError(error) {
  if (!error) return false;
  const msg = String(error.message || error).toLowerCase();
  return (
    !isBrowserOnline() ||
    msg.includes('failed to fetch') ||
    msg.includes('network') ||
    msg.includes('timeout') ||
    msg.includes('load failed')
  );
}

function resolveRefId(id, idMap) {
  if (!id) return id;
  return idMap[id] || id;
}

function resolvePayloadRefs(payload, idMap) {
  if (!payload || typeof payload !== 'object') return payload;
  const resolved = { ...payload };
  if (resolved.project_id) {
    resolved.project_id = resolveRefId(resolved.project_id, idMap);
  }
  return resolved;
}

async function executeQueueItem(item, idMap) {
  const payload = resolvePayloadRefs(item.payload, idMap);
  const entityId = resolveRefId(item.entityId, idMap);

  switch (`${item.entity}:${item.action}`) {
    case 'project:create': {
      const created = await db.createProject(payload);
      if (item.tempId) idMap[item.tempId] = created.id;
      if (payload.components?.length) {
        for (const code of payload.components) {
          await db.addProjectComponent(created.id, code);
        }
      }
      if (payload.communities?.length) {
        for (const code of payload.communities) {
          await db.addProjectCommunityType(created.id, code);
        }
      }
      return created;
    }
    case 'project:update':
      return db.updateProject(entityId, payload);
    case 'project:archive':
      return db.deleteProject(entityId);
    case 'project:restore':
      return db.restoreProject(entityId);
    case 'project:permanentDelete':
      return db.permanentDeleteProject(entityId);
    case 'equipment:create': {
      const created = await db.createEquipment(payload);
      if (item.tempId) idMap[item.tempId] = created.id;
      return created;
    }
    case 'equipment:update':
      return db.updateEquipment(entityId, payload);
    case 'equipment:archive':
      return db.deleteEquipment(entityId);
    case 'equipment:restore':
      return db.restoreEquipment(entityId);
    case 'equipment:permanentDelete':
      return db.permanentDeleteEquipment(entityId);
    case 'starbooks_unit:update':
      return db.updateStarbooksUnit(entityId, payload);
    case 'starbooks_unit:delete': {
      const { error } = await supabase.from('starbooks_units').delete().eq('id', entityId);
      if (error) throw error;
      return true;
    }
    case 'training:create': {
      const { data, error } = await supabase.from('trainings').insert([payload]).select().single();
      if (error) throw error;
      if (item.tempId) idMap[item.tempId] = data.id;
      return data;
    }
    case 'training:update': {
      const { data, error } = await supabase.from('trainings').update(payload).eq('id', entityId).select().single();
      if (error) throw error;
      return data;
    }
    case 'training:archive': {
      const { error } = await supabase
        .from('trainings')
        .update({ is_archived: true, archived_at: new Date().toISOString() })
        .eq('id', entityId);
      if (error) throw error;
      return true;
    }
    default:
      throw new Error(`Unknown sync action: ${item.entity}:${item.action}`);
  }
}

export async function processSyncQueue() {
  const queue = await offlineStore.getQueue();
  const pending = queue.filter((q) => q.status === 'pending' || q.status === 'failed');
  if (pending.length === 0) return { synced: 0, failed: 0, errors: [] };

  const idMap = {};
  let synced = 0;
  let failed = 0;
  const errors = [];

  for (const item of pending) {
    try {
      await offlineStore.updateQueueItem(item.id, { status: 'syncing', error: null });
      await executeQueueItem(item, idMap);
      await offlineStore.removeFromQueue(item.id);
      synced += 1;
    } catch (err) {
      failed += 1;
      const message = err?.message || 'Sync failed';
      errors.push({ id: item.id, message });
      await offlineStore.updateQueueItem(item.id, { status: 'failed', error: message });
    }
  }

  return { synced, failed, errors };
}

export function mergeQueueWithData(data, queue) {
  let projects = [...(data.projects || [])];
  let equipment = [...(data.equipment || [])];
  let starbooksUnits = [...(data.starbooksUnits || [])];
  let archivedProjects = [...(data.archivedProjects || [])];
  let trainings = [...(data.trainings || [])];

  const pendingQueue = (queue || []).filter((q) => q.status === 'pending' || q.status === 'failed');

  for (const item of pendingQueue) {
    const mark = { _syncStatus: 'pending', _queueId: item.id };
    const id = item.entityId || item.tempId;

    switch (`${item.entity}:${item.action}`) {
      case 'project:create':
        projects = [{ id: item.tempId, ...item.payload, ...mark, created_at: item.createdAt }, ...projects];
        break;
      case 'project:update':
        projects = projects.map((p) =>
          String(p.id) === String(id) ? { ...p, ...item.payload, ...mark } : p
        );
        break;
      case 'project:archive': {
        const proj = projects.find((p) => String(p.id) === String(id));
        if (proj) {
          projects = projects.filter((p) => String(p.id) !== String(id));
          archivedProjects = [
            { ...proj, _type: 'project', archived_at: item.createdAt, ...mark },
            ...archivedProjects,
          ];
        }
        break;
      }
      case 'equipment:create':
        equipment = [{ id: item.tempId, ...item.payload, ...mark, created_at: item.createdAt }, ...equipment];
        break;
      case 'equipment:update':
        equipment = equipment.map((e) =>
          String(e.id) === String(id) ? { ...e, ...item.payload, ...mark } : e
        );
        break;
      case 'equipment:archive': {
        const eq = equipment.find((e) => String(e.id) === String(id));
        if (eq) {
          equipment = equipment.filter((e) => String(e.id) !== String(id));
          archivedProjects = [
            { ...eq, _type: 'equipment', archived_at: item.createdAt, ...mark },
            ...archivedProjects,
          ];
        }
        break;
      }
      case 'starbooks_unit:update':
        starbooksUnits = starbooksUnits.map((u) =>
          String(u.id) === String(id) ? { ...u, ...item.payload, ...mark } : u
        );
        break;
      case 'starbooks_unit:delete':
        starbooksUnits = starbooksUnits.filter((u) => String(u.id) !== String(id));
        break;
      case 'training:create':
        trainings = [{ id: item.tempId, ...item.payload, ...mark, created_at: item.createdAt }, ...trainings];
        break;
      case 'training:update':
        trainings = trainings.map((t) =>
          String(t.id) === String(id) ? { ...t, ...item.payload, ...mark } : t
        );
        break;
      case 'training:archive': {
        const training = trainings.find((t) => String(t.id) === String(id));
        if (training) {
          trainings = trainings.filter((t) => String(t.id) !== String(id));
          archivedProjects = [
            { ...training, _type: 'training', archived_at: item.createdAt, ...mark },
            ...archivedProjects,
          ];
        }
        break;
      }
      default:
        break;
    }
  }

  return { projects, equipment, starbooksUnits, archivedProjects, trainings };
}

export async function enqueueMutation({ entity, action, payload, entityId = null, tempId = null }) {
  const item = {
    id: crypto.randomUUID(),
    entity,
    action,
    payload,
    entityId,
    tempId: tempId || (action === 'create' ? generateTempId(entity) : null),
    status: 'pending',
    createdAt: new Date().toISOString(),
    error: null,
  };
  await offlineStore.addToQueue(item);
  return item;
}

/** If editing an unsynced create, merge into that queue row instead of adding an update. */
export async function enqueueOrMergeMutation({ entity, action, payload, entityId = null }) {
  if (entityId && String(entityId).startsWith('pending-')) {
    const queue = await offlineStore.getQueue();
    const createItem = queue.find(
      (q) => q.tempId === entityId && q.entity === entity && q.action === 'create'
    );
    if (createItem) {
      return offlineStore.updateQueueItem(createItem.id, {
        payload: { ...createItem.payload, ...payload },
      });
    }
  }
  return enqueueMutation({ entity, action, payload, entityId });
}

export { generateTempId };
