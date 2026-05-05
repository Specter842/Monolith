# Monolith

**Life OS v1.7.0** — A self-contained personal productivity suite built for mobile, running entirely in the browser.
# Monolith

Monolith is a productivity app I built that combines a bunch of tools I always needed in one place. Instead of using 5 different apps for your calendar, tasks, finances, passwords, etc., you can just use this.

Everything is saved in your browser so you don't need to make an account or anything.

---

## What's inside

**Calendar** - You can add events and view them by day, week, month or year. Events can repeat (daily, weekly, monthly, yearly). You can also import .ics calendar files if you want to bring in events from somewhere else.

**Tasks** - A to-do list where you can set priorities (Low, Medium, High). There's also a "worked today" button for each task so you can track which days you actually made progress on something. Completed tasks get archived so you can look back at them later. There's also a cool feature where you can take a photo of a handwritten list and it'll automatically read it and create tasks (uses Google Gemini AI for this).

**Finance** - Track your income and expenses. You can pick different currencies (USD, EUR, JPY, AED, INR), organize transactions by category, and see a chart of where your money is going each month.

**Vault** - A password manager. Passwords are hidden by default and you can reveal them or copy them with a button.

**Wishlist** - Keep track of things you want to buy, organized by category.

**Archives** - Save links and resources you want to come back to, organized in folders.

**Learning** - Track books, courses or anything you're currently learning.

---

## How to run it

You need Node.js installed.

```bash
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

If you want the AI task scanning feature to work, you need a Google Gemini API key:

```bash
API_KEY=your_key_here npm run dev
```

Everything else works fine without it.

---

## Built with

- React + TypeScript
- Vite
- Tailwind CSS
- Recharts (for the finance charts)
- Lucide React (icons)
- Google Gemini API (just for the image scanning feature)
