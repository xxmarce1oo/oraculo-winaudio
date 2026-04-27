-- Adiciona campos de código WN e vigência nas normas
ALTER TABLE rules ADD COLUMN IF NOT EXISTS codigo_wn TEXT;
ALTER TABLE rules ADD COLUMN IF NOT EXISTS vigencia_inicio DATE;
ALTER TABLE rules ADD COLUMN IF NOT EXISTS vigencia_fim DATE;

-- Adiciona contador de normativas por setor
ALTER TABLE departments ADD COLUMN IF NOT EXISTS contador_normativas INTEGER DEFAULT 0;

-- Índice para garantir unicidade do código WN
CREATE UNIQUE INDEX IF NOT EXISTS idx_rules_codigo_wn ON rules(codigo_wn) WHERE codigo_wn IS NOT NULL;

-- Função para gerar o próximo código WN de um setor
CREATE OR REPLACE FUNCTION proximo_codigo_wn(p_department_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_contador INTEGER;
  v_sigla TEXT;
BEGIN
  -- Incrementa o contador do setor atomicamente
  UPDATE departments
  SET contador_normativas = contador_normativas + 1
  WHERE id = p_department_id
  RETURNING contador_normativas INTO v_contador;

  -- Gera sigla das primeiras 3 letras do nome do setor (sem espaços, maiúsculas)
  SELECT UPPER(REGEXP_REPLACE(SUBSTRING(name, 1, 3), '[^A-Za-z]', '', 'g'))
  INTO v_sigla
  FROM departments
  WHERE id = p_department_id;

  RETURN 'WN' || v_sigla || LPAD(v_contador::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;
