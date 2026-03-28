import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Inicializamos a OpenAI com a chave guardada nas variáveis de ambiente
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    // Extraímos o token de autenticação enviado pelo front-end para garantir que
    // o cliente Supabase assuma a identidade do utilizador logado e respeite o RLS.
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Não autorizado. Faça login no sistema.' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Obter o perfil do usuário para personalizar a resposta
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name')
      .single();

    const userName = profileData?.full_name || 'Colaborador';

    if (!message) {
      return NextResponse.json({ error: 'Mensagem não fornecida' }, { status: 400 });
    }

    // 1. Vetorizar a pergunta do utilizador
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: message,
    });
    
    const query_embedding = embeddingResponse.data[0].embedding;

    // 2. Procurar as regras mais relevantes na base de dados (Similarity Search)
    const { data: rules, error: rpcError } = await supabase.rpc('match_rules', {
      query_embedding,
      match_threshold: 0.2, // Limite de similaridade reduzido para melhor cobertura em português
      match_count: 5        // Quantidade máxima de normas a injetar como contexto
    });

    if (rpcError) {
      console.error('Erro ao buscar normas:', rpcError);
      throw rpcError;
    }

    console.log(`[RAG] Pergunta: "${message}"`);
    console.log(`[RAG] Normas encontradas: ${rules?.length || 0}`);

    // 3. Montar o contexto injetável
    let contextText = '';
    let sourceNames: string[] = [];

    if (rules && rules.length > 0) {
      contextText = rules.map((rule: any) => `Norma: ${rule.title}\nConteúdo: ${rule.content}`).join('\n\n');
      sourceNames = rules.map((rule: any) => rule.title);
    }

  // 4. Prompt de Sistema: A espinha dorsal contra "alucinações"
    const systemPrompt = `
    Você é o Oráculo, o assistente virtual de inteligência artificial da WinAudio.
    Sua missão é responder às dúvidas de ${userName} baseando-se EXCLUSIVAMENTE nas normativas fornecidas no contexto abaixo.
    
    Diretrizes estritas:
    - Trate ${userName} com respeito, empatia e cordialidade, usando o nome da pessoa de forma natural durante a conversa.
    - Se a resposta para a pergunta não estiver explicitamente no contexto fornecido, informe educadamente que você não encontrou essa informação nas normas atuais e sugira que ${userName} consulte um gestor ou o RH.
    - SOB NENHUMA HIPÓTESE invente informações, deduza regras que não estão no texto ou busque conhecimentos externos à WinAudio.
    - Seja claro, objetivo e profissional, adotando sempre o tom de "Tecnologia Humanizada" (acolhedor e prestativo, nunca robótico ou frio).
    
    CONTEXTO DAS NORMATIVAS DA WINAUDIO:
    ${contextText}
    `;

    // 5. Chamar o modelo de LLM (GPT-4o-mini)
    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.2, // Temperatura baixa para respostas exatas e sem invenções
    });

    const reply = chatResponse.choices[0].message.content;

    // 6. Retornar a resposta final e as fontes (sem duplicados)
    // Só incluir fontes se a IA realmente usou o contexto (não disse que não encontrou)
    const hasSources = reply && !reply.toLowerCase().includes('não encontr') && sourceNames.length > 0;
    
    return NextResponse.json({
      reply,
      sources: hasSources ? [...new Set(sourceNames)] : []
    });

  } catch (error: any) {
    console.error('Erro no processamento do Oráculo:', error);
    
    // Tratamento específico e amigável para o erro de saldo da OpenAI (Quota Exceeded)
    if (error?.status === 429 || error?.error?.type === 'insufficient_quota' || error?.code === 'insufficient_quota') {
      return NextResponse.json({ 
        error: 'O assistente de Inteligência Artificial está temporariamente indisponível devido a limitações de quota na API. Por favor, contacte o administrador do sistema.' 
      }, { status: 429 });
    }

    return NextResponse.json({ error: 'Erro interno ao processar a pergunta' }, { status: 500 });
  }
}