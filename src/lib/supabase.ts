import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { ArchivedFrame } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment to enable uploads and remote archive sync.'
  );
}

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

const ARCHIVE_TABLE_NAME = 'archived_frames';
const GENERATED_FRAMES_BUCKET = 'generated-frames';
const GENERATED_FRAMES_TABLE = 'generated_frames';

export const loadArchivesFromSupabase = async (): Promise<ArchivedFrame[]> => {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase.from(ARCHIVE_TABLE_NAME).select('*').order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: Record<string, any>) => ({
    id: row.id,
    createdAt: row.created_at,
    userName: row.user_name,
    userSubtext: row.user_subtext,
    chapterName: row.chapter_name,
    chapterCode: row.chapter_code,
    thumbnailUrl: row.thumbnail_url,
    posterData: typeof row.poster_data === 'string' ? JSON.parse(row.poster_data) : row.poster_data,
    downloadCount: row.download_count ?? 1,
  }));
};

export const syncArchivesToSupabase = async (frames: ArchivedFrame[]): Promise<void> => {
  if (!supabase) {
    return;
  }

  const rows = frames.map((frame) => ({
    id: frame.id,
    created_at: frame.createdAt,
    user_name: frame.userName,
    user_subtext: frame.userSubtext,
    chapter_name: frame.chapterName,
    chapter_code: frame.chapterCode,
    thumbnail_url: frame.thumbnailUrl,
    poster_data: frame.posterData,
    download_count: frame.downloadCount,
  }));

  const { error } = await supabase.from(ARCHIVE_TABLE_NAME).upsert(rows, { onConflict: 'id' });

  if (error) {
    throw error;
  }
};

export const deleteArchivesFromSupabase = async (ids: string[]): Promise<void> => {
  if (!supabase || ids.length === 0) {
    return;
  }

  const { error } = await supabase.from(ARCHIVE_TABLE_NAME).delete().in('id', ids);

  if (error) {
    throw error;
  }
};

export const uploadGeneratedFrameToSupabase = async (blob: Blob, fileName: string): Promise<void> => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { error: uploadError } = await supabase.storage
    .from(GENERATED_FRAMES_BUCKET)
    .upload(fileName, blob, {
      contentType: blob.type || 'image/png',
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Supabase storage upload failed:', uploadError);
    throw uploadError;
  }

  const { error: insertError } = await supabase.from(GENERATED_FRAMES_TABLE).insert({
    file_name: fileName,
    created_at: new Date().toISOString(),
  });

  if (insertError) {
    console.error('Supabase generated_frames insert failed:', insertError);
    throw insertError;
  }
};