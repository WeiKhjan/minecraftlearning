'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface VocabWord {
  word: string;
  meaning: string;
  category: string;
}

interface GenerationResult {
  word: string;
  imageUrl?: string;
  error?: string;
}

export default function GenerateImagesPage() {
  const [vocabulary, setVocabulary] = useState<VocabWord[]>([]);
  const [generating, setGenerating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [batchSize, setBatchSize] = useState(5);
  const [totalWords, setTotalWords] = useState(0);

  useEffect(() => {
    // Fetch vocabulary list
    fetch('/api/generate-vocab-batch')
      .then(res => res.json())
      .then(data => {
        setVocabulary(data.vocabulary || []);
        setTotalWords(data.totalWords || 0);
      })
      .catch(err => console.error('Failed to fetch vocabulary:', err));
  }, []);

  const generateBatch = async () => {
    if (generating) return;

    setGenerating(true);

    try {
      const response = await fetch('/api/generate-vocab-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startIndex: currentIndex, count: batchSize }),
      });

      const data = await response.json();

      if (data.results) {
        setResults(prev => [...prev, ...data.results]);
        setCurrentIndex(data.nextIndex || currentIndex + batchSize);
      }
    } catch (error) {
      console.error('Generation error:', error);
    }

    setGenerating(false);
  };

  const generateAll = async () => {
    if (generating) return;

    setGenerating(true);
    let index = currentIndex;

    while (index < totalWords) {
      try {
        const response = await fetch('/api/generate-vocab-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ startIndex: index, count: batchSize }),
        });

        const data = await response.json();

        if (data.results) {
          setResults(prev => [...prev, ...data.results]);
          index = data.nextIndex || index + batchSize;
          setCurrentIndex(index);
        }

        if (!data.nextIndex) break;

        // Wait between batches
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        console.error('Generation error:', error);
        break;
      }
    }

    setGenerating(false);
  };

  const successCount = results.filter(r => r.imageUrl).length;
  const errorCount = results.filter(r => r.error).length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#87CEEB] to-[#5DADE2] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Generate Vocabulary Images</h1>
          <Link href="/admin" className="text-white underline">
            Back to Admin
          </Link>
        </div>

        {/* Stats Card */}
        <div className="pixel-card mb-6">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-gray-800">{totalWords}</p>
              <p className="text-sm text-gray-600">Total Words</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">{successCount}</p>
              <p className="text-sm text-gray-600">Generated</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-red-600">{errorCount}</p>
              <p className="text-sm text-gray-600">Errors</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">{currentIndex}</p>
              <p className="text-sm text-gray-600">Current Index</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="pixel-card mb-6">
          <div className="flex items-center gap-4 mb-4">
            <label className="text-gray-700">
              Batch Size:
              <input
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                min={1}
                max={10}
                className="ml-2 w-20 px-2 py-1 border rounded"
              />
            </label>
            <label className="text-gray-700">
              Start Index:
              <input
                type="number"
                value={currentIndex}
                onChange={(e) => setCurrentIndex(Number(e.target.value))}
                min={0}
                max={totalWords}
                className="ml-2 w-20 px-2 py-1 border rounded"
              />
            </label>
          </div>

          <div className="flex gap-4">
            <button
              onClick={generateBatch}
              disabled={generating || currentIndex >= totalWords}
              className={`pixel-button px-6 py-2 ${generating ? 'opacity-50' : ''}`}
            >
              {generating ? 'Generating...' : `Generate Batch (${batchSize})`}
            </button>
            <button
              onClick={generateAll}
              disabled={generating || currentIndex >= totalWords}
              className={`px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 ${generating ? 'opacity-50' : ''}`}
            >
              Generate All Remaining
            </button>
            <button
              onClick={() => { setResults([]); setCurrentIndex(0); }}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Reset
            </button>
          </div>

          {generating && (
            <div className="mt-4 flex items-center gap-2">
              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="text-gray-600">Generating images... Please wait.</span>
            </div>
          )}
        </div>

        {/* Vocabulary Preview */}
        <div className="pixel-card mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Vocabulary List</h2>
          <div className="max-h-60 overflow-y-auto">
            <div className="grid grid-cols-3 gap-2">
              {vocabulary.map((word, idx) => {
                const result = results.find(r => r.word === word.word);
                return (
                  <div
                    key={word.word}
                    className={`p-2 rounded text-sm ${
                      result?.imageUrl ? 'bg-green-100' :
                      result?.error ? 'bg-red-100' :
                      idx < currentIndex ? 'bg-yellow-100' :
                      'bg-gray-100'
                    }`}
                  >
                    <span className="font-medium">{word.word}</span>
                    <span className="text-gray-500 ml-1">({word.category})</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="pixel-card">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Generated Images</h2>
            <div className="grid grid-cols-4 gap-4">
              {results.map((result, idx) => (
                <div key={idx} className="text-center">
                  {result.imageUrl ? (
                    <div>
                      <img
                        src={result.imageUrl}
                        alt={result.word}
                        className="w-full h-24 object-contain bg-white rounded-lg mb-1"
                      />
                      <p className="text-sm font-medium text-gray-700">{result.word}</p>
                    </div>
                  ) : (
                    <div className="w-full h-24 bg-red-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-red-600 text-xs">{result.word}</p>
                        <p className="text-red-500 text-xs">Error</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
