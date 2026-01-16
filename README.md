# Parity+ - Upgraded Rate Parity Monitoring Tool

A modern, Navigator-style UI for Distribution and Revenue Managers to monitor and action rate parity issues across OTAs, meta sites, and wholesalers.

## Features

### Dashboard & KPIs
- **Parity Score** displayed as percentage with total violations
- **WLM and R/A Violations** in color-coded KPI cards with trends
- **Trend Graph** showing Parity Score evolution (daily/weekly/monthly/yearly views)
- **OTA vs Meta** separate tracking and visualization

### Hierarchy & Drilldown
- **Flexible Hierarchy**: Brand → Sub Brand → Single Hotel → Channel
- **In-place Drilldowns**: Expandable panels and side drawers for detailed views
- **Context Preservation**: Act on violations without losing dashboard context

### Advanced Filtering
- **Global Filter Bar**: Horizontal filter bar with active filter chips
- **Advanced Filters Drawer**: Comprehensive filtering for:
  - Rate, Room, Board, POS, LOS, Occupancy
  - Date ranges (shop/check-in)
  - Channel, Brand/Sub Brand/Hotel
  - Violation Reason and Severity

### OTA vs Meta & Reasons
- **Separate Tracking**: OTA and Meta sites tracked independently
- **Reasons Section**: Categorized violations with filtering
- **Top Reasons**: Summary of top 3 reasons by impacted revenue/instances

### AI Insights & Alerts
- **Contextual Insights**: AI-generated alerts and recommendations
- **Clickable Insights**: Direct links to filtered drilldown views
- **Severity-based**: Color-coded insights (Critical, High, Medium, Low)

### Reports & Visualization
- **Clean Tables**: Simple, consistent tables with sticky headers
- **Modal/Side-drawer Views**: Reports open from dashboard cards, pre-filtered
- **Column Management**: Show/hide columns as needed
- **Cache & Live**: View cache snapshots or open live sites

### Channel Parity View
- **Grid Layout**: Channel-wise cards showing:
  - Parity score
  - Instances checked
  - Rate and Availability violations
  - Trend indicators (improving/declining/stable)

### Test Bookings
- **Clean Design**: Card/table layout with clear status tags
- **Aggregations**: Total violations, unattended violations, and leakage per wholesaler/OTA
- **Consistent Filters**: Same filter system as main dashboard

### Theme & Visual Style
- **Navigator-style**: Light, modern, card-based UI
- **Left Navigation Rail**: Clear icons and labels
- **Gradient Top Bar**: Blue-purple gradient header
- **Color Coding**: Blue (primary), Green (positive), Red/Orange (negative/critical)

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
parity-plus-upgraded/
├── src/
│   ├── components/
│   │   ├── Layout/          # Layout components (Navigation, GradientBar)
│   │   ├── Dashboard/        # KPI cards, Trend charts
│   │   ├── Filters/          # Filter bar and advanced filters
│   │   ├── AIInsights/       # AI insights panel
│   │   ├── ChannelParity/    # Channel parity grid
│   │   └── Hierarchy/        # Hierarchy drilldown component
│   ├── pages/
│   │   ├── Overview.tsx      # Main dashboard
│   │   ├── Reports.tsx       # Violations reports
│   │   ├── TestBookings.tsx # Test bookings page
│   │   ├── Statistics.tsx   # Statistics and analytics
│   │   └── Settings.tsx     # Configuration settings
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── App.tsx              # Main app component with routing
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## Key Technologies

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Recharts** for data visualization
- **Lucide React** for icons

## Features in Detail

### Dashboard Overview
The main dashboard provides:
- At-a-glance KPIs with trend indicators
- Parity score trend visualization
- AI-generated insights
- Channel parity overview
- Hierarchy drilldown

### Reports
- Filterable violation reports
- Column visibility management
- Cache snapshot viewing
- Direct links to live sites
- Export functionality (CSV/Excel)

### Test Bookings
- Aggregated view by wholesaler/OTA
- Detailed booking information
- Status tracking (Open, Closed by User, Closed by RateGain)
- Violation counts and leakage amounts

### Statistics
- Top hotels by violations
- Top channels by violations
- Severity distribution
- Top violation reasons
- Wholesaler leakage analysis

### Settings
- Severity threshold configuration
- Tolerance percentage settings
- Violation reason management
- User access management
- Security and notification preferences

## Notes

- Currently uses mock data for demonstration
- Replace API calls in components with actual backend integration
- All filters and data are client-side for demo purposes
- Production implementation should include proper error handling, loading states, and API integration

## License

Proprietary - RateGain Travel Technologies



