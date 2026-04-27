-- Tabela de histórico de versões das normativas
CREATE TABLE IF NOT EXISTS rules_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  edited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rules_versions_rule_id ON rules_versions(rule_id);
CREATE INDEX IF NOT EXISTS idx_rules_versions_edited_at ON rules_versions(edited_at DESC);

-- RLS
ALTER TABLE rules_versions ENABLE ROW LEVEL SECURITY;

-- Admins e gestores podem ver e inserir versões
CREATE POLICY "Admins visualizam versões"
ON rules_versions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin_global', 'admin', 'gestor_setor')
  )
);

CREATE POLICY "Admins inserem versões"
ON rules_versions FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin_global', 'admin', 'gestor_setor')
  )
);
