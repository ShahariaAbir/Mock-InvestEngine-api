# Market Engine Dashboard 📈

A production-ready Next.js 16 real-time investment market engine with live dashboard, automated Vercel cron jobs, and public API for external integrations.

![Build Status](https://img.shields.io/badge/build-success-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Vercel](https://img.shields.io/badge/Vercel-Ready-blue)
![Supabase](https://img.shields.io/badge/Supabase-Configured-green)

## 🎯 Features

- **Real-time Dashboard** - Live investment portfolio tracking with 5 pre-configured companies
- **Auto-Initialization** - Generates profit/loss data on first website visit automatically
- **Enhanced API v2.0** - Detailed profit/loss history with last 10 transactions per company
- **Embedded Widget** - Single-line script to add market engine to any external website
- **Automated Market Updates** - Vercel Cron jobs update market data every 5 minutes
- **Public API** - RESTful endpoints for external app integration (`/api/market-data`, `/api/market-engine/initialize`, `/api/market-engine/update`)
- **Market Logs** - Track all profit/loss transactions with timestamps and exact times
- **Company Time Biases** - Hardcoded GMT+6 windows make each company more likely to profit or lose during specific daily periods
- **Countdown Timer** - Visual indicator showing time until next market update
- **Test API Button** - Built-in API testing tool in dashboard
- **Dark Theme** - Professional hacker-style interface with Tailwind CSS
- **Row Level Security** - Supabase RLS policies for data protection
- **Production Ready** - Fully configured for Vercel deployment


## ⏰ Company Profit/Loss Time Biases

Market updates use hardcoded company schedules from `lib/market-schedule.ts`. Edit the `COMPANY_MARKET_SCHEDULES` section to change company names, GMT+6 profit windows, GMT+6 loss windows, and chance percentages without adding any database table.

Current configured companies:

| Company | Mostly Profit Time (GMT+6) | Profit Chance | Mostly Loss Time (GMT+6) | Loss Chance |
| --- | --- | ---: | --- | ---: |
| CocaCola | 08:00-11:30 | 82% | 19:00-21:00 | 68% |
| Nvadia | 13:00-16:30 | 88% | 02:00-04:30 | 72% |
| Microsoft | 10:00-13:00 | 80% | 22:00-23:59 | 65% |
| Apple | 16:00-18:30 | 84% | 05:00-07:00 | 70% |
| Samsung | 20:00-23:00 | 78% | 11:30-13:00 | 66% |

Outside configured windows, the engine uses the default 70% profit / 30% loss chance.

## 🚀 Quick Start

### 1. Setup Supabase

```bash
# Create project at https://supabase.com
# Copy your credentials:
# - Project URL → NEXT_PUBLIC_SUPABASE_URL
# - Anon Key → NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 2. Configure Environment

Create `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Run SQL Setup

Execute in Supabase SQL Editor (in order):
```bash
sql/01_create_companies_table.sql
sql/02_create_market_logs_table.sql
sql/03_seed_companies.sql
```

### 4. Local Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Open http://localhost:3000
```

### 5. Deploy to Vercel

```bash
# Option 1: GitHub Integration (Recommended)
# Push to GitHub → Connect to Vercel → Add env vars

# Option 2: Vercel CLI
npm i -g vercel
vercel
# Add environment variables when prompted
```

## 📊 Dashboard Components

### Portfolio Summary
- Total portfolio value across all companies
- Overall return percentage
- Number of active positions

### Company Cards
- Real-time capital tracking
- Volatility factor display
- Status indicator (Profit/Loss/Stable)
- Latest ROI percentage
- Last update timestamp

### Market Logs
- Recent transaction history
- Profit/loss events with amounts
- Timestamps for each transaction
- Auto-refreshing every 10 seconds

### Countdown Timer
- Time until next market update
- Progress bar visualization
- Configurable schedule (default: every 5 minutes)

### Test API Button
- One-click API testing
- Shows response from both endpoints
- Useful for debugging integrations

## 🌐 Embedded Widget for Other Websites

Add the Market Engine to **any website** in just 2 lines:

```html
<script src="https://your-domain.com/market-engine-widget.js"></script>
<div id="market-engine-widget"></div>
```

The widget automatically:
- ✅ Initializes market data on first load
- ✅ Updates every 30 seconds
- ✅ Displays responsive dashboard
- ✅ Provides JavaScript API for custom integrations

**Example:** View the widget demo at `/public/widget-example.html`

**Documentation:** See `WIDGET_INTEGRATION.md` for complete widget guide

## 🔌 API Endpoints

### POST `/api/market-engine/initialize`
Initialize market data with random profit/loss on first website visit.

**Example Usage:**
```javascript
const response = await fetch('/api/market-engine/initialize', {
  method: 'POST'
});
const data = await response.json();
// Returns: { success: true, companies_updated: 5, logs_created: 5 }
```

### GET `/api/market-data`
Returns all companies with current market data and last 10 profit/loss transactions per company.

**Example Usage:**
```javascript
const response = await fetch('/api/market-data');
const data = await response.json();
// data.data contains array of companies
```

**Response:**
```json
{
  "success": true,
  "api_version": "2.0",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "generated_at": {
    "date": "01/15/2024",
    "time": "10:30:45 AM"
  },
  "total_companies": 5,
  "profit_loss_history_limit_per_company": 10,
  "total_profit_loss_history_returned": 50,
  "companies": [
    {
      "id": "uuid",
      "name": "TechCorp Industries",
      "initial_capital": 5000000,
      "current_capital": 5250500.75,
      "volatility_factor": 1.2,
      "last_updated": "2024-01-15T10:25:00.000Z",
      "total_profit_loss": 250500.75,
      "roi_percentage": "5.01",
      "profit_loss_history": [
        {
          "id": "log-uuid",
          "event_type": "profit",
          "roi_percentage": 2.15,
          "capital_before": 5150000,
          "capital_after": 5250500.75,
          "change_amount": 100500.75,
          "timestamp": "2024-01-15T10:25:00.000Z",
          "date": "01/15/2024",
          "time": "10:25:00 AM"
        }
      ]
    }
  ]
}
```

### POST/GET `/api/market-engine/update`
Triggers a manual market update (runs automatically via Vercel cron).

**Response:**
```json
{
  "success": true,
  "message": "Market engine updated 5 companies",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "companies": [...],
  "logs_inserted": 5
}
```

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── market-data/route.ts          # Public market data endpoint
│   │   └── market-engine/update/route.ts # Market update cron endpoint
│   ├── layout.tsx                        # Root layout
│   ├── page.tsx                          # Dashboard
│   └── globals.css                       # Styles
├── components/
│   ├── CompanyCard.tsx                   # Company display component
│   ├── CountdownTimer.tsx                # Update timer
│   ├── MarketLogs.tsx                    # Transaction history
│   └── TestAPIButton.tsx                 # API testing tool
├── lib/
│   └── supabase/
│       └── client.ts                     # Supabase client & types
├── sql/
│   ├── 01_create_companies_table.sql     # Companies table schema
│   ├── 02_create_market_logs_table.sql   # Logs table schema
│   └── 03_seed_companies.sql             # Sample data
├── .env.local                            # Environment variables
├── vercel.json                           # Cron configuration
├── SETUP.md                              # Detailed setup guide
├── DEPLOYMENT_CHECKLIST.md               # Pre-deployment checklist
└── INTEGRATION_GUIDE.md                  # Integration examples
```

## 🔄 How It Works

### Market Update Flow
1. **Cron Trigger** - Vercel cron calls `/api/market-engine/update` every 5 minutes
2. **Calculate ROI** - Random ROI between -5% and +8% (biased toward profit)
3. **Update Capital** - Apply ROI to each company's capital
4. **Store History** - Log all transactions in market_logs table
5. **Dashboard Refresh** - Frontend polls API every 10 seconds

### Companies Included
- **TechCorp Industries** - Volatility: 1.2x, Starting: $5M
- **FinanceFlow Solutions** - Volatility: 0.8x, Starting: $3.5M
- **CloudVerse Systems** - Volatility: 1.5x, Starting: $4.2M
- **DataMind Analytics** - Volatility: 1.1x, Starting: $2.8M
- **QuantumLeap Ventures** - Volatility: 1.3x, Starting: $3.9M

## 🧪 Testing

### Local Testing
```bash
pnpm dev
# Visit http://localhost:3000
# Click "Test Market APIs" button
```

### Cron Job Testing
After deployment to Vercel:
1. Wait 5 minutes for first automatic update
2. Check company values change
3. Verify market logs show transactions
4. Check Vercel dashboard for cron execution logs

## 🔧 Configuration

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   # Public API key
SUPABASE_SERVICE_ROLE_KEY       # Server-side only (optional)
```

### Vercel Cron Schedule
Edit `vercel.json` to change update frequency:
```json
{
  "crons": [
    {
      "path": "/api/market-engine/update",
      "schedule": "*/5 * * * *"  // Every 5 minutes
    }
  ]
}
```

Common schedules:
- `*/1 * * * *` - Every minute
- `*/5 * * * *` - Every 5 minutes (default)
- `0 * * * *` - Every hour
- `0 9 * * *` - Daily at 9 AM

## 📱 Integration with Other Apps

Use in your Money Transfer App or any other application:

```javascript
const BASE_URL = "https://your-deployment.vercel.app";

async function getMarketData() {
  const response = await fetch(`${BASE_URL}/api/market-data`);
  const data = await response.json();
  return data.data; // Array of companies
}

// Refresh every 10 seconds
setInterval(getMarketData, 10000);
```

See `INTEGRATION_GUIDE.md` for complete examples and patterns.

## 🐛 Troubleshooting

### Dashboard shows "Configuration Required"
- Verify `.env.local` has correct Supabase credentials
- Run SQL setup files in Supabase
- Check environment variables in Vercel project settings

### Cron jobs not running
- Verify `vercel.json` is in project root
- Deploy to Vercel (cron doesn't run locally)
- Check Vercel dashboard for cron status

### API returns 500 error
- Check Vercel function logs
- Verify Supabase is accessible
- Confirm environment variables are set

## 📚 Documentation

- **API_DOCUMENTATION.md** - Complete API reference with examples (JavaScript, React, TypeScript, Python, cURL)
- **WIDGET_INTEGRATION.md** - Guide to embed widget in external websites
- **SETUP.md** - Detailed setup and deployment instructions
- **DEPLOYMENT_CHECKLIST.md** - Pre-deployment verification checklist
- **INTEGRATION_GUIDE.md** - Integration examples for external apps
- **QUICK_REFERENCE.md** - Quick start and common tasks
- **public/widget-example.html** - Live widget demo with examples

## 🔐 Security

- ✅ Row Level Security enabled on all tables
- ✅ Public read-only access to market data
- ✅ Service role key for internal operations only
- ✅ Environment variables properly secured in Vercel
- ✅ No sensitive data in frontend code

## 📈 Performance

- ✅ Next.js 16 with Turbopack (instant builds)
- ✅ Static page generation for dashboard
- ✅ Dynamic API routes for real-time data
- ✅ Efficient database indexes
- ✅ Frontend caching with SWR patterns
- ✅ Optimized Supabase queries

## 🎓 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Crons](https://vercel.com/docs/crons)
- [Tailwind CSS](https://tailwindcss.com)

## 📝 License

MIT - Use freely in your projects

## 🤝 Support

For issues or questions:
1. Check the documentation files (SETUP.md, INTEGRATION_GUIDE.md)
2. Review Vercel and Supabase documentation
3. Check the troubleshooting section above

---

**Ready to get started? Follow the Quick Start section above or read SETUP.md for detailed instructions.** 🚀

Built with ❤️ using Next.js, Supabase, and Vercel
