const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://jdywkwidlneaykagspwd.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkeXdrd2lkbG5lYXlrYWdzcHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNTA3NTAsImV4cCI6MjA5MjcyNjc1MH0.Sj2SE-ydS69Tn-d01R6-l7kZfZi6zqEbmUn0q5jLkeY";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Updating role of Test Farmer (da756cf5-0539-4bf0-b79e-7486620b4199) to admin...");
  
  const { data: updated, error } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', 'da756cf5-0539-4bf0-b79e-7486620b4199')
    .select();
    
  if (error) {
    console.error("Update error:", error);
  } else {
    console.log("Success! Updated profile to admin:", updated);
  }
}

run();
