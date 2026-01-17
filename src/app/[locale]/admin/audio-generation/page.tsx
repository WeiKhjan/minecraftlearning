'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type AudioType = 'syllable_guide' | 'syllable_pronunciation' | 'vocabulary' | 'phrase' | 'dictation' | 'matching';
type Locale = 'ms' | 'zh' | 'en';

interface RegistryInfo {
  total: number;
  byType: Record<string, number>;
  byLocale: Record<string, number>;
}

interface CategoryInfo {
  category: AudioType;
  locale: Locale;
  count: number;
}

interface GenerationResult {
  id: string;
  success: boolean;
  url?: string;
  error?: string;
}

interface GenerationProgress {
  category: AudioType | 'all';
  locale: Locale | 'all';
  processed: number;
  total: number;
  successCount: number;
  errorCount: number;
  nextIndex: number | null;
  estimatedTimeRemaining: string;
  results: GenerationResult[];
}

export default function AudioGenerationPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  const [registryInfo, setRegistryInfo] = useState<RegistryInfo | null>(null);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [batchSize, setBatchSize] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState<AudioType | 'all'>('syllable_guide');
  const [selectedLocale, setSelectedLocale] = useState<Locale | 'all'>('ms');
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [autoGenerate, setAutoGenerate] = useState(false);

  // Fetch registry info on mount
  useEffect(() => {
    fetchRegistryInfo();
  }, []);

  const fetchRegistryInfo = async () => {
    try {
      const response = await fetch('/api/generate-audio-batch');
      const data = await response.json();
      if (data.registry) {
        setRegistryInfo(data.registry);
        setCategories(data.categories || []);
      }
    } catch (error) {
      addLog(`Error fetching registry: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 99)]);
  }, []);

  const generateBatch = async (startIndex: number = 0): Promise<GenerationProgress | null> => {
    try {
      const response = await fetch('/api/generate-audio-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          locale: selectedLocale,
          startIndex,
          count: batchSize,
          dryRun,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        addLog(`Error: ${data.error || 'Generation failed'}`);
        return null;
      }

      setProgress(data);

      // Log results
      const successCount = data.successCount || 0;
      const errorCount = data.errorCount || 0;
      addLog(`Batch complete: ${successCount} success, ${errorCount} errors. Progress: ${data.processed + startIndex}/${data.total}`);

      // Log any errors
      data.results?.filter((r: GenerationResult) => !r.success).forEach((r: GenerationResult) => {
        addLog(`  Error for ${r.id}: ${r.error}`);
      });

      return data;
    } catch (error) {
      addLog(`Error: ${error}`);
      return null;
    }
  };

  const startGeneration = async () => {
    setGenerating(true);
    setProgress(null);
    addLog(`Starting ${dryRun ? '(DRY RUN)' : ''} generation for ${selectedCategory}/${selectedLocale}`);

    let currentIndex = 0;
    let hasMore = true;

    while (hasMore && (autoGenerate || currentIndex === 0)) {
      const result = await generateBatch(currentIndex);

      if (!result) {
        hasMore = false;
        break;
      }

      if (result.nextIndex === null) {
        hasMore = false;
        addLog('Generation complete!');
      } else {
        currentIndex = result.nextIndex;

        // If not auto-generating, stop after first batch
        if (!autoGenerate) {
          addLog(`Paused. Next index: ${currentIndex}. Click "Continue" to proceed.`);
          hasMore = false;
        }
      }
    }

    setGenerating(false);
  };

  const continueGeneration = async () => {
    if (!progress?.nextIndex) return;

    setGenerating(true);
    addLog(`Continuing from index ${progress.nextIndex}...`);

    let currentIndex = progress.nextIndex;
    let hasMore = true;

    while (hasMore && autoGenerate) {
      const result = await generateBatch(currentIndex);

      if (!result) {
        hasMore = false;
        break;
      }

      if (result.nextIndex === null) {
        hasMore = false;
        addLog('Generation complete!');
      } else {
        currentIndex = result.nextIndex;

        if (!autoGenerate) {
          addLog(`Paused. Next index: ${currentIndex}. Click "Continue" to proceed.`);
          hasMore = false;
        }
      }
    }

    setGenerating(false);
  };

  const categoryLabels: Record<AudioType | 'all', string> = {
    syllable_guide: 'Syllable Guides',
    syllable_pronunciation: 'Syllable Pronunciation',
    vocabulary: 'Vocabulary Words',
    phrase: 'Speaking Phrases',
    dictation: 'Dictation Words',
    matching: 'Matching Audio',
    all: 'All Categories',
  };

  const localeLabels: Record<Locale | 'all', string> = {
    ms: 'Malay (ms)',
    zh: 'Chinese (zh)',
    en: 'English (en)',
    all: 'All Locales',
  };

  const getItemCount = (category: AudioType | 'all', loc: Locale | 'all'): number => {
    if (category === 'all' && loc === 'all') {
      return registryInfo?.total || 0;
    }
    if (category === 'all') {
      return categories
        .filter(c => c.locale === loc)
        .reduce((sum, c) => sum + c.count, 0);
    }
    if (loc === 'all') {
      return categories
        .filter(c => c.category === category)
        .reduce((sum, c) => sum + c.count, 0);
    }
    return categories.find(c => c.category === category && c.locale === loc)?.count || 0;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#87CEEB] to-[#5DADE2] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#87CEEB] to-[#5DADE2] flex flex-col">
      {/* Header */}
      <header className="w-full p-4 flex justify-between items-center">
        <Link href={`/${locale}/admin`}>
          <img src="/logo.jpeg" alt="MYLearnt" className="h-12 w-auto rounded-lg" />
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/admin`}
            className="text-white hover:text-gray-200 text-sm underline"
          >
            Back to Admin
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg text-center mb-6">
            Audio Generation
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="pixel-card text-center">
              <p className="text-3xl font-bold text-[#5D8731]">{registryInfo?.total || 0}</p>
              <p className="text-sm text-gray-600">Total Items</p>
            </div>
            <div className="pixel-card text-center">
              <p className="text-3xl font-bold text-[#5DADE2]">
                {Object.keys(registryInfo?.byType || {}).length}
              </p>
              <p className="text-sm text-gray-600">Categories</p>
            </div>
            <div className="pixel-card text-center">
              <p className="text-3xl font-bold text-yellow-500">
                {Object.keys(registryInfo?.byLocale || {}).length}
              </p>
              <p className="text-sm text-gray-600">Locales</p>
            </div>
            <div className="pixel-card text-center">
              <p className="text-3xl font-bold text-purple-500">
                ~{Math.round((registryInfo?.total || 0) * 9 / 60)} min
              </p>
              <p className="text-sm text-gray-600">Est. Time</p>
            </div>
          </div>

          {/* Controls */}
          <div className="pixel-card mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Generation Controls</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Category Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as AudioType | 'all')}
                  className="w-full p-2 border rounded-lg"
                  disabled={generating}
                >
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Locale Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Locale</label>
                <select
                  value={selectedLocale}
                  onChange={(e) => setSelectedLocale(e.target.value as Locale | 'all')}
                  className="w-full p-2 border rounded-lg"
                  disabled={generating}
                >
                  {Object.entries(localeLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Batch Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch Size</label>
                <input
                  type="number"
                  value={batchSize}
                  onChange={(e) => setBatchSize(Math.max(1, Math.min(20, parseInt(e.target.value) || 5)))}
                  className="w-full p-2 border rounded-lg"
                  min={1}
                  max={20}
                  disabled={generating}
                />
              </div>

              {/* Items Count Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Items to Generate</label>
                <div className="w-full p-2 bg-gray-100 rounded-lg font-bold text-center">
                  {getItemCount(selectedCategory, selectedLocale)}
                </div>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex gap-6 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dryRun}
                  onChange={(e) => setDryRun(e.target.checked)}
                  disabled={generating}
                  className="w-4 h-4"
                />
                <span className="text-sm">Dry Run (no actual generation)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoGenerate}
                  onChange={(e) => setAutoGenerate(e.target.checked)}
                  disabled={generating}
                  className="w-4 h-4"
                />
                <span className="text-sm">Auto-continue (process all batches)</span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={startGeneration}
                disabled={generating}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${
                  generating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#5D8731] hover:bg-[#4A6B27] text-white'
                }`}
              >
                {generating ? 'Generating...' : 'Start Generation'}
              </button>

              {progress?.nextIndex && !generating && (
                <button
                  onClick={continueGeneration}
                  className="px-6 py-2 bg-[#5DADE2] hover:bg-[#4A9ACF] text-white rounded-lg font-bold transition-all"
                >
                  Continue from {progress.nextIndex}
                </button>
              )}

              <button
                onClick={() => setLogs([])}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-bold transition-all"
              >
                Clear Logs
              </button>
            </div>
          </div>

          {/* Progress */}
          {progress && (
            <div className="pixel-card mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Progress</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{progress.successCount}</p>
                  <p className="text-sm text-gray-600">Success</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{progress.errorCount}</p>
                  <p className="text-sm text-gray-600">Errors</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {progress.nextIndex || progress.total}/{progress.total}
                  </p>
                  <p className="text-sm text-gray-600">Progress</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{progress.estimatedTimeRemaining}</p>
                  <p className="text-sm text-gray-600">Time Remaining</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-[#5D8731] h-4 rounded-full transition-all"
                  style={{ width: `${((progress.nextIndex || progress.total) / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Logs */}
          <div className="pixel-card">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Logs</h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <p className="text-gray-500">No logs yet. Start generation to see progress.</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="mb-1">{log}</div>
                ))
              )}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="pixel-card mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Category Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 px-3">Category</th>
                    <th className="text-center py-2 px-3">Malay</th>
                    <th className="text-center py-2 px-3">Chinese</th>
                    <th className="text-center py-2 px-3">English</th>
                    <th className="text-center py-2 px-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(['syllable_guide', 'syllable_pronunciation', 'vocabulary', 'phrase', 'dictation', 'matching'] as AudioType[]).map(cat => (
                    <tr key={cat} className="border-b border-gray-100">
                      <td className="py-2 px-3 font-medium">{categoryLabels[cat]}</td>
                      <td className="text-center py-2 px-3">
                        {categories.find(c => c.category === cat && c.locale === 'ms')?.count || 0}
                      </td>
                      <td className="text-center py-2 px-3">
                        {categories.find(c => c.category === cat && c.locale === 'zh')?.count || 0}
                      </td>
                      <td className="text-center py-2 px-3">
                        {categories.find(c => c.category === cat && c.locale === 'en')?.count || 0}
                      </td>
                      <td className="text-center py-2 px-3 font-bold">
                        {getItemCount(cat, 'all')}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-gray-300 font-bold">
                    <td className="py-2 px-3">TOTAL</td>
                    <td className="text-center py-2 px-3">{registryInfo?.byLocale?.ms || 0}</td>
                    <td className="text-center py-2 px-3">{registryInfo?.byLocale?.zh || 0}</td>
                    <td className="text-center py-2 px-3">{registryInfo?.byLocale?.en || 0}</td>
                    <td className="text-center py-2 px-3 text-[#5D8731]">{registryInfo?.total || 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
