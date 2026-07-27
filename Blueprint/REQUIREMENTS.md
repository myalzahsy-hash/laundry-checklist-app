# REQUIREMENTS.md: Laundry Checklist

## Functional Requirements

### Phase 1: PWA for Staff

#### FR-1.1: Authentication and Authorization
The PWA SHALL provide a secure authentication mechanism for staff users.
-   AC: Staff MUST be able to log in using their registered email and password via Firebase Authentication.
-   AC: Upon successful login, the system SHALL automatically assign the staff user to their designated outlet.
-   AC: The PWA SHALL maintain the user's session across application restarts until explicitly logged out.

#### FR-1.2: Kasir (Intake) Page - Customer and Transaction Information
The PWA SHALL allow staff to input essential customer and transaction details.
-   AC: Staff MUST be able to input the customer's name (max 100 characters) into a dedicated text field.
-   AC: Staff MUST be able to select a transaction date using a date picker, which SHALL default to the current date.
-   AC: Staff MUST be able to input a unique receipt number (alphanumeric, max 50 characters) for the current outlet and day.
-   AC: The system SHALL prevent saving a transaction if the receipt number is not unique for the given outlet and day, displaying an appropriate error message.

#### FR-1.3: Kasir (Intake) Page - Fixed Item Categories
The PWA SHALL provide dedicated input fields for fixed laundry item categories.
-   AC: Staff MUST be able to input numeric quantities (0-9999) for "Pakaian" (clothing), "Celana Dalam" (underwear), "BH" (bra), and "Kaos Kaki" (socks).
-   AC: All fixed item quantity fields SHALL default to '0' when a new transaction is initiated.
-   AC: The system SHALL only accept non-negative integer values for fixed item quantities.

#### FR-1.4: Kasir (Intake) Page - Dynamic "Lain-lain" (Other) Items
The PWA SHALL allow staff to add and manage dynamic "Lain-lain" item entries.
-   AC: Staff MUST be able to add new rows for "Lain-lain" items, each containing a text input for item name (max 50 characters) and a numeric input for quantity (1-9999).
-   AC: Staff MUST be able to remove any "Lain-lain" item row from the list.
-   AC: The system SHALL allow an unlimited number of "Lain-lain" item rows to be added to a single transaction.

#### FR-1.5: Kasir (Intake) Page - Auto-Calculation and Submission
The PWA SHALL automatically calculate the total item count and facilitate transaction submission.
-   AC: The total item count SHALL automatically update in real-time as fixed and dynamic item quantities are entered or modified.
-   AC: Staff MUST be able to submit the transaction data to Firestore via a "Save" button.
-   AC: Upon successful submission, the PWA SHALL display a success notification including the receipt number and clear all input fields for a new transaction.

#### FR-1.6: Riwayat (History) Page - List View
The PWA SHALL display a list of all transactions for the current outlet.
-   AC: The history page MUST display transactions in reverse chronological order (newest first), showing receipt number, customer name, transaction date, and total item count.
-   AC: Staff MUST be able to search and filter transactions in real-time by receipt number or customer name (case-insensitive).
-   AC: The list SHALL support pagination or infinite scroll, loading transactions in batches of 20.

#### FR-1.7: Riwayat (History) Page - Detail and Edit View
The PWA SHALL allow staff to view, edit, and delete transaction details.
-   AC: Clicking on a transaction in the history list SHALL display a detailed view including all fixed and dynamic item details, receipt number, customer name, date, outlet name, and total item count.
-   AC: Staff MUST be able to edit the quantities of fixed and dynamic items within the detail view.
-   AC: Staff MUST be able to delete a transaction after confirming their action via a modal dialog.

#### FR-1.8: Pengaturan (Settings) Page
The PWA SHALL allow staff to configure outlet-specific settings.
-   AC: Staff MUST be able to input and save the "Outlet Name" (max 100 characters) and "Notes" (max 500 characters) for their assigned outlet.
-   AC: The settings page SHALL display the currently saved outlet name and notes upon loading.
-   AC: Upon successful saving, the PWA SHALL display a success notification.

#### FR-1.9: Offline Capability
The PWA SHALL support offline operation for data entry and viewing.
-   AC: Staff MUST be able to view previously cached transactions when the device is offline.
-   AC: Staff MUST be able to create new transactions when offline, which SHALL be queued locally.
-   AC: Queued offline transactions MUST automatically sync to Firestore when an internet connection is re-established.

#### FR-1.10: PWA Installation and Manifest
The PWA SHALL be installable on supported mobile devices and browsers.
-   AC: The PWA MUST provide an install prompt on Android and iOS devices.
-   AC: The installed PWA SHALL launch in standalone mode (fullscreen without browser chrome) and display a splash screen.
-   AC: The PWA MUST have a web app manifest defining its name, icons, and theme colors.

### Phase 2: Customer Portal

#### FR-2.1: Portal Access and Search
The Customer Portal SHALL allow customers to search for their transaction details without requiring a login.
-   AC: Customers MUST be able to search for a transaction by providing both the receipt number and customer name.
-   AC: The system SHALL validate the provided receipt number and customer name against Firestore.
-   AC: If no matching transaction is found, the portal SHALL display a "Transaction not found" message.

#### FR-2.2: Portal Transaction Display
The Customer Portal SHALL display transaction details identical to the staff PWA's detail view.
-   AC: Upon a successful search, the portal MUST display the receipt number, customer name, transaction date, outlet name, total item count, and all fixed and dynamic item details.
-   AC: The portal SHALL NOT provide any functionality for customers to edit or delete transaction data.
-   AC: The portal MUST include a "Back" button to return to the search form.

### Phase 3: Desktop App with Printing

#### FR-3.1: Desktop Search Interface
The Desktop App SHALL provide a search interface for transactions.
-   AC: Staff MUST be able to search for transactions by either receipt number or customer name.
-   AC: The search results SHALL be displayed in a list format, similar to the PWA's history page.
-   AC: Clicking on a transaction in the search results SHALL open its detailed view.

#### FR-3.2: Desktop Detail and Print Functionality
The Desktop App SHALL display transaction details and enable printing via QZ Tray.
-   AC: The transaction detail view in the Desktop App MUST be identical to the PWA's detail view.
-   AC: Staff MUST be able to initiate printing of the transaction details via a "Print" button.
-   AC: The print function SHALL utilize QZ Tray to send an ESC/POS formatted receipt to a thermal printer (80mm or 58mm).
-   AC: The printed receipt MUST include the outlet name, receipt number, customer name, date, a list of all items with quantities, total item count, and a timestamp.

#### FR-3.3: Desktop App Deployment and QZ Tray Detection
The Desktop App SHALL be deployable as a web application and detect QZ Tray availability.
-   AC: The Desktop App MUST be accessible via a dedicated URL (e.g., `desktop.laundrychecklist.app`) and hosted on Firebase Hosting.
-   AC: The application SHALL detect whether QZ Tray is installed and running on the user's machine upon page load.
-   AC: If QZ Tray is not detected, the application SHOULD provide instructions or a link for its installation.

## Non-Functional Requirements

| Category | Requirement | Measurable Target |
|:---|:---|:---|
| **Performance** | Page Load Time (PWA) | < 2s (cached); < 3s (first load) |
| **Performance** | Search Response | < 500ms |
| **Performance** | Firestore Latency | < 1s (write); < 500ms (read) |
| **Performance** | Print Template Rendering | < 2s |
| **Reliability** | Uptime (Firebase) | 99.95% |
| **Scalability** | Concurrent Users | 50 per outlet (Phase 1) |
| **Scalability** | Transaction Volume | 1000 transactions/day per outlet |
| **Data Integrity** | Offline Sync Queue | Persist up to 100 transactions locally |
| **Data Integrity** | Data Retention | 2 years (configurable per outlet) |
| **Compatibility** | Mobile Browser Support | Chrome, Safari (iOS 14+), Firefox |
| **Compatibility** | Desktop Browser Support | Chrome, Firefox, Edge (latest 2 versions) |
| **Security** | Data Encryption | TLS 1.3 in transit; Firestore encryption at rest |
| **Security** | Authentication | Firebase Auth with email/password; no plaintext storage |
| **Usability** | Accessibility (WCAG 2.1) | Level AA |
| **Resource Usage** | PWA Cache Size | < 10 MB |

## Technical Constraints

-   **Single Firestore Database:** All applications (PWA, Portal, Desktop) MUST share a single Firestore project as the source of truth.
-   **No Real-Time Collaboration:** The system SHALL NOT support simultaneous multi-user editing of the same transaction.
-   **Outlet-Level Isolation:** Staff SHALL only access transactions for their assigned outlet, enforced via Firestore security rules.
-   **Receipt Number Uniqueness:** Receipt numbers MUST be unique per outlet per day, not globally unique.
-   **No Pricing/Billing:** The application SHALL NOT include any functionality for cost calculation, pricing, or payment processing.
-   **No Service Workflow:** The application SHALL NOT track laundry service states (e.g., "washing," "drying," "ready for pickup").
-   **No Customer Authentication:** The Customer Portal SHALL NOT require customer login; access is based on receipt number and customer name.
-   **No Notifications:** The application SHALL NOT send SMS or email notifications.
-   **No Analytics Dashboard:** The MVP (Phase 1) SHALL NOT include an analytics or reporting dashboard.
-   **Desktop App is Web-Based:** The Desktop App SHALL be a web application leveraging QZ Tray for printing, NOT a native Electron application.
-   **Offline Capability Limited to PWA:** The Desktop App SHALL require an internet connection and SHALL NOT support offline mode.
-   **Technology Stack:** The project MUST adhere to the specified technology stack: React, Vite, TypeScript, Firebase (Firestore, Auth, Hosting), Zustand, Tailwind CSS + Shadcn/ui, React Hook Form + Zod, Vitest, QZ Tray.

## Assumptions

-   Staff users possess smartphones or tablets (iOS 14+ or Android 8+) capable of running the PWA.
-   Laundry outlets have stable internet connectivity, or can tolerate brief periods of disconnection for PWA offline sync.
-   Customers will have access to their receipt number and remember the customer name used during intake for portal search.
-   QZ Tray will be pre-installed and configured on desktop machines designated for printing.
-   Thermal printers used for receipts are ESC/POS compatible (80mm or 58mm).
-   Firebase Firestore quotas are sufficient for the projected transaction volume (1000 transactions/day per outlet).
-   Staff will receive adequate training on PWA usage, including offline sync behavior.
-   Multi-outlet operations will have a centralized user management system (Firebase Authentication) for staff.