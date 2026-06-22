import { supabase } from './supabaseClient';

// STARBOOKS Service for managing units, images, and related data
export const starbooksService = {
  
  // ==================== UNITS ====================
  
  async getUnits() {
    try {
      const { data, error } = await supabase
        .from('starbooks_units')
        .select(`
          *,
          municipality:municipalities(id, name),
          province:provinces(id, name),
          images:starbooks_images(
            id, file_name, file_path, alt_text, is_primary, display_order
          ),
          components:starbooks_unit_components(
            component:starbooks_components(id, name, description)
          ),
          specifications:starbooks_specifications(*),
          usage_stats:starbooks_usage_stats(*),
          maintenance_history:starbooks_maintenance_history(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to include image URLs
      const unitsWithImageUrls = data?.map(unit => ({
        ...unit,
        images: unit.images?.map(img => ({
          ...img,
          url: this.getImageUrl(img.file_path)
        })) || [],
        primaryImage: unit.images?.find(img => img.is_primary)?.file_path 
          ? this.getImageUrl(unit.images.find(img => img.is_primary).file_path)
          : null
      })) || [];

      return unitsWithImageUrls;
    } catch (error) {
      console.error('Error fetching STARBOOKS units:', error);
      throw error;
    }
  },

  async createUnit(unitData) {
    try {
      const { data, error } = await supabase
        .from('starbooks_units')
        .insert([unitData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating STARBOOKS unit:', error);
      throw error;
    }
  },

  async updateUnit(id, updates) {
    try {
      const { data, error } = await supabase
        .from('starbooks_units')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating STARBOOKS unit:', error);
      throw error;
    }
  },

  async deleteUnit(id) {
    try {
      // Delete associated images from storage first
      await this.deleteUnitImages(id);
      
      const { error } = await supabase
        .from('starbooks_units')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting STARBOOKS unit:', error);
      throw error;
    }
  },

  // ==================== IMAGES ====================
  
  async uploadImage(file, unitId, altText = '', isPrimary = false) {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${unitId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('starbooks-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Save image record to database
      const { data: imageData, error: dbError } = await supabase
        .from('starbooks_images')
        .insert([{
          unit_id: unitId,
          file_name: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          mime_type: file.type,
          alt_text: altText,
          is_primary: isPrimary
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      return {
        ...imageData,
        url: this.getImageUrl(imageData.file_path)
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  async deleteImage(imageId) {
    try {
      // Get image data first
      const { data: imageData, error: fetchError } = await supabase
        .from('starbooks_images')
        .select('file_path')
        .eq('id', imageId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('starbooks-images')
        .remove([imageData.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('starbooks_images')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  },

  async deleteUnitImages(unitId) {
    try {
      // Get all images for the unit
      const { data: images, error: fetchError } = await supabase
        .from('starbooks_images')
        .select('id, file_path')
        .eq('unit_id', unitId);

      if (fetchError) throw fetchError;

      if (images && images.length > 0) {
        // Delete from storage
        const filePaths = images.map(img => img.file_path);
        const { error: storageError } = await supabase.storage
          .from('starbooks-images')
          .remove(filePaths);

        if (storageError) console.warn('Some files may not have been deleted from storage:', storageError);

        // Delete from database
        const { error: dbError } = await supabase
          .from('starbooks_images')
          .delete()
          .eq('unit_id', unitId);

        if (dbError) throw dbError;
      }
    } catch (error) {
      console.error('Error deleting unit images:', error);
      throw error;
    }
  },

  async setPrimaryImage(imageId, unitId) {
    try {
      // First, unset all primary images for this unit
      await supabase
        .from('starbooks_images')
        .update({ is_primary: false })
        .eq('unit_id', unitId);

      // Then set the selected image as primary
      const { data, error } = await supabase
        .from('starbooks_images')
        .update({ is_primary: true })
        .eq('id', imageId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error setting primary image:', error);
      throw error;
    }
  },

  getImageUrl(filePath) {
    if (!filePath) return null;
    
    const { data } = supabase.storage
      .from('starbooks-images')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  },

  // ==================== COMPONENTS ====================
  
  async getComponents() {
    try {
      const { data, error } = await supabase
        .from('starbooks_components')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching components:', error);
      throw error;
    }
  },

  async addUnitComponent(unitId, componentId) {
    try {
      const { data, error } = await supabase
        .from('starbooks_unit_components')
        .insert([{ unit_id: unitId, component_id: componentId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding unit component:', error);
      throw error;
    }
  },

  async removeUnitComponent(unitId, componentId) {
    try {
      const { error } = await supabase
        .from('starbooks_unit_components')
        .delete()
        .eq('unit_id', unitId)
        .eq('component_id', componentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing unit component:', error);
      throw error;
    }
  },

  // ==================== SPECIFICATIONS ====================
  
  async updateSpecifications(unitId, specifications) {
    try {
      const { data, error } = await supabase
        .from('starbooks_specifications')
        .upsert([{ unit_id: unitId, ...specifications }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating specifications:', error);
      throw error;
    }
  },

  // ==================== USAGE STATS ====================
  
  async updateUsageStats(unitId, stats) {
    try {
      const { data, error } = await supabase
        .from('starbooks_usage_stats')
        .upsert([{ unit_id: unitId, ...stats }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating usage stats:', error);
      throw error;
    }
  },

  // ==================== MAINTENANCE HISTORY ====================
  
  async addMaintenanceRecord(unitId, maintenanceData) {
    try {
      const { data, error } = await supabase
        .from('starbooks_maintenance_history')
        .insert([{ unit_id: unitId, ...maintenanceData }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding maintenance record:', error);
      throw error;
    }
  },

  // ==================== UTILITIES ====================
  
  async getMunicipalities() {
    try {
      const { data, error } = await supabase
        .from('municipalities')
        .select(`
          id, name,
          province:provinces(id, name)
        `)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching municipalities:', error);
      throw error;
    }
  },

  async getProvinces() {
    try {
      const { data, error } = await supabase
        .from('provinces')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching provinces:', error);
      throw error;
    }
  }
};

export default starbooksService;