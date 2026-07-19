import { supabaseServer } from "../../supabase";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { mode, email, password } = await request.json();
  const cookieStore = await cookies();
  const supabase = supabaseServer(cookieStore);

  console.log("mode", mode);
  // サインアップ
  if (mode === 1) {
    const { data, error } = await supabase.auth.signUp({email,password});
    if (error) {
      return Response.json({success: false, error: error.message});
    }

    return Response.json({
      success: true,
      uid: data.user?.id,
    });
  }

  // ログイン
  const { data, error } = await supabase.auth.signInWithPassword({email,password});
  if (error) {
    return Response.json({success: false, error: error.message});
  }

  return Response.json({
    success: true,
    uid: data.user?.id,
  });
}