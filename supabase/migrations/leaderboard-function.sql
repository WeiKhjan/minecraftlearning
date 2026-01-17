-- Create a function to get leaderboard data that bypasses RLS
-- This only exposes non-sensitive data needed for the leaderboard

CREATE OR REPLACE FUNCTION get_leaderboard()
RETURNS TABLE (
  id UUID,
  name TEXT,
  avatar_seed TEXT,
  generated_avatar_url TEXT,
  level INT,
  total_xp INT,
  grade TEXT,
  school TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to bypass RLS
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    k.id,
    k.name,
    k.avatar_seed,
    k.generated_avatar_url,
    k.level,
    k.total_xp,
    k.grade,
    k.school
  FROM kids k
  ORDER BY k.total_xp DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_leaderboard() TO authenticated;

-- Also create a function to get progress stats for leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard_stats()
RETURNS TABLE (
  kid_id UUID,
  completed_count BIGINT,
  total_stars BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kp.kid_id,
    COUNT(*) FILTER (WHERE kp.status = 'completed') as completed_count,
    COALESCE(SUM(kp.stars) FILTER (WHERE kp.status = 'completed'), 0) as total_stars
  FROM kid_progress kp
  GROUP BY kp.kid_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_leaderboard_stats() TO authenticated;
