# Memento AI - Complete Application Documentation

## Table of Contents

1. [Overview](#overview)
2. [Application Architecture](#application-architecture)
3. [User Authentication System](#user-authentication-system)
4. [User Interface & Navigation](#user-interface--navigation)
5. [Memory Management System](#memory-management-system)
6. [Search Functionality](#search-functionality)
7. [Chat Interface](#chat-interface)
8. [Data Storage & Backend](#data-storage--backend)
9. [AI & Machine Learning Integration](#ai--machine-learning-integration)
10. [Technical Services](#technical-services)
11. [Data Flow Diagrams](#data-flow-diagrams)

---

## Overview

**Memento AI** is a personal memory storage and retrieval application that allows users to:

- Store text-based memories with categorization tags
- Search through memories using AI-powered semantic search
- Interact with an AI assistant through a chat interface
- Organize and retrieve personal information efficiently

**Platform**: Mobile application (iOS)
**Primary Technology Stack**: Native iOS with cloud backend services

---

## Application Architecture

### High-Level Structure

The application follows a **layered architecture**:

```
┌─────────────────────────────────────────┐
│         User Interface Layer            │
│  (Views: Auth, Memories, Chat, Search)  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Service Layer                   │
│  (Auth, Database, Edge Functions)       │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Backend Infrastructure          │
│  (Supabase: Auth, Database, Functions)  │
└─────────────────────────────────────────┘
```

### File Organization

All application code resides in a **flat directory structure** (no sub-folders):

**Entry Point:**

- `Memento_AIApp.swift` - Application startup and initialization

**User Interface:**

- `ContentView.swift` - Main hub with tabs for Memories and Chat
- `AuthView.swift` - Login and registration screens
- `AddMemoryView.swift` - Form for creating new memories
- `SearchView.swift` - Semantic search interface
- `ChatView.swift` - Conversational AI interface

**Services:**

- `AuthService.swift` - User authentication management
- `DatabaseService.swift` - Data storage and retrieval
- `EdgeFunctionService.swift` - AI-powered cloud functions

**Configuration:**

- `SupabaseManager.swift` - Backend client initialization
- `SupabaseConfig.swift` - Environment configuration
- `Persistence.swift` - Legacy local storage (currently unused)

---

## User Authentication System

### Purpose

Secure user access and data isolation - each user only sees their own memories and chat history.

### Authentication Flow

```
App Launch → Check Authentication Status
    ├─ Not Authenticated → Show Login/Registration Screen
    └─ Authenticated → Show Main Application
```

### Features Provided

**Sign Up (New User Registration):**

1. User enters email address and password
2. System validates email format and password strength
3. Account is created in the backend
4. User is automatically logged in
5. User ID is assigned for data isolation

**Sign In (Existing User Login):**

1. User enters email and password
2. Credentials are verified against backend
3. Upon success, user session is created
4. User gains access to their personal data

**Sign Out:**

1. User clicks "Sign Out" button
2. Session is terminated
3. User is returned to login screen
4. All cached user data is cleared

**Password Reset:**

- Function available to reset forgotten passwords via email

### Security Features

- Passwords are securely transmitted and never stored locally
- Each user's data is isolated by User ID
- Authentication state is maintained throughout app session
- Automatic session validation on app launch

### Implementation Details

**File:** `AuthService.swift`

**State Management:**

- `user`: Currently logged-in user information
- `isLoading`: Indicates authentication operation in progress
- `isSignedIn`: Boolean flag for authentication status

**Operations Performed:**

- `getCurrentUser()` - Checks if user is already logged in
- `signUp(email, password)` - Creates new account
- `signIn(email, password)` - Logs in existing user
- `signOut()` - Ends user session
- `resetPassword(email)` - Initiates password recovery

---

## User Interface & Navigation

### Main Navigation Structure

The application uses a **tabbed interface** with two main sections:

```
┌─────────────────────────────────────────┐
│              Top Bar                     │
│  [Sign Out] [Title] [Search][Test][Add] │
├─────────────────────────────────────────┤
│                                          │
│           Content Area                   │
│      (Changes based on active tab)       │
│                                          │
├─────────────────────────────────────────┤
│            Tab Bar                       │
│    [🧠 Memories]    [💬 Chat]            │
└─────────────────────────────────────────┘
```

### Tab 1: Memories

**Purpose:** View, add, and search personal memories

**Screen Layout:**

- **Navigation Bar:**
    - Left: "Sign Out" button
    - Center: "Memories" title
    - Right: Search icon, Test button, Add (+) icon

- **Content Area:**
    - Scrollable list of all memories
    - Each memory displays:
        - Main text content
        - Category tag (colored badge)
        - Creation timestamp
    - Pull-to-refresh gesture to reload memories

**Available Actions:**

1. **Add New Memory** (+ button):
    - Opens modal form
    - Enter memory text (multi-line input)
    - Enter category tag (single-line)
    - Save or Cancel

2. **Search Memories** (magnifying glass):
    - Opens search interface
    - Semantic AI-powered search
    - Returns ranked results

3. **Test Edge Function** (Test button):
    - Developer testing feature
    - Generates AI summary of all memories
    - Displays total count and summary text

4. **Refresh List** (pull down):
    - Reloads memories from server
    - Updates with latest data

### Tab 2: Chat

**Purpose:** Conversational interface with AI assistant

**Screen Layout:**

- **Navigation Bar:** "Chat" title
- **Content Area:**
    - Scrollable conversation history
    - Message bubbles:
        - User messages (right-aligned, blue)
        - AI responses (left-aligned, gray)
        - Timestamps below each message

- **Input Area:**
    - Text field for typing messages
    - Send button (up arrow icon)
    - Loading indicator during AI processing

**Interaction Flow:**

1. User types message in text field
2. Presses send button
3. Message appears in conversation
4. Loading indicator shows while waiting
5. AI response appears below user message

**Current Status:** The AI response is currently a placeholder (echoes user message). Integration with AI service is pending.

---

## Memory Management System

### What is a Memory?

A **memory** is a piece of text information that users want to save and retrieve later. Each memory consists of:

- **Content:** The actual text being saved (e.g., "Meeting notes from project discussion")
- **Tag:** A category label for organization (e.g., "work", "personal", "ideas")
- **Timestamp:** When the memory was created
- **User ID:** Who owns this memory (for privacy)
- **Embedding:** AI-generated numerical representation (for semantic search)

### Memory Lifecycle

```
1. CREATE
   User writes text → Adds tag → Saves
   ↓
2. PROCESS
   System generates AI embedding → Stores in database
   ↓
3. STORE
   Memory saved with metadata → Linked to user account
   ↓
4. RETRIEVE
   Displayed in list → Searchable → Always accessible
```

### Adding a New Memory

**User Experience:**

1. User clicks the "+" button in top-right
2. Modal form appears
3. User enters:
    - Memory text (what to remember)
    - Tag (category name)
4. Clicks "Save"
5. System shows loading indicator
6. Form closes when complete
7. New memory appears in list

**Behind the Scenes:**

1. **Validation:** System checks that text and tag are not empty
2. **AI Processing:** Memory text is sent to OpenRouter API
3. **Embedding Generation:** AI converts text into 1536 numbers (vector representation)
4. **Database Insert:** Memory + tag + embedding + user ID saved to database
5. **List Refresh:** Memory list is reloaded to show the new entry
6. **Cleanup:** Form is cleared and closed

### Viewing Memories

**Display Format:**
Each memory is shown as a card with:

- Main text prominently displayed
- Tag shown in colored badge
- Date/time in small gray text
- Cards stack vertically in scrollable list

**Sorting:** Memories appear in order from database (typically newest first)

**Refresh:** Pull down on the list to reload from server

### Memory Storage

**File:** `DatabaseService.swift`

**Data Model:** Each memory contains:

- `id`: Unique identifier (auto-generated)
- `userId`: Which user owns this memory
- `memoryData`: The actual text content
- `tag`: Category label
- `createdAt`: Timestamp of creation
- `embedding`: 1536-dimensional vector for AI search

**Database Operations:**

- `fetchMemories()` - Retrieves all memories for current user
- `insertMemory(text, tag, embedding)` - Saves new memory
- `fetchMemoriesWithTags()` - Advanced query with tag relationships

---

## Search Functionality

### Semantic Search Explained

Unlike traditional keyword search (finding exact word matches), **semantic search** understands **meaning**:

**Example:**

- User searches: "cooking ideas"
- Results include memories about "recipes", "dinner plans", "meal prep"
- Even if those exact words weren't used in the search

**How it Works:**

1. Search query is converted to numerical representation (embedding)
2. System compares query embedding with all memory embeddings
3. Memories with similar meanings rank higher
4. Results are sorted by relevance

### Search Interface

**File:** `SearchView.swift`

**User Experience:**

1. User clicks search icon (magnifying glass)
2. Search screen slides up
3. User types query in search box
4. Clicks search button
5. Results appear below in ranked order
6. Each result shows full memory with tag and date

**Search Configuration:**

- **Match Count:** Returns top 5 most relevant results
- **Search Method:** Hybrid RAG (Retrieval-Augmented Generation)
- **Response Time:** Typically 1-2 seconds

**Empty States:**

- Before search: Blank screen with search box
- No results: "No results found" message
- During search: Loading spinner

### Backend Search Process

**File:** `EdgeFunctionService.swift`

**Search Pipeline:**

```
User Query
    ↓
Send to Cloud Function
    ↓
Generate Query Embedding (AI)
    ↓
Compare with Memory Embeddings (Vector Database)
    ↓
Rank by Similarity Score
    ↓
Return Top Matches
    ↓
Display in UI
```

**Function Called:** `searchMemories(query, matchCount)`

- `query`: User's search text
- `matchCount`: Number of results to return (default: 5)

**Cloud Function:** `search-memories`

- Deployed on Supabase Edge Functions
- Processes search using vector similarity
- Returns structured response with matching memories

---

## Chat Interface

### Purpose

Provides a conversational way to interact with AI, potentially for:

- Asking questions about stored memories
- Getting summaries or insights
- Natural language memory retrieval
- General assistance

### Chat Structure

**File:** `ChatView.swift`

**Conversation Model:**

- Each conversation has a unique ID
- Messages are stored in database
- Two roles: "user" and "assistant"
- Messages display in chronological order

**Message Data:**

- `id`: Unique message identifier
- `conversationId`: Which conversation this belongs to
- `userId`: Who sent the message
- `role`: "user" or "assistant"
- `content`: The message text
- `createdAt`: Timestamp

### User Interaction

**Sending a Message:**

1. User types in text field at bottom
2. Presses send button (up arrow)
3. Message immediately appears as user bubble
4. Loading indicator shows
5. AI response appears below

**Message Display:**

- **User messages:** Right-aligned, blue background, white text
- **AI messages:** Left-aligned, gray background, black text
- **Timestamps:** Small text below each message

**Current Status:**
The AI integration is **not yet implemented**. Currently:

- User message is saved to database
- A placeholder response echoes the user's message
- Comment in code: "TODO: Call AI service to get response"

**Future Implementation:**
Will likely integrate with:

- AI language model for responses
- Memory context from user's stored memories
- Personalized assistance based on user's data

### Message Persistence

**Database Operations:**

- `fetchConversationMessages(conversationId)` - Loads chat history
- `insertConversationMessage(conversationId, role, content)` - Saves new message

**On App Launch:**

- Previous conversation loads automatically
- Full message history is displayed
- User can continue where they left off

---

## Data Storage & Backend

### Backend Architecture: Supabase

**What is Supabase?**
An open-source backend platform providing:

- **Database:** PostgreSQL for structured data
- **Authentication:** User management and sessions
- **Edge Functions:** Serverless cloud functions
- **Vector Storage:** AI embedding support

### Configuration

**Files:** `SupabaseConfig.swift`, `SupabaseManager.swift`

**Environment Modes:**

- **Local Mode:** Development environment on local machine
- **Remote Mode:** Production cloud deployment

**Current Setting:** Local mode (`local = true`)

**Configuration Variables:**

- `SUPABASE_LOCAL_URL` / `SUPABASE_URL` - Backend server address
- `SUPABASE_SECRET_KEY` - Authentication key
- `MEMORY_FETCH_LOCAL_URL` / `MEMORY_FETCH_URL` - Cloud function endpoints

### Database Schema

**Table 1: memories**
Stores all user memories

| Column      | Type         | Description                        |
| ----------- | ------------ | ---------------------------------- |
| id          | UUID         | Unique identifier (auto-generated) |
| user_id     | UUID         | Owner of this memory               |
| memory_data | Text         | The actual memory content          |
| tag         | Text         | Category label                     |
| created_at  | Timestamp    | When memory was created            |
| embedding   | Vector(1536) | AI-generated embedding for search  |

**Table 2: tags**
Manages tag categories

| Column     | Type      | Description          |
| ---------- | --------- | -------------------- |
| id         | Integer   | Unique identifier    |
| user_id    | UUID      | Owner of this tag    |
| name       | Text      | Tag name             |
| created_at | Timestamp | When tag was created |

**Table 3: chat_entries**
Stores conversation messages

| Column          | Type      | Description                        |
| --------------- | --------- | ---------------------------------- |
| id              | UUID      | Unique message ID                  |
| conversation_id | UUID      | Which conversation this belongs to |
| user_id         | UUID      | Message sender (null for AI)       |
| role            | Text      | "user" or "assistant"              |
| content         | Text      | Message text                       |
| created_at      | Timestamp | When message was sent              |

### Data Access Layer

**File:** `DatabaseService.swift`

**Purpose:** Single point of access for all database operations

**Implemented as Singleton:**

- Only one instance exists (`DatabaseService.shared`)
- Prevents duplicate connections
- Centralized data management

**Operations Available:**

**Memory Operations:**

- `fetchMemories()` - Get all memories for logged-in user
- `fetchMemoriesWithTags()` - Get memories with related tag data
- `insertMemory(text, tag, embedding)` - Save new memory

**Tag Operations:**

- `fetchTags()` - Get all tags for user

**Chat Operations:**

- `fetchConversationMessages(conversationId)` - Load chat history
- `insertConversationMessage(conversationId, role, content)` - Save message

**Security:**
All operations automatically filter by current user's ID - users can only access their own data.

### Legacy Storage System

**File:** `Persistence.swift`

**Technology:** Core Data (Apple's local database framework)

**Status:** **Not actively used**

The application was initially set up with local Core Data storage but has migrated to cloud-based Supabase storage. Core Data infrastructure remains in code but is inactive.

**Evidence:**

- Core Data context is passed to views but never used
- All actual data operations use DatabaseService → Supabase
- No Core Data models are accessed in active code

---

## AI & Machine Learning Integration

### Embedding Generation

**What are Embeddings?**
Numerical representations of text that capture semantic meaning:

- Text is converted to a list of 1536 numbers
- Similar meanings have similar number patterns
- Enables AI to understand and compare meanings

**Example:**

```
"I love cooking" → [0.123, -0.456, 0.789, ..., 0.234]
"I enjoy making food" → [0.119, -0.452, 0.791, ..., 0.237]
                           ↑ Very similar numbers = similar meaning
```

### Embedding Service

**Provider:** OpenRouter (proxying OpenAI's API)

**Model:** `openai/text-embedding-3-small`

- Produces 1536-dimensional vectors
- Optimized for semantic similarity
- Fast and cost-effective

**Process Flow:**

**File:** `ContentView.swift` - Function: `generateEmbedding(for text)`

```
Memory Text
    ↓
Send HTTP Request to OpenRouter API
    ↓
Headers:
  - Content-Type: application/json
  - Authorization: Bearer [API_KEY]
    ↓
Request Body:
  - model: "openai/text-embedding-3-small"
  - input: [memory text]
  - encoding_format: "float"
    ↓
OpenRouter processes request
    ↓
Response: { data: [{ embedding: [array of 1536 numbers] }] }
    ↓
Extract embedding array
    ↓
Return to application
```

**API Key Management:**

- Key stored in environment variable: `OPENROUTER_OPENAI_EMBEDDINGS_KEY`
- Never hardcoded in source code
- Loaded at runtime from system environment

**Error Handling:**

- Missing API key: Throws error "API key not found"
- Invalid response: Throws error "Invalid response from API"
- Parse failure: Throws error "Failed to parse embedding response"

### Edge Functions (Cloud AI Operations)

**File:** `EdgeFunctionService.swift`

**What are Edge Functions?**
Serverless cloud functions that run AI operations without local processing:

- Execute on Supabase infrastructure
- Access to full database and AI models
- No mobile processing burden
- Always up-to-date with latest AI capabilities

### Function 1: Memory Summarization

**Function Name:** `memory-fetch` (with action: "summarizeMemories")

**Purpose:** Generate an AI summary of all user memories

**Input:** User authentication (automatic)

**Process:**

1. Retrieves all memories for authenticated user
2. Sends memory collection to AI model
3. AI analyzes and summarizes key themes/patterns
4. Returns summary text and count

**Output Structure:**

```
{
  data: {
    summary: "Your memories focus on...",
    totalMemories: 42
  }
}
```

**Use Case:** "Test Edge" button generates this summary

### Function 2: Semantic Memory Search

**Function Name:** `search-memories`

**Purpose:** Find memories by semantic similarity

**Input:**

- `query`: Search text
- `matchCount`: Number of results (default: 5)
- `startTime`: Optional date filter (start)
- `endTime`: Optional date filter (end)

**Process:**

1. Convert search query to embedding (vector)
2. Compare with all memory embeddings in database
3. Calculate similarity scores
4. Rank and return top matches

**Output Structure:**

```
{
  data: [array of matching Memory objects],
  query: "original search text",
  matchCount: 5
}
```

**Vector Search Technology:**
Uses PostgreSQL's pgvector extension for efficient similarity search on high-dimensional vectors.

---

## Technical Services

### Service Architecture Pattern

All services follow the **Singleton Pattern**:

- One shared instance accessed throughout app
- Consistent state management
- Efficient resource usage

**Examples:**

- `DatabaseService.shared`
- `EdgeFunctionService.shared`
- `SupabaseManager.shared`

### Authentication Service Details

**File:** `AuthService.swift`

**Design Pattern:** Observable Object

- UI automatically updates when authentication state changes
- Reactive programming model

**Published Properties** (automatically notify UI):

- `user` - Current user information
- `isLoading` - Operation in progress
- `isSignedIn` - Authentication status

**Thread Safety:** `@MainActor`

- All operations run on main UI thread
- Prevents threading issues
- Ensures UI updates are smooth

### State Management

**How the App Knows User Status:**

**On App Launch:**

1. `AuthService` initializes
2. Calls `getCurrentUser()`
3. Attempts to retrieve existing session
4. Sets `isSignedIn` based on result
5. UI renders accordingly:
    - `isSignedIn = true` → Show main app
    - `isSignedIn = false` → Show login screen

**On Sign In/Sign Up:**

1. User submits credentials
2. `isLoading = true` (shows spinner)
3. Request sent to backend
4. On success:
    - `user` = user information
    - `isSignedIn = true`
    - UI automatically switches to main app
5. `isLoading = false` (hides spinner)

**On Sign Out:**

1. User clicks "Sign Out"
2. `isLoading = true`
3. Session terminated on backend
4. `user = null`
5. `isSignedIn = false`
6. UI automatically switches to login screen
7. `isLoading = false`

### Date Formatting

**Purpose:** Display timestamps in user-friendly format

**Format:** Short date + short time

- Example: "1/15/26, 3:45 PM"

**Implementation:**

- Reusable formatter created once
- Used across multiple views
- Consistent time display throughout app

---

## Data Flow Diagrams

### Complete User Flow: Adding a Memory

```
┌─────────────────┐
│  User Interface │
│   (ContentView) │
└────────┬────────┘
         │
         │ 1. User clicks "+" button
         ↓
┌─────────────────┐
│  AddMemoryView  │
│   Modal Form    │
└────────┬────────┘
         │
         │ 2. User enters text and tag
         │ 3. User clicks "Save"
         ↓
┌─────────────────┐
│  ContentView    │
│  saveMemory()   │
└────────┬────────┘
         │
         │ 4. Validation check
         ├─────────────────────────┐
         │                         │
         ↓                         │
┌─────────────────┐               │
│ generateEmbedding│              │
│   (AI Service)  │               │
└────────┬────────┘               │
         │                         │
         │ 5. HTTP Request         │
         ↓                         │
┌─────────────────┐               │
│  OpenRouter API │               │
│  Text → Vector  │               │
└────────┬────────┘               │
         │                         │
         │ 6. Returns 1536 numbers │
         ↓                         │
┌─────────────────┐               │
│ DatabaseService │               │
│ insertMemory()  │ ←─────────────┘
└────────┬────────┘
         │
         │ 7. Insert to database
         ↓
┌─────────────────┐
│ Supabase DB     │
│ "memories"      │
│ table           │
└────────┬────────┘
         │
         │ 8. Success response
         ↓
┌─────────────────┐
│ ContentView     │
│ loadMemories()  │
└────────┬────────┘
         │
         │ 9. Fetch updated list
         ↓
┌─────────────────┐
│ User Interface  │
│ Display updated │
│ memory list     │
└─────────────────┘
```

### Authentication Flow

```
┌─────────────────┐
│   App Launch    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  AuthService    │
│  Initialization │
└────────┬────────┘
         │
         │ getCurrentUser()
         ↓
┌─────────────────┐
│  Supabase Auth  │
│  Check Session  │
└────────┬────────┘
         │
         ├──── Session Exists ────→ isSignedIn = true → Main App
         │
         └──── No Session ────→ isSignedIn = false → Login Screen
                                          │
                                          ↓
                                    User Enters Email/Password
                                          │
                                          ↓
                                    signIn() or signUp()
                                          │
                                          ↓
                                    Verify Credentials
                                          │
                         ├────────────────┼────────────────┐
                         │                                 │
                    ✓ Success                         ✗ Error
                         │                                 │
                         ↓                                 ↓
                  isSignedIn = true                  Show Error Alert
                         │                                 │
                         ↓                                 ↓
                    Main App                         Stay on Login
```

### Search Flow

```
┌─────────────────┐
│  User Types     │
│  Search Query   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  SearchView     │
│  performSearch()│
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│EdgeFunctionService
│searchMemories() │
└────────┬────────┘
         │
         │ HTTP Request with query
         ↓
┌─────────────────┐
│  Supabase Edge  │
│  Function       │
│"search-memories"│
└────────┬────────┘
         │
         ├─── 1. Generate query embedding (AI)
         │
         ├─── 2. Vector similarity search in DB
         │
         ├─── 3. Rank by relevance score
         │
         └─── 4. Return top 5 matches
                    │
                    ↓
         ┌─────────────────┐
         │  SearchView     │
         │  Display Results│
         └─────────────────┘
```

---

## Summary

Memento AI is a sophisticated personal memory management application that combines:

1. **User Management:** Secure authentication with personal data isolation
2. **Memory Storage:** Cloud-based storage with categorization and timestamps
3. **AI Search:** Semantic search using vector embeddings for intelligent retrieval
4. **Chat Interface:** Conversational AI (planned) for natural interaction
5. **Cloud Backend:** Supabase infrastructure for scalable, reliable operation
6. **Modern UI:** Native mobile interface optimized for iOS

**Key Technical Highlights:**

- Serverless architecture with edge functions
- Vector database for AI-powered search
- Reactive UI with real-time state management
- Secure multi-user environment
- Hybrid AI approach (embeddings + cloud functions)

**Development Status:**

- ✅ Authentication system (complete)
- ✅ Memory CRUD operations (complete)
- ✅ Semantic search (complete)
- ✅ UI/UX for all features (complete)
- ⏳ Chat AI integration (pending)
- 📦 Currently in local development mode

---

## File Reference

**Main Application Entry:**

- [Memento_AIApp.swift](Memento AI/Memento_AIApp.swift) - App initialization

**User Interface Views:**

- [ContentView.swift](Memento AI/ContentView.swift) - Main hub with tabs
- [AuthView.swift](Memento AI/AuthView.swift) - Login/registration
- [AddMemoryView.swift](Memento AI/AddMemoryView.swift) - New memory form
- [SearchView.swift](Memento AI/SearchView.swift) - Search interface
- [ChatView.swift](Memento AI/ChatView.swift) - Chat interface

**Service Layer:**

- [AuthService.swift](Memento AI/AuthService.swift) - Authentication
- [DatabaseService.swift](Memento AI/DatabaseService.swift) - Data operations
- [EdgeFunctionService.swift](Memento AI/EdgeFunctionService.swift) - Cloud AI functions

**Configuration:**

- [SupabaseManager.swift](Memento AI/SupabaseManager.swift) - Backend client
- [SupabaseConfig.swift](Memento AI/SupabaseConfig.swift) - Environment config
- [Persistence.swift](Memento AI/Persistence.swift) - Legacy Core Data (unused)
