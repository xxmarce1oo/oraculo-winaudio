-- Tabela de agendamentos de salas
CREATE TABLE agendamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sala TEXT NOT NULL CHECK (sala IN ('treinamento', 'reuniao')),
  titulo TEXT NOT NULL,
  descricao TEXT,
  responsavel_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  responsavel_nome TEXT NOT NULL,
  inicio TIMESTAMPTZ NOT NULL,
  fim TIMESTAMPTZ NOT NULL,
  recorrencia TEXT CHECK (recorrencia IN ('nenhuma', 'diaria', 'semanal', 'mensal')) DEFAULT 'nenhuma',
  grupo_recorrencia_id UUID,
  cancelado BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT horario_valido CHECK (
    EXTRACT(HOUR FROM inicio AT TIME ZONE 'America/Sao_Paulo') >= 8 AND
    EXTRACT(HOUR FROM fim AT TIME ZONE 'America/Sao_Paulo') <= 19 AND
    fim > inicio
  )
);

-- Índices
CREATE INDEX idx_agendamentos_sala ON agendamentos(sala);
CREATE INDEX idx_agendamentos_inicio ON agendamentos(inicio);
CREATE INDEX idx_agendamentos_grupo ON agendamentos(grupo_recorrencia_id);
CREATE INDEX idx_agendamentos_responsavel ON agendamentos(responsavel_id);

-- RLS
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- Todos os usuários autenticados podem visualizar agendamentos não cancelados
CREATE POLICY "Visualizar agendamentos" ON agendamentos
  FOR SELECT
  TO authenticated
  USING (cancelado = FALSE);

-- Admin global e gestor de setor podem inserir
CREATE POLICY "Inserir agendamentos" ON agendamentos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin_global', 'gestor_setor')
    )
  );

-- Admin global e gestor de setor podem atualizar
CREATE POLICY "Atualizar agendamentos" ON agendamentos
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin_global', 'gestor_setor')
    )
  );

-- Trigger para atualizar atualizado_em
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_agendamento
  BEFORE UPDATE ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp();
