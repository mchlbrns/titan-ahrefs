# 📊 titan-ahrefs — Ahrefs SEO & Keyword Analytics Engine

`titan-ahrefs` is the Ahrefs integration layer, backlink profile monitor, and automated keyword ranking engine for Titan Workspace.

## 🎯 Purpose & Scope

- **Ahrefs API Integration**: Automated fetching of Domain Rating (DR), URL Rating (UR), backlink profiles, and organic keyword positions across managed domains.
- **Competitor & Keyword Intelligence**: Track keyword SERP rankings, search volumes, traffic value, and keyword gaps for sweepstakes casino & gaming niches.
- **Portfolio SEO Monitoring**: Real-time auditing and historical reporting for our 7 managed portfolio domains:
  1. `betsweepsy.com`
  2. `luckytwogrands.com`
  3. `sweepsybet.com`
  4. `goldishsweeps.com`
  5. `luckierbety.com`
  6. `titantreasure.bet`
  7. `titantreasure.casino`

## 📁 Repository Structure

```
titan-ahrefs/
├── README.md               # Overview & quickstart
├── package.json            # Node.js dependencies & scripts
├── src/                    # Source code for Ahrefs client & trackers
│   ├── client.ts           # Ahrefs API v3 client wrapper
│   ├── keywords.ts         # Keyword ranking & SERP position monitoring
│   └── backlinks.ts        # Backlink & domain authority audits
└── config/                 # Domain lists & keyword targeting presets
```

## 🚀 Quickstart

```bash
# Install dependencies
npm install

# Run Ahrefs domain audit across portfolio
npm run audit:portfolio

# Fetch latest keyword rankings
npm run fetch:keywords
```

## 🔐 Environment Variables

Ensure the following variables are configured in `.env.local`:

```env
AHREFS_API_KEY=your_ahrefs_api_token
```

---

*Part of the Titan Workspace Portfolio (`mchlbrns/titan-workspace`)*
