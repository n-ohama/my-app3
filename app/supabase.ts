import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const _url = "https://jmjdrbkzaytmraerizrh.supabase.co";
const _key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptamRyYmt6YXl0bXJhZXJpenJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMDY4MjEsImV4cCI6MjA5NDc4MjgyMX0.EbJM_fQU_PF3SeJFzV_qx4EnUsnZaBcJJKCLZcyYHBY";

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