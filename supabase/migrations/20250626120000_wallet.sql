-- Wallet de fidelización Más Café (Supabase — plan gratuito compatible)

CREATE TABLE IF NOT EXISTS member_counter (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  last_number int NOT NULL DEFAULT 0
);

INSERT INTO member_counter (id, last_number) VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS program_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  enabled boolean NOT NULL DEFAULT true,
  points_per_thousand_cop int NOT NULL DEFAULT 1,
  min_purchase_cop int NOT NULL DEFAULT 15000,
  max_points_per_day int NOT NULL DEFAULT 500,
  brand_name text NOT NULL DEFAULT 'Más Café',
  tiers jsonb NOT NULL DEFAULT '[]'::jsonb,
  rewards jsonb NOT NULL DEFAULT '[]'::jsonb,
  staff_pin_hash text,
  initialized_at timestamptz DEFAULT now(),
  pin_updated_at timestamptz
);

CREATE TABLE IF NOT EXISTS customers (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  member_id text UNIQUE NOT NULL,
  display_name text NOT NULL DEFAULT 'Cliente',
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wallets (
  user_id uuid PRIMARY KEY REFERENCES customers (user_id) ON DELETE CASCADE,
  points int NOT NULL DEFAULT 0,
  lifetime_points int NOT NULL DEFAULT 0,
  tier text NOT NULL DEFAULT 'Amante del café',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES customers (user_id) ON DELETE CASCADE,
  member_id text NOT NULL,
  type text NOT NULL CHECK (type IN ('earn', 'redeem')),
  points int NOT NULL,
  balance_after int NOT NULL,
  amount_cop int,
  reason text NOT NULL,
  reward_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES customers (user_id) ON DELETE CASCADE,
  member_id text NOT NULL,
  reward_id text NOT NULL,
  reward_name text NOT NULL,
  points_cost int NOT NULL,
  code text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  confirmed_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS redemptions_code_pending_idx
  ON redemptions (code)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS ledger_user_created_idx
  ON ledger (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ledger_user_type_created_idx
  ON ledger (user_id, type, created_at DESC);

CREATE INDEX IF NOT EXISTS customers_member_id_idx ON customers (member_id);
CREATE INDEX IF NOT EXISTS customers_email_idx ON customers (email);
CREATE INDEX IF NOT EXISTS redemptions_code_status_idx ON redemptions (code, status);

ALTER TABLE member_counter ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;

-- Sin políticas públicas: solo Edge Functions con service_role acceden a los datos.
