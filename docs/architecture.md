# Frontend Architecture

## Overview
The AfterWord frontend is a cross-platform mobile application built using **React Native** and the **Expo** framework. It leverages Expo Router for file-based routing and navigation, ensuring a seamless experience across iOS, Android, and Web.

---

## Core Security & Data Access Architecture

The frontend enforces a **Strict Read-Only Database Client Policy**:

1. **Read Operations (`SELECT`)**:
   - The frontend query layer uses the Supabase JS client (`supabase.from('tableName').select(...)`) directly for read queries.
   - All queries are automatically scoped by Row Level Security (RLS) policies to `auth.uid()`.

2. **Mutation Operations (`CREATE` / `UPDATE` / `DELETE`)**:
   - Frontend components and hooks **never** execute direct `supabase.from('books').insert()`, `update()`, or `delete()` calls.
   - All book mutations route through the `manage-book` Supabase Edge Function using `supabase.functions.invoke('manage-book', { body: { action, ... } })`.
   - The Edge Function authenticates the caller's JWT, verifies resource ownership, and performs the database update server-side.

---

## Core Technology Stack

- **Framework**: React Native + Expo (`~54.0.0` SDK)
- **Routing**: Expo Router (`expo-router`) for file-based navigation in `app/`
- **Styling**: **NativeWind** (Tailwind CSS for React Native) + Custom Design System tokens (`Colors`, `Fonts`)
- **State Management**: **Zustand** for lightweight global UI state (layout, sidebar)
- **Data Fetching & Cache**: **TanStack React Query** (`@tanstack/react-query`) for server state management, caching, and cache invalidation
- **Backend Integration**: **Supabase** JS Client (`@supabase/supabase-js`) for authentication, read queries, and Edge Function invocations
- **Animations**: `react-native-reanimated` for fluid UI transitions

---

## Directory & File Organization

Located in `afterword-fe/`:

- `/app`: File-based Expo Router navigation.
  - `/(app)`: Authenticated application routes.
    - `/(tabs)`: Navigation tabs (`index.tsx` Home, `highlights.tsx`, `library.tsx`, `collections.tsx`, `upload.tsx`).
    - `/book/[id].tsx`: Book details, highlight list, Open Library matching, and deletion menu.
    - `/book/add.tsx`: New book & highlight creation screen.
    - `/book/[id]/add.tsx`: Add highlight to existing book screen.
    - `/highlight/[id]/edit.tsx`: Highlight edit screen.
    - `profile.tsx` & `settings.tsx`: Profile, preferences, and account deletion.
  - `/(auth)`: Sign-in and registration screens.
  - `/(onboarding)`: First-time user welcome flow.
- `/hooks`: Custom React hooks.
  - `/queries`: React Query data fetching hooks (`useBooks`, `useBookById`, `useSearchBooks`, `useCreateBook`, `useUpdateBook`, `useDeleteBook`, `useHighlights`, `useNotes`, `useTags`, `useStats`).
  - `/mutations`: Mutation hooks invoking Edge Functions (`manage-highlight`, `manage-book`).
  - `/auth`: Auth context and identity hooks (`useAuth.tsx`).
- `/lib`: Client singletons (`supabase.ts`).
- `/src/components`: Reusable UI components (`BookCover`, `HighlightCard`, `TagPicker`, `ManageTagsSheet`, `KnowledgeGraph`).

---

## Data Flow & Cache Management

1. **Queries**: `useBooks()`, `useBookById()`, `useSearchBooks()` query Supabase Postgres directly and transform `snake_case` database fields to `camelCase` model objects.
2. **Mutations**:
   - `useDeleteBook(bookId)` invokes `manage-book` (`action: 'delete'`) and invalidates `['books']`, `['book', bookId]`, `['library_stats']`, `['highlights']` React Query cache keys.
   - `useCreateBook(input)` invokes `manage-book` (`action: 'create'`) and invalidates `['books']`, `['library_stats']`.
   - `useUpdateBook(input)` invokes `manage-book` (`action: 'update'`) and invalidates `['books']`, `['book', bookId]`.
3. **Authentication**: `useAuth` listens for Supabase auth state changes and dynamically guards routes between `(auth)` and `(app)`.
