-- Migration: Sistema de Publicação de Artigos
-- Data: 2026-04-13
-- Descrição: Transforma o módulo de normas em um sistema de publicação de artigos profissional

-- 1. Garantir que content suporta textos longos (já é TEXT, mas vamos confirmar)
-- ALTER TABLE rules ALTER COLUMN content TYPE TEXT;

-- 2. Adicionar coluna de status com valores permitidos
ALTER TABLE rules ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'vigente';

-- Adicionar CHECK constraint para status
ALTER TABLE rules DROP CONSTRAINT IF EXISTS rules_status_check;
ALTER TABLE rules ADD CONSTRAINT rules_status_check 
CHECK (status IN ('vigente', 'atualizacao_recente', 'obsoleta'));

-- 3. Adicionar coluna para link de norma substituta (quando obsoleta)
ALTER TABLE rules ADD COLUMN IF NOT EXISTS replaced_by_id UUID REFERENCES rules(id) ON DELETE SET NULL;

-- 4. Adicionar coluna para URL de vídeo (YouTube/Vimeo)
ALTER TABLE rules ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 5. Adicionar coluna para anexos (metadados em JSONB)
-- Estrutura esperada: [{ "name": "arquivo.pdf", "url": "https://...", "size": 1024 }]
ALTER TABLE rules ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- 6. Adicionar coluna para tempo de leitura estimado (em minutos)
ALTER TABLE rules ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER DEFAULT 1;

-- 7. Adicionar coluna updated_at para rastrear última atualização
ALTER TABLE rules ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 8. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  -- Calcular tempo de leitura baseado no conteúdo (média 200 palavras/minuto)
  IF NEW.content IS NOT NULL AND NEW.content != '' THEN
    NEW.reading_time_minutes = GREATEST(1, CEIL(
      array_length(regexp_split_to_array(regexp_replace(NEW.content, '<[^>]*>', '', 'g'), '\s+'), 1)::numeric / 200
    ));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Criar trigger para updated_at
DROP TRIGGER IF EXISTS trigger_rules_updated_at ON rules;
CREATE TRIGGER trigger_rules_updated_at
  BEFORE UPDATE ON rules
  FOR EACH ROW
  EXECUTE FUNCTION update_rules_updated_at();

-- 10. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_rules_status ON rules(status);
CREATE INDEX IF NOT EXISTS idx_rules_replaced_by ON rules(replaced_by_id);
CREATE INDEX IF NOT EXISTS idx_rules_updated_at ON rules(updated_at DESC);

-- 11. Atualizar a função match_rules para filtrar normas obsoletas
-- (Esta função é usada pelo RAG para buscar normas relevantes)
DROP FUNCTION IF EXISTS match_rules(vector, double precision, integer);
DROP FUNCTION IF EXISTS match_rules(vector(1536), float, int);

CREATE OR REPLACE FUNCTION match_rules(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  type text,
  department_id uuid,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.title,
    r.content,
    r.type,
    r.department_id,
    1 - (r.embedding <=> query_embedding) AS similarity
  FROM rules r
  WHERE 
    r.embedding IS NOT NULL
    AND r.status != 'obsoleta'  -- Filtrar normas obsoletas
    AND 1 - (r.embedding <=> query_embedding) > match_threshold
  ORDER BY r.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 12. Criar view para facilitar consultas de normas com informações completas
CREATE OR REPLACE VIEW rules_with_details AS
SELECT 
  r.*,
  d.name as department_name,
  rb.title as replaced_by_title
FROM rules r
LEFT JOIN departments d ON r.department_id = d.id
LEFT JOIN rules rb ON r.replaced_by_id = rb.id;

-- Verificação final (execute manualmente)
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'rules';
