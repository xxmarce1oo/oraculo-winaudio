CREATE TABLE IF NOT EXISTS avisos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fixado BOOLEAN NOT NULL DEFAULT false,
  ativo BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_avisos_criado_em ON avisos(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_avisos_ativo ON avisos(ativo);

ALTER TABLE avisos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos autenticados visualizam avisos ativos"
ON avisos FOR SELECT TO authenticated
USING (ativo = true);

CREATE POLICY "Admins gerenciam avisos"
ON avisos FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin_global', 'admin'))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin_global', 'admin'))
);

-- Tabela de leituras de avisos (para badge de não lidos)
CREATE TABLE IF NOT EXISTS aviso_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aviso_id UUID NOT NULL REFERENCES avisos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(aviso_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_aviso_readings_user_id ON aviso_readings(user_id);

ALTER TABLE aviso_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios gerenciam propria leitura de avisos"
ON aviso_readings FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
