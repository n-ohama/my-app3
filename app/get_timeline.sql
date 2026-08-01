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

  WITH T0 AS (
    SELECT 
      post_id,
      COUNT(*)::bigint AS likes_count,
      jsonb_agg(jsonb_build_object('user_id', user_id)) AS likes_uid
    FROM likes
    GROUP BY post_id
  ), T1 AS (
    SELECT
      c.post_id,
      jsonb_agg(jsonb_build_object('comment_user_name', cu.name, 'content', c.content)) AS comments
    FROM comments c
    INNER JOIN users cu ON cu.id = c.user_id
    GROUP BY c.post_id
  )
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
  LEFT JOIN T0 l ON l.post_id = p.id
  LEFT JOIN T1 c ON c.post_id = p.id
  ORDER BY p.created_at DESC;
END;
$$;