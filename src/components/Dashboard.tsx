'use client';

import React, { useRef } from 'react';
import { FileDown, Plus, Save } from 'lucide-react';
import SwotAnalysis from './SwotAnalysis';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MetricsCard {
  label: string;
  value: string | number;
  source: string;
  icon?: React.ReactNode;
}

interface PlatformMetrics {
  platform: string;
  followers: number;
  engagementRate: number;
  url: string;
  postFrequency: string;
  audienceGrowth: string;
}

interface DashboardProps {
  organizationName: string;
  industry: string;
  executiveSummary: string;
  metrics: MetricsCard[];
  platforms: PlatformMetrics[];
  competitors: Array<{ name: string; followers: number }>;
  swot: {
    strengths: Array<{ text: string; source: string }>;
    weaknesses: Array<{ text: string; source: string }>;
    opportunities: Array<{ text: string; source: string }>;
    threats: Array<{ text: string; source: string }>;
  };
  recommendations: string[];
  sources?: string[];
  onNewAudit?: () => void;
  onSave?: () => void;
  isEditing?: boolean;
  onEditChange?: (field: string, value: any) => void;
}

export default function Dashboard({
  organizationName,
  industry,
  executiveSummary,
  metrics,
  platforms,
  competitors,
  swot,
  recommendations,
  sources = [],
  onNewAudit,
  onSave,
  isEditing = false,
  onEditChange,
}: DashboardProps) {
  const dashboardRef = useRef<HTMLDivElement>(null);

  const handlePdfExport = () => {
    // Using html2pdf or print fallback
    if (typeof window !== 'undefined') {
      const content = dashboardRef.current;
      if (content) {
        const printWindow = window.open('', '', 'width=800,height=600');
        if (printWindow) {
          printWindow.document.write(content.innerHTML);
          printWindow.document.close();
          printWindow.print();
        }
      }
    }
  };

  const comparisonData = [
    {
      name: organizationName,
      followers: metrics[0]?.value || 0,
    },
    ...competitors.slice(0, 3).map(c => ({
      name: c.name,
      followers: c.followers,
    })),
  ];

  return (
    <div ref={dashboardRef} className="space-y-8">
      {/* Header */}
      <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-ms-navy">{organizationName}</h1>
            <div className="mt-2 flex items-center gap-3">
              <span className="inline-block rounded-full bg-ms-oceanBlue px-3 py-1 text-sm font-semibold text-white">
                {industry}
              </span>
              <span className="text-sm text-ms-gray">
                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handlePdfExport}
              className="flex items-center gap-2 rounded-lg border-2 border-ms-gold bg-white px-4 py-2 font-semibold text-ms-gold hover:bg-ms-gold hover:text-white transition-colors"
            >
              <FileDown className="h-5 w-5" />
              <span className="hidden sm:inline">Export PDF</span>
              <span className="sm:hidden">Export</span>
            </button>
            {onNewAudit && (
              <button
                onClick={onNewAudit}
                className="flex items-center gap-2 rounded-lg border-2 border-ms-oceanBlue bg-white px-4 py-2 font-semibold text-ms-oceanBlue hover:bg-ms-oceanBlue hover:text-white transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline">New Audit</span>
              </button>
            )}
            {onSave && (
              <button
                onClick={onSave}
                className="flex items-center gap-2 rounded-lg bg-ms-navy px-4 py-2 font-semibold text-white hover:bg-opacity-90 transition-opacity"
              >
                <Save className="h-5 w-5" />
                <span className="hidden sm:inline">Save</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Executive Summary Banner */}
      <div className="overflow-hidden rounded-lg shadow-sm">
        <div className="from-ms-navy to-ms-oceanBlue relative bg-gradient-to-r px-6 py-8 text-white">
          <div className="absolute top-0 right-0 opacity-10 text-6xl font-bold">→</div>
          <h2 className="mb-2 text-xl font-bold">Executive Summary</h2>
          {isEditing ? (
            <textarea
              value={executiveSummary}
              onChange={(e) => onEditChange?.('executiveSummary', e.target.value)}
              className="w-full rounded px-3 py-2 text-gray-900 bg-white bg-opacity-95 text-base"
              rows={4}
            />
          ) : (
            <p className="text-base leading-relaxed">{executiveSummary}</p>
          )}
          <div className="mt-4 h-1 w-24 bg-ms-gold rounded"></div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-ms-navy">Key Metrics</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {metrics.map((metric, idx) => (
            <div
              key={idx}
              className="rounded-lg border-l-4 border-ms-gold bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-semibold text-ms-gray mb-1">{metric.label}</p>
              <p className="text-2xl font-bold text-ms-navy">{metric.value}</p>
              <p className="mt-2 text-xs text-gray-500">Source: {metric.source}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Digital Footprint */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-ms-navy">Digital Footprint</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {platforms.map((platform, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-ms-navy">{platform.platform}</h3>
                <span className="text-xs font-semibold px-2 py-1 rounded bg-ms-skyBlue text-ms-navy">
                  ACTIVE
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-ms-gray font-medium uppercase">Followers</p>
                  <p className="text-xl font-bold text-ms-navy">
                    {(platform.followers / 1000).toFixed(1)}K
                  </p>
                </div>
                <div>
                  <p className="text-xs text-ms-gray font-medium uppercase">Engagement Rate</p>
                  <p className="text-xl font-bold text-ms-gold">{platform.engagementRate.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-xs text-ms-gray font-medium uppercase">Post Frequency</p>
                  <p className="text-sm text-gray-700">{platform.postFrequency}</p>
                </div>
                <div>
                  <p className="text-xs text-ms-gray font-medium uppercase">Audience Growth</p>
                  <p className="text-sm font-semibold text-emerald-600">{platform.audienceGrowth}</p>
                </div>

                {platform.url && (
                  <a
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex text-sm text-ms-oceanBlue hover:underline font-medium mt-2"
                  >
                    Visit Profile →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audience Comparison */}
      {competitors.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-ms-navy">Audience Comparison</h2>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="followers" fill="#217CA1" name="Total Followers" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* SWOT Analysis */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <SwotAnalysis
          strengths={swot.strengths as any}
          weaknesses={swot.weaknesses as any}
          opportunities={swot.opportunities as any}
          threats={swot.threats as any}
          isEditing={isEditing}
        />
      </div>

      {/* Recommendations */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-bold text-ms-navy">Recommendations</h2>
        {isEditing ? (
          <textarea
            value={recommendations.join('\n')}
            onChange={(e) => onEditChange?.('recommendations', e.target.value.split('\n'))}
            className="w-full rounded px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 text-base"
            rows={6}
          />
        ) : (
          <ul className="space-y-3">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="flex gap-3 text-gray-700">
                <span className="flex-shrink-0 mt-1 h-2 w-2 rounded-full bg-ms-gold"></span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* CTA Footer */}
      <div className="rounded-lg bg-gradient-to-r from-ms-navy to-ms-oceanBlue px-6 py-8 text-white text-center shadow-sm">
        <h3 className="mb-2 text-2xl font-bold">Ready for a Complete Audit?</h3>
        <p className="mb-4 text-white text-opacity-90">
          Let Majority Strategies help you unlock your brand's full potential
        </p>
        <a
          href="https://majoritystategies.com"
          className="inline-block rounded-lg bg-ms-gold px-6 py-3 font-bold text-ms-navy hover:bg-opacity-90 transition-opacity"
        >
          Contact Majority Strategies
        </a>
      </div>

      {/* Sources Footer */}
      {sources.length > 0 && (
        <div className="text-xs text-ms-gray">
          <p className="font-semibold mb-2">Data Sources:</p>
          <ul className="list-disc list-inside space-y-1">
            {sources.map((source, idx) => (
              <li key={idx}>{source}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
