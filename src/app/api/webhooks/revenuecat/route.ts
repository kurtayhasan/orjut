import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client with Service Role Key to bypass RLS for backend updates
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    // Optionally verify Authorization header if configured in RevenueCat dashboard
    const authHeader = req.headers.get('authorization');
    const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
    
    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('[RevenueCat Webhook] Event Received:', body);

    const event = body.event;
    if (!event) {
      return NextResponse.json({ error: 'Invalid event payload' }, { status: 400 });
    }

    const { type, app_user_id, entitlement_id, entitlement_ids } = event;

    if (!app_user_id) {
      return NextResponse.json({ error: 'Missing app_user_id' }, { status: 400 });
    }

    // Check if the event entitlement is the one we care about
    const targetEntitlement = 'com.orjut.ziraiasistan Pro';
    const isTargetEntitlement = entitlement_id === targetEntitlement || (entitlement_ids && entitlement_ids.includes(targetEntitlement));

    if (!isTargetEntitlement) {
      console.log(`[RevenueCat Webhook] Entitlement ignored: ${entitlement_id || entitlement_ids}`);
      return NextResponse.json({ success: true, message: 'Entitlement ignored' });
    }

    let isPremium = false;

    // Define which event types activate or deactivate premium
    // RevenueCat event types: https://www.revenuecat.com/docs/webhooks
    switch (type) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'RESTORE':
      case 'SUBSCRIBER_ALIAS':
        isPremium = true;
        break;
      case 'EXPIRATION':
      case 'CANCELLATION':
      case 'BILLING_ISSUE':
        isPremium = false;
        break;
      default:
        console.log(`[RevenueCat Webhook] Unhandled event type: ${type}`);
        return NextResponse.json({ success: true, message: 'Event type ignored' });
    }

    // Update user profile
    const { error } = await supabase
      .from('profiles')
      .update({ is_premium: isPremium })
      .eq('id', app_user_id);

    if (error) {
      console.error('[RevenueCat Webhook] Supabase Update Error:', error);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }

    console.log(`[RevenueCat Webhook] Successfully updated user ${app_user_id} is_premium status to ${isPremium}`);
    return NextResponse.json({ success: true, message: 'User status updated successfully' });

  } catch (err: any) {
    console.error('[RevenueCat Webhook] Handler Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
