
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAndFixSchema() {
  console.log('Checking lands table structure...');
  
  // Try to insert a dummy land with lat/lng to see if it fails
  const { error } = await supabase.from('lands').insert([
    { 
      org_id: '00000000-0000-0000-0000-000000000000', 
      name: 'Schema Check', 
      lat: 0, 
      lng: 0 
    }
  ]).select();

  if (error) {
    if (error.message.includes('column "lat" of relation "lands" does not exist')) {
      console.log('Detected missing lat/lng columns. Adding them...');
      // We can't run ALTER TABLE via anon key usually. 
      // But if the user has Service Role key we could.
      // However, we can try to use a RPC if they have one, or just inform the user.
      console.error('Error: Table "lands" is missing "lat" and "lng" columns.');
    } else {
      console.error('Database error:', error.message);
    }
  } else {
    console.log('Schema looks OK (lat/lng columns exist).');
    // Cleanup
    await supabase.from('lands').delete().eq('name', 'Schema Check');
  }
}

checkAndFixSchema();
