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

      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 mb-3 animate-pulse">
              ✨ Mini RAG App
            </h1>
            <p className="text-lg text-gray-300 mb-2">
              Intelligent Document Search & Question Answering
            </p>
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full">
              <p className="text-white font-semibold">📚 {docCount} documents loaded</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Upload Section */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700 hover:border-cyan-500 transition-all duration-300">
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-6">📄 Upload Document</h2>
              
              {/* Mode Tabs */}
              <div className="flex gap-2 mb-6 bg-gray-700 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all duration-300 ${
                    uploadMode === 'file'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  📎 Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('text')}
                  className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all duration-300 ${
                    uploadMode === 'text'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  📝 Paste Text
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-5">
                {uploadMode === 'file' ? (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-cyan-400 mb-3">
                        Select File (PDF, TXT, DOCX) *
                      </label>
                      <input
                        type="file"
                        accept=".txt,.pdf,.docx,.doc"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="w-full px-4 py-3 border-2 border-dashed border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-gray-800 text-white hover:border-cyan-400 transition-colors"
                        required
                      />
                      {file && (
                        <div className="mt-3 p-3 bg-cyan-500 bg-opacity-10 border border-cyan-500 rounded-lg">
                          <p className="text-sm text-cyan-300 font-semibold">
                            ✓ Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-cyan-400 mb-3">
                        Document Text *
                      </label>
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full h-32 px-4 py-3 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-gray-800 text-white placeholder-gray-500 hover:border-cyan-400 transition-colors resize-none"
                        placeholder="Paste your document text here..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-cyan-400 mb-3">
                        Source Name *
                      </label>
                      <input
                        type="text"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-gray-800 text-white placeholder-gray-500 hover:border-cyan-400 transition-colors"
                        placeholder="e.g., document.txt, article.pdf"
                        required
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-3">
                    Title (optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-gray-800 text-white placeholder-gray-500 hover:border-cyan-400 transition-colors"
                    placeholder="Document title"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 font-bold transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Processing...
                    </span>
                  ) : 'Upload & Process'}
                </button>
              </form>

              {uploadStatus && (
                <div className={`mt-4 p-4 rounded-lg text-sm font-semibold border-2 animate-in fade-in ${
                  uploadStatus.startsWith('✓') 
                    ? 'bg-green-500 bg-opacity-10 text-green-300 border-green-500' 
                    : 'bg-red-500 bg-opacity-10 text-red-300 border-red-500'
                }`}>
                  {uploadStatus}
                </div>
              )}
            </div>

            {/* Query Section */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700 hover:border-purple-500 transition-all duration-300">
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 mb-6">🔍 Ask Question</h2>
              <form onSubmit={handleQuery} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-purple-400 mb-3">
                    Your Question
                  </label>
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full h-32 px-4 py-3 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-800 text-white placeholder-gray-500 hover:border-purple-400 transition-colors resize-none"
                    placeholder="Ask a question about your documents..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-4 rounded-lg hover:from-purple-600 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 font-bold transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Searching...
                    </span>
                  ) : 'Get Answer'}
                </button>
              </form>
            </div>
          </div>

          {/* Results Section */}
          {queryResult && (
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700 border-opacity-50 animate-in fade-in slide-in-from-bottom">
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-cyan-500 mb-6">💡 Answer</h2>
              
              <div className="prose prose-invert max-w-none mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
                <p className="text-gray-100 leading-relaxed whitespace-pre-wrap text-lg">
                  {queryResult.answer}
                </p>
              </div>

              {/* Timing & Cost */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-4 rounded-lg border border-blue-700">
                  <p className="text-xs text-blue-300 font-semibold">⚡ Retrieval</p>
                  <p className="text-2xl font-bold text-blue-100 mt-2">
                    {queryResult.timing.retrievalMs}<span className="text-sm">ms</span>
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-900 to-purple-800 p-4 rounded-lg border border-purple-700">
                  <p className="text-xs text-purple-300 font-semibold">🔄 Reranking</p>
                  <p className="text-2xl font-bold text-purple-100 mt-2">
                    {queryResult.timing.rerankMs}<span className="text-sm">ms</span>
                  </p>
                </div>
                <div className="bg-gradient-to-br from-pink-900 to-pink-800 p-4 rounded-lg border border-pink-700">
                  <p className="text-xs text-pink-300 font-semibold">🤖 LLM</p>
                  <p className="text-2xl font-bold text-pink-100 mt-2">
                    {queryResult.timing.llmMs}<span className="text-sm">ms</span>
                  </p>
                </div>
                <div className="bg-gradient-to-br from-cyan-900 to-cyan-800 p-4 rounded-lg border border-cyan-700">
                  <p className="text-xs text-cyan-300 font-semibold">⏱️ Total</p>
                  <p className="text-2xl font-bold text-cyan-100 mt-2">
                    {queryResult.timing.totalMs}<span className="text-sm">ms</span>
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-900 to-green-800 p-4 rounded-lg border border-green-700">
                  <p className="text-xs text-green-300 font-semibold">📊 Tokens</p>
                  <p className="text-2xl font-bold text-green-100 mt-2">
                    {queryResult.usage.totalTokens}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-orange-900 to-orange-800 p-4 rounded-lg border border-orange-700">
                  <p className="text-xs text-orange-300 font-semibold">💰 Est. Cost</p>
                  <p className="text-2xl font-bold text-orange-100 mt-2">
                    ${queryResult.usage.estimatedCost.toFixed(6)}
                  </p>
                </div>
              </div>

              {/* Citations */}
              {queryResult.citations.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 mb-6">📚 Sources</h3>
                  <div className="space-y-4">
                    {queryResult.citations.map((citation, idx) => (
                      <div
                        key={citation.index}
                        className="group bg-gradient-to-r from-gray-800 to-gray-700 border-2 border-gray-600 rounded-xl p-6 hover:border-orange-500 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <div className="flex items-start gap-4">
                          <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                            {citation.index}
                          </span>
                          <div className="flex-grow">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="font-bold text-lg text-orange-300 group-hover:text-orange-200">
                                  {citation.title || citation.source}
                                </p>
                                <div className="flex gap-3 mt-2 text-xs text-gray-400 flex-wrap">
                                  <span className="bg-gray-700 px-3 py-1 rounded-full">📄 {citation.source}</span>
                                  <span className="bg-gray-700 px-3 py-1 rounded-full">📍 Chunk {citation.position + 1}</span>
                                  <span className="bg-gradient-to-r from-cyan-700 to-blue-700 px-3 py-1 rounded-full text-cyan-200">⭐ {citation.rerankScore.toFixed(3)}</span>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed bg-gray-900 bg-opacity-50 p-3 rounded-lg border border-gray-700">
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
