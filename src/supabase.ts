import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xqpmaurzqmqlcpagqwdb.supabase.co'; 
const supabaseAnonKey = 'sb_publishable_afWFnx0DPE-pG7zAiO08hg_UBBd5IUb';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
