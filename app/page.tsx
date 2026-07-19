import { supabaseServer } from "./supabase";
import Timeline from "./Timeline";
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation';

export default async function Home() {
  const cookieStore = await cookies()
  const supabase = supabaseServer(cookieStore);
  const {data: {user}} = await supabase.auth.getUser();
  if (user === null) redirect('/login');

  const {data} = await supabase.rpc("get_timeline");
  return <Timeline user_id={user.id} posts={data} />
}