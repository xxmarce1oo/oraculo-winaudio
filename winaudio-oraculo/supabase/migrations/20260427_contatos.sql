CREATE TABLE IF NOT EXISTS contatos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  setor TEXT NOT NULL DEFAULT 'Geral',
  telefones TEXT[] NOT NULL DEFAULT '{}',
  emails TEXT[] NOT NULL DEFAULT '{}',
  descricao TEXT,
  criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contatos_nome ON contatos(nome);
CREATE INDEX IF NOT EXISTS idx_contatos_setor ON contatos(setor);

ALTER TABLE contatos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados visualizam contatos"
ON contatos FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins gerenciam contatos"
ON contatos FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin_global', 'gestor_setor'))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin_global', 'gestor_setor'))
);
