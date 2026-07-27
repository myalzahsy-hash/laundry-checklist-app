# CODING_STANDARDS.md: Laundry Checklist

## 1. General Principles

Adherence to these principles ensures maintainable, scalable, and robust code.

### 1.1 Clean Code
Code should be easy to read, understand, and modify. Prioritize clarity over cleverness.

### 1.2 SOLID Principles
*   **Single Responsibility Principle (SRP):** Each module, class, or function should have only one reason to change.
*   **Open/Closed Principle (OCP):** Software entities should be open for extension, but closed for modification.
*   **Liskov Substitution Principle (LSP):** Objects in a program should be replaceable with instances of their subtypes without altering the correctness of that program.
*   **Interface Segregation Principle (ISP):** Clients should not be forced to depend on interfaces they do not use.
*   **Dependency Inversion Principle (DIP):** High-level modules should not depend on low-level modules. Both should depend on abstractions. Abstractions should not depend on details. Details should depend on abstractions.

### 1.3 DRY (Don't Repeat Yourself)
Avoid duplicating code. Abstract common logic into reusable functions, components, or services.

### 1.4 KISS (Keep It Simple, Stupid)
Favor simple, straightforward solutions over complex ones. Complexity increases the likelihood of bugs and reduces maintainability.

### 1.5 YAGNI (You Aren't Gonna Need It)
Do not add functionality until it is necessary. Avoid over-engineering.

## 2. Language & Framework Standards

### 2.1 TypeScript
*   **Strict Typing:** All new code must be written in TypeScript with strict mode enabled. Avoid `any` type unless absolutely necessary and justified.
*   **Interfaces vs. Types:** Use `interface` for defining object shapes and `type` for aliases, union types, or complex types.
*   **Enums vs. Union Types:** Prefer union types (`'pending' | 'success' | 'error'`) over string enums for better type safety and tree-shaking.
*   **Type Inference:** Let TypeScript infer types where possible to reduce verbosity, but explicitly define types for function parameters, return values, and complex object structures.
*   **Naming Conventions:**
    *   `PascalCase` for interfaces, types, enums, and React components.
    *   `camelCase` for variables, functions, and object properties.
    *   `SCREAMING_SNAKE_CASE` for global constants.

### 2.2 React
*   **Functional Components & Hooks:** Prefer functional components with React Hooks over class components.
*   **Component Naming:** Use `PascalCase` for component files and names (e.g., `CashierPage.tsx`, `TransactionItem.tsx`).
*   **Props:**
    *   Destructure props at the top of the component function signature.
    *   Define prop types using TypeScript interfaces.
    *   Avoid prop drilling; use context or Zustand for global state.
*   **State Management:**
    *   Use `useState` for local component state.
    *   Use `Zustand` for global application state (e.g., user session, outlet settings, offline sync queue).
*   **Side Effects:** Use `useEffect` for side effects (data fetching, subscriptions, DOM manipulation). Ensure proper dependency arrays to prevent infinite loops or stale closures.
*   **Conditional Rendering:** Use ternary operators or logical `&&` for simple conditions. For complex conditions, extract logic into helper functions or separate components.
*   **Error Boundaries:** Implement React Error Boundaries for gracefully handling rendering errors in parts of the UI.

### 2.3 Styling (Tailwind CSS & Shadcn/ui)
*   **Utility-First:** Apply Tailwind utility classes directly in JSX.
*   **Class Ordering:** Use a consistent order for Tailwind classes (e.g., layout, flexbox, grid, spacing, sizing, typography, background, border, effects, interactivity, state). Tools like `prettier-plugin-tailwindcss` can enforce this.
*   **Customization:** Extend Tailwind's configuration (`tailwind.config.js`) for project-specific colors, fonts, or spacing, rather than overriding utilities.
*   **Shadcn/ui:** Use Shadcn/ui components as the primary building blocks for UI elements. Customize them via Tailwind classes or by modifying the component source directly (as per Shadcn's design).

### 2.4 State Management (Zustand)
*   **Store Structure:** Define stores in `src/stores/` or within feature modules. Each store should represent a distinct piece of application state (e.g., `useAuthStore.ts`, `useOfflineQueueStore.ts`).
*   **Actions:** Define actions within the store to modify its state. Actions should encapsulate state update logic.
*   **Selectors:** Use selectors to derive computed state or to select specific parts of the state, preventing unnecessary re-renders.
*   **Immutability:** Always update state immutably.

### 2.5 Form Management (React Hook Form & Zod)
*   **`useForm` Hook:** Use `useForm` for all form management.
*   **Schema Validation:** Define form validation schemas using `Zod` and integrate them with `React Hook Form` via the `resolver` option.
*   **Controller Components:** For complex input types (e.g., date pickers, custom selects), wrap them with `Controller` from `react-hook-form` to integrate with the form state.
*   **Error Display:** Clearly display validation errors next to the corresponding input fields.

### 2.6 Firebase/Firestore Interaction
*   **Repository Pattern:** All direct Firestore interactions must be encapsulated within repository classes/functions. UI components or services should never directly import `firebase/firestore`.
*   **Error Handling:** Implement robust error handling for all Firestore operations, including network errors, permission denied, and quota issues.
*   **Security Rules:** Assume Firestore security rules are the primary enforcement mechanism for data access. Client-side code should not rely on its own checks for security.

## 3. Architectural Patterns & Structure

### 3.1 Clean Architecture / Modular Architecture
The project will follow a modular, layered architecture inspired by Clean Architecture principles to ensure separation of concerns.

*   **Domain Layer:** Contains core business entities, value objects, and business rules. Independent of all other layers.
    *   `src/core/domain/`: `Transaction.ts`, `Customer.ts`, `Item.ts`, `Outlet.ts`
*   **Application Layer:** Orchestrates domain objects to perform specific tasks. Contains application services and use cases.
    *   `src/core/application/services/`: `TransactionService.ts`, `OutletService.ts`
    *   `src/core/application/usecases/`: `CreateTransactionUseCase.ts`, `GetTransactionsUseCase.ts`
*   **Infrastructure Layer:** Implements interfaces defined in the domain/application layer. Deals with external concerns like databases, APIs, and external services.
    *   `src/infrastructure/repositories/firestore/`: `FirestoreTransactionRepository.ts`, `FirestoreOutletRepository.ts`
    *   `src/infrastructure/firebase/`: Firebase initialization, auth setup.
*   **Presentation Layer (UI):** React components, pages, and UI-specific logic. Depends on the Application Layer.
    *   `src/features/`: `cashier/`, `history/`, `settings/`, `auth/`
    *   `src/shared/components/`: Reusable UI components.

### 3.2 Repository Pattern
*   **Abstraction:** Define abstract interfaces for data access in the `domain` layer (e.g., `ITransactionRepository`).
*   **Implementation:** Implement these interfaces in the `infrastructure` layer (e.g., `FirestoreTransactionRepository`).
*   **Dependency Injection:** Services and use cases should depend on these abstract repository interfaces, not their concrete implementations.

### 3.3 Service Layer
*   **Business Logic:** Encapsulate all business logic within service classes or functions in the `application` layer.
*   **Orchestration:** Services orchestrate calls to repositories and domain objects.
*   **No UI/DB Direct Access:** Services should not directly interact with the UI or directly access the database.

### 3.4 Separation of Concerns
*   **UI (Presentation) Components:** Responsible for rendering and user interaction. Should call application services/use cases, not directly manipulate data or contain business logic.
*   **Business Logic:** Resides in the `application` layer (services/use cases).
*   **Data Access:** Handled by the `infrastructure` layer (repositories).

## 4. File Naming & Folder Structure

### 4.1 General Naming Conventions
*   **Files:** `kebab-case` for general files (e.g., `button.tsx`, `use-auth.ts`).
*   **Components:** `PascalCase` for component files (e.g., `CashierPage.tsx`, `TransactionItem.tsx`).
*   **Hooks:** `useHookName.ts` (e.g., `useAuth.ts`).
*   **Services:** `serviceName.ts` (e.g., `transactionService.ts`).
*   **Repositories:** `repositoryName.ts` (e.g., `firestoreTransactionRepository.ts`).
*   **Interfaces/Types:** `interfaceName.ts` or `typeName.ts` (e.g., `ITransaction.ts`).

### 4.2 Core Folder Structure
```
src/
├── App.tsx
├── main.tsx
├── assets/
├── core/
│   ├── application/  // Application services, use cases, DTOs
│   │   ├── services/
│   │   └── usecases/
│   └── domain/       // Core entities, value objects, interfaces
│       ├── entities/
│       ├── interfaces/
│       └── value-objects/
├── features/         // Feature-specific modules (PWA pages, components, hooks)
│   ├── auth/
│   ├── cashier/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── pages/CashierPage.tsx
│   ├── history/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── pages/HistoryPage.tsx
│   └── settings/
│       ├── components/
│       ├── hooks/
│       └── pages/SettingsPage.tsx
├── infrastructure/   // Concrete implementations of interfaces (Firestore, Auth)
│   ├── firebase/
│   ├── repositories/
│   │   └── firestore/
│   └── services/     // External service integrations (e.g., QZ Tray client)
├── lib/              // Utility functions, helpers, constants
│   ├── constants.ts
│   ├── utils.ts
│   └── validation/
├── stores/           // Zustand stores
│   ├── authStore.ts
│   └── offlineQueueStore.ts
├── shared/           // Reusable components, hooks, types across features
│   ├── components/
│   ├── hooks/
│   └── types/
└── styles/           // Tailwind CSS config, global CSS
```

## 5. Linting & Formatting

### 5.1 ESLint
*   Use ESLint with recommended React, TypeScript, and Prettier configurations.
*   All code must pass ESLint checks without warnings or errors.
*   Configure rules to enforce best practices (e.g., `react-hooks/exhaustive-deps`).

### 5.2 Prettier
*   Use Prettier for automatic code formatting.
*   Integrate Prettier with ESLint to avoid conflicts.
*   Configure `prettier.config.js` for consistent formatting (e.g., single quotes, trailing commas).

### 5.3 Pre-commit Hooks
*   Implement Git pre-commit hooks (e.g., using Husky and `lint-staged`) to automatically run ESLint and Prettier on staged files before committing. This ensures code quality before it enters the repository.

## 6. Testing

### 6.1 Unit Tests
*   Use `Vitest` for unit testing.
*   Test individual functions, components (shallow rendering), and services in isolation.
*   Aim for high code coverage for critical business logic (services, repositories, domain entities).
*   Test files should be co-located with the code they test, using a `.test.ts` or `.test.tsx` suffix (e.g., `transactionService.test.ts`).

### 6.2 Integration Tests
*   Test the interaction between multiple units (e.g., a service interacting with a repository).
*   Mock external dependencies (e.g., Firestore calls) where appropriate.

### 6.3 End-to-End (E2E) Tests (Future)
*   Consider Playwright or Cypress for E2E tests to simulate user flows across the entire application. (Not in MVP scope, but good to keep in mind).

## 7. Version Control (Git)

### 7.1 Branching Strategy
*   Follow a `GitHub Flow` or `Git Flow` strategy.
    *   `main` branch is always deployable.
    *   Feature branches (`feature/my-new-feature`) for new functionality.
    *   Bugfix branches (`bugfix/fix-login-issue`) for bug fixes.
    *   Release branches (`release/v1.0.0`) for preparing releases.
*   Never commit directly to `main`.

### 7.2 Commit Messages
*   Use conventional commit messages (e.g., `feat: add cashier page`, `fix: correct item count calculation`, `docs: update README`).
*   Commit messages should be concise, descriptive, and explain *what* was changed and *why*.

### 7.3 Pull Requests (PRs)
*   All code changes must go through a Pull Request review process.
*   PRs should be small, focused, and address a single feature or bug.
*   Require at least one approval before merging to `main`.

## 8. Security in Code

### 8.1 Input Validation & Sanitization
*   Validate all user inputs on the client-side using `Zod` and `React Hook Form`.
*   Re-validate critical inputs on the server-side (implicitly handled by Firestore security rules and data modeling, but be mindful if any server-side functions are introduced).
*   Sanitize any user-generated content before displaying it to prevent XSS attacks (e.g., using libraries like `DOMPurify` if dynamic HTML is ever rendered).

### 8.2 Environment Variables
*   Store sensitive configuration (e.g., Firebase API keys, QZ Tray server URLs) in environment variables.
*   Do not hardcode secrets in the codebase.
*   Use Vite's `import.meta.env` for client-side environment variables.

### 8.3 Firebase Security Rules
*   All data access (read/write) to Firestore must be explicitly controlled by Firebase Security Rules.
*   Rules must enforce outlet-level isolation and user permissions as defined in `PRD.md`.
*   Regularly review and test security rules.

### 8.4 Authentication
*   Leverage Firebase Authentication for staff login.
*   Do not store user credentials directly in client-side storage. Firebase Auth handles token management securely.

## 9. Documentation

### 9.1 JSDoc/TSDoc
*   Document all public functions, components, interfaces, and complex logic using JSDoc/TSDoc comments.
*   Explain parameters, return values, and the purpose of the code.

### 9.2 READMEs
*   Maintain a `README.md` for the overall project.
*   Consider adding `README.md` files within complex feature modules or shared libraries to explain their purpose and usage.

## 10. Performance Considerations

### 10.1 Memoization
*   Use `React.memo`, `useMemo`, and `useCallback` to prevent unnecessary re-renders of components and recalculations of expensive values/functions.
*   Apply judiciously; over-memoization can introduce its own overhead.

### 10.2 Lazy Loading
*   Implement React's `lazy` and `Suspense` for code splitting and lazy loading of routes/components to reduce initial bundle size and improve load times.

### 10.3 Firestore Query Optimization
*   Design Firestore queries to be efficient, using indexes and avoiding large document reads.
*   Implement pagination or infinite scroll for lists (e.g., History page) to limit data fetched.

### 10.4 PWA Caching Strategy
*   Ensure Workbox is configured correctly for aggressive caching of static assets and a sensible runtime caching strategy for API responses (if applicable).
*   Manage cache expiration to prevent stale data and excessive storage usage.