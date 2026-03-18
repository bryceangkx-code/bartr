-- Atomically adds credits to brand_profiles AND logs the credit transaction.
-- Returns FALSE (idempotent no-op) if the stripe_session_id already exists.
CREATE OR REPLACE FUNCTION topup_brand_credits(
  p_brand_id UUID,
  p_amount INTEGER,
  p_stripe_session_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert transaction first; unique constraint on stripe_session_id ensures idempotency.
  INSERT INTO credit_transactions (brand_id, amount, action, stripe_session_id)
  VALUES (p_brand_id, p_amount, 'topup', p_stripe_session_id);

  -- Only reach here if insert succeeded (i.e., not a duplicate).
  UPDATE brand_profiles
  SET credits = credits + p_amount
  WHERE id = p_brand_id;

  RETURN TRUE;
EXCEPTION
  WHEN unique_violation THEN
    -- Already processed this session; idempotent no-op.
    RETURN FALSE;
END;
$$;
