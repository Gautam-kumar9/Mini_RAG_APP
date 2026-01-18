import type { NextApiRequest, NextApiResponse } from 'next';
import { getDocumentCount } from '@/lib/vectorStore';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const count = await getDocumentCount();
    res.status(200).json({ count });
  } catch (error: any) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message || 'Failed to get stats' });
  }
}
