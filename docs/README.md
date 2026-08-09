# AfterWord Frontend Documentation

Welcome to the AfterWord frontend documentation. This repository contains the React Native mobile application built with Expo, NativeWind, and Supabase.

---

## Documentation Index

- **[Architecture & Security Tech Stack](./architecture.md)**: Details on Expo Router setup, NativeWind styling, React Query server state, Zustand UI state, strict Read-Only database client policy, and Edge Function mutation hooks (`manage-book`, `manage-highlight`).
- **[Features Overview](./features.md)**: Comprehensive breakdown of all application screens and features (Home Dashboard, Library & Book Details, Open Library Metadata Matching, Book Mutations, Highlights Feed, Collections & Tagging, Semantic Search, and Clipping File Ingestion).

---

## Running Locally

To run the application:

```bash
cd afterword-fe
npm install
npx expo start
```

- Press `i` for iOS Simulator.
- Press `a` for Android Emulator.
- Press `w` for Web preview.

Ensure your `.env` file in `afterword-fe/` contains:
```env
EXPO_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```
