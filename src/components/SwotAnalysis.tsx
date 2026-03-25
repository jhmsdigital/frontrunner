'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';

interface SwotItem {
  text: string;
  source: string;
}

interface SwotAnalysisProps {
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
  onEdit?: (section: 'strengths' | 'weaknesses' | 'opportunities' | 'threats', items: SwotItem[]) => void;
  isEditing?: boolean;
}

const getSourceColor = (source: string): string => {
  const colors: Record<string, string> = {
    VERIFIED: 'bg-green-100 text-green-800',
    'api-verified': 'bg-green-100 text-green-800',
    CALCULATED: 'bg-blue-100 text-blue-800',
    calculated: 'bg-blue-100 text-blue-800',
    BENCHMARK: 'bg-purple-100 text-purple-800',
    benchmark: 'bg-purple-100 text-purple-800',
    OBSERVED: 'bg-gray-100 text-gray-800',
    observation: 'bg-gray-100 text-gray-800',
  };
  return colors[source] || 'bg-gray-100 text-gray-800';
};

const quadrants = [
  {
    key: 'strengths' as const,
    title: 'Strengths',
    color: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    headerColor: 'bg-emerald-500',
    items: [] as SwotItem[],
  },
  {
    key: 'weaknesses' as const,
    title: 'Weaknesses',
    color: 'bg-rose-50',
    borderColor: 'border-rose-200',
    headerColor: 'bg-rose-500',
    items: [] as SwotItem[],
  },
  {
    key: 'opportunities' as const,
    title: 'Opportunities',
    color: 'bg-amber-50',
    borderColor: 'border-amber-200',
    headerColor: 'bg-amber-500',
    items: [] as SwotItem[],
  },
  {
    key: 'threats' as const,
    title: 'Threats',
    color: 'bg-slate-50',
    borderColor: 'border-slate-200',
    headerColor: 'bg-slate-500',
    items: [] as SwotItem[],
  },
];

export default function SwotAnalysis({
  strengths,
  weaknesses,
  opportunities,
  threats,
  onEdit,
  isEditing = false,
}: SwotAnalysisProps) {
  const quads = [
    { ...quadrants[0], items: strengths },
    { ...quadrants[1], items: weaknesses },
    { ...quadrants[2], items: opportunities },
    { ...quadrants[3], items: threats },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-ms-navy mb-2">SWOT Analysis</h3>
        <p className="text-ms-gray">Strategic analysis of your brand's strengths, weaknesses, opportunities, and threats</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {quads.map(quad => (
          <div
            key={quad.key}
            className={`rounded-lg border-2 ${quad.borderColor} ${quad.color} p-6`}
          >
            {/* Header */}
            <div className={`${quad.headerColor} -mx-6 -mt-6 rounded-t-md px-6 py-3 mb-4`}>
              <h4 className="text-lg font-bold text-white">{quad.title}</h4>
            </div>

            {/* Items */}
            <div className="space-y-3">
              {quad.items.length > 0 ? (
                quad.items.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">{item.text}</p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getSourceColor(item.source)}`}>
                        {item.source}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No items identified</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
