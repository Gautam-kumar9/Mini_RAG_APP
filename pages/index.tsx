import { useState, useEffect } from 'react';
import Head from 'next/head';

interface Citation {
  index: number;
  content: string;
  source: string;
  title?: string;
  position: number;
  rerankScore: number;
}

interface QueryResponse {
  answer: string;
  citations: Citation[];
  timing: {
    retrievalMs: number;
    rerankMs: number;
    llmMs: number;
    totalMs: number;
  };
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCost: number;
  };
}

export default function Home() {
  const [uploadMode, setUploadMode] = useState<'text' | 'file'>('file');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState('');
  const [title, setTitle] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [queryResult, setQueryResult] = useState<QueryResponse | null>(null);
  const [docCount, setDocCount] = useState(0);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setDocCount(data.count);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploadStatus('');

    try {
      let res;
      
      if (uploadMode === 'file' && file) {
        // File upload
        const formData = new FormData();
        formData.append('file', file);
        if (title) formData.append('title', title);
        
        res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
      } else {
        // Text upload
        res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, source, title }),
        });
      }

      const data = await res.json();

      if (res.ok) {
        setUploadStatus(
          `✓ Success! Created ${data.stats.chunksCreated} chunks (${data.stats.totalTokens} tokens, ~$${data.stats.estimatedCost.toFixed(6)}, ${data.stats.processingTime}ms)`
        );
        setText('');
        setFile(null);
        setSource('');
        setTitle('');
        fetchStats();
      } else {
        setUploadStatus(`✗ Error: ${data.error}`);
      }
    } catch (error: any) {
      setUploadStatus(`✗ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setQueryResult(null);

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (res.ok) {
        setQueryResult(data);
      } else {
        setQueryResult({
          answer: `Error: ${data.error}`,
          citations: [],
          timing: { retrievalMs: 0, rerankMs: 0, llmMs: 0, totalMs: 0 },
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, estimatedCost: 0 },
        });
      }
    } catch (error: any) {
      setQueryResult({
        answer: `Error: ${error.message}`,
        citations: [],
        timing: { retrievalMs: 0, rerankMs: 0, llmMs: 0, totalMs: 0 },
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, estimatedCost: 0 },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Mini RAG App</title>
        <meta name="description" content="RAG application with retrieval and reranking" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Mini RAG App</h1>
            <p className="text-gray-600">Upload documents, ask questions, get cited answers</p>
            <p className="text-sm text-gray-500 mt-2">Documents in database: {docCount}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">📄 Upload Document</h2>
              
              {/* Mode Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                    uploadMode === 'file'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  📎 Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('text')}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                    uploadMode === 'text'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  📝 Paste Text
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                {uploadMode === 'file' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select File (PDF, TXT, DOCX) *
                      </label>
                      <input
                        type="file"
                        accept=".txt,.pdf,.docx,.doc"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      {file && (
                        <p className="text-sm text-gray-600 mt-1">
                          Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Document Text *
                      </label>
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Paste your document text here..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Source Name *
                      </label>
                      <input
                        type="text"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., document.txt, article.pdf"
                        required
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title (optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Document title"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Processing...' : 'Upload & Process'}
                </button>
              </form>

              {uploadStatus && (
                <div className={`mt-4 p-3 rounded-md text-sm ${
                  uploadStatus.startsWith('✓') 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {uploadStatus}
                </div>
              )}
            </div>

            {/* Query Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">🔍 Ask Question</h2>
              <form onSubmit={handleQuery} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Question
                  </label>
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ask a question about your documents..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Searching...' : 'Get Answer'}
                </button>
              </form>
            </div>
          </div>

          {/* Results Section */}
          {queryResult && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">💡 Answer</h2>
              
              <div className="prose max-w-none mb-6">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {queryResult.answer}
                </p>
              </div>

              {/* Timing & Cost */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-md">
                <div>
                  <p className="text-xs text-gray-500">Retrieval</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {queryResult.timing.retrievalMs}ms
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Reranking</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {queryResult.timing.rerankMs}ms
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">LLM</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {queryResult.timing.llmMs}ms
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Time</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {queryResult.timing.totalMs}ms
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tokens</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {queryResult.usage.totalTokens}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Est. Cost</p>
                  <p className="text-sm font-semibold text-gray-800">
                    ${queryResult.usage.estimatedCost.toFixed(6)}
                  </p>
                </div>
              </div>

              {/* Citations */}
              {queryResult.citations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">📚 Sources</h3>
                  <div className="space-y-3">
                    {queryResult.citations.map((citation) => (
                      <div
                        key={citation.index}
                        className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                            {citation.index}
                          </span>
                          <div className="flex-grow">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium text-gray-800">
                                  {citation.title || citation.source}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {citation.source} • Chunk {citation.position + 1} • Score: {citation.rerankScore.toFixed(3)}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {citation.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
