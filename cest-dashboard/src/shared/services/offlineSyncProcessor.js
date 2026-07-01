import { db, supabase } from "./supabaseClient";
import { offlineSyncQueue } from "./offlineSyncQueue";

async function runItem(item) {
  switch (item.type) {
    case "createProjectBundle": {
      const { projectData, equipmentList = [] } = item.payload;
      const newProject = await db.createProject(projectData);

      for (const equipmentData of equipmentList) {
        await db.createEquipment({
          ...equipmentData,
          project_id: newProject.id,
          project_title: projectData.project_title,
        });
      }
      return;
    }

    case "createEquipment": {
      await db.createEquipment(item.payload);
      return;
    }

    case "updateProject": {
      const { id, projectData } = item.payload;
      const { components: _c, communities: _m, ...rest } = projectData;
      await db.updateProject(id, rest);
      return;
    }

    case "updateEquipment": {
      const { id, equipmentData } = item.payload;
      await db.updateEquipment(id, equipmentData);
      return;
    }

    case "archiveProject": {
      await db.deleteProject(item.payload.id);
      return;
    }

    case "archiveEquipment": {
      await db.deleteEquipment(item.payload.id);
      return;
    }

    case "restoreItem": {
      const { item: record } = item.payload;
      if (record._type === "equipment") {
        await db.restoreEquipment(record.id);
      } else if (record._type === "training") {
        const { error } = await supabase
          .from("trainings")
          .update({ is_archived: false, archived_at: null })
          .eq("id", record.id);
        if (error) throw error;
      } else {
        await db.restoreProject(record.id);
        for (const eq of item.payload.linkedEquipment || []) {
          await db.restoreEquipment(eq.id);
        }
      }
      return;
    }

    case "permanentDeleteItem": {
      const { item: record, linkedEquipment = [] } = item.payload;
      if (record._type === "equipment") {
        await db.permanentDeleteEquipment(record.id);
      } else if (record._type === "training") {
        const { error } = await supabase.from("trainings").delete().eq("id", record.id);
        if (error) throw error;
      } else {
        await db.permanentDeleteProject(record.id);
        for (const eq of linkedEquipment) {
          await db.permanentDeleteEquipment(eq.id);
        }
      }
      return;
    }

    default:
      throw new Error(`Unknown sync operation: ${item.type}`);
  }
}

export async function processOfflineSyncQueue({ onItemSynced, onItemFailed } = {}) {
  if (!navigator.onLine) return { synced: 0, failed: 0, remaining: offlineSyncQueue.getCount() };

  const pending = offlineSyncQueue.getPending();
  let synced = 0;
  let failed = 0;

  for (const item of pending) {
    if (!navigator.onLine) break;

    try {
      await runItem(item);
      offlineSyncQueue.remove(item.id);
      synced += 1;
      onItemSynced?.(item);
    } catch (err) {
      failed += 1;
      offlineSyncQueue.markFailed(item.id, err.message || "Sync failed");
      onItemFailed?.(item, err);
      if (!navigator.onLine) break;
    }
  }

  return {
    synced,
    failed,
    remaining: offlineSyncQueue.getCount(),
  };
}
