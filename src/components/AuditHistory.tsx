'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Trash2, Eye, RefreshCw } from 'lucide-react';

interface AuditRecord {
  id: string;
  organizationName: string;
  industry: string;
  createdAt: string;
  platformCount: number;
}

interface AuditHistoryProps {
  onSelectAudit?: (id: string) => void;
}

export default function AuditHistory({ onSelectAudit }: AuditHistoryProps) {
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/audit/list');
      if (!response.ok) throw new Error('Failed to fetch audits');
      const data = await response.json();
      setAudits(data.audits || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this audit? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/audit/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete audit');
      setAudits(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete audit');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-ms-oceanBlue mx-auto" />
          <p className="text-ms-gray">Loading audit history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border-2 border-red-300 bg-red-50 p-6 text-center">
        <p className="font-semibold text-red-800">Error loading audits</p>
        <p className="text-sm text-red-700 mt-1">{error}</p>
        <button
          onClick={fetchAudits}
          className="mt-4 text-sm text-red-600 hover:underline font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  if (audits.length === 0) {
    return (
      <div className="text-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-12 px-6">
        <p className="text-lg font-semibold text-ms-navy mb-2">No audits yet</p>
        <p className="text-ms-gray">Create your first social media audit to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-ms-navy mb-2">Audit History</h2>
        <p className="text-ms-gray">View and manage your previous audits</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {audits.map(audit => (
          <div
            key={audit.id}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mb-4">
              <h3 className="font-bold text-ms-navy text-lg truncate">{audit.organizationName}</h3>
              <p className="text-sm text-ms-gray">{audit.industry}</p>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Created</span>
                <span className="font-medium text-gray-900">
                  {new Date(audit.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}{' '}
                  <span className="text-ms-lightGray font-normal text-xs">
                    {new Date(audit.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Platforms</span>
                <span className="font-medium text-gray-900">{audit.platformCount}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onSelectAudit?.(audit.id)}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-ms-oceanBlue px-3 py-2 font-medium text-white hover:bg-opacity-90 transition-opacity text-sm"
              >
                <Eye className="h-4 w-4" />
                <span>View</span>
              </button>
              <button
                onClick={() => handleDelete(audit.id)}
                className="flex items-center justify-center rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-red-700 hover:bg-red-100 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
