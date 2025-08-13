-- 1) Add encrypted columns to store credentials securely (base64 strings)
ALTER TABLE public.integrations
  ADD COLUMN IF NOT EXISTS encrypted_password TEXT,
  ADD COLUMN IF NOT EXISTS encrypted_password_iv TEXT,
  ADD COLUMN IF NOT EXISTS encrypted_api_key TEXT,
  ADD COLUMN IF NOT EXISTS encrypted_api_key_iv TEXT;

-- Optional: document intent
COMMENT ON COLUMN public.integrations.encrypted_password IS 'AES-GCM encrypted password (base64)';
COMMENT ON COLUMN public.integrations.encrypted_password_iv IS 'AES-GCM IV for password (base64)';
COMMENT ON COLUMN public.integrations.encrypted_api_key IS 'AES-GCM encrypted API key (base64)';
COMMENT ON COLUMN public.integrations.encrypted_api_key_iv IS 'AES-GCM IV for API key (base64)';