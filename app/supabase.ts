import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const _url = "https://zoljjiixulpodvsflxeg.supabase.co";
const _key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvbGpqaWl4dWxwb2R2c2ZseGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDk2MjIsImV4cCI6MjA5ODEyNTYyMn0.YG93nXpWcaST0Q_eAMSkxq4pFL8ZGj1t4Owaky-tgGM";

export const supabase = createClient(_url,_key);

export const supabaseServer = (cookie: any) => createServerClient(_url,_key,
  {
    cookies: {
      getAll() { return cookie.getAll() },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookie.set(name, value, options))
        } catch { /* サーバーコンポーネントからの呼び出し時用 */ }
      },
    },
  }
)