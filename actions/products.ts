'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Zod schema for product filtering
const ProductFilterSchema = z.object({
  type: z.enum(['checking', 'secured_card', 'credit_builder_loan', 'counseling_org']).optional(),
  state: z.string().optional(),
  recommendedOnly: z.boolean().optional(),
  requiresPermanentAddress: z.boolean().optional(),
  requiresCreditCheck: z.boolean().optional(),
});

/**
 * Get vetted products with optional filtering
 */
export async function getProducts(filters: {
  type?: string;
  state?: string;
  recommendedOnly?: boolean;
  requiresPermanentAddress?: boolean;
  requiresCreditCheck?: boolean;
}) {
  const supabase = await createClient();
  
  let query = supabase
    .from('product_directory')
    .select('*')
    .eq('is_vetted', true);

  // Apply filters
  if (filters.type) {
    query = query.eq('type', filters.type);
  }

  if (filters.state && filters.state !== 'all') {
    query = query.contains('supported_states', [filters.state]);
  }

  if (filters.recommendedOnly) {
    // This would require a recommended flag in the schema
    // For now, we'll use is_vetted as the recommendation indicator
  }

  if (filters.requiresPermanentAddress !== undefined) {
    query = query.eq('requires_permanent_address', filters.requiresPermanentAddress);
  }

  if (filters.requiresCreditCheck !== undefined) {
    query = query.eq('requires_credit_check', filters.requiresCreditCheck);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;

  return data;
}

/**
 * Get a single product by ID
 */
export async function getProductById(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('product_directory')
    .select('*')
    .eq('id', id)
    .eq('is_vetted', true)
    .single();

  if (error) throw error;

  return data;
}

/**
 * Get product categories for filtering
 */
export async function getProductCategories() {
  return [
    { value: 'checking', label: 'Banking' },
    { value: 'secured_card', label: 'Credit Cards' },
    { value: 'credit_builder_loan', label: 'Loans' },
    { value: 'counseling_org', label: 'Counseling' },
  ];
}

/**
 * Get supported states for filtering
 */
export async function getSupportedStates() {
  return [
    { value: 'all', label: 'All States' },
    { value: 'CA', label: 'California' },
    { value: 'TX', label: 'Texas' },
    { value: 'NY', label: 'New York' },
    { value: 'FL', label: 'Florida' },
    { value: 'IL', label: 'Illinois' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'OH', label: 'Ohio' },
    { value: 'GA', label: 'Georgia' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'MI', label: 'Michigan' },
  ];
}
