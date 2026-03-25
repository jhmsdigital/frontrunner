'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Edit2, RotateCcw } from 'lucide-react';
import Dashboard from '@/components/Dashboard';

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

export default function AuditDetailPage() {
  const params = useParams();
  const router = useRouter();
  const auditId = params.id as string;

  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<AuditResult>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    fetchAudit();
  }, [auditId]);

  const fetchAudit = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/audit/${auditId}`);
      if (!response.ok) throw new Error('Failed to fetch audit');
      const data = await response.json();
      setAudit(data);
      setEditedData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (field: string, value: any) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveChanges = async () => {
    if (!audit || !editedData) return;

    try {
      setIsSaving(true);
      const response = await fetch(`/api/audit/${auditId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedData),
      });

      if (!response.ok) throw new Error('Failed to save changes');

      const updatedAudit = await response.json();
      setAudit(updatedAudit);
      setEditedData(updatedAudit);
      setIsEditing(false);
      alert('Changes saved successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerateAnalysis = async () => {
    if (!audit) return;

    if (!confirm('This will regenerate the analysis. Continue?')) {
      return;
    }

    try {
      setIsRegenerating(true);
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auditId,
          regenerate: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to regenerate analysis');

      const result = await response.json();
      setAudit(result);
      setEditedData(result);
      alert('Analysis regenerated successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to regenerate analysis');
    } finally {
      setIsRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-ms-oceanBlue mx-auto" />
          <p className="text-ms-gray">Loading audit...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border-2 border-red-300 bg-red-50 p-6 text-center">
        <p className="font-semibold text-red-800">Error loading audit</p>
        <p className="text-sm text-red-700 mt-1">{error}</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 text-sm text-red-600 hover:underline font-medium"
        >
          Return to Home
        </button>
      </div>
    );
  }

  if (!audit) return null;

  return (
    <div className="space-y-6">
      {/* Edit Mode Toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 rounded-lg border-2 border-ms-oceanBlue bg-white px-4 py-2 font-semibold text-ms-oceanBlue hover:bg-ms-oceanBlue hover:text-white transition-colors"
        >
          <Edit2 className="h-5 w-5" />
          <span>{isEditing ? 'Exit Edit Mode' : 'Edit Audit'}</span>
        </button>

        {isEditing && (
          <>
            <button
              onClick={handleRegenerateAnalysis}
              disabled={isRegenerating}
              className="flex items-center gap-2 rounded-lg border-2 border-ms-gold bg-white px-4 py-2 font-semibold text-ms-gold hover:bg-ms-gold hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRegenerating && <Loader2 className="h-5 w-5 animate-spin" />}
              {!isRegenerating && <RotateCcw className="h-5 w-5" />}
              <span>Regenerate</span>
            </button>

            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-ms-navy px-4 py-2 font-semibold text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {isSaving && <Loader2 className="h-5 w-5 animate-spin" />}
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </>
        )}
      </div>

      {/* Dashboard with edit mode */}
      {(editedData as any).organizationName && (
        <Dashboard
          organizationName={(editedData as any).organizationName || audit.organizationName}
          industry={(editedData as any).industry || audit.industry}
          executiveSummary={(editedData as any).executiveSummary || audit.executiveSummary}
          metrics={(editedData as any).metrics || audit.metrics}
          platforms={(editedData as any).platforms || audit.platforms}
          competitors={(editedData as any).competitors || audit.competitors}
          swot={(editedData as any).swot || audit.swot}
          recommendations={(editedData as any).recommendations || audit.recommendations}
          sources={(editedData as any).sources || audit.sources}
          isEditing={isEditing}
          onEditChange={handleEditChange}
        />
      )}
    </div>
  );
}
