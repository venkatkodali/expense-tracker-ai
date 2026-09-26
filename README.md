# Expense Tracker

A modern, responsive personal expense tracker built with Next.js 14 (App Router),
TypeScript, and Tailwind CSS. All data is stored locally in the browser
(`localStorage`) — there's no backend or database.

## Features

- **Add / edit / delete expenses** — date, amount, category, and description,
  validated with `react-hook-form` + `zod`.
- **Dashboard summary** — total spending, this-month spend with a delta vs. last
  month, top category, and transaction count.
- **Charts** — spending by category (horizontal bar) and a 6-month spending
  trend (area chart), both built with Recharts and a colorblind-safe palette
  that adapts to light/dark mode.
- **Filters** — search by description, filter by one or more categories, and
  date-range presets (All time / This month / Last 30 days / Last 90 days /
  Custom range). Filters scope the summary cards, charts, and list together.
- **CSV export** — exports whatever is currently filtered.
- **Light/dark theme toggle**, responsive layout (table on desktop, cards on
  mobile), loading skeletons, and toast notifications for actions and errors.

## Getting started

Requires Node.js 18.18+ (Node 20+ recommended).

```bash
cd expense-tracker-ai
npm install   # only needed once, or after pulling dependency changes
npm run dev
```

Then open **http://localhost:3000** in your browser.

Other scripts:

```bash
npm run build   # production build
npm run start   # run the production build (after `npm run build`)
npm run lint    # ESLint
```

## Manually testing the features

1. **Empty state** — on first load with no data, you should see "No expenses
   yet" with an "Add expense" call-to-action.
2. **Add an expense** — click **Add expense**, fill in date/amount/category/
   description, submit. It should appear at the top of the list, and the
   summary cards / charts should update immediately.
3. **Validation** — try submitting with an empty description, a negative or
   zero amount, or more than 2 decimal places; each field should show an
   inline error and the form should not submit.
4. **Edit** — click the pencil icon on a row, change a field, save — the row
   and all dashboard numbers should update.
5. **Delete** — click the trash icon, confirm in the dialog — the expense
   should disappear and the totals recalculate.
6. **Filters**
   - Type in the search box to filter by description.
   - Click one or more category chips to narrow the list; click "Clear" to
     reset.
   - Try the date presets, then "Custom" with a from/to date.
   - Confirm the summary cards, charts, and list count all agree with the
     active filters.
7. **Charts** — hover over a category bar or a point on the trend line to see
   the tooltip with the exact amount.
8. **Export CSV** — click **Export CSV**; the downloaded file should match
   the currently filtered rows and open cleanly in a spreadsheet app.
9. **Persistence** — reload the page (or close and reopen the tab); your data
   should still be there (it's saved to `localStorage`).
10. **Theme toggle** — click the sun/moon icon in the header to switch
    light/dark mode; your preference is remembered on reload.
11. **Mobile** — resize the browser (or open dev tools' device toolbar) to a
    phone width; the table becomes a stacked-card list and everything should
    remain usable with no horizontal scrolling.

## Resetting the data

The app uses a single `localStorage` key: `expense-tracker:expenses:v1`. To
start over, open your browser's DevTools → Application → Local Storage, and
delete that key (or run `localStorage.clear()` in the console while on the
page).

## Project structure

```
src/
  app/
    layout.tsx        # root layout, theme init script, toast provider
    page.tsx           # the dashboard page — wires everything together
    globals.css         # design tokens (light/dark) + Tailwind layers
  components/           # UI components (form, list, charts, modals, ...)
  hooks/
    useExpenses.ts       # localStorage-backed CRUD state
  lib/
    types.ts, categories.ts, validation.ts, storage.ts, csv.ts, stats.ts,
    filterExpenses.ts, utils.ts
```

## Notes

- This is a client-side demo app: data lives only in your browser and is not
  shared across devices or backed up anywhere. Clearing site data or using a
  different browser/profile will not show the same expenses.
- `npm audit` reports some advisories against the Next.js 14 line itself
  (widely-scoped CVEs; see `npm audit` for detail). They mostly affect
  self-hosted server deployments and don't apply meaningfully to running this
  locally, but if you deploy this, consider upgrading to the latest Next.js
  14.2.x patch or Next.js 15/16 (`npm audit fix --force`, which is a breaking
  change) first.
