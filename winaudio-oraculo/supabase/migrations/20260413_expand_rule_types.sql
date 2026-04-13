-- Migration: Expandir tipos de documentos na tabela rules
-- Data: 2026-04-13
-- Descrição: Altera a coluna 'type' para suportar: 'procedimentos', 'normativa', 'me_consulte', 'faq'

-- 1. Verificar se a coluna type existe e seu tipo atual
-- Se for um ENUM, precisamos recriá-lo. Se for TEXT, adicionamos CHECK constraint.

-- Opção A: Se a coluna 'type' for TEXT com CHECK constraint
-- Remove constraint antiga (se existir)
ALTER TABLE rules DROP CONSTRAINT IF EXISTS rules_type_check;

-- Opção B: Se a coluna 'type' for um ENUM, converter para TEXT primeiro
-- (Descomente as linhas abaixo se necessário)
-- ALTER TABLE rules ALTER COLUMN type TYPE TEXT;

-- 2. Migrar dados existentes para os novos valores
-- 'oraculo' -> 'normativa' (mapeamento lógico)
UPDATE rules SET type = 'normativa' WHERE type = 'oraculo';

-- 3. Adicionar nova CHECK constraint com os valores permitidos
ALTER TABLE rules 
ADD CONSTRAINT rules_type_check 
CHECK (type IN ('procedimentos', 'normativa', 'me_consulte', 'faq'));

-- 4. Garantir que a coluna não aceita NULL
ALTER TABLE rules ALTER COLUMN type SET NOT NULL;

-- 5. Criar índice para melhorar performance de filtros por tipo
CREATE INDEX IF NOT EXISTS idx_rules_type ON rules(type);

-- Verificação final (opcional - execute manualmente)
-- SELECT type, COUNT(*) FROM rules GROUP BY type;
