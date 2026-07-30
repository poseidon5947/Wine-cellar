# Wine Cellar Workbook — Expansion Plan

## Current state (delivered)

- **Cellar tab** — full catalogue for ~1,200 bottles. Column order (per client
  request): Photo (A, live thumbnail) → Label Photo URL (B) → ID (C) →
  Producer → Wine Name → Vintage → Type → Grape(s) → Region → Country →
  Alcohol % → Bottle Size → Quantity → Purchase Date → Purchase Price →
  Drinking Window Start/End → Status → Personal Rating → Reviews & Notes
  (wide, word-wrapped) → Last Updated → Drink Status (auto) → Halliday /
  Hook / RP / Larkin / My Score / Others → Storage Location (last column).
- **Dashboard tab** — KPI tiles (distinct wines, total bottles, cellar value,
  by-type breakdown) plus three live QUERY-driven lists: ready to drink now,
  coming into window next year, quantity = 0.
- **Read Me tab** — hand-off notes: column layout, how to add photos, how to
  add fields later, how to run the Apps Script setup.
- **Code.gs** — pop-up "Add Bottle" form covering every column, auto ID,
  auto Last Updated timestamp, auto Photo/Drink Status formulas on new rows,
  "Rebuild dropdowns" and "Rebuild Filter Views" menu commands.
- **Data validation** — dropdowns on Type, Bottle Size, Country, Status,
  Personal Rating. Conditional formatting on Quantity = 0 and Drink Status.

## Proposed phases

### Phase 1 — Everyday usability (low effort, high visibility)
| Feature | What it does | Why it's a good next step |
|---|---|---|
| Consumption log | "Drink a bottle" menu action decrements Quantity and logs date/occasion to a new History tab | Removes manual editing, gives a natural audit trail, sets up Phase 2's mobile entry |
| Drinking-window email reminders | Monthly auto-email listing what's entering/leaving its window | Delivers value without the client opening the sheet — proves ongoing usefulness |

### Phase 2 — Capture at the point of purchase (medium effort)
| Feature | What it does | Why it matters |
|---|---|---|
| Mobile entry via Google Form | Phone-friendly form (feeds the same sheet) to log a bottle and snap a label photo on the spot | Removes the "I'll enter it later" friction that causes stale data |
| QR labels | Auto-generated QR code per bottle, printable, links back to its row | Fast physical lookup on the shelf, no scrolling/searching |

### Phase 3 — Richer data, less manual entry (medium-high effort)
| Feature | What it does | Why it matters |
|---|---|---|
| Auto critic-score lookup | Pull Halliday/Vivino/Wine-Searcher scores by producer + vintage where an API is available | Cuts down manual data entry, keeps scores current |
| Market value tracking | Periodic price lookup so the Dashboard shows current cellar value vs. purchase price | Turns the sheet into a valuation tool, not just a log |
| Looker Studio dashboard | Free Google-native BI layer on top of the sheet for richer charts/visuals | Nicer presentation layer without leaving the Google ecosystem |

### Phase 4 — Platform graduation (large effort, only if needed)
- If/when the cellar outgrows Sheets (multi-user conflicts, needs real
  accounts/roles, search across 1,200+ rows feels slow) — migrate to a small
  web app, using the Sheet as import/export rather than source of truth.

## Ongoing relationship options (non-technical)
- **Quarterly cellar health-check** — dedupe entries, fix broken image
  links, validate data, tidy formulas.
- **Support retainer** — small monthly fee for bug fixes/tweaks as usage
  surfaces edge cases.
- **Short training/handoff session** — screen-recorded walkthrough of the
  Dashboard, Add Bottle form, and Filter Views.

## Recommended starting point
Phase 1's consumption log — fastest to build, immediately useful, and a
natural lead-in to the mobile-entry conversation in Phase 2.
