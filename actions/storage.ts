'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Generate presigned URL for file upload
 */
export async function getUploadPresignedUrl(fileName: string, bucket: string = 'user-documents') {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  const filePath = `${user.id}/${Date.now()}-${fileName}`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(filePath);

  if (error) throw error;

  return { signedUrl: data.signedUrl, path: filePath };
}

/**
 * Generate signed URL for file download
 */
export async function getDownloadSignedUrl(filePath: string, bucket: string = 'user-documents') {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  // Verify user owns this file (path should start with user.id)
  if (!filePath.startsWith(`${user.id}/`)) {
    throw new Error('Unauthorized: You do not have access to this file');
  }
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, 60); // 60 seconds expiry

  if (error) throw error;

  return { signedUrl: data.signedUrl };
}

/**
 * List user's files
 */
export async function listUserFiles(bucket: string = 'user-documents') {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .list(user.id);

  if (error) throw error;

  return data;
}

/**
 * Delete user's file
 */
export async function deleteFile(filePath: string, bucket: string = 'user-documents') {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  // Verify user owns this file
  if (!filePath.startsWith(`${user.id}/`)) {
    throw new Error('Unauthorized: You do not have access to this file');
  }

  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) throw error;

  return { success: true };
}

/**
 * Check if storage buckets exist
 */
export async function checkStorageBuckets() {
  const supabase = await createClient();
  
  const { data: buckets, error } = await supabase.storage.listBuckets();
  
  if (error) throw error;
  
  const requiredBuckets = ['user-documents', 'generated-plans'];
  const existingBuckets = buckets?.map(b => b.name) || [];
  const missingBuckets = requiredBuckets.filter(bucket => !existingBuckets.includes(bucket));
  
  return {
    exists: missingBuckets.length === 0,
    existingBuckets,
    missingBuckets,
  };
}

/**
 * Get storage bucket info
 */
export async function getBucketInfo(bucket: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase.storage.getBucket(bucket);
  
  if (error) {
    if (error.message.includes('not found')) {
      return null;
    }
    throw error;
  }
  
  return data;
}
