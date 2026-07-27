# COMPONENT_STRUCTURE.md: Laundry Checklist

This document outlines the component structure for the "Laundry Checklist" project, encompassing the Progressive Web App (PWA) for staff, the Customer Portal, and the Desktop App. The design adheres to principles of Clean Architecture, Modular Architecture, and Separation of Concerns, ensuring maintainability, scalability, and testability.

## Architectural Principles Applied

*   **Modular Architecture:** Each major feature (e.g., Authentication, Cashier, History) is treated as a distinct module, encapsulating its own components, services, and logic.
*   **Separation of Concerns:**
    *   **Presentation Layer (UI Components):** Responsible solely for rendering the UI and handling user interactions. These components are "dumb" or "presentational," receiving data and callbacks via props.
    *   **Application Layer (Services/Hooks):** Contains the application-specific business logic, orchestrates data flow, and interacts with the domain and infrastructure layers. UI components interact with these services/hooks.
    *   **Domain Layer (Entities/Models):** Defines the core business entities (e.g., `Transaction`, `Customer`, `Item`).
    *   **Infrastructure Layer (Repositories):** Handles data persistence and external integrations (e.g., Firestore, QZ Tray). Services interact with repositories.
*   **Repository Pattern:** Abstracting data access logic, allowing services to interact with a consistent interface regardless of the underlying data source (Firestore).
*   **Service Layer:** Provides a clear API for business operations, decoupling UI components from direct database interaction.

## Core Component Categories

Across all applications, components can be broadly categorized:

1.  **Layout Components:** Provide the overall page structure (headers, navigation, footers).
2.  **Feature Modules:** Group related UI components and their associated logic for a specific feature (e.g., `CashierModule`, `HistoryModule`).
3.  **UI Primitives / Shared Components:** Reusable, atomic UI elements (buttons, inputs, modals, toasts) built using Tailwind CSS and Shadcn/ui.
4.  **Application Services / Custom Hooks:** Encapsulate business logic, data fetching, state management, and interactions with the data layer. These are typically not UI components themselves but are consumed by UI components.

## 1. PWA (Staff Application)

The PWA is the primary application for laundry staff, focusing on item intake and transaction management.

### 1.1. Layout & Navigation

*   `AppLayout`: The main layout component, including `Header`, `NavigationBar`, and the main content area.
*   `Header`: Displays app title, potentially user info, and logout button.
*   `NavigationBar`: Contains links to Kasir, Riwayat, and Pengaturan.

### 1.2. Authentication Module

*   `AuthService`: Handles user authentication (login, logout, session management) using Firebase Authentication.
*   `LoginPage`: UI for staff login (email/password).
*   `AuthGuard`: A higher-order component or route guard to protect authenticated routes.

### 1.3. Kasir (Intake) Module

This module handles the creation of new laundry transactions.

*   `CashierPage`: Orchestrates the various form components for transaction input.
*   `CustomerInfoForm`:
    *   `CustomerNameInput`
    *   `TransactionDateInput`
    *   `ReceiptNumberInput`
*   `FixedItemsInput`:
    *   `ItemQuantityInput` (reusable for Pakaian, Celana Dalam, BH, Kaos Kaki).
*   `DynamicItemsInput`:
    *   `OtherItemRow`: Component for a single "Lain-lain" item (name + quantity).
    *   `AddOtherItemButton`: To add new dynamic item rows.
*   `TotalItemsDisplay`: Shows the automatically calculated total item count.
*   `TransactionSubmitButton`: Triggers the save operation.
*   `TransactionService`: (Application Service) Handles saving new transactions to Firestore, including uniqueness checks and offline queuing.

### 1.4. Riwayat (History) Module

This module allows staff to view, search, edit, and delete past transactions.

*   `HistoryPage`: Main page for displaying transaction history.
*   `HistorySearchInput`: Component for searching by receipt number or customer name.
*   `TransactionList`: Displays a paginated/infinite-scrolling list of `TransactionListItem` components.
*   `TransactionListItem`: Displays summary details for a single transaction (receipt no, customer, date, total items). Includes action buttons (View Detail, Edit, Delete).
*   `TransactionDetailModal`: Displays comprehensive details of a selected transaction.
    *   `ItemSummaryTable`: Reusable component to display fixed and dynamic items with quantities.
*   `TransactionEditForm`: Reuses input components from `CashierModule` but pre-populated with existing data. Handles update logic.
*   `ConfirmationDialog`: For delete operations.
*   `TransactionService`: (Application Service) Handles fetching, updating, and deleting transactions.

### 1.5. Pengaturan (Settings) Module

*   `SettingsPage`: Main page for outlet settings.
*   `OutletSettingsForm`:
    *   `OutletNameInput`
    *   `NotesTextarea`
*   `SaveSettingsButton`: Triggers the save operation.
*   `OutletService`: (Application Service) Handles fetching and saving outlet-specific settings.

### 1.6. Offline & Sync Components

*   `OfflineSyncIndicator`: A small UI component (e.g., a badge or icon) indicating online/offline status and pending sync operations.
*   `useOfflineStatusHook`: (Custom Hook) Provides real-time online/offline status.
*   `useSyncQueueHook`: (Custom Hook) Manages the local queue of transactions created offline and triggers synchronization when online.

## 2. Customer Portal

The Customer Portal is a read-only web application for customers to verify their transaction details.

### 2.1. Layout

*   `PortalLayout`: A simpler layout compared to the PWA, typically just a header and content area.

### 2.2. Search Module

*   `SearchPage`: The main entry point for customers.
*   `ReceiptSearchForm`:
    *   `ReceiptNumberInput`
    *   `CustomerNameInput`
    *   `SearchButton`: Triggers the search.
*   `PortalTransactionService`: (Application Service) Handles fetching read-only transaction data based on search criteria.

### 2.3. Transaction Display Module

*   `TransactionDetailPage`: Displays the details of a found transaction. This component is read-only and reuses the `ItemSummaryTable` from the PWA.
*   `NotFoundMessage`: Displays if no transaction matches the search.

## 3. Desktop App

The Desktop App is a web-based application primarily for searching transactions and printing receipts via QZ Tray.

### 3.1. Layout

*   `DesktopLayout`: Similar to the PWA layout but potentially optimized for larger screens.

### 3.2. Search Module

*   `SearchPage`: Main page for desktop search.
*   `DesktopSearchInput`: Similar to PWA's `HistorySearchInput`.
*   `TransactionList`: Displays search results, similar to PWA's history list.
*   `TransactionListItem`: Similar to PWA's history list item.
*   `DesktopTransactionService`: (Application Service) Handles fetching transaction data.

### 3.3. Transaction Display & Printing Module

*   `TransactionDetailPage`: Displays full transaction details, similar to PWA's detail view.
    *   `ItemSummaryTable`: Reused from PWA.
    *   `PrintButton`: Triggers the printing process.
*   `QZTrayService`: (Application Service) Manages communication with the local QZ Tray instance.
*   `PrintTemplateGenerator`: (Utility) Generates the ESC/POS formatted data for the thermal printer based on transaction details.
*   `QZTrayStatusIndicator`: Shows if QZ Tray is connected and ready.

## 4. Shared UI Primitives

These components are designed to be highly reusable across all applications where applicable, ensuring a consistent look and feel.

*   `Button`
*   `Input` (text, number, date)
*   `Textarea`
*   `Modal`
*   `ToastNotification`
*   `LoadingSpinner`
*   `ConfirmationDialog`
*   `Icon` (wrapper for SVG icons)
*   `Table` (for displaying lists/summaries)

## 5. Application Services & Hooks (Conceptual)

These represent the application layer logic, interacting with the data layer (Firestore via repositories) and providing clean interfaces to UI components.

*   `AuthService`: Manages user authentication state and interactions with Firebase Auth.
*   `TransactionService`: Handles all CRUD operations for `Transaction` entities, including offline queue management, data validation, and interaction with the `TransactionRepository`.
*   `OutletService`: Manages `Outlet` specific settings and data, interacting with the `OutletRepository`.
*   `QZTrayService`: Manages the lifecycle and commands for QZ Tray integration.
*   `useAuth`: React hook for accessing authentication state and actions.
*   `useTransactions`: React hook for fetching, adding, updating, and deleting transactions.
*   `useOutletSettings`: React hook for accessing and updating outlet settings.
*   `useOfflineSync`: React hook for managing and observing offline sync status.

## 6. Data Layer (Repositories)

While not UI components, the concept of repositories is crucial for the Clean Architecture. These abstract the data source.

*   `TransactionRepository`: Interface for `Transaction` data operations (e.g., `addTransaction`, `getTransactions`, `updateTransaction`, `deleteTransaction`). The implementation would interact directly with Firestore.
*   `OutletRepository`: Interface for `Outlet` data operations.

See [FOLDER_STRUCTURE.md] and [API_DESIGN.md] for more details on how these services and repositories are organized and interact.