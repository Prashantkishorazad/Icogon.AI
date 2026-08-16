import { supabase } from "../lib/supabase";

export const uploadAvatar = async (
  file: File,
  userId: string
) => {
  const filePath = `${userId}/avatar.png`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  if (!data?.publicUrl) {
    throw new Error("Unable to generate public avatar URL");
  }

  return data.publicUrl;
};