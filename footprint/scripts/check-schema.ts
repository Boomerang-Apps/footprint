import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
console.log('Supabase URL:', url?.substring(0, 30) + '...');

const supabase = createClient(url, key);

async function main() {
  // Check orders table
  const { data, error } = await supabase.from('orders').select('*').limit(1);

  if (error) {
    console.log('Orders error:', error.message);
  } else {
    console.log('Orders rows:', data?.length);
    if (data && data.length > 0) {
      console.log('Orders columns:', Object.keys(data[0]).join(', '));
      console.log('Sample row:', JSON.stringify(data[0], null, 2));
    }
  }

  // Check order_items table
  const { data: items, error: itemsErr } = await supabase.from('order_items').select('*').limit(2);
  if (itemsErr) {
    console.log('\nOrder items error:', itemsErr.message);
  } else {
    console.log('\nOrder items rows:', items?.length);
    if (items && items.length > 0) {
      console.log('Order items columns:', Object.keys(items[0]).join(', '));
      console.log('Sample item:', JSON.stringify(items[0], null, 2));
    }
  }

  // Check profiles table (for customer info)
  const { data: profiles, error: profErr } = await supabase.from('profiles').select('*').limit(1);
  if (profErr) {
    console.log('\nProfiles error:', profErr.message);
  } else {
    console.log('\nProfiles rows:', profiles?.length);
    if (profiles && profiles.length > 0) {
      console.log('Profiles columns:', Object.keys(profiles[0]).join(', '));
    }
  }
}

main().catch(console.error);
