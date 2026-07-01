import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  console.error('Missing Supabase environment variables:', {
    supabaseUrl: !!supabaseUrl,
    supabaseAnonKey: !!supabaseAnonKey,
  })
}

const clientOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
  },
  global: {
    headers: {
      'x-my-custom-header': 'cest-dashboard',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, clientOptions)
  : createClient('https://placeholder.supabase.co', 'placeholder-anon-key', clientOptions)

export const db = {
  async getProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`*, municipality:municipalities(name, province_id),
          project_components(component:components(*)),
          project_community_types(community_type:community_types(*))`)
        .is('deleted_at', null)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Database error in getProjects:', error);
        throw error;
      }
      
      
      const transformedData = data?.map(project => {
        const provinceId = project.municipality?.province_id;
        let provinceName = '';
        
        
        if (provinceId) {
          const provinceMap = {
            'batanes': 'Batanes',
            'cagayan': 'Cagayan',
            'isabela': 'Isabela',
            'nueva vizcaya': 'Nueva Vizcaya',
            'quirino': 'Quirino'
          };
          provinceName = provinceMap[provinceId.toLowerCase()] || provinceId;
        }
        
        return {
          ...project,
          province: { name: provinceName }
        };
      }) || [];
      
      return transformedData;
    } catch (error) {
      console.error('Error in getProjects:', error);
      throw error;
    }
  },

  async createProject(project) {
    const { components, communities, ...projectData } = project
    
    
    const { data, error } = await supabase.from('projects').insert([projectData]).select()
    if (error) throw error
    
    const newProject = data[0]
    const projectId = newProject.id
    
    
    if (components && components.length > 0) {
      for (const componentCode of components) {
        try {
          
          const { data: component, error: compError } = await supabase
            .from('components')
            .select('id')
            .eq('id', componentCode.toLowerCase())
            .single()
          
          if (!compError && component) {
            
            await supabase.from('project_components')
              .insert([{ project_id: projectId, component_id: component.id }])
          }
        } catch (err) {
          console.warn(`Failed to add component ${componentCode}:`, err)
        }
      }
    }
    
    
    if (communities && communities.length > 0) {
      for (const communityType of communities) {
        try {
          
          const { data: community, error: commError } = await supabase
            .from('community_types')
            .select('id')
            .eq('id', communityType.toLowerCase())
            .single()
          
          if (!commError && community) {
            
            await supabase.from('project_community_types')
              .insert([{ project_id: projectId, community_type_id: community.id }])
          }
        } catch (err) {
          console.warn(`Failed to add community type ${communityType}:`, err)
        }
      }
    }
    
    return newProject
  },

  async updateProject(id, updates) {
    const { data, error } = await supabase.from('projects').update(updates).eq('id', id).select()
    if (error) throw error
    return data[0]
  },

  
  async deleteProject(id) {
    const now = new Date().toISOString()
    const { error } = await supabase.from('projects')
      .update({ is_archived: true, archived_at: now, deleted_at: now })
      .eq('id', id)
    if (error) throw error
  },

  
  async restoreProject(id) {
    const { error } = await supabase.from('projects')
      .update({ is_archived: false, archived_at: null, deleted_at: null })
      .eq('id', id)
    if (error) throw error
  },

  async getArchivedProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select(`*, municipality:municipalities(name, province_id), project_components(component:components(*))`)
      .eq('is_archived', true)
      .order('archived_at', { ascending: false })
    if (error) return []
    
    
    const transformedData = data?.map(project => {
      const provinceId = project.municipality?.province_id;
      let provinceName = '';
      
      
      if (provinceId) {
        const provinceMap = {
          'batanes': 'Batanes',
          'cagayan': 'Cagayan',
          'isabela': 'Isabela',
          'nueva vizcaya': 'Nueva Vizcaya',
          'quirino': 'Quirino'
        };
        provinceName = provinceMap[provinceId.toLowerCase()] || provinceId;
      }
      
      return {
        ...project,
        province: { name: provinceName }
      };
    }) || [];
    
    return transformedData;
  },

  async permanentDeleteProject(id) {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) throw error
  },

  
  async addProjectComponent(projectId, componentCode) {
    try {
      
      const { data: existing } = await supabase
        .from('project_components')
        .select('id')
        .eq('project_id', projectId)
        .eq('component_id', componentCode.toLowerCase())
        .single()
      
      if (existing) {
        return;
      }
      
      const { data: component, error } = await supabase.from('components')
        .select('id').eq('id', componentCode.toLowerCase()).single()
      if (error || !component) {
        return;
      }
      
      const { error: insertError } = await supabase.from('project_components')
        .insert([{ project_id: projectId, component_id: component.id }])
      
      if (insertError) {
        console.warn('Error inserting project component:', insertError);
      }
    } catch (err) {
      console.warn('Error in addProjectComponent:', err);
    }
  },

  async addProjectCommunityType(projectId, communityCode) {
    try {
      
      const { data: existing } = await supabase
        .from('project_community_types')
        .select('id')
        .eq('project_id', projectId)
        .eq('community_type_id', communityCode.toLowerCase())
        .single()
      
      if (existing) {
        return;
      }
      
      const { data: ct, error } = await supabase.from('community_types')
        .select('id').eq('id', communityCode.toLowerCase()).single()
      if (error || !ct) {
        return;
      }
      
      const { error: insertError } = await supabase.from('project_community_types')
        .insert([{ project_id: projectId, community_type_id: ct.id }])
      
      if (insertError) {
        console.warn('Error inserting project community type:', insertError);
      }
    } catch (err) {
      console.warn('Error in addProjectCommunityType:', err);
    }
  },

  async getEquipment() {
    try {
      const { data, error } = await supabase.from('equipment')
        .select(`*, 
          municipality:municipalities(name), 
          project:projects(id, project_title),
          component:components(name)`)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Database error in getEquipment:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getEquipment:', error);
      throw error;
    }
  },

  async createEquipment(equipment) {
    const equipmentData = {
      year: equipment.year || new Date().getFullYear(),
      municipality_id: equipment.municipality_id,
      community: equipment.community || '',
      equipment_name: equipment.equipment_name || 'Unknown Equipment',
      units: parseInt(equipment.units) || 0,
      units_per_year: equipment.units_per_year ? parseInt(equipment.units_per_year) : null,
      component_id: equipment.component_id || 'sel',
      project_title: equipment.project_title || null,
      
      project_id: equipment.project_id || null
    }
    
    
    if (equipmentData.project_title && !equipmentData.project_id) {
      try {
        const { data: matchingProjects, error: queryError } = await supabase
          .from('projects')
          .select('id, project_title')
          .eq('project_title', equipmentData.project_title)
          .eq('is_archived', false)
          .limit(1)
        
        if (!queryError && matchingProjects && matchingProjects.length > 0) {
          equipmentData.project_id = matchingProjects[0].id
        }
      } catch {
        
      }
    }
    
    const { data, error } = await supabase.from('equipment').insert([equipmentData]).select()
    if (error) throw error
    return data[0]
  },

  async updateEquipment(id, updates) {
    const updateData = {
      year: updates.year,
      municipality_id: updates.municipality_id,
      community: updates.community,
      equipment_name: updates.equipment_name,
      units: parseInt(updates.units) || 0,
      units_per_year: updates.units_per_year ? parseInt(updates.units_per_year) : null,
      component_id: updates.component_id,
      project_title: updates.project_title || null
    };
    
    
    if (updateData.project_title && !updates.project_id) {
      try {
        const { data: matchingProjects, error: queryError } = await supabase
          .from('projects')
          .select('id, project_title')
          .eq('project_title', updateData.project_title)
          .eq('is_archived', false)
          .limit(1)
        
        if (!queryError && matchingProjects && matchingProjects.length > 0) {
          updateData.project_id = matchingProjects[0].id
        } else {
          updateData.project_id = null
        }
      } catch {
        updateData.project_id = null
      }
    } else if (updates.project_id) {
      updateData.project_id = updates.project_id
    }
    
    const { data, error } = await supabase.from('equipment').update(updateData).eq('id', id).select()
    if (error) {
      console.error('Database update error:', error);
      throw error;
    }
    return data[0]
  },

  async deleteEquipment(id) {
    const { error } = await supabase.from('equipment')
      .update({ is_archived: true, archived_at: new Date().toISOString() }).eq('id', id)
    if (error) throw error
  },

  async restoreEquipment(id) {
    const { error } = await supabase.from('equipment')
      .update({ is_archived: false, archived_at: null }).eq('id', id)
    if (error) throw error
  },

  async getArchivedEquipment() {
    const { data, error } = await supabase.from('equipment')
      .select(`*, municipality:municipalities(name)`)
      .eq('is_archived', true).order('archived_at', { ascending: false })
    if (error) return []
    return data || []
  },

  async permanentDeleteEquipment(id) {
    const { error } = await supabase.from('equipment').delete().eq('id', id)
    if (error) throw error
  },

  async getComponents() {
    const { data, error } = await supabase.from('components').select('*').order('name')
    if (error) throw error
    return data
  },

  async getCommunityTypes() {
    const { data, error } = await supabase.from('community_types').select('*').order('name')
    if (error) throw error
    return data
  },

  async getMunicipalities() {
    const { data, error } = await supabase.from('municipalities')
      .select(`*, province:provinces(*)`).order('name')
    if (error) throw error
    return data
  },

  async getAuditLogs(limit = 50) {
    try {
      const { data, error } = await supabase.from('audit_logs')
        .select('*').order('created_at', { ascending: false }).limit(limit)
      if (error) {
        console.warn('Error fetching audit logs:', error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.warn('Audit logs table may not exist yet:', err);
      return [];
    }
  },

  async markAuditLogAsRead(logId) {
    try {
      const { data, error } = await supabase.from('audit_logs')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', logId)
        .select()
      if (error) {
        console.warn('Error marking log as read:', error);
        return null;
      }
      return data[0];
    } catch (err) {
      console.warn('Could not mark log as read:', err);
      return null;
    }
  },

  async markAllAuditLogsAsRead() {
    try {
      const { data, error } = await supabase.from('audit_logs')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('is_read', false)
        .select()
      if (error) {
        console.warn('Error marking all logs as read:', error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.warn('Could not mark all logs as read:', err);
      return [];
    }
  },

  async getUnreadAuditLogsCount() {
    try {
      const { count, error } = await supabase.from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
      if (error) {
        console.warn('Error getting unread count:', error);
        return 0;
      }
      return count || 0;
    } catch (err) {
      console.warn('Could not get unread count:', err);
      return 0;
    }
  },

  async getActiveStarbooksUnits() {
    try {
      const { data, error } = await supabase
        .from('starbooks_units')
        .select('*')
        .or('is_archived.is.null,is_archived.eq.false')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching active STARBOOKS units:', error);
      return [];
    }
  },

  async getArchivedStarbooksUnits() {
    try {
      const { data, error } = await supabase
        .from('starbooks_units')
        .select('*')
        .eq('is_archived', true)
        .order('archived_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching archived STARBOOKS units:', error);
      return [];
    }
  },

  async archiveStarbooksUnit(unitId, archivedBy = 'Admin User', reason = null) {
    try {
      const { data, error } = await supabase.rpc('archive_starbooks_unit', {
        p_unit_id: unitId,
        p_archived_by: archivedBy,
        p_reason: reason
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error archiving STARBOOKS unit:', error);
      throw error;
    }
  },

  async restoreStarbooksUnit(unitId) {
    try {
      const { data, error } = await supabase.rpc('restore_starbooks_unit', {
        p_unit_id: unitId
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error restoring STARBOOKS unit:', error);
      throw error;
    }
  },

  async permanentlyDeleteStarbooksUnit(unitId) {
    try {
      const { data, error } = await supabase.rpc('permanently_delete_starbooks_unit', {
        p_unit_id: unitId
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error permanently deleting STARBOOKS unit:', error);
      throw error;
    }
  },

  async getStarbooksArchiveStats() {
    try {
      const { data, error} = await supabase.rpc('get_starbooks_archive_stats');
      if (error) throw error;
      return data?.[0] || {
        total_units: 0,
        active_units: 0,
        archived_units: 0,
        archived_this_month: 0,
        archived_this_year: 0
      };
    } catch (error) {
      console.error('Error fetching STARBOOKS archive stats:', error);
      return {
        total_units: 0,
        active_units: 0,
        archived_units: 0,
        archived_this_month: 0,
        archived_this_year: 0
      };
    }
  },

  async getStarbooksDocumentation() {
    try {
      const { data, error } = await supabase
        .from('starbooks_documentation')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching STARBOOKS documentation:', error);
      return [];
    }
  },

  async addStarbooksImage(unitId, imageUrl, caption = null, category = 'General', isPrimary = false, uploadedBy = 'Admin User') {
    try {
      const { data, error } = await supabase.rpc('add_starbooks_image', {
        p_unit_id: unitId,
        p_image_url: imageUrl,
        p_caption: caption,
        p_category: category,
        p_is_primary: isPrimary,
        p_uploaded_by: uploadedBy
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding STARBOOKS image:', error);
      throw error;
    }
  },

  async getStarbooksImages(unitId) {
    try {
      const { data, error } = await supabase
        .from('starbooks_images')
        .select('*')
        .eq('unit_id', unitId)
        .order('is_primary', { ascending: false })
        .order('uploaded_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching STARBOOKS images:', error);
      return [];
    }
  },

  async deleteStarbooksImage(imageId) {
    try {
      const { error } = await supabase
        .from('starbooks_images')
        .delete()
        .eq('id', imageId);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting STARBOOKS image:', error);
      throw error;
    }
  },

  async updateStarbooksUnit(unitId, updates) {
    try {
      const { data, error } = await supabase
        .from('starbooks_units')
        .update(updates)
        .eq('id', unitId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating STARBOOKS unit:', error);
      throw error;
    }
  }
};

export const auth = {
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }
      return data
    } catch (error) {
      console.error('Error in signIn:', error);
      throw error;
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in signOut:', error);
      throw error;
    }
  },

  async getUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error('Get user error:', error);
        throw error;
      }
      return user
    } catch (error) {
      console.error('Error in getUser:', error);
      throw error;
    }
  },

  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Get session error:', error);
        throw error;
      }
      return session
    } catch (error) {
      console.error('Error in getSession:', error);
      throw error;
    }
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}
