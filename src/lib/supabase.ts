import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { ArchivedFrame } from '../types';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment to enable uploads and remote archive sync.'
  );
}

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const GENERATED_FRAMES_BUCKET = 'generated-frames';

export const loadArchivesFromSupabase = async (): Promise<ArchivedFrame[]> => {
  if (!supabase) {
    return [];
  }

  return [];
};

export const syncArchivesToSupabase = async (_frames: ArchivedFrame[]): Promise<void> => {
  if (!supabase) {
    return;
  }

  return;
};

export const deleteArchivesFromSupabase = async (_ids: string[]): Promise<void> => {
  if (!supabase || _ids.length === 0) {
    return;
  }

  return;
};

export interface UploadedFrameAsset {
  publicUrl: string;
  storagePath: string;
}

export const uploadGeneratedFrameToSupabase = async (blob: Blob, fileName: string): Promise<UploadedFrameAsset> => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const storagePath = fileName.replace(/^\/+/, '');
  const { error: uploadError } = await supabase.storage
    .from(GENERATED_FRAMES_BUCKET)
    .upload(storagePath, blob, {
      contentType: blob.type || 'image/png',
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    console.error('Supabase storage upload failed:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage.from(GENERATED_FRAMES_BUCKET).getPublicUrl(storagePath);

  return {
    publicUrl: data.publicUrl,
    storagePath,
  };
};