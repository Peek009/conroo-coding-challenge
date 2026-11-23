# Terminal Slot Reservations

## Getting started

Requirements: Node 24+, pnpm

```bash
# Install dependencies
pnpm install

# Copy environment file
cp bff/.env.example bff/.env
```

> [!IMPORTANT]
> Open `bff/.env` and set `EXTERNAL_API_BASE_URL` to the real upstream API.

```bash
# Start the frontend and BFF together
pnpm dev
```

The application is then available at:

| URL                     | Description             |
| ------------------------ | ------------------------ |
| http://localhost:5173    | Frontend (Vite dev server) |
| http://localhost:4000    | BFF (Express)           |

```bash
pnpm build   # Build frontend and BFF for production
pnpm lint    # Lint and check style
pnpm test    # Run all unit tests
```

## Architecture

The BFF is the only thing that talks to the external API. It normalizes the
upstream shape into our own `TimeSlot`/`TimeSlotUpdate` types, validates
everything with Zod, and relays live updates to every connected browser
through its own SSE hub. The browser never connects to the external API
directly.

```
bff/src/
├── config/       # env parsing & validation (Zod)
├── domain/
│   └── timeSlot/ # TimeSlot/TimeSlotUpdate schemas, normalization, merge logic
├── routes/       # /timeSlots (REST) and /sse (SSE relay)
├── sse/          # upstream SSE client (retry loop), line parser, broadcast hub
├── app.ts        # Express app, middleware
├── server.ts     # entrypoint
└── logger.ts     # pino logger

frontend/src/
├── components/
│   ├── base/        # Headline, SkeletonBlock
│   ├── header/      # AppHeader, LiveStatus, LanguageSwitcher
│   ├── date-tabs/   # DateTabs, DateTab
│   ├── day-header/  # DayHeader
│   └── slot-list/   # SlotList, SlotRow, CapacityBar, CategoryBadge, CategoryFilter
├── composables/   # useSlotStream (owns the browser-side EventSource)
├── domain/        # TimeSlot/DaySlot schemas, grouping & formatting helpers
├── services/      # fetchTimeSlots, subscribeToTimeSlotUpdates (fetch/SSE wrappers)
├── stores/        # slots (Pinia), settings (locale)
├── i18n/          # vue-i18n setup + locales (en/de/pl/ru)
└── test-utils/    # shared fixtures for tests
```

## Design choices

- **A BFF in front of the external API.** It hides the upstream's shape
  from the browser and lets us normalize, validate, and fan out data our
  own way, instead of every client talking to the real API directly.
- **Express for the BFF.** The BFF is just a couple of thin routes and
  middleware, so a minimal, unopinionated framework fits better than a
  heavier one.
- **One shared SSE connection.** The BFF keeps a single connection to the
  external API and fans updates out to every browser tab.
- **Validation at every boundary.** Both the BFF and the frontend check
  incoming data with Zod before using it.
- **Thin, pure store.** The Pinia store only holds state — fetching and
  SSE live in `services/` and `composables/`.
- **Components split by feature.** `date-tabs/`, `day-header/`, `slot-list/`
  — not grouped by type.
- **Four languages from day one.** i18n covers en/de/pl/ru, not just a
  single locale.
- **No caching layer.** Kept simple on purpose for this scope.
