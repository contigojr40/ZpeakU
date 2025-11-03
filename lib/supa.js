import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ⚙️ Configuración real de tu proyecto ZPEAKU™ (zpeaku-db)
const supaUrl = 'https://kocxihrlsmqhekxmbnuw.supabase.co';
const supaKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvY3hpaHJsc21xaGVreG1ibnV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNzQyODksImV4cCI6MjA3MTg1MDI4OX0.nP64IyikzwFwoluRXyPL0d6uMY-6cQrYz4VUcwW3o4I';

export const supa = createClient(supaUrl, supaKey);