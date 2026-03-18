CREATE OR REPLACE FUNCTION decrement_brand_credit(p_brand_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE brand_profiles
  SET credits = credits - 1
  WHERE id = p_brand_id AND credits >= 1;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$;
