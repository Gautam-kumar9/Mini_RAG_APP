import type { NextApiRequest, NextApiResponse } from 'next';
import { chunkText, generateEmbeddings, estimateTokens, estimateEmbeddingCost } from '@/lib/embeddings';
import { upsertDocuments } from '@/lib/vectorStore';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export const config = {
  api: {
    bodyParser: false, // Disable default body parser for file uploads
  },
};

// Extract text from different file types
async function extractTextFromFile(filePath: string, mimetype: string): Promise<string> {
  if (mimetype === 'text/plain' || filePath.endsWith('.txt')) {
    return fs.readFileSync(filePath, 'utf-8');
  } else if (mimetype === 'application/pdf' || filePath.endsWith('.pdf')) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } else if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    filePath.endsWith('.docx')
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } else {
    throw new Error(`Unsupported file type: ${mimetype}`);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const contentType = req.headers['content-type'] || '';
    let text: string;
    let source: string;
    let title: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const form = formidable({
        maxFileSize: 10 * 1024 * 1024, // 10MB
        keepExtensions: true,
      });

      const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>(
        (resolve, reject) => {
          form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            else resolve([fields, files]);
          });
        }
      );

      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      source = file.originalFilename || 'unknown';
      title = Array.isArray(fields.title) ? fields.title[0] : fields.title;

      // Extract text from file
      text = await extractTextFromFile(file.filepath, file.mimetype || '');

      // Clean up temp file
      fs.unlinkSync(file.filepath);
    } else {
      // Handle JSON text upload
      const { text: bodyText, source: bodySource, title: bodyTitle } = req.body;

      if (!bodyText || !bodySource) {
        return res.status(400).json({ error: 'Text and source are required' });
      }

      text = bodyText;
      source = bodySource;
      title = bodyTitle;
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Document contains no text' });
    }

    const startTime = Date.now();

    // Step 1: Chunk the text
    const chunks = chunkText(text, source, title);

    if (chunks.length === 0) {
      return res.status(400).json({ error: 'No valid chunks created from text' });
    }

    // Step 2: Generate embeddings
    const embeddings = await generateEmbeddings(chunks.map(c => c.content));

    // Step 3: Prepare documents for upsert
    const documents = chunks.map((chunk, idx) => ({
      content: chunk.content,
      embedding: embeddings[idx],
      metadata: chunk.metadata,
    }));

    // Step 4: Upsert to vector database
    await upsertDocuments(documents);

    const totalTime = Date.now() - startTime;

    // Calculate stats
    const totalTokens = chunks.reduce((sum, chunk) => sum + estimateTokens(chunk.content), 0);
    const cost = estimateEmbeddingCost(totalTokens);

    res.status(200).json({
      success: true,
      stats: {
        chunksCreated: chunks.length,
        totalTokens,
        estimatedCost: cost,
        processingTime: totalTime,
      },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to process document' });
  }
}
