import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://YOUR_PROJECT_ID.supabase.co"; // replace with your Supabase URL
const supabaseKey = "YOUR_ANON_KEY"; // replace with your anon key

export const supabase = createClient(supabaseUrl, supabaseKey);
