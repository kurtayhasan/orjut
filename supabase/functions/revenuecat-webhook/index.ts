// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// @ts-ignore
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
// @ts-ignore
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

serve(async (req: Request) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();

    const { event } = body;
    if (!event) {
      return new Response(JSON.stringify({ error: "No event found" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { app_user_id, type } = event;

    if (!app_user_id) {
      return new Response(JSON.stringify({ error: "No app_user_id found" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let isPremium = false;

    // Check RevenueCat webhook event types
    // INITIAL_PURCHASE, RENEWAL, PRODUCT_CHANGE, TRANSFER usually mean active
    // EXPIRATION, BILLING_ISSUE, CANCELLATION (sometimes active until end date, but for simplicity let's rely on expiration)
    if (
      type === "INITIAL_PURCHASE" ||
      type === "RENEWAL" ||
      type === "NON_RENEWING_PURCHASE" ||
      type === "PRODUCT_CHANGE" ||
      type === "TRANSFER"
    ) {
      isPremium = true;
    } else if (type === "EXPIRATION" || type === "CANCELLATION" || type === "UNCANCELLATION") {
      if (type === "EXPIRATION") {
        isPremium = false;
      } else {
        return new Response(JSON.stringify({ message: `Ignored event type: ${type}` }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    } else {
      return new Response(JSON.stringify({ message: `Ignored event type: ${type}` }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { error } = await supabase
      .from("profiles")
      .update({ is_premium: isPremium })
      .eq("id", app_user_id);

    if (error) {
      console.error("Supabase update error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, app_user_id, isPremium }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
