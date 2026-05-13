import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ✏️ Paste your Supabase credentials here
const SUPABASE_URL = 'https://krfyvhcdqhzlrdrubnlr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_WzR4E7hcW2hWQ0j6bf-PUQ_K1pkjaZF';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabaseInstance;
}

export type Company = {
  id: string;
  name: string;
  current_capital: number;
  initial_capital: number;
  volatility_factor: number;
  status: 'Profit' | 'Loss' | 'Stable';
  roi_percentage: number;
  last_update: string;
  created_at: string;
  updated_at: string;
};

export type MarketLog = {
  id: string;
  company_id: string;
  company_name: string;
  event_type: 'profit' | 'loss';
  roi_percentage: number;
  capital_before: number;
  capital_after: number;
  change_amount: number;
  timestamp: string;
};