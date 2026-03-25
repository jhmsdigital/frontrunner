'use client';

import React, { useState } from 'react';
import {
  Target,
  Globe,
  Link,
  Plus,
  Trash2,
  Search,
  Loader2,
  ChevronDown,
  CheckSquare,
} from 'lucide-react';

interface Competitor {
  id: string;
  name: string;
}

interface PlatformInput {
  platform: string;
  url: string;
}

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Retail',
  'Media & Entertainment',
  'Non-Profit',
  'Education',
  'Government',
  'Other',
];

const PLATFORMS = ['Facebook', 'Twitter/X', 'Instagram', 'TikTok', 'LinkedIn', 'YouTube'];

interface InputFormProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export default function InputForm({ onSubmit, isLoading = false }: InputFormProps) {
  const [formData, setFormData] = useState({
    orgName: '',
    website: '',
    industry: '',
    campaignGoals: '',
  });

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [platformUrls, setPlatformUrls] = useState<PlatformInput[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [newCompetitor, setNewCompetitor] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => {
      const updated = prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform];
      
      // Remove URL input for deselected platform
      if (!updated.includes(platform)) {
        setPlatformUrls(prev => prev.filter(p => p.platform !== platform));
      }
      
      return updated;
    });
  };

  const updatePlatformUrl = (platform: string, url: string) => {
    setPlatformUrls(prev => {
      const existing = prev.find(p => p.platform === platform);
      if (existing) {
        return prev.map(p => p.platform === platform ? { ...p, url } : p);
      }
      return [...prev, { platform, url }];
    });
  };

  const addCompetitor = () => {
    if (newCompetitor.trim() && competitors.length < 5) {
      setCompetitors(prev => [
        ...prev,
        { id: Date.now().toString(), name: newCompetitor },
      ]);
      setNewCompetitor('');
    }
  };

  const removeCompetitor = (id: string) => {
    setCompetitors(prev => prev.filter(c => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.orgName || !formData.website || !formData.industry || selectedPlatforms.length === 0) {
      alert('Please fill in all required fields and select at least one platform.');
      return;
    }

    const submissionData = {
      ...formData,
      platforms: selectedPlatforms.map(p => ({
        name: p,
        url: platformUrls.find(pu => pu.platform === p)?.url || '',
      })),
      competitors: competitors.map(c => c.name),
    };

    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 rounded-lg bg-white p-8 shadow-sm border border-gray-200">
      {/* Organization Info Section */}
      <div className="space-y-6">
        <h2 className="flex items-center space-x-2 text-xl font-bold text-ms-navy">
          <Target className="h-6 w-6" />
          <span>Organization Information</span>
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Organization Name */}
          <div>
            <label className="block text-sm font-semibold text-ms-navy mb-2">
              Organization Name *
            </label>
            <input
              type="text"
              name="orgName"
              value={formData.orgName}
              onChange={handleInputChange}
              placeholder="Enter your organization name"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-ms-oceanBlue focus:outline-none focus:ring-1 focus:ring-ms-oceanBlue"
              required
            />
          </div>

          {/* Website URL */}
          <div>
            <label className="block text-sm font-semibold text-ms-navy mb-2">
              Website URL *
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 h-5 w-5 text-ms-gray" />
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
                className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-gray-900 placeholder-gray-500 focus:border-ms-oceanBlue focus:outline-none focus:ring-1 focus:ring-ms-oceanBlue"
                required
              />
            </div>
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-semibold text-ms-navy mb-2">
              Industry *
            </label>
            <div className="relative">
              <select
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 appearance-none focus:border-ms-oceanBlue focus:outline-none focus:ring-1 focus:ring-ms-oceanBlue"
                required
              >
                <option value="">Select an industry...</option>
                {INDUSTRIES.map(ind => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-ms-gray pointer-events-none" />
            </div>
          </div>

          {/* Campaign Goals */}
          <div>
            <label className="block text-sm font-semibold text-ms-navy mb-2">
              Campaign Goals
            </label>
            <input
              type="text"
              name="campaignGoals"
              value={formData.campaignGoals}
              onChange={handleInputChange}
              placeholder="e.g., Increase engagement, Build brand awareness"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-ms-oceanBlue focus:outline-none focus:ring-1 focus:ring-ms-oceanBlue"
            />
          </div>
        </div>
      </div>

      {/* Platforms Section */}
      <div className="space-y-4">
        <h2 className="flex items-center space-x-2 text-xl font-bold text-ms-navy">
          <Link className="h-6 w-6" />
          <span>Social Media Platforms *</span>
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {PLATFORMS.map(platform => (
            <button
              key={platform}
              type="button"
              onClick={() => togglePlatform(platform)}
              className={`flex items-center space-x-2 rounded-lg border-2 px-4 py-3 font-medium transition-colors ${
                selectedPlatforms.includes(platform)
                  ? 'border-ms-oceanBlue bg-blue-50 text-ms-navy'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              <CheckSquare className={`h-5 w-5 ${selectedPlatforms.includes(platform) ? 'text-ms-gold' : 'text-gray-400'}`} />
              <span>{platform}</span>
            </button>
          ))}
        </div>

        {/* Platform URLs */}
        {selectedPlatforms.length > 0 && (
          <div className="mt-6 space-y-4 rounded-lg bg-gray-50 p-4 border border-gray-200">
            <p className="text-sm font-semibold text-ms-navy">Enter your social media URLs:</p>
            {selectedPlatforms.map(platform => (
              <div key={platform}>
                <label className="block text-sm font-medium text-ms-gray mb-2">
                  {platform} URL
                </label>
                <input
                  type="url"
                  placeholder={`https://${platform.toLowerCase().replace(/\s+/g, '')}.com/yourprofile`}
                  value={platformUrls.find(p => p.platform === platform)?.url || ''}
                  onChange={(e) => updatePlatformUrl(platform, e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-ms-oceanBlue focus:outline-none focus:ring-1 focus:ring-ms-oceanBlue"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Competitors Section */}
      <div className="space-y-4">
        <h2 className="flex items-center space-x-2 text-xl font-bold text-ms-navy">
          <Search className="h-6 w-6" />
          <span>Competitors (Optional)</span>
        </h2>

        <p className="text-sm text-ms-gray">Add up to 5 competitors for comparison analysis</p>

        <div className="flex gap-2">
          <input
            type="text"
            value={newCompetitor}
            onChange={(e) => setNewCompetitor(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCompetitor())}
            placeholder="Enter competitor name"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-ms-oceanBlue focus:outline-none focus:ring-1 focus:ring-ms-oceanBlue"
            disabled={competitors.length >= 5}
          />
          <button
            type="button"
            onClick={addCompetitor}
            disabled={competitors.length >= 5 || !newCompetitor.trim()}
            className="flex items-center space-x-2 rounded-lg bg-ms-oceanBlue px-4 py-2 font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>

        {competitors.length > 0 && (
          <div className="space-y-2">
            {competitors.map(competitor => (
              <div
                key={competitor.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 border border-gray-200"
              >
                <span className="text-sm font-medium text-gray-900">{competitor.name}</span>
                <button
                  type="button"
                  onClick={() => removeCompetitor(competitor.id)}
                  className="text-ms-gray hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 rounded-lg bg-ms-navy px-6 py-3 font-bold text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              <span>Generate Analysis</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
