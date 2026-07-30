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

const getStorageErrorMessage = (error: unknown, fallback = 'Storage upload failed.') => {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String((error as { message?: string }).message ?? '');
    if (message.includes('row-level security policy')) {
      return 'Storage upload is blocked by Row Level Security. Configure the generated-frames bucket to allow the current auth role to insert objects.';
    }

    if (message.includes('Anonymous sign-ins are disabled')) {
      return 'Anonymous authentication is disabled in Supabase. Use the configured auth method or enable anonymous sign-ins for this project.';
    }

    if (message.includes('No API key') || message.includes('apikey')) {
      return 'Supabase rejected the request because the project credentials are missing or invalid.';
    }

    if (message) {
      return message;
    }
  }

  return fallback;
};

const ensureStorageClient = () => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  return supabase;
};

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
  const client = ensureStorageClient();

  const storagePath = fileName.replace(/^\/+/, '');
  const { data, error: uploadError } = await client.storage
    .from(GENERATED_FRAMES_BUCKET)
    .upload(storagePath, blob, {
      contentType: blob.type || 'image/png',
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError || !data?.path) {
    const errorMessage = getStorageErrorMessage(uploadError, 'Supabase storage upload returned no object path.');
    console.error(errorMessage, uploadError);
    throw new Error(errorMessage);
  }

  const { data: publicData } = client.storage.from(GENERATED_FRAMES_BUCKET).getPublicUrl(data.path);

  return {
    publicUrl: publicData.publicUrl,
    storagePath: data.path,
  };
};