import { groq, LLM_MODEL } from './config';
import { RerankedResult } from './retriever';
import { estimateTokens } from './embeddings';

export interface AnswerWithCitations {
  answer: string;
  citations: Citation[];
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCost: number;
  };
  timing: {
    llmMs: number;
  };
}

export interface Citation {
  index: number;
  content: string;
  source: string;
  title?: string;
  position: number;
  rerankScore: number;
}

/**
 * Generate answer with citations using Google Gemini
 */
export async function generateAnswer(
  query: string,
  contexts: RerankedResult[]
): Promise<AnswerWithCitations> {
  const startTime = Date.now();

  // Prepare context with citation markers
  const contextText = contexts
    .map((ctx, idx) => `[${ctx.citationIndex}] ${ctx.content}`)
    .join('\n\n');

  const prompt = `You are a helpful assistant that answers questions based on the provided context. 
Always cite your sources using the citation numbers provided in square brackets [1], [2], etc.

Context:
${contextText}

Question: ${query}

Instructions:
1. Answer the question based ONLY on the provided context
2. Use inline citations [1], [2], etc. to reference specific sources
3. If the context doesn't contain enough information, say so
4. Be concise and accurate

Answer:`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: LLM_MODEL,
    temperature: 0.3,
    max_tokens: 500,
  });

  const answer = completion.choices[0]?.message?.content || 'No answer generated.';
  const llmMs = Date.now() - startTime;

  // Prepare citations
  const citations: Citation[] = contexts.map(ctx => ({
    index: ctx.citationIndex,
    content: ctx.content,
    source: ctx.metadata.source,
    title: ctx.metadata.title,
    position: ctx.metadata.position,
    rerankScore: ctx.rerankScore,
  }));

  // Get actual token usage from Groq
  const promptTokens = completion.usage?.prompt_tokens || 0;
  const completionTokens = completion.usage?.completion_tokens || 0;
  const totalTokens = promptTokens + completionTokens;
  const estimatedCost = 0; // Groq is FREE

  return {
    answer,
    citations,
    usage: {
      promptTokens,
      completionTokens,
      totalTokens,
      estimatedCost,
    },
    timing: {
      llmMs,
    },
  };
}
