# Frontrunner Frontend Components Documentation

## Overview

The Frontrunner Next.js 14 app is a social media audit tool for Majority Strategies. The frontend is built with React, Tailwind CSS, and TypeScript.

## Custom Branding

### Colors (Defined in `tailwind.config.ts`)
- **ms-navy** (#00476C) - Primary dark color for headings and key elements
- **ms-oceanBlue** (#217CA1) - Secondary color for links, buttons, and accents
- **ms-gray** (#5A5B5D) - Text and secondary content
- **ms-gold** (#A38D31) - Accent color for highlights and CTAs
- **ms-lightGray** (#A4A7A9) - Light borders and subtle elements
- **ms-skyBlue** (#8BC6E8) - Light accent for status badges

### Font
- **Sofia Sans** - Loaded via Google Fonts in `globals.css`

## File Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with navigation bar
│   ├── page.tsx                # Main home page with state management
│   ├── globals.css             # Global styles with font imports
│   ├── audit/
│   │   └── [id]/
│   │       └── page.tsx        # Individual audit detail page
│   └── api/                    # Backend API routes (separate)
├── components/
│   ├── InputForm.tsx           # Form for audit creation
│   ├── Dashboard.tsx           # Results dashboard component
│   ├── SwotAnalysis.tsx        # SWOT analysis grid
│   ├── AuditHistory.tsx        # List of previous audits
│   └── ui/
│       └── Badge.tsx           # Reusable badge component
├── lib/
│   ├── utils.ts                # Helper utility functions
│   ├── supabase.ts             # Supabase client (existing)
│   ├── gemini.ts               # Gemini API integration (existing)
│   └── platforms/              # Platform-specific integrations (existing)
└── types/
    └── index.ts                # TypeScript type definitions
```

## Component Details

### 1. **layout.tsx** - Root Layout
The main layout component that wraps all pages.

**Features:**
- Navigation bar with Frontrunner logo (F square + text + subtitle)
- Meta tags for SEO
- Global styling with min-h-screen

**Props:** None (automatic from Next.js)

**Usage:**
```tsx
// Automatically wraps all pages via Next.js
```

---

### 2. **page.tsx** - Home Page
Main page with multi-view state management.

**State Management:**
```typescript
type PageState = 'home' | 'loading' | 'results' | 'history'
```

**Views:**
- **Home:** Hero section + InputForm + feature cards
- **Loading:** Animated spinner with rotating progress messages
- **Results:** Dashboard component showing audit results
- **History:** AuditHistory component listing previous audits

**Props:** None (client component)

**Key Functions:**
- `handleFormSubmit(formData)` - Calls `/api/analyze` endpoint
- `handleSelectAudit(id)` - Loads an audit from history
- `handleNewAudit()` - Resets to home view

---

### 3. **InputForm.tsx** - Audit Input Form
Comprehensive form for creating a new audit.

**Props:**
```typescript
interface InputFormProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}
```

**Form Sections:**
1. **Organization Information**
   - Organization name (required)
   - Website URL (required)
   - Industry dropdown (required)
   - Campaign goals (optional)

2. **Social Media Platforms**
   - Multi-select checkboxes (Facebook, Twitter/X, Instagram, TikTok, LinkedIn, YouTube)
   - Conditional URL inputs for each selected platform

3. **Competitors**
   - Add up to 5 competitors
   - Remove individual competitors
   - Real-time input validation

**Submitted Data:**
```typescript
{
  orgName: string,
  website: string,
  industry: string,
  campaignGoals?: string,
  platforms: [{ platform: string, url: string }],
  competitors: string[]
}
```

**Icons Used:**
- Target, Globe, Link, Plus, Trash2, Search, Loader2, ChevronDown, CheckSquare

---

### 4. **Dashboard.tsx** - Results Dashboard
Displays comprehensive audit results.

**Props:**
```typescript
interface DashboardProps {
  organizationName: string;
  industry: string;
  executiveSummary: string;
  metrics: MetricsCard[];
  platforms: PlatformMetrics[];
  competitors: Competitor[];
  swot: SwotAnalysis;
  recommendations: string[];
  sources?: string[];
  onNewAudit?: () => void;
  onSave?: () => void;
  isEditing?: boolean;
  onEditChange?: (field: string, value: any) => void;
}
```

**Sections:**
1. **Header** - Org name, industry badge, action buttons
2. **Executive Summary Banner** - Navy to oceanBlue gradient with gold accent
3. **Key Metrics** - 3 cards with metrics and data source badges
4. **Digital Footprint** - Platform cards with followers, engagement rate, post frequency
5. **Audience Comparison** - Horizontal bar chart using Recharts
6. **SWOT Analysis** - 2x2 grid using SwotAnalysis component
7. **Recommendations** - Bulleted list with gold accent points
8. **CTA Footer** - "Contact Majority Strategies" call-to-action
9. **Sources Footer** - Data source attribution

**Editable Fields (when isEditing=true):**
- Executive Summary (textarea)
- Recommendations (textarea)
- SWOT items (via SwotAnalysis)

**Actions:**
- Export PDF (uses window.print)
- New Audit
- Save Changes (when editing)

---

### 5. **SwotAnalysis.tsx** - SWOT Grid
Displays SWOT analysis in a 2x2 grid.

**Props:**
```typescript
interface SwotAnalysisProps {
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
  onEdit?: (section: string, items: SwotItem[]) => void;
  isEditing?: boolean;
}
```

**Item Structure:**
```typescript
interface SwotItem {
  text: string;
  source: 'VERIFIED' | 'CALCULATED' | 'BENCHMARK' | 'OBSERVED';
}
```

**Colors:**
- Strengths - Emerald background
- Weaknesses - Rose background
- Opportunities - Amber background
- Threats - Slate background

**Each quadrant shows:**
- Header with section title
- List of items
- Source badge per item

---

### 6. **AuditHistory.tsx** - Audit List
Lists previously saved audits with view/delete actions.

**Props:**
```typescript
interface AuditHistoryProps {
  onSelectAudit?: (id: string) => void;
}
```

**States:**
- Loading - Spinner with message
- Error - Error message with retry button
- Empty - "No audits yet" message
- Loaded - Grid of audit cards

**Card Contents:**
- Organization name
- Industry
- Creation date
- Platform count
- View button (calls onSelectAudit)
- Delete button (with confirmation)

**API Calls:**
- `GET /api/audit/list` - Fetch all audits
- `DELETE /api/audit/{id}` - Delete an audit

---

### 7. **audit/[id]/page.tsx** - Audit Detail Page
View and edit a saved audit.

**Route:** `/audit/[id]`

**Props:**
- `id` - Audit ID from URL params

**States:**
- Loading - Spinner
- Error - Error message with back button
- Loaded - Full dashboard with edit mode toggle

**Features:**
- **Edit Mode Toggle** - Switch between view and edit modes
- **Regenerate Button** - Calls `/api/analyze` to regenerate analysis
- **Save Button** - Calls `PUT /api/audit/{id}` to save changes

**Editable Fields:**
- Executive summary
- SWOT items
- Recommendations

**API Calls:**
- `GET /api/audit/{id}` - Fetch audit details
- `PUT /api/audit/{id}` - Save changes
- `POST /api/analyze` - Regenerate analysis

---

### 8. **Badge.tsx** - Badge Component
Reusable badge/pill component.

**Props:**
```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
  className?: string;
}
```

**Variants:**
- default - Gray
- success - Green
- danger - Red
- warning - Yellow
- info - Blue

**Usage:**
```tsx
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
```

---

## Type Definitions (types/index.ts)

```typescript
// Main audit form data
interface AuditFormData {
  orgName: string;
  website: string;
  industry: string;
  campaignGoals?: string;
  platforms: { name: string; url: string }[];
  competitors: string[];
}

// Platform metrics for results
interface PlatformMetrics {
  platform: string;
  followers: number;
  engagementRate: number;
  url: string;
  postFrequency: string;
  audienceGrowth: string;
}

// SWOT item
interface SwotItem {
  text: string;
  source: 'VERIFIED' | 'CALCULATED' | 'BENCHMARK' | 'OBSERVED';
}

// Full audit result
interface AuditResult {
  id: string;
  organizationName: string;
  industry: string;
  executiveSummary: string;
  metrics: MetricsCard[];
  platforms: PlatformMetrics[];
  competitors: Competitor[];
  swot: SwotAnalysis;
  recommendations: string[];
  sources: string[];
  createdAt?: string;
  updatedAt?: string;
}
```

---

## Utility Functions (lib/utils.ts)

- `formatNumber(num)` - Format numbers with K/M/B suffixes
- `formatDate(date)` - Format date to readable string
- `formatDateTime(date)` - Format date and time
- `isValidUrl(url)` - Validate URL format
- `getDomainFromUrl(url)` - Extract domain from URL
- `generateId()` - Generate random ID
- `truncateText(text, maxLength)` - Truncate text with ellipsis
- `getEngagementColor(percentage)` - Get color class for engagement rate
- `formatEngagementRate(rate)` - Format engagement rate as percentage string

---

## Styling Notes

### Tailwind Setup
- Custom colors defined in `tailwind.config.ts`
- Sofia Sans font configured as default sans-serif
- Responsive design with `sm:`, `md:`, `lg:` breakpoints
- Dark mode support available via `dark:` prefix

### Common Patterns

**Button Styling:**
```tsx
// Primary (Navy)
className="bg-ms-navy px-4 py-2 text-white hover:bg-opacity-90"

// Secondary (OceanBlue)
className="border-2 border-ms-oceanBlue text-ms-oceanBlue hover:bg-ms-oceanBlue hover:text-white"

// Accent (Gold)
className="bg-ms-gold text-white hover:bg-opacity-90"
```

**Card Styling:**
```tsx
className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md"
```

**Text Colors:**
```tsx
// Headings
className="text-ms-navy font-bold"

// Secondary text
className="text-ms-gray"

// Accents
className="text-ms-gold"
```

---

## API Integration

The frontend communicates with backend APIs:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/analyze` | POST | Create new audit |
| `/api/audit/list` | GET | List all audits |
| `/api/audit/{id}` | GET | Fetch audit details |
| `/api/audit/{id}` | PUT | Update audit |
| `/api/audit/{id}` | DELETE | Delete audit |

---

## Dependencies

- `next` - Next.js framework
- `react` - React library
- `recharts` - Charts library for Audience Comparison
- `lucide-react` - Icon library
- `tailwindcss` - Styling
- `typescript` - Type safety

---

## Best Practices

1. **Use 'use client' directive** - All interactive components have this
2. **Use fetch() for API calls** - Not axios or other libraries
3. **Type everything** - Import types from @/types
4. **Responsive first** - Design works on mobile, tablet, desktop
5. **Tailwind only** - No inline styles
6. **Semantic HTML** - Use proper heading levels, buttons, etc.
7. **Accessibility** - ARIA labels, proper contrast, keyboard navigation

---

## Future Enhancements

- Export to PDF with `html2pdf.js` library
- Real-time data synchronization with Supabase
- Advanced filtering in AuditHistory
- Bulk export of multiple audits
- Custom chart exports
- Shareable audit links
- Audit comparison view
