CREATE OR REPLACE FUNCTION add_brand_credits(p_brand_id UUID, p_amount INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE brand_profiles
  SET credits = credits + p_amount
  WHERE id = p_brand_id;
END;
$$;
