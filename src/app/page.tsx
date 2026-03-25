'use client';

import React, { useState } from 'react';
import { Loader2, Zap, BarChart3, Users, Target } from 'lucide-react';
import InputForm from '@/components/InputForm';
import Dashboard from '@/components/Dashboard';
import AuditHistory from '@/components/AuditHistory';

type PageState = 'home' | 'loading' | 'results' | 'history';

const progressMessages = [
  'Analyzing your social media presence...',
  'Examining competitor strategies...',
  'Calculating engagement metrics...',
  'Generating SWOT analysis...',
  'Compiling recommendations...',
];

interface AuditResult {
  id: string;
  organizationName: string;
  industry: string;
  executiveSummary: string;
  metrics: Array<{
    label: string;
    value: string | number;
    source: string;
  }>;
  platforms: Array<{
    platform: string;
    followers: number;
    engagementRate: number;
    url: string;
    postFrequency: string;
    audienceGrowth: string;
  }>;
  competitors: Array<{
    name: string;
    followers: number;
  }>;
  swot: {
    strengths: Array<{ text: string; source: string }>;
    weaknesses: Array<{ text: string; source: string }>;
    opportunities: Array<{ text: string; source: string }>;
    threats: Array<{ text: string; source: string }>;
  };
  recommendations: string[];
  sources: string[];
}

export default function Home() {
  const [pageState, setPageState] = useState<PageState>('home');
  const [progressMessage, setProgressMessage] = useState('');
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);

  const handleFormSubmit = async (formData: any) => {
    setPageState('loading');
    setProgressMessage(progressMessages[0]);

    // Simulate progress message changes
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % progressMessages.length;
      setProgressMessage(progressMessages[messageIndex]);
    }, 2000);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const result = await response.json();
      setAuditResult(result);
      setPageState('results');
    } catch (error) {
      alert('Failed to analyze. Please try again.');
      setPageState('home');
    } finally {
      clearInterval(messageInterval);
    }
  };

  const handleSelectAudit = async (auditId: string) => {
    try {
      const response = await fetch(`/api/audit/${auditId}`);
      if (!response.ok) throw new Error('Failed to fetch audit');
      const result = await response.json();
      setAuditResult(result);
      setSelectedAuditId(auditId);
      setPageState('results');
    } catch (error) {
      alert('Failed to load audit. Please try again.');
    }
  };

  const handleNewAudit = () => {
    setPageState('home');
    setAuditResult(null);
    setSelectedAuditId(null);
  };

  // Home View
  if (pageState === 'home') {
    return (
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold text-ms-navy leading-tight max-w-3xl mx-auto">
            Don't just join the conversation.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ms-oceanBlue to-ms-gold">
              Lead it.
            </span>
          </h1>
          <p className="text-lg text-ms-gray max-w-2xl mx-auto">
            Analyze your brand's social media presence, understand your competitors, and discover actionable insights to amplify your voice in the digital space.
          </p>
        </div>

        {/* Input Form */}
        <div className="max-w-4xl mx-auto w-full">
          <InputForm onSubmit={handleFormSubmit} />
        </div>

        {/* Feature Cards */}
        <div className="grid gap-6 md:grid-cols-3 pt-8">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-ms-oceanBlue text-white">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="mb-2 font-bold text-ms-navy">Comprehensive Analysis</h3>
            <p className="text-sm text-ms-gray">
              Get detailed insights into your social media performance across all platforms with real-time metrics.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-ms-gold text-white">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mb-2 font-bold text-ms-navy">Competitor Benchmarking</h3>
            <p className="text-sm text-ms-gray">
              Compare your audience size, engagement rates, and growth against your competitors.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-ms-skyBlue text-ms-navy">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="mb-2 font-bold text-ms-navy">Actionable Recommendations</h3>
            <p className="text-sm text-ms-gray">
              Receive strategic recommendations to improve your social media presence and reach your goals.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading View
  if (pageState === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-6">
          <div className="inline-block">
            <div className="relative h-24 w-24">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-ms-oceanBlue border-r-ms-gold animate-spin"></div>
              <Zap className="absolute inset-0 m-auto h-10 w-10 text-ms-navy" />
            </div>
          </div>

          <div>
            <p className="text-lg font-semibold text-ms-navy mb-2">
              {progressMessage || 'Analyzing your audit...'}
            </p>
            <p className="text-sm text-ms-gray">This usually takes 30-60 seconds</p>
          </div>

          {/* Progress dots */}
          <div className="flex gap-2 justify-center">
            {progressMessages.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 w-2 rounded-full transition-all ${
                  idx <= progressMessages.indexOf(progressMessage)
                    ? 'bg-ms-oceanBlue w-6'
                    : 'bg-gray-300'
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Results View
  if (pageState === 'results' && auditResult) {
    return (
      <Dashboard
        organizationName={auditResult.organizationName}
        industry={auditResult.industry}
        executiveSummary={auditResult.executiveSummary}
        metrics={auditResult.metrics}
        platforms={auditResult.platforms}
        competitors={auditResult.competitors}
        swot={auditResult.swot}
        recommendations={auditResult.recommendations}
        sources={auditResult.sources}
        onNewAudit={handleNewAudit}
      />
    );
  }

  // History View
  if (pageState === 'history') {
    return (
      <div>
        <button
          onClick={() => setPageState('home')}
          className="mb-6 text-ms-oceanBlue hover:underline font-medium flex items-center gap-2"
        >
          ← Back to Home
        </button>
        <AuditHistory onSelectAudit={handleSelectAudit} />
      </div>
    );
  }

  return null;
}
