import { createClient } from "../../../../utils/supabase/client";
export default async function uploadFile(file) {
  const supabase = createClient();
  const {data: { user }} = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }


  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // use a safe bucket name (no spaces) — ensure this bucket exists in Supabase
  const bucket = "Receipt Pictures";
  const filename = file.name || `${Date.now()}.bin`;
  const path = `${user.id}/${Date.now()}-${filename}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error("uploadError:", uploadError);
    return new Response(
      JSON.stringify({ error: "File upload failed", detail: uploadError }),
      { status: 500 }
    );
  }

  return filename;
}
