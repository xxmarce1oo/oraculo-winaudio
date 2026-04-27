ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Bucket público para avatares (criar via dashboard ou Storage API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
-- ON CONFLICT DO NOTHING;
