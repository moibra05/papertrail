import { createClient } from "../../utils/supabase/client";

const supabase = createClient();

export function useFolders() {
  async function createFolder(data) {
    const { name, description, color, user, parent_id } = data;
    const folderData = { name, description, color, user, parent_id };

    const { error } = await supabase.from("folders").insert([folderData]);

    if (error) {
      console.error("Error creating folder:", error.message);
      return { error };
    }

    return { error: null };
  }

  async function updateFolder(id, data) {
    const { name, description, color, parent_id } = data;
    const updateData = { name, description, color, parent_id };

    const { error } = await supabase
      .from("folders")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Error updating folder:", error.message);
      return { error };
    }

    return { error: null };
  }

  async function deleteFolder(id) {
    const { error } = await supabase.from("folders").delete().eq("id", id);

    if (error) {
      console.error("Error deleting folder:", error.message);
      return { error };
    }

    return { error: null };
  }

  return {
    createFolder,
    updateFolder,
    deleteFolder,
  };
}
