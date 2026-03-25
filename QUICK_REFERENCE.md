# Frontrunner Frontend - Quick Reference Guide

## File Locations

```
src/
├── app/
│   ├── layout.tsx              Main layout with navbar
│   ├── page.tsx                Home page (hub)
│   ├── globals.css             Styles & fonts
│   └── audit/[id]/page.tsx     Detail page
├── components/
│   ├── InputForm.tsx           Audit form
│   ├── Dashboard.tsx           Results display
│   ├── SwotAnalysis.tsx        SWOT grid
│   ├── AuditHistory.tsx        Audit list
│   └── ui/Badge.tsx            Badge component
├── lib/utils.ts                Helper functions
└── types/index.ts              Type definitions
```

## Component Quick Reference

| Component | File | Purpose |
|-----------|------|---------|
| **InputForm** | `components/InputForm.tsx` | Create new audit - org info, platforms, competitors |
| **Dashboard** | `components/Dashboard.tsx` | Display results - metrics, platforms, SWOT, recommendations |
| **SwotAnalysis** | `components/SwotAnalysis.tsx` | 2x2 SWOT grid display |
| **AuditHistory** | `components/AuditHistory.tsx` | List saved audits - view/delete actions |
| **Badge** | `components/ui/Badge.tsx` | Reusable badge/pill component |

## Color Codes

```
Navy:      text-ms-navy,      bg-ms-navy      (#00476C)
OceanBlue: text-ms-oceanBlue, bg-ms-oceanBlue (#217CA1)
Gold:      text-ms-gold,      bg-ms-gold      (#A38D31)
Gray:      text-ms-gray                       (#5A5B5D)
LightGray: text-ms-lightGray                  (#A4A7A9)
SkyBlue:   text-ms-skyBlue,   bg-ms-skyBlue   (#8BC6E8)
```

## Common Patterns

### Button Styling
```tsx
// Primary (Navy)
<button className="bg-ms-navy text-white px-4 py-2 rounded-lg hover:bg-opacity-90">
  Action
</button>

// Secondary (OceanBlue border)
<button className="border-2 border-ms-oceanBlue text-ms-oceanBlue hover:bg-ms-oceanBlue hover:text-white">
  Secondary
</button>

// Gold accent
<button className="bg-ms-gold text-white hover:bg-opacity-90">
  Accent
</button>
```

### Card Styling
```tsx
<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
  Content here
</div>
```

### Text Styling
```tsx
// Heading
<h1 className="text-3xl font-bold text-ms-navy">Title</h1>

// Secondary text
<p className="text-ms-gray">Description</p>

// Accent
<span className="text-ms-gold font-semibold">Important</span>
```

## State Management (page.tsx)

```typescript
type PageState = 'home' | 'loading' | 'results' | 'history'

// Home: Show InputForm
// Loading: Show spinner + progress
// Results: Show Dashboard
// History: Show AuditHistory
```

## Form Data Structure

```typescript
{
  orgName: "Acme Corp",
  website: "https://acme.com",
  industry: "Technology",
  campaignGoals: "Increase engagement",
  platforms: [
    { name: "Facebook", url: "https://facebook.com/acme" },
    { name: "Twitter/X", url: "https://twitter.com/acme" }
  ],
  competitors: ["CompetitorA", "CompetitorB"]
}
```

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/analyze` | Create new audit |
| GET | `/api/audit/list` | List audits |
| GET | `/api/audit/{id}` | Get audit details |
| PUT | `/api/audit/{id}` | Update audit |
| DELETE | `/api/audit/{id}` | Delete audit |

## Key Props

### InputForm
```tsx
<InputForm 
  onSubmit={(data) => {}} 
  isLoading={false}
/>
```

### Dashboard
```tsx
<Dashboard
  organizationName="Acme"
  industry="Tech"
  executiveSummary="..."
  metrics={[...]}
  platforms={[...]}
  competitors={[...]}
  swot={{...}}
  recommendations={[...]}
  onNewAudit={() => {}}
  onSave={() => {}}
  isEditing={false}
  onEditChange={(field, value) => {}}
/>
```

### AuditHistory
```tsx
<AuditHistory 
  onSelectAudit={(id) => {}}
/>
```

## Import Statements

```tsx
// Icons
import { Target, Globe, Link, Plus, Trash2, Search, Loader2, ChevronDown, CheckSquare } from 'lucide-react';

// Components
import InputForm from '@/components/InputForm';
import Dashboard from '@/components/Dashboard';
import AuditHistory from '@/components/AuditHistory';
import SwotAnalysis from '@/components/SwotAnalysis';
import { Badge } from '@/components/ui/Badge';

// Types
import type { AuditFormData, AuditResult, PlatformMetrics } from '@/types';

// Utils
import { formatNumber, formatDate, isValidUrl } from '@/lib/utils';
```

## Responsive Classes

```tsx
// Grid responsive
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

// Flexbox responsive
<div className="flex flex-col md:flex-row gap-4">

// Hide on mobile
<span className="hidden sm:inline">Desktop only</span>

// Show on mobile
<span className="sm:hidden">Mobile only</span>
```

## Loading States

```tsx
// Loading spinner
<Loader2 className="h-8 w-8 animate-spin text-ms-oceanBlue" />

// Disabled button while loading
<button disabled={isLoading} className="disabled:opacity-50">
  {isLoading ? 'Loading...' : 'Submit'}
</button>
```

## Edit Mode (Dashboard & Detail Page)

```tsx
{isEditing ? (
  <textarea
    value={executiveSummary}
    onChange={(e) => onEditChange('executiveSummary', e.target.value)}
  />
) : (
  <p>{executiveSummary}</p>
)}
```

## Form Validation Example

```tsx
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!formData.orgName || !formData.website || selectedPlatforms.length === 0) {
    alert('Please fill required fields');
    return;
  }
  
  onSubmit(submissionData);
};
```

## API Call Pattern

```tsx
const handleSubmit = async (data) => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Failed');
    const result = await response.json();
    setAuditResult(result);
  } catch (error) {
    alert('Error: ' + error.message);
  }
};
```

## Environment Variables Needed

None in frontend - all API calls are to relative paths (`/api/*`)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Tips

1. Components are already optimized with React.memo where needed
2. Use `useCallback` for event handlers if you extend functionality
3. Images should be lazy-loaded if added
4. Recharts is already imported for charts

## Debugging

```tsx
// Console logging
console.log('Debug:', data);

// React DevTools
// Use browser React DevTools extension to inspect component state

// Network tab
// Check Network tab in DevTools to see API calls
```

## Mobile Testing

```bash
# Test on mobile breakpoints
npm run dev
# Then visit http://localhost:3000 and use DevTools to toggle device modes
```

## Accessibility Checklist

- ✅ Semantic HTML (buttons, links, headings)
- ✅ Proper heading hierarchy (h1, h2, h3)
- ✅ Button click handlers
- ✅ Focus states via Tailwind
- ⏳ ARIA labels (can be added as needed)
- ⏳ Keyboard navigation (works by default)

## Common Tasks

### Add New Platform
Edit `InputForm.tsx` - add to `PLATFORMS` array:
```tsx
const PLATFORMS = ['Facebook', 'Twitter/X', 'Instagram', 'TikTok', 'LinkedIn', 'YouTube', 'NEW_PLATFORM'];
```

### Add New Metric
Pass new metric to Dashboard `metrics` prop:
```tsx
metrics={[
  { label: 'Total Followers', value: 50000, source: 'Twitter API' },
  { label: 'Avg Engagement', value: '3.5%', source: 'Calculated' },
  { label: 'Your New Metric', value: 'value', source: 'Source' }
]}
```

### Customize Colors
Edit `tailwind.config.ts`:
```tsx
colors: {
  'ms-navy': '#00476C',
  // ... modify here
}
```

### Add New Icon
Import from lucide-react:
```tsx
import { YourNewIcon } from 'lucide-react';

<YourNewIcon className="h-5 w-5" />
```

## Deployment

```bash
# Build for production
npm run build

# Start production server
npm start

# Deploy to Vercel
vercel deploy
```

## File Size Reference

- InputForm.tsx: ~330 lines
- Dashboard.tsx: ~310 lines
- SwotAnalysis.tsx: ~120 lines
- AuditHistory.tsx: ~140 lines
- page.tsx: ~240 lines
- layout.tsx: ~65 lines
- audit/[id]/page.tsx: ~220 lines

**Total: ~1,900 lines of production code**

---

**Status:** ✅ Ready for development

**Last Updated:** 2026-03-25

