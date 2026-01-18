import type { NextApiRequest, NextApiResponse } from 'next';
import { retrieveAndRerank } from '@/lib/retriever';
import { generateAnswer } from '@/lib/llm';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const startTime = Date.now();

    // Step 1: Retrieve and rerank
    const { results, timing: retrievalTiming } = await retrieveAndRerank(query);

    if (results.length === 0) {
      return res.status(200).json({
        answer: 'No relevant documents found to answer your question. Please upload some documents first.',
        citations: [],
        timing: {
          retrievalMs: retrievalTiming.retrievalMs,
          rerankMs: retrievalTiming.rerankMs,
          llmMs: 0,
          totalMs: Date.now() - startTime,
        },
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          estimatedCost: 0,
        },
      });
    }

    // Step 2: Generate answer with LLM
    const answerResult = await generateAnswer(query, results);

    const totalTime = Date.now() - startTime;

    res.status(200).json({
      answer: answerResult.answer,
      citations: answerResult.citations,
      timing: {
        retrievalMs: retrievalTiming.retrievalMs,
        rerankMs: retrievalTiming.rerankMs,
        llmMs: answerResult.timing.llmMs,
        totalMs: totalTime,
      },
      usage: answerResult.usage,
    });
  } catch (error: any) {
    console.error('Query error:', error);
    res.status(500).json({ error: error.message || 'Failed to process query' });
  }
}
