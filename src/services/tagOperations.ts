
import { supabase } from "@/integrations/supabase/client";
import { Tag, TagFormData } from "@/types/tag";

export const tagOperations = {
  // Get all tags for the current user
  async getTags(): Promise<Tag[]> {
    const { data: tags, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }

    return tags.map(tag => ({
      ...tag,
      createdAt: new Date(tag.created_at),
      updatedAt: new Date(tag.updated_at),
    }));
  },

  // Create a new tag
  async createTag(data: TagFormData): Promise<Tag> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: tag, error } = await supabase
      .from('tags')
      .insert({
        name: data.name,
        color: data.color,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating tag:', error);
      throw error;
    }

    return {
      ...tag,
      createdAt: new Date(tag.created_at),
      updatedAt: new Date(tag.updated_at),
    };
  },

  // Update an existing tag
  async updateTag(tagId: string, data: TagFormData): Promise<void> {
    const { error } = await supabase
      .from('tags')
      .update({
        name: data.name,
        color: data.color,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tagId);

    if (error) {
      console.error('Error updating tag:', error);
      throw error;
    }
  },

  // Delete a tag
  async deleteTag(tagId: string): Promise<void> {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', tagId);

    if (error) {
      console.error('Error deleting tag:', error);
      throw error;
    }
  },

  // Add tags to a task
  async addTagsToTask(taskId: string, tagIds: string[]): Promise<void> {
    const taskTags = tagIds.map(tagId => ({
      task_id: taskId,
      tag_id: tagId,
    }));

    const { error } = await supabase
      .from('task_tags')
      .insert(taskTags);

    if (error) {
      console.error('Error adding tags to task:', error);
      throw error;
    }
  },

  // Remove tags from a task
  async removeTagsFromTask(taskId: string, tagIds?: string[]): Promise<void> {
    let query = supabase
      .from('task_tags')
      .delete()
      .eq('task_id', taskId);

    if (tagIds && tagIds.length > 0) {
      query = query.in('tag_id', tagIds);
    }

    const { error } = await query;

    if (error) {
      console.error('Error removing tags from task:', error);
      throw error;
    }
  },

  // Update task tags (remove all and add new ones)
  async updateTaskTags(taskId: string, tagIds: string[]): Promise<void> {
    // Remove all existing tags
    await this.removeTagsFromTask(taskId);
    
    // Add new tags if any
    if (tagIds.length > 0) {
      await this.addTagsToTask(taskId, tagIds);
    }
  },
};
