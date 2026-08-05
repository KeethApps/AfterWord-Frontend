# Frontend Architecture

## Overview
The AfterWord frontend is a cross-platform mobile application built using **React Native** and the **Expo** framework. It leverages Expo Router for file-based routing and navigation, ensuring a seamless multi-tab experience across iOS and Android.

## Core Technologies
- **Framework**: React Native + Expo (`~54.0.0` SDK)
- **Routing**: Expo Router (`expo-router`) for file-based navigation (app directory structure)
- **Styling**: **NativeWind** (Tailwind CSS for React Native) to ensure consistent, highly customizable, and maintainable styling
- **State Management**: **Zustand** is used for lightweight global state (e.g., layout and sidebar state). 
- **Data Fetching**: **TanStack React Query** is heavily utilized for server state, fetching, caching, and updating data seamlessly.
- **Backend Integration**: **Supabase** JS Client (`@supabase/supabase-js`) is used for authentication, database queries, and edge function calls.
- **Animations**: `react-native-reanimated` for performant, 60fps UI animations.

## Project Structure
The application follows a standard Expo Router setup bundled with custom hooks and libraries in `afterword-fe/`:

- `/app`: The file-based routing system.
  - `/(app)`: The main authenticated area of the app.
    - `/(tabs)`: Bottom tab navigator (`index.tsx` for Home, `highlights.tsx`, `library.tsx`, `search.tsx`, `upload.tsx`).
    - `profile.tsx` & `settings.tsx`: User management screens.
  - `/(auth)`: Screens for sign-in and registration.
  - `/(onboarding)`: Welcome screens for new users.
- `/components`: Reusable UI components.
- `/hooks`: Custom hooks encapsulating logic.
  - `/queries` & `/mutations`: React Query definitions for fetching and modifying data (e.g., highlights, books, uploading chunks).
  - `/auth`: Authentication hooks (e.g., `useAuth.tsx`).
- `/lib`: Utility functions and clients (e.g., `supabase.ts` for the Supabase client initialization).
- `/constants`: Global configuration, theme tokens, and constants.

## Data Flow
The frontend heavily relies on a hybrid state management model:
1. **Server State (React Query + Supabase)**: The app uses React Query to fetch and cache data (books, highlights, search results) directly from the Supabase Postgres database or via Edge Functions. Mutations (like creating a highlight or triggering an upload job) invalidate queries to keep the UI in sync.
2. **Local/UI State (Zustand)**: Global UI state that isn't server-dependent (such as layout configurations or theming preferences) is handled by Zustand stores (e.g., `useLayoutStore.ts`).
3. **Authentication**: Supabase handles auth. A context provider or hook (`useAuth`) listens for auth state changes and routes the user between `(auth)` and `(app)` layouts automatically.
