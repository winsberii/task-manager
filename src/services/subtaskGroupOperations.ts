
import { supabase } from "@/integrations/supabase/client";
import { SubtaskGroupServiceInterface } from "./types";

export const subtaskGroupOperations: SubtaskGroupServiceInterface = {
  // Add subtask group with proper order index
  async addSubtaskGroup(taskId: string, groupName: string): Promise<void> {
    // Get the next order index
    const { data: lastGroup } = await supabase
      .from('subtask_groups')
      .select('order_index')
      .eq('task_id', taskId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    const nextOrderIndex = (lastGroup?.order_index ?? -1) + 1;

    const { error } = await supabase
      .from('subtask_groups')
      .insert({
        task_id: taskId,
        name: groupName,
        order_index: nextOrderIndex,
      });

    if (error) {
      console.error('Error adding subtask group:', error);
      throw error;
    }
  },

  // Update subtask group
  async updateSubtaskGroup(groupId: string, groupName: string): Promise<void> {
    const { error } = await supabase
      .from('subtask_groups')
      .update({
        name: groupName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', groupId);

    if (error) {
      console.error('Error updating subtask group:', error);
      throw error;
    }
  },

  // Delete subtask group
  async deleteSubtaskGroup(groupId: string): Promise<void> {
    const { error } = await supabase
      .from('subtask_groups')
      .delete()
      .eq('id', groupId);

    if (error) {
      console.error('Error deleting subtask group:', error);
      throw error;
    }
  },

  async reorderSubtaskGroups(taskId: string, groupIds: string[]): Promise<void> {
    const promises = groupIds.map((id, index) =>
      supabase
        .from('subtask_groups')
        .update({
          order_index: index,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
    );

    const results = await Promise.all(promises);
    
    for (const result of results) {
      if (result.error) {
        console.error('Error reordering subtask groups:', result.error);
        throw result.error;
      }
    }
  },
};
