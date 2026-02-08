import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(url, key);

async function main() {
  const { data } = await supabase
    .from('orders')
    .select('id, order_number, created_at, shipping_address, order_items(style, size, paper_type, frame_type, base_price)')
    .order('created_at', { ascending: false })
    .limit(5);

  for (const o of data || []) {
    const addr = o.shipping_address as Record<string, string>;
    const items = (o.order_items as Array<Record<string, unknown>>) || [];
    console.log(`\n${o.order_number} (${o.created_at})`);
    console.log(`  Customer: ${addr?.name || 'N/A'}`);
    for (const i of items) {
      console.log(`  Item: style=${i.style} size=${i.size} paper=${i.paper_type} frame=${i.frame_type} price=${i.base_price}`);
    }
    if (items.length === 0) console.log('  NO ITEMS');
  }
}

main().catch(console.error);
