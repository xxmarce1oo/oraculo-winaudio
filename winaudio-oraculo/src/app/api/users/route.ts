import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email, password, full_name, role, department_id } = await request.json();

    if (!email || !password || !full_name || !role) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: email, password, full_name, role' },
        { status: 400 }
      );
    }

    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error('Erro ao criar usuário:', authError);
      return NextResponse.json(
        { error: authError.message || 'Erro ao criar usuário' },
        { status: 400 }
      );
    }

    // 2. Criar/atualizar perfil na tabela profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        full_name,
        role,
        department_id: department_id || null,
      });

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError);
      // Tentar deletar o usuário criado se o perfil falhar
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Erro ao criar perfil do usuário' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: { id: authData.user.id, email: authData.user.email },
    });

  } catch (error) {
    console.error('Erro na API de usuários:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        full_name,
        role,
        department_id,
        created_at,
        departments ( id, name )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 });
    }

    return NextResponse.json({ users: data });
  } catch (error) {
    console.error('Erro na API de usuários:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, full_name, role, department_id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (role !== undefined) updateData.role = role;
    if (department_id !== undefined) updateData.department_id = department_id;

    console.log('API: Atualizando perfil:', id, updateData);

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Erro ao atualizar perfil:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('API: Perfil atualizado:', data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro na API de usuários:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
