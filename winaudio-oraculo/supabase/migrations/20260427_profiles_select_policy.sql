-- Permite que usuários autenticados vejam o nome/avatar de outros perfis
-- necessário para exibir o autor nos avisos e em outras listagens
CREATE POLICY IF NOT EXISTS "Autenticados visualizam perfis"
ON profiles FOR SELECT TO authenticated
USING (true);
