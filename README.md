# AfterWord — Frontend Foundation

> Remember What You Read · Kindle Highlights Manager

## Tech Stack

- **Expo SDK ~52** with Expo Router v4
- **TypeScript** strict mode
- **React Native Web** (0.19)
- **NativeWind v4** (Tailwind CSS for React Native)

## Quick Start

```bash
# Install dependencies
npm install

# Start web dev server
npm run web
```

The app opens at `http://localhost:8081` in your browser.

## Project Structure

```
afterword/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout (sidebar + shell)
│   ├── index.tsx           # Home screen
│   ├── library.tsx         # Library screen
│   ├── search.tsx          # Search screen
│   ├── upload.tsx          # Upload/import screen
│   └── settings.tsx        # Settings screen
│
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Sidebar.tsx         # Persistent left navigation
│   │   ├── AppHeader.tsx       # Top bar with title + actions
│   │   ├── ScreenContainer.tsx # Scrollable content wrapper
│   │   ├── SectionHeader.tsx   # Label row + "View all" link
│   │   ├── EmptyState.tsx      # Empty state with FolioFox
│   │   ├── FolioFox.tsx        # Mascot fox SVG illustration
│   │   ├── Card.tsx            # Generic surface card
│   │   ├── Button.tsx          # Primary/secondary/ghost/danger
│   │   ├── HighlightCard.tsx   # Quote card with metadata
│   │   ├── BookCover.tsx       # Book thumbnail + info
│   │   └── index.ts            # Barrel export
│   │
│   └── theme/              # Design system tokens
│       ├── colors.ts           # Color palette + semantic aliases
│       ├── typography.ts       # Fonts, sizes, weights
│       ├── spacing.ts          # Spacing, radius, shadows
│       └── index.ts            # Barrel export
│
├── global.css              # NativeWind base + web fonts
├── tailwind.config.js      # Tailwind config with custom tokens
├── metro.config.js         # Metro + NativeWind config
├── app.json                # Expo config
└── tsconfig.json           # TypeScript config
```

## Design System

### Color Palette (from mockup)

| Token       | Hex       | Usage                          |
|-------------|-----------|--------------------------------|
| `forest`    | `#0F2E28` | Brand primary, sidebar, CTAs   |
| `amber`     | `#E9C46A` | Accent, stars, active states   |
| `cream`     | `#F4EFE6` | App background                 |
| `mist`      | `#EDE6D5` | Card backgrounds, dividers     |
| `slate`     | `#6B7280` | Secondary text, icons          |
| `crimson`   | `#D64545` | Errors, danger actions         |

### Typography

- **Display**: Playfair Display (serif) — headings, quotes
- **Body**: Lato — UI labels, descriptions, metadata

### Key Components

- `<Sidebar />` — dark forest-green left nav, 220px wide
- `<AppHeader />` — page title + notification bell
- `<HighlightCard />` — quote card, supports `featured` variant
- `<BookCover />` — book thumbnail with deterministic placeholder colors
- `<EmptyState />` — FolioFox + message + optional CTA
- `<FolioFox />` — SVG mascot (6 variants: reading, happy, thinking, waving, laptop, sad)
- `<Button />` — 4 variants × 3 sizes

## Screens

| Route        | Screen    | Description                                    |
|--------------|-----------|------------------------------------------------|
| `/`          | Home      | Daily highlight, recently read, recent quotes  |
| `/library`   | Library   | All books grid                                 |
| `/search`    | Search    | Semantic search with filter tabs               |
| `/upload`    | Upload    | File import flow (7 state previews)            |
| `/settings`  | Settings  | Account, preferences, about                   |

## Next Steps

- [ ] Authentication (Sign In / Sign Up / Email Verify)
- [ ] File upload logic + Clippings.txt parser
- [ ] Semantic search backend integration
- [ ] Highlight detail view
- [ ] Book detail view with all highlights
- [ ] Tags system
