// src/utils/supabase.js
import 'react-native-url-polyfill/auto'; 
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oddulakvdkuqjhlnzwil.supabase.co'; // Replace!
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kZHVsYWt2ZGt1cWpobG56d2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5OTg4MTgsImV4cCI6MjA1NTU3NDgxOH0.SXAAdh6ZOqnofDOlUEjo_o5cBskuxI9DdmJpxczdyaY'; // Replace!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
    }
});