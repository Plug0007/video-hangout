import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://YOUR_PROJECT_ID.supabase.co"; // replace with your Supabase URL
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsc3l6Z3Zxa2hha250anlteWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTQxMTUsImV4cCI6MjA1OTk3MDExNX0.lIJ_d66V7vbJAEAb9zUnWCegqXaXyd5lLT7f0xdByPw"; // replace with your anon key

export const supabase = createClient(supabaseUrl, supabaseKey);
