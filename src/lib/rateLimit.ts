import { supabase } from './supabase';

export async function checkRateLimit(userId: string, limit = 10, windowMs = 60_000): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('increment_rate_limit', {
      p_user_id: userId,
      p_limit_val: limit,
      p_window_val: windowMs
    });
    
    if (error) {
      console.error("Rate limit check error:", error);
      // Fallback to true if database fails so we don't break the app, but log it
      return true;
    }
    
    return data === true;
  } catch (err) {
    console.error("Unexpected rate limit error:", err);
    return true;
  }
}
