# FOLDER_STRUCTURE.md: Laundry Checklist

This document outlines the proposed folder structure for the "Laundry Checklist" project, designed to adhere to Clean Architecture, SOLID principles, Repository Pattern, Service Layer, and Modular Architecture. The structure separates concerns across different layers and applications (PWA, Customer Portal, Desktop App) while maximizing code reuse.

## Root Level

```
.
├── public/
├── src/
├── .env
├── .eslintrc.cjs
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── tailwind.config.js
```

### Description

*   `.env`: Environment variables.
*   `.eslintrc.cjs`: ESLint configuration for code quality.
*   `.gitignore`: Specifies intentionally untracked files to ignore.
*   `index.html`: The main HTML entry point for all web applications (PWA, Portal, Desktop), configured via `vite.config.ts` to load different `main.tsx` files.
*   `package.json`: Project metadata and dependencies.
*   `public/`: Static assets (e.g., `icons/`, `manifest.json` for PWA, `robots.txt`).
*   `tailwind.config.js`: Tailwind CSS configuration.
*   `tsconfig.json`, `tsconfig.node.json`: TypeScript configuration files.
*   `vite.config.ts`: Vite build tool configuration, including multiple entry points for PWA, Portal, and Desktop apps, and PWA plugin settings.

## `src/` Directory

The `src/` directory contains all application source code, organized into distinct layers and application-specific modules.

```
src/
├── apps/
├── core/
├── data/
├── shared/
├── ui/
├── config/
├── tests/
├── vite-env.d.ts
└── main.tsx (Optional, if all apps have dedicated entry points)
```

### `src/apps/`

Contains the entry points and application-specific logic for each distinct application (PWA, Customer Portal, Desktop App). This ensures clear separation and allows for independent deployment and configuration.

```
src/apps/
├── pwa/             # Staff PWA Application
│   ├── main.tsx     # PWA entry point
│   ├── App.tsx      # Root component for PWA
│   ├── router/      # React Router configuration for PWA
│   │   └── index.ts
│   ├── features/    # Feature-specific modules for PWA
│   │   ├── cashier/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── pages/CashierPage.tsx
│   │   ├── history/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── pages/HistoryPage.tsx
│   │   └── settings/
│   │       ├── components/
│   │       ├── hooks/
│   │       └── pages/SettingsPage.tsx
│   └── config/pwa.ts # PWA-specific configurations (e.g., manifest generation options)
├── portal/          # Customer Portal Application
│   ├── main.tsx     # Portal entry point
│   ├── App.tsx      # Root component for Portal
│   ├── router/      # React Router configuration for Portal
│   │   └── index.ts
│   └── features/    # Feature-specific modules for Portal
│       ├── search/
│       │   ├── components/
│       │   └── pages/SearchPage.tsx
│       └── transaction-detail/
│           ├── components/
│           └── pages/TransactionDetailPage.tsx
└── desktop/         # Desktop Web Application (for QZ Tray printing)
    ├── main.tsx     # Desktop app entry point
    ├── App.tsx      # Root component for Desktop app
    ├── router/      # React Router configuration for Desktop app
    │   └── index.ts
    ├── features/    # Feature-specific modules for Desktop app
    │   ├── search/
    │   │   ├── components/
    │   │   └── pages/SearchPage.tsx
    │   ├── transaction-detail/
    │   │   ├── components/
    │   │   └── pages/TransactionDetailPage.tsx
    │   └── printing/
    │       ├── services/qz-tray.ts # QZ Tray integration logic
    │       └── utils/print-template.ts # ESC/POS template generation
    └── config/      # Desktop-specific configurations
```

### `src/core/`

The `core/` directory represents the **Domain** and **Application** layers of Clean Architecture. It contains the business logic, domain entities, value objects, and use cases, completely independent of UI or data storage.

```
src/core/
├── domain/          # Entities, Value Objects, Aggregates, Interfaces (Contracts)
│   ├── transaction/
│   │   ├── Transaction.ts           # Transaction entity
│   │   └── ITransactionRepository.ts # Interface for transaction data access
│   ├── customer/Customer.ts
│   ├── item/Item.ts
│   ├── outlet/
│   │   ├── Outlet.ts                # Outlet entity
│   │   └── IOutletRepository.ts     # Interface for outlet data access
│   └── user/User.ts
├── use-cases/       # Application-specific business rules, orchestrating domain and repositories
│   ├── transaction/
│   │   ├── CreateTransaction.ts
│   │   ├── GetTransactionHistory.ts
│   │   ├── GetTransactionDetail.ts
│   │   ├── UpdateTransaction.ts
│   │   └── DeleteTransaction.ts
│   ├── outlet/
│   │   └── UpdateOutletSettings.ts
│   └── auth/SignIn.ts
├── services/        # Cross-cutting business logic not tied to a single entity
│   ├── OfflineSyncService.ts
│   └── AuthManagementService.ts
└── ports/           # Interfaces for external services (e.g., IAuthService, IPrinterService)
```

### `src/data/`

The `data/` directory represents the **Infrastructure** layer. It contains the concrete implementations of repository interfaces, data mappers, and direct interactions with external services like Firebase.

```
src/data/
├── repositories/    # Implementations of domain repository interfaces
│   ├── firestore/
│   │   ├── FirestoreTransactionRepository.ts
│   │   └── FirestoreOutletRepository.ts
│   └── auth/FirebaseAuthRepository.ts
├── firebase/        # Firebase SDK initialization and instances
│   ├── index.ts     # Firebase app initialization
│   ├── firestore.ts # Firestore instance
│   └── auth.ts      # Auth instance
├── mappers/         # Convert between domain entities and data models (DTOs)
│   ├── TransactionMapper.ts
│   └── OutletMapper.ts
├── dtos/            # Data Transfer Objects for API/DB interaction
│   ├── TransactionDTO.ts
│   └── OutletDTO.ts
└── local/           # Local storage for offline queue (e.g., IndexedDB)
    └── IndexedDBQueue.ts
```

### `src/shared/`

Contains code that is reusable across all applications and layers, promoting consistency and reducing duplication.

```
src/shared/
├── components/      # Generic, app-agnostic UI components (e.g., LoadingSpinner, ErrorMessage)
├── hooks/           # Generic utility hooks (e.g., useDebounce)
├── utils/           # Helper functions and utilities
│   ├── validation/  # Zod schemas for validation
│   │   └── transactionSchema.ts
│   └── index.ts     # General utility functions (e.g., formatDate, calculateTotalItems)
├── types/           # Global TypeScript types/interfaces
├── constants/       # Global constants (e.g., API_URLS, default values)
├── enums/           # Global enums
├── lib/             # External library configurations/wrappers
│   └── zustand.ts   # Zustand store setup for global state
└── contexts/        # Global React contexts
```

### `src/ui/`

Contains the design system and common UI components, potentially built on top of Shadcn/ui.

```
src/ui/
├── components/      # Shadcn/ui generated components and custom wrappers
│   ├── ui/          # Shadcn/ui generated components (e.g., Button, Input, Dialog)
│   └── custom/      # Project-specific UI components built from Shadcn/ui or custom
├── layouts/         # Common layouts (e.g., AuthLayout, BaseLayout)
├── styles/          # Global styles and Tailwind CSS configuration
│   ├── index.css
│   └── tailwind.css
└── assets/          # Common UI assets (e.g., logos, fonts, generic images)
```

### `src/config/`

Global configuration files for the entire project.

```
src/config/
├── firebase.ts      # Firebase project configuration (API keys, project ID)
└── environment.ts   # Environment-specific variables and settings
```

### `src/tests/`

Dedicated directory for all types of tests.

```
src/tests/
├── unit/            # Unit tests for individual functions, components, use cases
├── integration/     # Integration tests for interactions between modules
└── e2e/             # End-to-end tests (e.g., using Playwright or Cypress)
```