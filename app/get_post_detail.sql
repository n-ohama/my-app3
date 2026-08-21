CREATE OR REPLACE FUNCTION public.get_post_detail(p_post_id bigint)
RETURNS TABLE (
  id bigint,
  created_at timestamptz,
  content text,
  user_id uuid,
  name text,
  account_id text,
  likes_count bigint,
  likes_uid jsonb
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
      jsonb_agg(jsonb_build_object('user_id', l.user_id)) AS likes_uid
    FROM likes l
    GROUP BY post_id
  ), T1 AS (
    SELECT 
      p.id,
      p.created_at,
      p.content,
      p.user_id,
      u.name,
      u.account_id,
      COALESCE(l.likes_count, 0)::bigint AS likes_count,
      COALESCE(l.likes_uid, '[]'::jsonb) AS likes_uid
    FROM posts p
    INNER JOIN users u ON u.id = p.user_id
    LEFT JOIN T0 l ON l.post_id = p.id
    WHERE p.id = p_post_id
  ), T2 AS (
    SELECT 
      p.id,
      p.created_at,
      p.content,
      p.user_id,
      u.name,
      u.account_id,
      COALESCE(l.likes_count, 0)::bigint AS likes_count,
      COALESCE(l.likes_uid, '[]'::jsonb) AS likes_uid
    FROM posts p
    INNER JOIN users u ON u.id = p.user_id
    LEFT JOIN T0 l ON l.post_id = p.id
    WHERE p.parent_id = p_post_id
  )
  SELECT * FROM T1
  UNION ALL SELECT * FROM T2
  ORDER BY created_at DESC;
END;
$$;