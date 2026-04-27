CREATE TABLE IF NOT EXISTS rule_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(rule_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_rule_readings_rule_id ON rule_readings(rule_id);
CREATE INDEX IF NOT EXISTS idx_rule_readings_user_id ON rule_readings(user_id);

ALTER TABLE rule_readings ENABLE ROW LEVEL SECURITY;

-- Colaborador pode inserir e ver sua própria leitura
CREATE POLICY "Usuarios marcam propria leitura"
ON rule_readings FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuarios veem propria leitura"
ON rule_readings FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin_global', 'admin', 'gestor_setor')
  )
);
