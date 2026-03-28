import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { ruleId, content } = await request.json();

    if (!ruleId || !content) {
      return NextResponse.json({ error: 'Faltam dados obrigatórios' }, { status: 400 });
    }

    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: content,
    });

    const vector = embeddingResponse.data[0].embedding;

    const { error: updateError } = await supabaseAdmin
      .from('rules')
      .update({ embedding: vector })
      .eq('id', ruleId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, message: 'Embedding gerado com sucesso!' });

  } catch (error) {
    console.error('Erro na API de Embeddings:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
