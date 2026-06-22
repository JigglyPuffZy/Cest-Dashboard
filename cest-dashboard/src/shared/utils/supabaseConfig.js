// Supabase configuration utilities
// This file helps manage Supabase client configuration and troubleshooting

export const SUPABASE_CONFIG = {
  // Set to false to disable realtime subscriptions completely
  ENABLE_REALTIME: false,
  
  // Set to true to enable debug logging
  DEBUG_MODE: process.env.NODE_ENV === 'development',
  
  // Connection retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
};

export const logSupabaseEvent = (event, data) => {
  if (SUPABASE_CONFIG.DEBUG_MODE) {
    console.log(`[Supabase] ${event}:`, data);
  }
};

export const handleSupabaseError = (error, context) => {
  console.error(`[Supabase Error] ${context}:`, error);
  
  // Common error handling
  if (error.message?.includes('WebSocket')) {
    console.warn('WebSocket connection failed. Realtime features may not work.');
    return { type: 'websocket', recoverable: true };
  }
  
  if (error.message?.includes('JWT')) {
    console.warn('Authentication token issue. User may need to re-login.');
    return { type: 'auth', recoverable: false };
  }
  
  if (error.message?.includes('duplicate key')) {
    console.warn('Duplicate key constraint violation.');
    return { type: 'constraint', recoverable: true };
  }
  
  return { type: 'unknown', recoverable: false };
};

export const createSafeSupabaseClient = (createClient, url, key, options = {}) => {
  try {
    const config = {
      auth: { 
        autoRefreshToken: true, 
        persistSession: true, 
        detectSessionInUrl: true 
      },
      global: {
        headers: {
          'x-my-custom-header': 'cest-dashboard'
        }
      },
      ...options
    };
    
    // Only add realtime config if enabled
    if (SUPABASE_CONFIG.ENABLE_REALTIME) {
      config.realtime = {
        params: {
          eventsPerSecond: 5 // Reduced from 10 to be more conservative
        }
      };
    }
    
    logSupabaseEvent('Creating client', { url, config });
    return createClient(url, key, config);
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    throw error;
  }
};