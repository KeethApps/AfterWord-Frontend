# Application Features

The AfterWord frontend is designed to seamlessly integrate with your reading life, allowing you to ingest, store, search, and resurface your book highlights and notes.

## 1. Home / Dashboard (`/app/(app)/(tabs)/index.tsx`)
The central hub for the user. 
- Displays a summary of the user's reading activity.
- May feature recently added books or dynamically resurfaced highlights to help with spaced repetition and retention.

## 2. Highlights Feed (`/app/(app)/(tabs)/highlights.tsx`)
A dedicated feed for browsing individual highlights and personal notes.
- Users can scroll through their imported highlights.
- Support for inline editing of notes or highlights.
- Deleting or managing specific highlights.

## 3. Library (`/app/(app)/(tabs)/library.tsx`)
The collection of all books the user has uploaded highlights for.
- Displays book covers and metadata (enriched by the backend via Open Library).
- Users can tap into a book to see all associated highlights and notes specific to that title.

## 4. Semantic Search (`/app/(app)/(tabs)/search.tsx`)
A powerful, AI-driven search experience.
- Allows users to search their highlights conceptually rather than just by exact keyword matches.
- Integrates with the backend's Supabase Edge AI (`gte-small` embeddings) to return semantically relevant highlights and notes based on the user's query.

## 5. Upload & Ingestion (`/app/(app)/(tabs)/upload.tsx`)
The gateway for importing data into AfterWord.
- Supports picking and uploading files (like `My Clippings.txt` from a Kindle) via `expo-document-picker`.
- Communicates with the backend ingestion pipeline to chunk the file, extract highlights, and generate AI embeddings asynchronously.
- Displays progress or status of the ingestion job.

## 6. Profile & Settings (`/app/(app)/profile.tsx` & `settings.tsx`)
User management and application preferences.
- **Account**: Options for signing out or deleting the account entirely (handled securely by backend edge functions).
- **Appearance**: Toggling application themes (Light/Dark).
- **Onboarding**: Re-triggering the `(onboarding)` flow if necessary.
