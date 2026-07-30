import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { ArchivedFrame, ArchiveUploadStatus } from '../types';

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

const ARCHIVE_TABLE_NAME = 'studio_frame_archives_v1';
const GENERATED_FRAMES_BUCKET = 'generated-frames';

const toArchiveMeta = (value: unknown) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {} as Record<string, unknown>;
  }

  return value as Record<string, unknown>;
};

export const loadArchivesFromSupabase = async (): Promise<ArchivedFrame[]> => {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase.from(ARCHIVE_TABLE_NAME).select('*').order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: Record<string, any>) => {
    const parsedPosterData = typeof row.poster_data === 'string' ? JSON.parse(row.poster_data) : (row.poster_data ?? {});
    const archiveMeta = toArchiveMeta(parsedPosterData.__archiveMeta);
    const posterData = { ...parsedPosterData };
    delete posterData.__archiveMeta;

    return {
      id: row.id,
      createdAt: row.created_at,
      userName: row.user_name,
      userSubtext: row.user_subtext,
      chapterName: row.chapter_name,
      chapterCode: row.chapter_code,
      thumbnailUrl: row.thumbnail_url ?? '',
      posterData,
      downloadCount: row.download_count ?? 1,
      imageUrl: typeof archiveMeta.imageUrl === 'string' ? archiveMeta.imageUrl : undefined,
      storagePath: typeof archiveMeta.storagePath === 'string' ? archiveMeta.storagePath : undefined,
      uploadStatus: (archiveMeta.uploadStatus as ArchiveUploadStatus | undefined) ?? (row.thumbnail_url ? 'uploaded' : 'pending'),
      lastUploadError: typeof archiveMeta.lastUploadError === 'string' ? archiveMeta.lastUploadError : null,
      syncedAt: typeof archiveMeta.syncedAt === 'string' ? archiveMeta.syncedAt : undefined,
    };
  });
};

export const syncArchivesToSupabase = async (frames: ArchivedFrame[]): Promise<void> => {
  if (!supabase) {
    return;
  }

  const rows = frames.map((frame) => {
    const posterData = { ...(frame.posterData ?? {}) } as Record<string, unknown>;
    if (typeof posterData.photoUrl === 'string' && !posterData.photoUrl.startsWith('http://') && !posterData.photoUrl.startsWith('https://')) {
      posterData.photoUrl = null;
    }

    posterData.__archiveMeta = {
      imageUrl: frame.imageUrl ?? null,
      storagePath: frame.storagePath ?? null,
      uploadStatus: frame.uploadStatus ?? 'pending',
      lastUploadError: frame.lastUploadError ?? null,
      syncedAt: frame.syncedAt ?? null,
    };

    return {
      id: frame.id,
      created_at: frame.createdAt,
      user_name: frame.userName,
      user_subtext: frame.userSubtext,
      chapter_name: frame.chapterName,
      chapter_code: frame.chapterCode,
      thumbnail_url: frame.imageUrl ?? frame.thumbnailUrl ?? '',
      poster_data: posterData,
      download_count: frame.downloadCount,
    };
  });

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