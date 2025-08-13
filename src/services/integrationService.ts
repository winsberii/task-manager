import { supabase } from "@/integrations/supabase/client";
import type { Integration, CreateIntegrationData, UpdateIntegrationData } from "@/types/integration";

export const integrationService = {
  async getIntegrations(): Promise<Integration[]> {
    const { data, error } = await supabase
      .from('integrations')
      .select('id, user_id, name, type, url, username, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching integrations:', error);
      throw error;
    }

    return data || [];
  },

  async createIntegration(integrationData: CreateIntegrationData): Promise<Integration> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('save-integration', {
      body: {
        action: 'create',
        data: integrationData,
      },
    });

    if (error) {
      console.error('Error creating integration:', error);
      throw error;
    }

    return data as Integration;
  },

  async updateIntegration(id: string, updates: UpdateIntegrationData): Promise<Integration> {
    const { data, error } = await supabase.functions.invoke('save-integration', {
      body: {
        action: 'update',
        data: { id, ...updates },
      },
    });

    if (error) {
      console.error('Error updating integration:', error);
      throw error;
    }

    return data as Integration;
  },

  async deleteIntegration(id: string): Promise<void> {
    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting integration:', error);
      throw error;
    }
  },

  async getIntegrationByType(type: string): Promise<Integration | null> {
    const { data, error } = await supabase
      .from('integrations')
      .select('id, user_id, name, type, url, username, created_at, updated_at')
      .eq('type', type)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error fetching integration by type:', error);
      throw error;
    }

    return data || null;
  },
};