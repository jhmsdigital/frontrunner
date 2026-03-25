# Frontend Setup Guide

## Quick Start

### 1. Install Dependencies

The following packages are required. Add them to `package.json` if not already present:

```bash
npm install next react react-dom typescript tailwindcss postcss autoprefixer lucide-react recharts
```

### 2. Configuration Files Setup

Ensure these files are in place:

#### `tailwind.config.ts`
✅ Created with Majority Strategies custom colors:
- ms-navy, ms-oceanBlue, ms-gray, ms-gold, ms-lightGray, ms-skyBlue
- Sofia Sans font configured

#### `postcss.config.js`
Should include:
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

#### `tsconfig.json`
Should have path aliases:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 3. Project Structure

```
frontrunner/
├── public/              # Static assets
├── src/
│   ├── app/
│   │   ├── api/        # Backend API routes
│   │   ├── audit/
│   │   │   └── [id]/   # Dynamic audit detail page
│   │   ├── layout.tsx  # ✅ Root layout
│   │   ├── page.tsx    # ✅ Home page
│   │   └── globals.css # ✅ Global styles
│   ├── components/
│   │   ├── InputForm.tsx      # ✅ Audit form
│   │   ├── Dashboard.tsx      # ✅ Results display
│   │   ├── SwotAnalysis.tsx   # ✅ SWOT grid
│   │   ├── AuditHistory.tsx   # ✅ Audit list
│   │   └── ui/
│   │       └── Badge.tsx      # ✅ Badge component
│   ├── lib/
│   │   ├── utils.ts           # ✅ Helper functions
│   │   ├── supabase.ts        # Backend Supabase client
│   │   ├── gemini.ts          # Backend Gemini integration
│   │   └── platforms/         # Platform integrations
│   └── types/
│       └── index.ts           # ✅ Type definitions
├── COMPONENT_DOCS.md          # ✅ Component documentation
├── FRONTEND_SETUP.md          # ✅ This file
├── package.json
├── tailwind.config.ts         # ✅ Tailwind configuration
├── tsconfig.json
├── next.config.js
└── postcss.config.js
```

## Component Files Created

| File | Purpose | Status |
|------|---------|--------|
| `src/app/layout.tsx` | Root layout with navbar | ✅ |
| `src/app/page.tsx` | Main home page | ✅ |
| `src/app/globals.css` | Global styles & fonts | ✅ |
| `src/app/audit/[id]/page.tsx` | Audit detail page | ✅ |
| `src/components/InputForm.tsx` | Audit creation form | ✅ |
| `src/components/Dashboard.tsx` | Results dashboard | ✅ |
| `src/components/SwotAnalysis.tsx` | SWOT analysis grid | ✅ |
| `src/components/AuditHistory.tsx` | Audit history list | ✅ |
| `src/components/ui/Badge.tsx` | Badge component | ✅ |
| `src/lib/utils.ts` | Utility functions | ✅ |
| `src/types/index.ts` | Type definitions | ✅ |
| `tailwind.config.ts` | Tailwind configuration | ✅ |

## How It Works

### User Flow

1. **Home View** (`page.tsx`)
   - User sees hero section + InputForm
   - Enters organization, website, industry, platforms, competitors
   - Clicks "Generate Analysis"

2. **Loading View** (same page)
   - Animated spinner with rotating progress messages
   - Takes 30-60 seconds for API to process

3. **Results View** (`Dashboard.tsx`)
   - Displays full audit results
   - Shows metrics, platforms, audience comparison, SWOT, recommendations
   - Options to export PDF, create new audit, or save

4. **Audit Detail View** (`audit/[id]/page.tsx`)
   - View saved audit from history
   - Edit mode to modify summary, SWOT, recommendations
   - Save or regenerate analysis

### Data Flow

```
InputForm
    ↓
[user submits]
    ↓
POST /api/analyze
    ↓
[backend processes]
    ↓
Dashboard
    ↓
[optional: edit]
    ↓
PUT /api/audit/{id}
    ↓
Updated Dashboard
```

## API Endpoints Expected

The frontend expects these endpoints to exist in `src/app/api/`:

### `POST /api/analyze`
**Request:**
```json
{
  "orgName": "string",
  "website": "string",
  "industry": "string",
  "campaignGoals": "string",
  "platforms": [{ "name": "string", "url": "string" }],
  "competitors": ["string"]
}
```

**Response:**
```json
{
  "id": "string",
  "organizationName": "string",
  "industry": "string",
  "executiveSummary": "string",
  "metrics": [{ "label": "string", "value": "number", "source": "string" }],
  "platforms": [{ "platform": "string", "followers": "number", ... }],
  "competitors": [{ "name": "string", "followers": "number" }],
  "swot": { "strengths": [], "weaknesses": [], "opportunities": [], "threats": [] },
  "recommendations": ["string"],
  "sources": ["string"]
}
```

### `GET /api/audit/list`
**Response:**
```json
{
  "audits": [
    {
      "id": "string",
      "organizationName": "string",
      "industry": "string",
      "createdAt": "ISO date",
      "platformCount": "number"
    }
  ]
}
```

### `GET /api/audit/{id}`
**Response:** Full `AuditResult` object (same as POST /api/analyze response)

### `PUT /api/audit/{id}`
**Request:** Partial or full `AuditResult` object
**Response:** Updated `AuditResult` object

### `DELETE /api/audit/{id}`
**Response:** 
```json
{ "success": true }
```

## Running the App

```bash
# Development
npm run dev

# Open in browser
# http://localhost:3000
```

## Key Features by Component

### InputForm
- ✅ Organization name, website, industry inputs
- ✅ Platform multi-select with conditional URL inputs
- ✅ Competitor management (add/remove up to 5)
- ✅ Form validation
- ✅ Loading state during submission
- ✅ Lucide icons for visual appeal
- ✅ Responsive design

### Dashboard
- ✅ Header with org info and action buttons
- ✅ Executive summary banner with gradient
- ✅ Key metrics cards with source badges
- ✅ Digital footprint platform cards
- ✅ Recharts bar chart for audience comparison
- ✅ SWOT analysis 2x2 grid
- ✅ Recommendations section
- ✅ CTA footer
- ✅ Edit mode support
- ✅ PDF export (window.print fallback)

### AuditHistory
- ✅ Loads audits from API
- ✅ Card-based grid layout
- ✅ View and delete buttons
- ✅ Loading and error states
- ✅ Empty state message
- ✅ Confirmation before delete

### SwotAnalysis
- ✅ 2x2 grid layout (mobile responsive)
- ✅ Color-coded quadrants
- ✅ Source badges per item
- ✅ Smooth shadows and borders
- ✅ Edit mode support

## Styling System

### Color Usage Examples

```tsx
// Navy headings
<h1 className="text-ms-navy font-bold">Title</h1>

// Ocean blue buttons
<button className="bg-ms-oceanBlue text-white">Action</button>

// Gold accents
<div className="border-l-4 border-ms-gold">
  Premium content
</div>

// Gray secondary text
<p className="text-ms-gray">Secondary info</p>

// Sky blue badges
<span className="bg-ms-skyBlue text-ms-navy">Status</span>
```

### Responsive Breakpoints

```tsx
// Mobile first, then scale up
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {/* Single column on mobile, 2 on tablet, 3 on desktop */}
</div>

// Hide on small screens
<span className="hidden sm:inline">Desktop text</span>

// Show only on mobile
<span className="sm:hidden">Mobile text</span>
```

## Testing the Frontend

### Test Home Page
1. Navigate to http://localhost:3000
2. See hero section with InputForm
3. Try adding competitors and selecting platforms
4. Submit form to trigger loading state

### Test Loading State
1. Submit form
2. Watch spinner with rotating progress messages
3. Should resolve in 30-60 seconds

### Test Results Page
1. After successful analysis, see Dashboard
2. Verify all sections render correctly
3. Test Export PDF button (opens print dialog)
4. Test New Audit button (returns to home)

### Test Audit History
1. Save multiple audits
2. Navigate to history view
3. Click "View" to load audit
4. Test "Delete" with confirmation
5. Verify empty state when all deleted

### Test Edit Mode
1. Open saved audit
2. Click "Edit Audit" button
3. Modify executive summary or recommendations
4. Click "Save Changes"
5. Verify data persists on reload

## Common Issues & Solutions

### Issue: Tailwind colors not showing
**Solution:** Rebuild Tailwind by:
```bash
npm run build
# or in dev mode, restart dev server
npm run dev
```

### Issue: Sofia Sans font not loading
**Solution:** Check `globals.css` has the Google Fonts import at the top

### Issue: API calls failing
**Solution:** Verify backend API routes exist in `src/app/api/`

### Issue: Images/icons not showing
**Solution:** Ensure lucide-react is installed:
```bash
npm install lucide-react
```

## Next Steps

1. ✅ Frontend components created
2. ⏳ Implement backend API routes in `src/app/api/`
3. ⏳ Connect to Supabase for data persistence
4. ⏳ Integrate platform APIs (Meta, Twitter, TikTok, etc.)
5. ⏳ Integrate Gemini API for AI analysis
6. ⏳ Add PDF export with html2pdf.js
7. ⏳ Deploy to Vercel

## Files Ready for Backend Integration

All frontend components are ready. The backend needs to implement:

- `/api/analyze` - Main analysis endpoint
- `/api/audit/list` - Fetch all audits
- `/api/audit/[id]` - Get, update, delete individual audits
- Integration with Supabase for data storage
- Integration with platform APIs for metrics
- Integration with Gemini for AI analysis
