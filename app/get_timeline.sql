CREATE OR REPLACE FUNCTION public.get_timeline()
RETURNS TABLE (
  id bigint,
  created_at timestamptz,
  content text,
  user_id uuid,
  name text,
  account_id text,
  likes_count bigint,
  likes_uid jsonb,
  comment_agg jsonb
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    p.id,
    p.created_at,
    p.content,
    p.user_id,
    u.name,
    u.account_id,
    COALESCE(l.likes_count, 0)::bigint AS likes_count,
    COALESCE(l.likes_uid, '[]'::jsonb) AS likes_uid,
    COALESCE(c.comments, '[]'::jsonb) AS comment_agg
  FROM posts p
  INNER JOIN users u ON u.id = p.user_id
  LEFT JOIN (
    SELECT 
      l.post_id,
      COUNT(*)::bigint AS likes_count,
      jsonb_agg(jsonb_build_object('user_id', l.user_id)) AS likes_uid -- l. を追加
    FROM likes l -- l エイリアスを追加
    GROUP BY l.post_id
  ) l ON l.post_id = p.id
  LEFT JOIN (
    SELECT 
      c.post_id,
      jsonb_agg(jsonb_build_object('comment_user_name', cu.name, 'content', c.content)) AS comments -- c. と cu. を明示
    FROM comments c
    INNER JOIN users cu ON cu.id = c.user_id -- 混同を防ぐためエイリアスを cu (comment_user) に変更
    GROUP BY c.post_id
  ) c ON c.post_id = p.id
  ORDER BY p.created_at DESC;
END;
$$;
select * from get_timeline();