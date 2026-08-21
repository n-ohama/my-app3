import { supabaseServer } from "../../supabase";
import PostDetail from "./PostDetail";
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation';

type Props = { params: { id: string } };

export default async function DetailPage({ params }: Props) {
  const { id } = await params;
  const cookieStore = await cookies()
  const supabase = supabaseServer(cookieStore);
  const {data: {user}} = await supabase.auth.getUser();
  if (user === null) redirect('/login');
  const {data} = await supabase.rpc('get_post_detail', { p_post_id: Number(id) });

  return (
    <PostDetail user_id={user.id} postId={Number(id)} posts={data} />
  );
}
