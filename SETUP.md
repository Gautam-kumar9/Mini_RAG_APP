## Setup Instructions

This document provides detailed setup instructions for the Mini RAG application.

### Step 1: Supabase Setup

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Go to the SQL Editor and run the contents of `supabase_schema.sql`
4. Note your project URL and service role key from Settings > API

### Step 2: API Keys

1. **OpenAI**: Get your API key from https://platform.openai.com/api-keys
2. **Cohere**: Sign up at https://dashboard.cohere.com and get your API key

### Step 3: Environment Variables

Create a `.env` file (copy from `.env.example`):

```env
OPENAI_API_KEY=sk-proj-...
COHERE_API_KEY=...
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
VECTOR_COLLECTION_NAME=rag_documents
EMBEDDING_DIMENSION=1536
```

### Step 4: Install and Run

```bash
npm install
npm run dev
```

Visit http://localhost:3000

### Step 5: Test the Application

1. **Upload a Document** (choose one method):
   - **File Upload**: Click "Upload File" tab, select a file from `sample-docs/` (e.g., `ai-basics.txt`)
   - **Text Paste**: Click "Paste Text" tab, copy content from a sample file and paste it
2. Wait for the success message showing chunks created
3. Ask a question related to the uploaded content (e.g., "What is quantum computing?")
4. Verify that the answer includes inline citations [1][2]
5. Check that source documents are displayed below the answer

### Troubleshooting

**Database Connection Error:**
- Verify Supabase URL and service role key
- Ensure the SQL schema was executed successfully
- Check that pgvector extension is enabled

**OpenAI API Error:**
- Verify your API key is valid
- Check your OpenAI account has credits
- Ensure no rate limits are being hit

**Cohere API Error:**
- Verify your Cohere API key
- Check you're on a plan that supports reranking
- Free tier has rate limits

**File Upload Error:**
- Ensure file is under 10 MB
- Supported formats: PDF, DOCX, TXT
- For PDFs, ensure they contain text (not just images)
- Check that formidable, pdf-parse, and mammoth packages are installed

**Build Errors:**
- Delete `node_modules` and `.next` folders
- Run `npm install` again
- Ensure Node.js version is 18 or higher

### Production Deployment

For Vercel deployment:

1. Push code to GitHub
2. Import project on Vercel
3. Add all environment variables
4. Deploy!

Make sure to set all environment variables in the Vercel dashboard before deployment.
