import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('departments')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('Erro ao buscar departamentos:', error);
      return NextResponse.json({ error: 'Erro ao buscar departamentos' }, { status: 500 });
    }

    return NextResponse.json({ departments: data });
  } catch (error) {
    console.error('Erro na API de departamentos:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('departments')
      .insert([{ name }])
      .select();

    if (error) {
      console.error('Erro ao criar departamento:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro na API de departamentos:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name } = await request.json();

    if (!id || !name) {
      return NextResponse.json({ error: 'ID e nome são obrigatórios' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('departments')
      .update({ name })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Erro ao atualizar departamento:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro na API de departamentos:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir departamento:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro na API de departamentos:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
