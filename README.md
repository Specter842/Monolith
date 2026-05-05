# Monolith

**Life OS v1.7.0** — A self-contained personal productivity suite built for mobile, running entirely in the browser.

Monolith consolidates the tools most people scatter across 5–10 different apps into a single, offline-capable interface: calendar, task queue, finance tracker, password vault, wishlist, resource archive, and a learning log — all persisted locally with no account required.

---

## Modules

### Calendar
Full scheduling suite with Day, Week, Month, and Year views. Events support repeat patterns (daily, weekly, monthly, yearly) and can have optional end times for ongoing entries. Import `.ics` files directly, replicate an entire day's schedule to another date, or clear a day in one action.

### Task Queue
Priority-based task management (Low / Medium / High) with a daily work tally system — mark whether you worked on a task each day and track a running effort streak. Completed tasks are archived chronologically rather than deleted. Supports AI-powered task extraction from images via Google Gemini, so you can photograph a handwritten list and have it parsed automatically.

### Finance
Wallet-based income and expense tracking with multi-currency support (USD, EUR, JPY, AED, INR). Transactions are categorized (Food, Travel, Transportation, Bills, Entertainment, or custom) and visualized in a monthly donut chart. Balance updates reflect in real time as entries are added or deleted.

### Vault
Encrypted-at-rest password manager with masked field display, copy-to-clipboard, and show/hide toggles.

### Wishlist
Product wishlist with custom categories. Track items you want to buy, organized however you like.

### Archives
Resource link library with folder organization — a personal bookmarking system for articles, tools, references, or anything else worth saving.

### Learning Log
Track books, courses, or skills in progress. Log what you're studying and monitor your progress over time.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| AI | Google Gemini (task OCR from images) |
| Persistence | `localStorage` (no backend, no account) |
| Icons | Lucide React |

---

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs locally at `http://localhost:5173`. All data is stored in your browser's `localStorage` — nothing is sent to a server.

**To enable AI task scanning**, provide a Google Gemini API key via the `API_KEY` environment variable:

```bash
API_KEY=your_key_here npm run dev
```

Without an API key, all other modules function normally. The camera/OCR button in the Task module will be inactive.

---

## Project Structure

```
├── index.tsx              # Monolithic app core — all primary modules
├── App.tsx                # Deprecated entry point (redirects to index.tsx)
├── types.ts               # Shared TypeScript interfaces
├── index.css              # Global styles
├── components/
│   ├── PasswordManagerModule.tsx
│   ├── WishlistModule.tsx
│   ├── ResourcesModule.tsx
│   ├── LearningModule.tsx
│   └── SettingsModule.tsx
└── services/              # Service layer utilities
```

---

## Design Philosophy

Monolith is intentionally opinionated: dark, dense, high-contrast, mobile-first. The UI borrows from terminal aesthetics — uppercase labels, tight tracking, monochromatic palette — while remaining touch-friendly. The name reflects the goal: one surface for everything, nothing external required.

All data lives in `localStorage`. There are no accounts, no sync, no network calls (except the optional Gemini API for image OCR). If you clear your browser storage, your data is gone — export or back up anything important.

---

## License

MIT
