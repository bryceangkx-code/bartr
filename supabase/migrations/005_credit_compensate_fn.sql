CREATE OR REPLACE FUNCTION increment_brand_credit_compensate(p_brand_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE brand_profiles
  SET credits = credits + 1
  WHERE id = p_brand_id;
END;
$$;
