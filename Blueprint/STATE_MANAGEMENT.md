# STATE_MANAGEMENT.md: Laundry Checklist

## 1. Introduction

Effective state management is crucial for the "Laundry Checklist" application, given its PWA nature, offline capabilities, and the need for a consistent user experience across multiple platforms (PWA, Customer Portal, Desktop App). This document outlines the strategy and implementation details for managing application state, primarily leveraging Zustand as the chosen state management library.

## 2. Overall Strategy

The state management strategy for Laundry Checklist adheres to the principles of Clean Architecture and Separation of Concerns.

*   **Centralized, Modular Stores:** Application state will be organized into distinct, domain-specific Zustand stores (e.g., `AuthStore`, `TransactionStore`, `SettingsStore`). Each store will manage its own slice of the global state.
*   **UI-Agnostic State:** State logic will be decoupled from UI components. UI components will dispatch actions or call methods on stores, and react to state changes, but will not contain complex state manipulation logic.
*   **Service Layer Interaction:** Zustand stores will interact with the application's Service Layer to perform asynchronous operations (e.g., fetching data from Firestore, saving transactions). This ensures that business logic resides outside the UI and state management layer.
*   **Offline-First Approach:** A core aspect of the PWA is its offline capability. State management will explicitly handle offline data queuing and synchronization with Firestore.
*   **Persistence:** Critical state (e.g., user authentication, offline transaction queue) will be persisted locally to ensure data integrity and a seamless user experience across sessions.

## 3. Core State Modules (Zustand Stores)

Zustand will be used to create lightweight, reactive stores for different domains of the application. Each store will expose state and actions/methods to interact with that state.

### 3.1. Auth Store (`useAuthStore`)

Manages user authentication status and related information.

| State Property | Type | Description | Persistence |
|:---|:---|:---|:---|
| `isAuthenticated` | `boolean` | True if a user is logged in. | Local Storage |
| `user` | `User | null` | Firebase User object or custom user profile. | Local Storage |
| `outletId` | `string | null` | ID of the outlet the user is assigned to. | Local Storage |
| `isLoading` | `boolean` | Indicates if authentication state is being loaded. | No |
| `error` | `string | null` | Any authentication error message. | No |

**Key Actions:**
*   `login(credentials)`: Authenticates user, sets `isAuthenticated`, `user`, `outletId`.
*   `logout()`: Clears authentication state.
*   `setUser(user, outletId)`: Sets user and outlet details (e.g., after initial load or refresh).

### 3.2. Outlet Settings Store (`useSettingsStore`)

Manages the current outlet's configurable settings.

| State Property | Type | Description | Persistence |
|:---|:---|:---|:---|
| `outletName` | `string` | Name of the current outlet. | Local Storage |
| `notes` | `string` | General notes for the outlet. | Local Storage |
| `isLoading` | `boolean` | Indicates if settings are being loaded/saved. | No |
| `error` | `string | null` | Any error message during settings operations. | No |

**Key Actions:**
*   `loadSettings(outletId)`: Fetches settings from Firestore for the given `outletId`.
*   `updateSettings(newSettings)`: Updates settings in Firestore and local state.

### 3.3. Transaction Store (`useTransactionStore`)

This is the most critical store, managing the creation, display, and synchronization of laundry transactions.

| State Property | Type | Description | Persistence |
|:---|:---|:---|:---|
| `transactions` | `Transaction[]` | List of transactions for the history view. | IndexedDB (cached) |
| `currentTransaction` | `TransactionDraft | null` | Transaction being created or edited in the "Kasir" page. | No |
| `offlineQueue` | `TransactionDraft[]` | Transactions created offline, awaiting sync. | IndexedDB |
| `isLoading` | `boolean` | Indicates if transactions are being loaded/saved. | No |
| `error` | `string | null` | Any error message during transaction operations. | No |
| `syncStatus` | `string` | "idle", "syncing", "error", "success". | No |
| `searchQuery` | `string` | Current search term for history view. | No |
| `paginationOffset` | `number` | Offset for infinite scroll/pagination. | No |

**Key Actions:**
*   `loadTransactions(outletId, query, offset)`: Fetches transactions from Firestore (or cache) for history.
*   `addTransaction(transactionDraft)`: Adds a new transaction. If offline, adds to `offlineQueue`. If online, saves to Firestore.
*   `updateTransaction(transactionId, updates)`: Updates an existing transaction.
*   `deleteTransaction(transactionId)`: Deletes a transaction.
*   `setCurrentTransaction(draft)`: Sets the transaction being worked on in the "Kasir" page.
*   `clearCurrentTransaction()`: Clears the draft.
*   `addToOfflineQueue(transactionDraft)`: Adds a transaction to the local queue.
*   `processOfflineQueue()`: Attempts to sync transactions from `offlineQueue` to Firestore.
*   `setSearchQuery(query)`: Updates the search filter.
*   `setPaginationOffset(offset)`: Updates the pagination offset.

### 3.4. UI State Store (`useUIStore`)

Manages general UI-related state that doesn't belong to specific domain stores (e.g., global loading indicators, modal visibility).

| State Property | Type | Description | Persistence |
|:---|:---|:---|:---|
| `isGlobalLoading` | `boolean` | Global loading spinner visibility. | No |
| `isModalOpen` | `boolean` | Generic modal visibility. | No |
| `modalContent` | `ReactNode | null` | Content to display in the generic modal. | No |
| `toastMessage` | `ToastMessage | null` | Message for global toast notifications. | No |

**Key Actions:**
*   `showLoading()`: Activates global loading.
*   `hideLoading()`: Deactivates global loading.
*   `showModal(content)`: Displays a modal.
*   `hideModal()`: Hides the modal.
*   `showToast(message, type)`: Displays a toast notification.

## 4. Offline State Management

The PWA's offline capability is a critical feature, managed through a combination of Zustand and local persistence.

*   **Online-First Architecture:** The application primarily operates online, fetching and syncing data with Firestore.
*   **Offline Queue (Zustand + IndexedDB):**
    *   When the device is offline, any new transaction creation or existing transaction modification attempts will be intercepted by the Service Layer.
    *   Instead of directly calling Firestore, these operations will be added to the `offlineQueue` within the `useTransactionStore`.
    *   The `offlineQueue` will be persisted using `zustand-persist` (or a similar mechanism) to IndexedDB, ensuring that queued transactions survive app restarts.
*   **Sync Mechanism:**
    *   A background process (e.g., a service worker or a periodic check within the app) will monitor network connectivity.
    *   When connectivity is restored, the `processOfflineQueue()` action will be dispatched.
    *   This action will iterate through the `offlineQueue`, attempting to send each transaction to Firestore via the Service Layer.
    *   Successful syncs will remove transactions from the queue. Failed syncs (e.g., due to Firestore errors or conflicts) will keep the transaction in the queue, potentially with an error flag, for retry.
*   **Conflict Resolution:** As per PRD, a "last-write-wins" strategy will be employed for conflicts during sync, where the server-side timestamp determines the final state. This will be handled by the Firestore rules and Service Layer logic.
*   **Cached Data (Workbox + IndexedDB):** For read operations, Workbox will cache static assets and API responses. For transaction history, the `useTransactionStore` will cache recently viewed transactions in IndexedDB, allowing users to view existing data even when offline.

## 5. Data Flow & Interaction

1.  **UI Component:** Triggers an action (e.g., `useTransactionStore.addTransaction()`).
2.  **Zustand Store:** Receives the action, updates its local state immediately (for optimistic UI updates if applicable), and then calls a method on the **Service Layer**.
3.  **Service Layer:** Contains the business logic. It determines whether to interact with Firestore directly (if online) or add the operation to the `offlineQueue` (if offline). It also handles data transformation and validation.
4.  **Repository Layer (Implicit/Firestore SDK):** The Service Layer uses the Firebase Firestore SDK to interact with the database.
5.  **Firestore:** Persists the data.
6.  **Firestore Listeners (for real-time updates):** For certain data (e.g., `transactions` list), the Service Layer might set up real-time listeners. When Firestore data changes, these listeners trigger updates back through the Service Layer to the Zustand store, which then updates the UI.

## 6. Persistence

Critical application state needs to be persisted across browser sessions or app restarts.

*   **Local Storage:** Used for lightweight, non-sensitive data like `isAuthenticated`, `user` ID, and `outletId` from the `AuthStore`, and `outletName`, `notes` from `SettingsStore`. This allows for quick re-hydration of user context.
*   **IndexedDB:** Used for more substantial data, specifically the `offlineQueue` from the `TransactionStore` and cached `transactions` for offline viewing. This provides robust, larger-capacity storage for structured data.
*   **Zustand Middleware:** Libraries like `zustand-persist` or custom middleware will be used to automatically synchronize specific Zustand store slices with Local Storage or IndexedDB.

## 7. Rationale for Zustand

Zustand was chosen for state management due to the following reasons:

*   **Simplicity and Minimalism:** It's a small, fast, and unopinionated library that requires minimal boilerplate, making it easy to learn and integrate.
*   **Hooks-Based API:** Integrates seamlessly with React's functional components and hooks paradigm.
*   **Performance:** Renders only components that subscribe to specific state changes, leading to efficient updates.
*   **Flexibility:** Allows for easy integration with middleware for persistence (e.g., `zustand-persist`) and debugging.
*   **Scalability:** While simple, it's capable of handling complex application states by organizing them into modular stores, aligning with the Clean Architecture principles.
*   **TypeScript Support:** Excellent TypeScript support ensures type safety throughout the state management layer.