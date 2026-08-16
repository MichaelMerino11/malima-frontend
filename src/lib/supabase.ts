import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://msthwugxxwrobndtscix.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zdGh3dWd4eHdyb2JuZHRzY2l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNzkxNjUsImV4cCI6MjA5ODg1NTE2NX0.XYRhVlIz2QfkfKBJBjzK3UYiiaPAxGKeVA35ltFc41o'

export const supabase = createClient(supabaseUrl, supabaseKey)
