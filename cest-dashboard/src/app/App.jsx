import { useState, useEffect, useRef, useCallback } from "react";
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth, getUserDisplayName } from "../shared/hooks/useAuth.jsx";
import { Sidebar } from "../components/layout/Sidebar";
import { StarbooksSidebar } from "../components/layout/StarbooksSidebar";
import { TopBar } from "../components/layout/TopBar";
import { Toast } from "../components/ui/Toast";
import { AuditLog } from "../components/ui/AuditLog";
import { LoadingScreen } from "../components/ui/LoadingScreen";
import { ViewModeBanner } from "../components/ui/ViewModeBanner";
import ErrorBoundary from "../components/ui/ErrorBoundary";
import { Dashboard } from "../features/dashboard/Dashboard";
import { ProvincesPage } from "../features/analytics/ProvincesPage";
import { CitiesPage } from "../features/analytics/CitiesPage";
import { BarangaysPage } from "../features/analytics/BarangaysPage";
import { MonitoringPage } from "../features/monitoring/MonitoringPage";
import { ArchivePage } from "../features/archive/ArchivePage";
import { DataEntryPage } from "../features/data-entry/DataEntryPage";
import { StarbooksPage } from "../features/starbooks/StarbooksPage";
import { LoginPage } from "../features/auth/LoginPage";
import TrainingsPage from "../features/trainings/TrainingsPage";
import { AdminRequestsPage } from "../features/admin/AdminRequestsPage";
import { GuestAccessBlocked } from "../components/ui/GuestAccessBlocked";
import { OfflineIndicator } from "../components/ui/OfflineIndicator";
import { OfflineProvider, useOffline } from "../shared/hooks/useOfflineSync.jsx";
import { offlineStore } from "../shared/services/offlineStore";
import { isBrowserOnline, isNetworkError } from "../shared/services/offlineSyncService";
import { useToastNotification } from "../shared/hooks/useToastNotification";
import { useAuditLog } from "../shared/hooks/useAuditLog";
import { auditService, ENTITY_TYPES } from "../shared/services/auditService";
import { db, supabase } from "../shared/services/supabaseClient";

const INACTIVITY_TIMEOUT = 60 * 60 * 1000;
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

function AppMain({ loadRef }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    loading: authLoading,
    signOut,
    exitGuestMode,
    isGuestMode,
    isReadOnly,
    canAccessApp,
    isAdmin,
    canViewData,
    displayName,
    guestAccessStatus,
    guestNeedsProfile,
    refreshGuestProfile,
  } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [starbooksUnits, setStarbooksUnits] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [archivedProjects, setArchivedProjects] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [activeSystem, setActiveSystem] = useState("cest");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { toasts, success, warning, error, removeToast } = useToastNotification();
  const { logs, refreshLogs, getUnreadCount } = useAuditLog();
  const { isOnline, pendingCount, isSyncing, syncNow, queueChange, applyPendingOverlay } = useOffline();
  const dataLoadedRef = useRef(false);
  const unreadCount = getUnreadCount();

  const applyDataToState = useCallback(async (base) => {
    const merged = await applyPendingOverlay(base);
    setProjects(merged.projects || []);
    setEquipment(merged.equipment || []);
    setStarbooksUnits(merged.starbooksUnits || []);
    setArchivedProjects(merged.archivedProjects || []);
  }, [applyPendingOverlay]);

  useEffect(() => {
    const pathToPage = {
      "/dashboard": "dashboard",
      "/analytics": "analytics",
      "/monitoring": "monitoring",
      "/archive": "archive",
      "/dataentry": "dataentry",
      "/trainings": "trainings",
      "/starbooks": "starbooks",
      "/admin": "admin",
      "/admin/requests": "admin",
      "/admin/approved": "admin",
      "/admin/declined": "admin",
      "/admin/logs": "admin",
    };
    if (pathToPage[location.pathname]) {
      setActivePage(pathToPage[location.pathname]);
    } else if (location.pathname.startsWith("/analytics")) {
      setActivePage("analytics");
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!isGuestMode || guestAccessStatus !== "pending") return undefined;
    const timer = setInterval(() => {
      refreshGuestProfile();
    }, 4000);
    return () => clearInterval(timer);
  }, [isGuestMode, guestAccessStatus, refreshGuestProfile]);

  const guardData = (node) => (canViewData ? node : <GuestAccessBlocked darkMode={darkMode} />);
  const guardAdmin = (node) => (isAdmin ? node : <Navigate to="/dashboard" replace />);

  const uniqueComm = new Set(projects.map((p) => p.community)).size;

  const dashboardProps = {
    projects,
    equipment,
    uniqueComm,
    darkMode,
    isGuestMode,
    guestAccessStatus,
    guestNeedsProfile,
    canViewData,
    isReadOnly,
    isAdmin,
    displayName,
    onGuestSignIn: exitGuestMode,
    onNavigateAdmin: () => {
      setActivePage("admin");
      navigate("/admin");
    },
  };

  useEffect(() => {
    if (canAccessApp && !authLoading && !dataLoadedRef.current) {
      dataLoadedRef.current = true;
      loadSupabaseData();
    }
    if (!canAccessApp && !authLoading) {
      dataLoadedRef.current = false;
    }
  }, [canAccessApp, authLoading]);

  useEffect(() => {
    const failsafeTimeout = setTimeout(() => {
      if (loadingData) {
        console.warn('Data loading failsafe triggered, forcing completion');
        setLoadingData(false);
      }
    }, 15000);

    return () => clearTimeout(failsafeTimeout);
  }, [loadingData]);

  const loadSupabaseData = useCallback(async () => {
    try {
      setLoadingData(true);
      console.log('Loading data...');

      let base = {
        projects: [],
        equipment: [],
        starbooksUnits: [],
        archivedProjects: [],
        trainings: [],
      };

      const loadFromNetwork = async () => {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Data loading timeout')), 10000)
        );

        const [projectsData, equipmentData, starbooksData] = await Promise.race([
          Promise.allSettled([
            db.getProjects(),
            db.getEquipment(),
            db.getActiveStarbooksUnits(),
          ]),
          timeoutPromise,
        ]);

        base.projects = projectsData.status === 'fulfilled' ? (projectsData.value || []) : [];
        base.equipment = equipmentData.status === 'fulfilled' ? (equipmentData.value || []) : [];
        base.starbooksUnits = starbooksData.status === 'fulfilled' ? (starbooksData.value || []) : [];

        try {
          const [archivedP, archivedE, archivedTRes] = await Promise.race([
            Promise.allSettled([
              db.getArchivedProjects(),
              db.getArchivedEquipment(),
              supabase.from('trainings').select('*').eq('is_archived', true).order('archived_at', { ascending: false }),
            ]),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Archive loading timeout')), 5000)),
          ]);

          base.archivedProjects = [
            ...(archivedP.status === 'fulfilled' ? archivedP.value : []).map((p) => ({ ...p, _type: 'project' })),
            ...(archivedE.status === 'fulfilled' ? archivedE.value : []).map((e) => ({ ...e, _type: 'equipment' })),
            ...((archivedTRes.status === 'fulfilled' ? archivedTRes.value.data : null) || []).map((t) => ({ ...t, _type: 'training' })),
          ];
        } catch (archiveErr) {
          console.warn('Archive loading failed:', archiveErr);
        }

        await offlineStore.saveFullCache(base);
      };

      if (isBrowserOnline()) {
        try {
          await loadFromNetwork();
        } catch (networkErr) {
          console.warn('Network load failed, using offline cache:', networkErr);
          const cached = await offlineStore.getFullCache();
          if (cached.projects?.length || cached.equipment?.length) {
            base = cached;
            warning('Showing cached data — will sync when connection returns');
          } else {
            throw networkErr;
          }
        }
      } else {
        const cached = await offlineStore.getFullCache();
        base = cached;
        if (!cached.projects?.length && !cached.equipment?.length) {
          warning('No cached data available yet. Connect once while online to enable offline viewing.');
        }
      }

      await applyDataToState(base);
      console.log('Data loading completed');
    } catch (err) {
      console.error('Critical error loading data:', err);
      const cached = await offlineStore.getFullCache();
      if (cached.projects?.length || cached.equipment?.length) {
        await applyDataToState(cached);
      } else {
        setProjects([]);
        setEquipment([]);
        setStarbooksUnits([]);
        setArchivedProjects([]);
      }

      if (!err.message?.includes('timeout')) {
        error('Failed to load data: ' + err.message);
      }
    } finally {
      setLoadingData(false);
    }
  }, [applyDataToState, error, warning]);

  useEffect(() => {
    loadRef.current = loadSupabaseData;
  }, [loadRef, loadSupabaseData]);

  useEffect(() => {
    if (!user) return;
  }, [user]);

  const handleSwitchSystem = () => {
    const newSystem = activeSystem === "cest" ? "starbooks" : "cest";
    setActiveSystem(newSystem);
    
    if (newSystem === "starbooks") {
      setActivePage("starbooks");
      navigate("/starbooks");
      auditService.logUpdate(ENTITY_TYPES.SYSTEM, 'System Switch', 'Switched to STARBOOKS system');
      success("Switched to STARBOOKS system");
    } else {
      setActivePage("dashboard");
      navigate("/dashboard");
      auditService.logUpdate(ENTITY_TYPES.SYSTEM, 'System Switch', 'Switched to CEST system');
      success("Switched to CEST system");
    }
  };

  useEffect(() => {
    if (activeSystem === "starbooks" && activePage !== "starbooks" && !activePage.startsWith("starbooks-")) {
      setActivePage("starbooks");
    }
  }, [activeSystem, activePage]);

  useEffect(() => {
    if (!canAccessApp) return;

    let inactivityTimer;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(async () => {
        await signOut();
        navigate("/");
        warning(isGuestMode ? 'Guest session ended due to inactivity' : 'You have been logged out due to inactivity');
      }, INACTIVITY_TIMEOUT);
    };

    ACTIVITY_EVENTS.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      ACTIVITY_EVENTS.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [canAccessApp, isGuestMode, navigate, signOut, warning]);

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (darkMode) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleClick = () => {
      if (showAuditLog) {
        setShowAuditLog(false);
      }
    };
    
    if (showAuditLog) {
      setTimeout(() => {
        document.addEventListener('click', handleClick);
      }, 0);
      
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showAuditLog]);

  const handleArchiveProject = async (project) => {
    if (isReadOnly) { warning('View-only mode: cannot archive records'); return; }
    try {
      if (archivedProjects.some(p => String(p.id) === String(project.id))) return;
      
      const linkedEquipment = equipment.filter(eq => 
        String(eq.project_id) === String(project.id) || 
        eq.project_title === project.project_title
      );
      
      const applyArchive = () => {
        setProjects(prev => prev.filter(p => p.id !== project.id));
        setEquipment(prev => prev.filter(eq => 
          String(eq.project_id) !== String(project.id) && 
          eq.project_title !== project.project_title
        ));
        setArchivedProjects(prev => [
          { ...project, _type: 'project', archived_at: new Date().toISOString(), _syncStatus: 'pending' },
          ...linkedEquipment.map(eq => ({ ...eq, _type: 'equipment', archived_at: new Date().toISOString(), _syncStatus: 'pending' })),
          ...prev
        ]);
      };

      if (!isOnline || String(project.id).startsWith('pending-')) {
        await queueChange({ entity: 'project', action: 'archive', entityId: project.id, payload: {} });
        for (const eq of linkedEquipment) {
          await queueChange({ entity: 'equipment', action: 'archive', entityId: eq.id, payload: {} });
        }
        applyArchive();
        success(`Project archived offline — will sync when online`);
        return;
      }

      applyArchive();
      await db.deleteProject(project.id);
      
      auditService.logDelete(
        ENTITY_TYPES.PROJECT, 
        project.project_title || project.project,
        linkedEquipment.length > 0 ? `Also archived ${linkedEquipment.length} equipment item(s)` : undefined
      );
      
      success(`Project and ${linkedEquipment.length} equipment item(s) moved to archive`);
    } catch (err) {
      if (isNetworkError(err)) {
        await queueChange({ entity: 'project', action: 'archive', entityId: project.id, payload: {} });
        warning('Archived offline — will sync when online');
        return;
      }
      await loadSupabaseData();
      error('Failed to archive project: ' + err.message);
    }
  };

  const handleArchiveEquipment = async (item) => {
    if (isReadOnly) { warning('View-only mode: cannot archive records'); return; }
    try {
      if (archivedProjects.some(p => String(p.id) === String(item.id))) return;

      if (!isOnline || String(item.id).startsWith('pending-')) {
        await queueChange({ entity: 'equipment', action: 'archive', entityId: item.id, payload: {} });
        setEquipment(prev => prev.filter(e => e.id !== item.id));
        setArchivedProjects(prev => [...prev, { ...item, _type: 'equipment', archived_at: new Date().toISOString(), _syncStatus: 'pending' }]);
        success('Equipment archived offline — will sync when online');
        return;
      }

      setEquipment(prev => prev.filter(e => e.id !== item.id));
      await db.deleteEquipment(item.id);
      setArchivedProjects(prev => [...prev, { ...item, _type: 'equipment', archived_at: new Date().toISOString() }]);
      auditService.logDelete(ENTITY_TYPES.EQUIPMENT, item.equipment_name || item.equipmentName);
      success(`Equipment moved to archive`);
    } catch (err) {
      if (isNetworkError(err)) {
        await queueChange({ entity: 'equipment', action: 'archive', entityId: item.id, payload: {} });
        warning('Archived offline — will sync when online');
        return;
      }
      error('Failed to archive equipment: ' + err.message);
    }
  };

  const handleRestore = async (itemId) => {
    if (isReadOnly) { warning('View-only mode: cannot restore records'); return; }
    const item = archivedProjects.find(p => String(p.id) === String(itemId));
    if (!item) return;
    try {
      if (item._type === 'equipment') {
        await db.restoreEquipment(item.id);
        setEquipment(prev => [...prev, { ...item, is_archived: false }]);
        auditService.logRestore(ENTITY_TYPES.EQUIPMENT, item.equipment_name || item.equipmentName);
        setArchivedProjects(prev => prev.filter(p => String(p.id) !== String(itemId)));
      } else if (item._type === 'training') {
        await supabase.from('trainings').update({ is_archived: false, archived_at: null }).eq('id', item.id);
        auditService.logRestore(ENTITY_TYPES.PROJECT, item.title);
        setArchivedProjects(prev => prev.filter(p => String(p.id) !== String(itemId)));
      } else {
        await db.restoreProject(item.id);
        
        const linkedEquipment = archivedProjects.filter(p => 
          p._type === 'equipment' && 
          (String(p.project_id) === String(item.id) || p.project_title === item.project_title)
        );
        
        setProjects(prev => [...prev, { ...item, is_archived: false }]);
        
        for (const eq of linkedEquipment) {
          await db.restoreEquipment(eq.id);
          setEquipment(prev => [...prev, { ...eq, is_archived: false }]);
        }
        
        setArchivedProjects(prev => prev.filter(p => 
          String(p.id) !== String(itemId) && 
          !(p._type === 'equipment' && (String(p.project_id) === String(item.id) || p.project_title === item.project_title))
        ));
        
        auditService.logRestore(
          ENTITY_TYPES.PROJECT, 
          item.project_title || item.project,
          linkedEquipment.length > 0 ? `Also restored ${linkedEquipment.length} equipment item(s)` : undefined
        );
      }
      success(`Restored successfully!`);
    } catch (err) {
      error('Failed to restore: ' + err.message);
    }
  };

  const handlePermanentDelete = async (itemId) => {
    if (isReadOnly) { warning('View-only mode: cannot delete records'); return; }
    const item = archivedProjects.find(p => String(p.id) === String(itemId));
    if (!item) return;
    
    setArchivedProjects(prev => prev.filter(p => String(p.id) !== String(itemId)));
    
    try {
      if (item._type === 'equipment') {
        await db.permanentDeleteEquipment(item.id);
      } else if (item._type === 'training') {
        const { error: tErr } = await supabase.from('trainings').delete().eq('id', item.id);
        if (tErr) throw tErr;
      } else {
        const linkedEquipment = archivedProjects.filter(p => 
          p._type === 'equipment' && 
          (String(p.project_id) === String(item.id) || p.project_title === item.project_title)
        );
        
        setArchivedProjects(prev => prev.filter(p => 
          !(p._type === 'equipment' && (String(p.project_id) === String(item.id) || p.project_title === item.project_title))
        ));
        
        await db.permanentDeleteProject(item.id);
        
        success(`Permanently deleted project and ${linkedEquipment.length} equipment item(s)`);
        return;
      }
      success('Permanently deleted');
    } catch (err) {
      setArchivedProjects(prev => [...prev, item]);
      error('Failed to permanently delete: ' + err.message);
    }
  };

  const handleAddProject = async (projectData) => {
    if (isReadOnly) { warning('View-only mode: cannot add records'); return; }
    try {
      if (!isOnline) {
        const item = await queueChange({ entity: 'project', action: 'create', payload: projectData });
        const pending = { id: item.tempId, ...projectData, _syncStatus: 'pending', created_at: item.createdAt };
        setProjects((prev) => [pending, ...prev]);
        success('Project saved offline — will sync when online');
        return pending;
      }

      const newProject = await db.createProject(projectData);
      
      if (projectData.components?.length) {
        for (const componentCode of projectData.components) {
          await db.addProjectComponent(newProject.id, componentCode);
        }
      }
      
      if (projectData.communities?.length) {
        for (const communityCode of projectData.communities) {
          await db.addProjectCommunityType(newProject.id, communityCode);
        }
      }
      
      await loadSupabaseData();
      
      auditService.logCreate(
        ENTITY_TYPES.PROJECT, 
        projectData.project_title,
        `Municipality: ${projectData.municipality_id}, Budget: ₱${projectData.amount_funded?.toLocaleString()}`
      );
      success('Project added successfully!');
      
      return newProject;
    } catch (err) {
      if (isNetworkError(err)) {
        const item = await queueChange({ entity: 'project', action: 'create', payload: projectData });
        const pending = { id: item.tempId, ...projectData, _syncStatus: 'pending', created_at: item.createdAt };
        setProjects((prev) => [pending, ...prev]);
        warning('Connection lost — project saved offline for later sync');
        return pending;
      }
      error('Failed to add project: ' + (err.message || 'Unknown error'));
      throw err;
    }
  };

  const handleAddEquipment = async (equipmentData) => {
    if (isReadOnly) { warning('View-only mode: cannot add records'); return; }
    try {
      if (!isOnline) {
        const item = await queueChange({ entity: 'equipment', action: 'create', payload: equipmentData });
        const pending = { id: item.tempId, ...equipmentData, _syncStatus: 'pending', created_at: item.createdAt };
        setEquipment((prev) => [pending, ...prev]);
        success('Equipment saved offline — will sync when online');
        return pending;
      }

      await db.createEquipment(equipmentData);
      await loadSupabaseData();
      
      auditService.logCreate(
        ENTITY_TYPES.EQUIPMENT,
        equipmentData.equipment_name,
        `Quantity: ${equipmentData.units}, Location: ${equipmentData.municipality}`
      );
      success('Equipment added successfully!');
    } catch (err) {
      if (isNetworkError(err)) {
        const item = await queueChange({ entity: 'equipment', action: 'create', payload: equipmentData });
        const pending = { id: item.tempId, ...equipmentData, _syncStatus: 'pending', created_at: item.createdAt };
        setEquipment((prev) => [pending, ...prev]);
        warning('Connection lost — equipment saved offline for later sync');
        return pending;
      }
      error('Failed to add equipment: ' + (err.message || 'Unknown error'));
    }
  };

  const handleUpdateProject = async (id, projectData) => {
    if (isReadOnly) { warning('View-only mode: cannot edit records'); return; }
    try {
      const { components, communities, ...rest } = projectData;

      if (!isOnline || String(id).startsWith('pending-')) {
        await queueChange({ entity: 'project', action: 'update', entityId: id, payload: rest });
        setProjects((prev) => prev.map((p) => (String(p.id) === String(id) ? { ...p, ...rest, _syncStatus: 'pending' } : p)));
        success('Project updated offline — will sync when online');
        return;
      }

      await db.updateProject(id, rest);
      await loadSupabaseData();
      
      auditService.logUpdate(
        ENTITY_TYPES.PROJECT,
        projectData.project_title || projectData.project,
        `Updated project details`
      );
      success('Project updated successfully!');
    } catch (err) {
      if (isNetworkError(err)) {
        const { components, communities, ...rest } = projectData;
        await queueChange({ entity: 'project', action: 'update', entityId: id, payload: rest });
        warning('Updated offline — will sync when online');
        return;
      }
      error('Failed to update project: ' + err.message);
    }
  };

  const handleUpdateEquipment = async (id, equipmentData) => {
    if (isReadOnly) { warning('View-only mode: cannot edit records'); return; }
    try {
      const updatePayload = {
        year: equipmentData.year,
        municipality_id: equipmentData.municipality_id,
        community: equipmentData.community,
        equipment_name: equipmentData.equipment_name || equipmentData.equipmentName,
        units: parseInt(equipmentData.units) || 0,
        units_per_year: equipmentData.units_per_year ? parseInt(equipmentData.units_per_year) : null,
        component_id: equipmentData.component_id || equipmentData.component,
        project_title: equipmentData.project_title || null
      };

      if (!isOnline || String(id).startsWith('pending-')) {
        await queueChange({ entity: 'equipment', action: 'update', entityId: id, payload: updatePayload });
        setEquipment((prev) => prev.map((e) => (String(e.id) === String(id) ? { ...e, ...updatePayload, _syncStatus: 'pending' } : e)));
        success('Equipment updated offline — will sync when online');
        return;
      }

      await db.updateEquipment(id, updatePayload);
      await loadSupabaseData();
      
      auditService.logUpdate(
        ENTITY_TYPES.EQUIPMENT,
        equipmentData.equipment_name || equipmentData.equipmentName,
        `Updated equipment details`
      );
      success('Equipment updated successfully!');
    } catch (err) {
      if (isNetworkError(err)) {
        const updatePayload = {
          year: equipmentData.year,
          municipality_id: equipmentData.municipality_id,
          community: equipmentData.community,
          equipment_name: equipmentData.equipment_name || equipmentData.equipmentName,
          units: parseInt(equipmentData.units) || 0,
          units_per_year: equipmentData.units_per_year ? parseInt(equipmentData.units_per_year) : null,
          component_id: equipmentData.component_id || equipmentData.component,
          project_title: equipmentData.project_title || null,
        };
        await queueChange({ entity: 'equipment', action: 'update', entityId: id, payload: updatePayload });
        warning('Updated offline — will sync when online');
        return;
      }
      error('Failed to update equipment: ' + err.message);
    }
  };

  if (authLoading || isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} darkMode={darkMode} />;
  }

  if (!canAccessApp) {
    return <LoginPage darkMode={darkMode} setDarkMode={setDarkMode} />;
  }

  if (loadingData) {
    return <LoadingScreen onComplete={() => {}} darkMode={darkMode} />;
  }

  return (
    <ErrorBoundary darkMode={darkMode}>
      <div className="flex h-screen overflow-hidden" style={{
        background: darkMode 
          ? 'linear-gradient(to bottom right, #020617, #0f172a, #020617)' 
          : 'linear-gradient(to bottom right, #f8fafc, #dbeafe, #e0e7ff)'
      }}>
        {/* Toast Notifications */}
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}

        {/* Conditional Sidebar based on active system */}
        {activeSystem === "starbooks" ? (
          <StarbooksSidebar
            activePage={activePage}
            setActivePage={setActivePage}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            darkMode={darkMode}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            onSwitchSystem={handleSwitchSystem}
            onLogout={async () => {
              await signOut();
              navigate("/");
            }}
          />
        ) : (
          <Sidebar
            activePage={activePage}
            setActivePage={setActivePage}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            darkMode={darkMode}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            isAdmin={isAdmin}
            isGuestMode={isGuestMode}
            canViewData={canViewData}
            onSwitchSystem={handleSwitchSystem}
            onLogout={async () => {
              await signOut();
              navigate("/");
            }}
          />
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar
            activePage={activePage}
            auditLogCount={unreadCount}
            setShowAuditLog={setShowAuditLog}
            setSidebarOpen={setSidebarOpen}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            projects={projects}
            onNavigateToProject={(project) => {
              setActivePage("dashboard");
            }}
            starbooksUnits={starbooksUnits}
            onNavigateToStarbooksUnit={(unit) => {
              setActivePage("starbooks");
            }}
          />

          <main className="flex-1 overflow-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 scrollbar-thin">
            <OfflineIndicator
              isOnline={isOnline}
              pendingCount={pendingCount}
              isSyncing={isSyncing}
              darkMode={darkMode}
              onSyncNow={syncNow}
            />
            {isGuestMode && isReadOnly && activePage !== "dashboard" && (
              <div className="mx-auto mb-6 max-w-[1400px]">
                <ViewModeBanner
                  darkMode={darkMode}
                  onSignIn={exitGuestMode}
                />
              </div>
            )}
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/dashboard"
                element={
                  activeSystem === "starbooks" ? (
                    <Navigate to="/starbooks" replace />
                  ) : activePage === "dashboard" ? (
                    <Dashboard {...dashboardProps} />
                  ) : activePage === "analytics" ? (
                    guardData(<ProvincesPage projects={projects} darkMode={darkMode} />)
                  ) : activePage === "monitoring" ? (
                    guardData(<MonitoringPage projects={projects} darkMode={darkMode} />)
                  ) : activePage === "archive" ? (
                    guardData(
                      <ArchivePage
                        archivedProjects={archivedProjects}
                        onRestore={handleRestore}
                        onPermanentDelete={handlePermanentDelete}
                        darkMode={darkMode}
                        readOnly={isReadOnly}
                      />
                    )
                  ) : activePage === "dataentry" ? (
                    guardData(
                      <DataEntryPage
                        projects={projects}
                        equipment={equipment}
                        onAddProject={handleAddProject}
                        onAddEquipment={handleAddEquipment}
                        onDeleteProject={handleArchiveProject}
                        onDeleteEquipment={handleArchiveEquipment}
                        onUpdateProject={handleUpdateProject}
                        onUpdateEquipment={handleUpdateEquipment}
                        darkMode={darkMode}
                        isLoading={loadingData}
                        readOnly={isReadOnly}
                      />
                    )
                  ) : activePage === "trainings" ? (
                    guardData(
                      <TrainingsPage
                        darkMode={darkMode}
                        readOnly={isReadOnly}
                        onArchiveTraining={(item) => setArchivedProjects((prev) => [...prev, item])}
                      />
                    )
                  ) : activePage === "admin" ? (
                    guardAdmin(
                      <AdminRequestsPage
                        darkMode={darkMode}
                        adminName={getUserDisplayName(user)}
                      />
                    )
                  ) : activePage === "starbooks" ? (
                    <StarbooksPage darkMode={darkMode} activePage={activePage} readOnly={isReadOnly} />
                  ) : activePage?.startsWith("starbooks") ? (
                    <StarbooksPage darkMode={darkMode} activePage={activePage} readOnly={isReadOnly} />
                  ) : (
                    <PlaceholderPage activePage={activePage} darkMode={darkMode} />
                  )
                }
              />
              <Route
                path="/analytics"
                element={guardData(<ProvincesPage projects={projects} darkMode={darkMode} />)}
              />
              <Route
                path="/analytics/provinces/:provinceId"
                element={guardData(<CitiesPage projects={projects} darkMode={darkMode} />)}
              />
              <Route
                path="/analytics/provinces/:provinceId/cities/:cityName"
                element={guardData(<BarangaysPage projects={projects} darkMode={darkMode} />)}
              />
              <Route
                path="/monitoring"
                element={guardData(<MonitoringPage projects={projects} darkMode={darkMode} />)}
              />
              <Route
                path="/archive"
                element={guardData(
                  <ArchivePage
                    archivedProjects={archivedProjects}
                    onRestore={handleRestore}
                    onPermanentDelete={handlePermanentDelete}
                    darkMode={darkMode}
                    readOnly={isReadOnly}
                  />
                )}
              />
              <Route
                path="/dataentry"
                element={guardData(
                  <DataEntryPage
                    projects={projects}
                    equipment={equipment}
                    onAddProject={handleAddProject}
                    onAddEquipment={handleAddEquipment}
                    onDeleteProject={handleArchiveProject}
                    onDeleteEquipment={handleArchiveEquipment}
                    onUpdateProject={handleUpdateProject}
                    onUpdateEquipment={handleUpdateEquipment}
                    darkMode={darkMode}
                    isLoading={loadingData}
                    readOnly={isReadOnly}
                  />
                )}
              />
              <Route
                path="/admin"
                element={guardAdmin(
                  <AdminRequestsPage darkMode={darkMode} adminName={getUserDisplayName(user)} />
                )}
              />
              <Route path="/admin/requests" element={<Navigate to="/admin" replace />} />
              <Route path="/admin/approved" element={<Navigate to="/admin" replace />} />
              <Route path="/admin/declined" element={<Navigate to="/admin" replace />} />
              <Route path="/admin/logs" element={<Navigate to="/admin" replace />} />
              <Route
                path="/starbooks"
                element={guardData(<StarbooksPage darkMode={darkMode} activePage={activePage} readOnly={isReadOnly} />)}
              />
              <Route
                path="/trainings"
                element={guardData(
                  <TrainingsPage
                    darkMode={darkMode}
                    readOnly={isReadOnly}
                    onArchiveTraining={(item) => setArchivedProjects((prev) => [...prev, item])}
                  />
                )}
              />
            </Routes>
          </main>

          {/* Audit Log Panel */}
          {showAuditLog && (
            <AuditLog 
              logs={logs}
              onClose={() => setShowAuditLog(false)}
              darkMode={darkMode}
              onLogsUpdate={refreshLogs}
            />
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

// Placeholder component for non-dashboard pages
function PlaceholderPage({ activePage, darkMode }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div 
        className="text-center p-12 rounded-3xl backdrop-blur-xl shadow-2xl max-w-md animate-fade-in"
        style={{
          backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: darkMode ? '#1e293b' : '#e2e8f0'
        }}
      >
        <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-glow">
          <span className="text-5xl">
            {activePage === "dataentry" && "✏️"}
            {activePage === "projects" && "📁"}
            {activePage === "starbooks" && "📚"}
            {activePage === "trainings" && "🎓"}
          </span>
        </div>
        <h2 className="text-3xl font-bold mb-3 gradient-text">
          {activePage === "dataentry" && "Data Entry"}
          {activePage === "projects" && "Projects"}
          {activePage === "starbooks" && "Starbooks"}
          {activePage === "trainings" && "Trainings"}
        </h2>
        <p className="font-medium mb-4" style={{ color: darkMode ? '#94a3b8' : '#475569' }}>
          This feature is coming soon
        </p>
        <div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
          style={{
            backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.3)' : '#dbeafe',
            color: darkMode ? '#60a5fa' : '#2563eb'
          }}
        >
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          In Development
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const loadRef = useRef(null);
  return (
    <HashRouter>
      <AuthProvider>
        <OfflineProvider onSyncComplete={() => loadRef.current?.()}>
          <AppMain loadRef={loadRef} />
        </OfflineProvider>
      </AuthProvider>
    </HashRouter>
  );
}
