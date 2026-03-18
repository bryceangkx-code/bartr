-- Migration 003: Instagram verification columns + credit_transactions table
-- NOTE: brand_profiles.credits already exists in 001_initial_schema.sql — do NOT re-add it

ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS instagram_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS instagram_access_token TEXT;
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS instagram_token_expires_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('topup', 'post_listing', 'feature_listing', 'admin_grant')),
  stripe_session_id TEXT UNIQUE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS credit_transactions_brand_id_idx ON credit_transactions(brand_id);
CREATE INDEX IF NOT EXISTS credit_transactions_stripe_session_id_idx ON credit_transactions(stripe_session_id) WHERE stripe_session_id IS NOT NULL;

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brands read own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = brand_id);
