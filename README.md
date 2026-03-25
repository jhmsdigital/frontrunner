# Frontrunner - Social Media Audit Tool

A modern Next.js 14 application for comprehensive social media auditing, built for Majority Strategies.

## Overview

Frontrunner helps organizations analyze their social media presence, benchmark against competitors, and receive actionable recommendations for growth. The tool provides insights into audience metrics, engagement rates, platform performance, and strategic opportunities.

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Features

### 🏠 Home Page
- Hero section: "Don't just join the conversation. Lead it."
- Comprehensive audit creation form
- Feature highlights with icons

### 📋 Audit Creation (InputForm)
- Organization details (name, website, industry)
- Multi-select platforms (Facebook, Twitter/X, Instagram, TikTok, LinkedIn, YouTube)
- Platform-specific URL inputs
- Competitor management (up to 5 competitors)
- Full form validation

### 📊 Results Dashboard
- Executive summary with gradient banner
- Key performance metrics
- Digital footprint analysis by platform
- Audience comparison chart (Recharts)
- SWOT analysis grid
- Strategic recommendations
- Export to PDF
- Contact CTA

### 📝 Audit History
- Browse previously saved audits
- Quick view/delete actions
- Organization name, industry, date, platform count
- Full audit list management

### ✏️ Edit Mode
- Modify executive summary
- Update SWOT analysis items
- Edit recommendations
- Regenerate analysis with new data
- Save changes to database

## Project Structure

```
frontrunner/
├── public/                     # Static assets
├── src/
│   ├── app/
│   │   ├── api/               # API routes (backend)
│   │   ├── audit/[id]/        # Audit detail page
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── InputForm.tsx      # Audit form
│   │   ├── Dashboard.tsx      # Results display
│   │   ├── SwotAnalysis.tsx   # SWOT grid
│   │   ├── AuditHistory.tsx   # Audit list
│   │   └── ui/Badge.tsx       # Badge component
│   ├── lib/
│   │   ├── utils.ts           # Utilities
│   │   ├── supabase.ts        # Supabase client
│   │   ├── gemini.ts          # Gemini integration
│   │   └── platforms/         # Platform APIs
│   └── types/index.ts         # Type definitions
├── tailwind.config.ts         # Tailwind configuration
└── postcss.config.js          # PostCSS configuration
```

## Majority Strategies Branding

### Colors
- **Navy** (#00476C) - Primary color for headings and key elements
- **Ocean Blue** (#217CA1) - Secondary color for buttons and links
- **Gold** (#A38D31) - Accent color for highlights
- **Gray** (#5A5B5D) - Text and secondary content
- **Light Gray** (#A4A7A9) - Borders and subtle elements
- **Sky Blue** (#8BC6E8) - Light accents for badges

### Font
- **Sofia Sans** - Google Fonts, configured as default

### Design
- Clean, professional interface
- Responsive mobile-first design
- Tailwind CSS for all styling
- Subtle shadows and borders
- Lucide React icons throughout

## Components

### InputForm
Form for creating new audits with organization info, platform selection, and competitor management.

**Props:**
```typescript
interface InputFormProps {
  onSubmit: (data: AuditFormData) => void;
  isLoading?: boolean;
}
```

### Dashboard
Results display with metrics, platforms, SWOT analysis, and recommendations.

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

### SwotAnalysis
2x2 grid displaying strengths, weaknesses, opportunities, and threats.

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

### AuditHistory
List of saved audits with view and delete actions.

**Props:**
```typescript
interface AuditHistoryProps {
  onSelectAudit?: (id: string) => void;
}
```

## API Integration

The frontend expects these endpoints:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/analyze` | Create new audit |
| GET | `/api/audit/list` | List all audits |
| GET | `/api/audit/{id}` | Get audit details |
| PUT | `/api/audit/{id}` | Update audit |
| DELETE | `/api/audit/{id}` | Delete audit |

## Type Definitions

```typescript
// Form submission
interface AuditFormData {
  orgName: string;
  website: string;
  industry: string;
  campaignGoals?: string;
  platforms: { name: string; url: string }[];
  competitors: string[];
}

// Audit result
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
}

// Platform metrics
interface PlatformMetrics {
  platform: string;
  followers: number;
  engagementRate: number;
  url: string;
  postFrequency: string;
  audienceGrowth: string;
}
```

See `src/types/index.ts` for all type definitions.

## Utilities

Helper functions in `src/lib/utils.ts`:

- `formatNumber(num)` - Format with K/M/B suffixes
- `formatDate(date)` - Format date string
- `formatDateTime(date)` - Format date and time
- `isValidUrl(url)` - Validate URL format
- `getDomainFromUrl(url)` - Extract domain
- `generateId()` - Generate random ID
- `truncateText(text, max)` - Truncate with ellipsis
- `getEngagementColor(percent)` - Color for engagement rate
- `formatEngagementRate(rate)` - Format as percentage

## Styling

### Tailwind CSS

All styling uses Tailwind CSS with custom colors. No inline styles.

### Custom Colors

```tsx
// Available throughout the app
className="text-ms-navy"      // Navy text
className="bg-ms-oceanBlue"   // Ocean blue background
className="border-ms-gold"    // Gold border
className="text-ms-gray"      // Gray text
```

### Responsive Design

Mobile-first approach with breakpoints:

```tsx
// 1 column on mobile, 2 on tablet, 3 on desktop
className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"

// Hidden on mobile, visible on desktop
className="hidden sm:inline"

// Visible on mobile, hidden on desktop
className="sm:hidden"
```

## Icons

Using lucide-react icons throughout:

```tsx
import { Target, Globe, Link, Plus, Trash2, Search, Loader2, ... } from 'lucide-react';

<Target className="h-5 w-5" />
```

## State Management

Main page uses React hooks for state:

```typescript
type PageState = 'home' | 'loading' | 'results' | 'history'

// Home - InputForm
// Loading - Spinner with progress
// Results - Dashboard
// History - AuditHistory
```

## Error Handling

- Try/catch blocks on all API calls
- User-friendly error messages
- Loading states for async operations
- Confirmation dialogs for destructive actions
- Input validation on forms

## Accessibility

- Semantic HTML throughout
- Proper heading hierarchy
- Button and link elements
- ARIA labels where needed
- Focus states via Tailwind
- Keyboard navigation support

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Client-side form validation
- Debounced search/input
- Optimized re-renders
- Lazy loading support (when added)
- Minimal bundle size
- Recharts for efficient charting

## Documentation

- **COMPONENT_DOCS.md** - Detailed component documentation
- **FRONTEND_SETUP.md** - Setup and integration guide
- **FRONTEND_FILES_MANIFEST.md** - Complete file listing
- **QUICK_REFERENCE.md** - Quick lookup guide

## Development

### Adding a Component

1. Create file in `src/components/`
2. Add 'use client' directive if interactive
3. Import and type with TypeScript
4. Use Tailwind for styling
5. Export and use in pages

### Adding a Page

1. Create in `src/app/` directory
2. Use dynamic routes with `[slug]` for parameters
3. Wrap with layout automatically
4. TypeScript-first approach

### Adding Styles

Use Tailwind CSS classes:

```tsx
<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
  Styled content
</div>
```

## Testing

### Manual Testing

1. Home page loads correctly
2. Form validation works
3. Submit creates audit (loading state)
4. Results dashboard displays all sections
5. Edit mode allows modifications
6. Audit history lists saved audits
7. Detail page loads and edits saved audit

### Browser DevTools

- React DevTools for component inspection
- Network tab to verify API calls
- Console for error checking

## Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

### Manual

```bash
npm run build
npm start
```

## Environment Variables

None required in frontend. All API calls use relative paths.

## Dependencies

Core packages:
- `next` - Next.js framework
- `react` - React library
- `typescript` - Type safety
- `tailwindcss` - Styling
- `lucide-react` - Icons
- `recharts` - Charts

Optional packages:
- `html2pdf` - PDF export (can be added)

## Troubleshooting

### Styles not showing
```bash
npm run dev
# Restart dev server to rebuild Tailwind
```

### Font not loading
Check `src/app/globals.css` has Google Fonts import

### API errors
Verify backend routes exist at `/api/*`

### Icons missing
Ensure `lucide-react` is installed

## Future Enhancements

- PDF export with html2pdf.js
- Real-time data sync with WebSockets
- Advanced filtering in audit history
- Bulk audit export
- Custom chart exports
- Shareable audit links
- Audit comparison view
- Email notifications
- Dashboard customization

## Contributing

1. Create feature branch
2. Make changes with TypeScript types
3. Test thoroughly
4. Submit PR with description

## License

Proprietary - Majority Strategies

## Support

For issues or questions, contact the development team.

---

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Last Updated:** 2026-03-25

All frontend components complete and ready for backend integration.
