# TESTING.md: Laundry Checklist

## Test Strategy

The testing strategy for Laundry Checklist will follow a multi-layered approach to ensure reliability, functionality, performance, and security across all application types (PWA, Customer Portal, Desktop App).

### Unit Testing
Focuses on individual functions, components, and modules in isolation. This ensures that the smallest testable parts of the application work correctly according to their specifications.

### Integration Testing
Verifies the interactions between different modules or services. This includes testing the integration of UI components with business logic, service layers with repositories, and the application with external services like Firestore.

### End-to-End (E2E) Testing
Simulates real user scenarios across the entire application flow, from UI interactions to database operations. E2E tests will cover critical user journeys for the PWA, Customer Portal, and Desktop App.

### PWA Specific Testing
Dedicated testing for PWA features such as offline capabilities, installation prompts, service worker registration, and manifest configurations.

### Performance Testing
Evaluates the application's responsiveness, stability, and scalability under various workloads, including page load times, search response, and Firestore latency.

### Security Testing
Identifies vulnerabilities in authentication, data access (Firestore Security Rules), and input validation.

### Accessibility Testing
Ensures the application is usable by people with disabilities, adhering to WCAG 2.1 Level AA standards.

## Testing Tools

| Category | Tool | Purpose |
|:---|:---|:---|
| **Unit/Integration** | Vitest | Fast unit and component testing for React/TypeScript. |
| **UI Component** | React Testing Library | Testing React components in a way that simulates user interaction. |
| **E2E Testing** | Playwright / Cypress | Browser automation for end-to-end user flow testing across PWA, Portal, and Desktop web app. |
| **PWA Audit** | Lighthouse | Auditing PWA performance, accessibility, best practices, and SEO. |
| **Mocking/Stubbing** | MSW (Mock Service Worker) | Intercepting network requests for isolated testing of API calls. |
| **Schema Validation** | Zod | Runtime validation of data structures, used in conjunction with form validation. |
| **Firestore Rules** | Firebase Emulator Suite | Testing Firestore Security Rules locally before deployment. |
| **QZ Tray Integration** | Manual Testing / Custom Scripts | Verifying communication with QZ Tray and thermal printer output. |

## Test Coverage Targets

| Test Type | Target Coverage | Rationale |
|:---|:---|:---|
| **Unit Tests** | ≥ 80% (Lines, Branches, Functions) | Critical business logic, utility functions, data transformations. |
| **Integration Tests** | ≥ 70% (Lines, Branches, Functions) | Service layer, repository interactions, component-to-component communication. |
| **E2E Tests** | ≥ 90% of Critical User Journeys | Core workflows (transaction creation, search, edit, print, customer lookup). |
| **Firestore Security Rules** | 100% of defined rules | Prevent unauthorized data access and manipulation. |
| **PWA Lighthouse Score** | ≥ 90 (Performance, PWA, Best Practices) | Ensure high-quality PWA experience. |

## Test Cases by Feature

### Phase 1: PWA for Staff

#### FR-1.1: Authentication & Outlet Assignment
*   **Unit:** Test Firebase Auth service functions (login, logout).
*   **Integration:** Verify user context (outlet assignment) after successful login.
*   **E2E:**
    *   Successful login with valid credentials.
    *   Failed login with invalid credentials.
    *   Session persistence after app restart.
    *   Logout functionality.

#### FR-1.2: Kasir (Intake) Page - Input Section
*   **Unit:**
    *   Validate form fields (required, max length, numeric range).
    *   Test `receipt number` uniqueness check logic (per outlet, per day).
*   **Integration:**
    *   Verify form state management (e.g., `Zustand` store updates).
    *   Test `React Hook Form` validation rules.
*   **E2E:**
    *   Enter valid customer name, date, receipt number.
    *   Enter quantities for fixed items (0, positive, max value).
    *   Attempt to save with missing required fields.
    *   Attempt to save with duplicate receipt number (same outlet, same day).

#### FR-1.3: Kasir (Intake) Page - Dynamic "Lain-lain" (Other) Section
*   **Unit:** Test logic for adding/removing dynamic items.
*   **Integration:** Verify UI updates correctly when adding/removing rows.
*   **E2E:**
    *   Add multiple "Lain-lain" items with valid names and quantities.
    *   Delete individual "Lain-lain" items.
    *   Attempt to save with empty "Lain-lain" item name or zero quantity.
    *   Verify unlimited rows can be added.

#### FR-1.4: Kasir (Intake) Page - Auto-Calculation & Submission
*   **Unit:** Test total item calculation logic (sum of fixed + dynamic).
*   **Integration:** Verify `FirestoreRepository` `saveTransaction` method.
*   **E2E:**
    *   Verify total item count updates dynamically as items are added/changed.
    *   Successfully save a transaction and verify success notification.
    *   Verify form clears after successful save.
    *   Check if saved transaction appears in `Riwayat` page.

#### FR-1.5: Riwayat (History) Page - List View
*   **Integration:** Test `FirestoreRepository` `getTransactions` method with filtering and pagination.
*   **E2E:**
    *   Load history page and verify transactions are displayed in reverse chronological order.
    *   Use search bar to filter by receipt number (case-insensitive).
    *   Use search bar to filter by customer name (case-insensitive).
    *   Verify pagination/infinite scroll loads more items.
    *   Click edit icon to navigate to detail view.
    *   Click delete icon, confirm deletion, and verify transaction removal.

#### FR-1.6: Riwayat (History) Page - Detail View
*   **Integration:** Test `FirestoreRepository` `updateTransaction` method.
*   **E2E:**
    *   View transaction details, verifying all fields are displayed correctly.
    *   Enter edit mode, modify quantities of fixed and dynamic items.
    *   Save changes and verify update in Firestore and history list.
    *   Cancel changes and verify no update occurs.
    *   Delete transaction from detail view.

#### FR-1.7: Pengaturan (Settings) Page
*   **Integration:** Test `FirestoreRepository` `updateOutletSettings` method.
*   **E2E:**
    *   Load settings page and verify current outlet name and notes are displayed.
    *   Update outlet name and notes.
    *   Save changes and verify success notification.
    *   Verify updated settings persist after page refresh.

#### FR-1.8: Offline Capability
*   **Unit:** Test `Zustand` store for queuing offline transactions.
*   **Integration:** Test `Workbox` service worker registration and caching strategy.
*   **E2E:**
    *   Go offline:
        *   View cached `Riwayat` transactions.
        *   Create a new transaction in `Kasir` page.
        *   Verify transaction is queued locally (e.g., via UI indicator).
    *   Go online:
        *   Verify queued transaction automatically syncs to Firestore.
        *   Verify transaction appears in `Riwayat` page and Firestore.
        *   Test conflict resolution (e.g., edit a transaction offline, then edit same transaction online before sync).

#### FR-1.9: PWA Installation & Manifest
*   **E2E (Manual/Lighthouse):**
    *   Verify PWA install prompt appears on supported devices/browsers.
    *   Install PWA to home screen.
    *   Launch PWA from home screen in standalone mode.
    *   Verify splash screen and app icon.
    *   Run Lighthouse audit for PWA score.

### Phase 2: Customer Portal

#### FR-2.1: Portal Authentication
*   **Integration:** Test `FirestoreRepository` `findTransactionByReceiptAndCustomer` method.
*   **E2E:**
    *   Search with valid receipt number and customer name.
    *   Search with invalid receipt number or customer name.
    *   Search with only one field provided.
    *   Test rate-limiting for search queries.

#### FR-2.2: Portal Search & Display
*   **E2E:**
    *   Verify displayed transaction details match staff detail view.
    *   Confirm no edit/delete options are visible.
    *   Verify "Back" button returns to search form.
    *   Test responsiveness across different screen sizes.

#### FR-2.3: Portal Hosting
*   **E2E (Manual):**
    *   Verify portal is accessible at its designated subdomain.
    *   Check HTTPS is enforced.

### Phase 3: Desktop App with Printing

#### FR-3.1: Desktop Search Interface
*   **E2E:**
    *   Search by receipt number and customer name.
    *   Verify search results match PWA history list.
    *   Click on a transaction to view details.

#### FR-3.2: Desktop Detail & Print
*   **Integration:** Test QZ Tray communication logic.
*   **E2E:**
    *   View transaction details, verifying all fields are displayed.
    *   Click "Print" button.
    *   Verify QZ Tray is detected and print job is sent.
    *   **Manual:** Verify thermal printer output matches the specified ESC/POS template (header, details, item list, total, footer).
    *   Test scenarios where QZ Tray is not installed or not running.
    *   Verify print success/failure notifications.

#### FR-3.3: Desktop Deployment
*   **E2E (Manual):**
    *   Verify desktop app is accessible at its designated subdomain.
    *   Check QZ Tray detection on page load.

## Performance Testing

*   **Lighthouse Audits:** Regularly run Lighthouse on PWA and Portal to monitor performance metrics (FCP, LCP, TBT, CLS).
*   **Load Testing (Future):** Simulate concurrent users and transaction volumes to identify bottlenecks in Firestore reads/writes and application responsiveness.
*   **Firestore Monitoring:** Utilize Firebase Console's monitoring tools to track read/write operations, latency, and quota usage.

## Security Testing

*   **Firestore Security Rules:** Comprehensive unit and integration tests using Firebase Emulator Suite to ensure:
    *   Staff can only access/modify data for their assigned outlet.
    *   Customers can only read specific transaction data via the portal.
    *   No unauthorized write access.
*   **Input Validation:** Verify all client-side and server-side (Firestore rules) input validations prevent malicious data injection (e.g., XSS, SQL injection attempts in text fields).
*   **Authentication:** Test Firebase Authentication flows for robustness against common attacks (e.g., brute-force login attempts, session hijacking).
*   **Rate Limiting:** Verify rate limits on customer portal search to prevent brute-force attacks on transaction data.

## Accessibility Testing

*   **Automated Tools:** Integrate tools like Axe-core into CI/CD for automated accessibility checks on UI components.
*   **Manual Review:** Conduct manual accessibility audits using screen readers (e.g., NVDA, VoiceOver), keyboard navigation, and color contrast checkers to ensure WCAG 2.1 Level AA compliance.
*   **User Testing:** Include users with disabilities in UAT phases.

## CI/CD Integration

All automated tests (Unit, Integration, E2E) will be integrated into the CI/CD pipeline.

*   **Pre-commit Hooks:** Run unit tests and linting checks before code is committed.
*   **Pull Request Checks:** Automatically trigger unit, integration, and E2E tests on every pull request.
    *   Build and deploy to a staging environment for E2E tests.
    *   Run Firebase Emulator Suite for Firestore Security Rules validation.
*   **Deployment:** Only allow deployment to production environments if all tests pass and code quality gates are met.
*   **Lighthouse CI:** Integrate Lighthouse audits into the CI pipeline to track PWA performance and quality metrics over time.