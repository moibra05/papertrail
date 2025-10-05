import React from "react";
import FolderDetailsClient from "../FolderDetailsClient";
import { createClient } from "../../../../../utils/supabase/server";

export default async function FolderDetailsPage({ params }) {
  const { id } = params;
  const supabase = await createClient();

  const { data: folder } = await supabase
    .from("folders")
    .select("*")
    .eq("id", id)
    .limit(1)
    .single();
  const { data: subfolders } = await supabase
    .from("folders")
    .select("*")
    .eq("parent_id", id);
  const { data: receipts } = await supabase
    .from("receipts")
    .select("*")
    .eq("folder_id", id)
    .order("created_at", { ascending: false });

  return (
    <FolderDetailsClient
      folder={folder || null}
      subfolders={subfolders || []}
      receipts={receipts || []}
    />
  );
}
