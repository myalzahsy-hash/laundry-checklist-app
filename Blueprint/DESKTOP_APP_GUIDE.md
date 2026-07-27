# DESKTOP_APP.md: Laundry Checklist

## 1. Introduction

The Desktop Application for Laundry Checklist serves as a dedicated tool for laundry staff to efficiently search for past transactions, view their details, and print physical receipts using a thermal printer. Unlike the PWA, this application is not designed for primary transaction input but rather for post-processing and customer service functions, specifically leveraging QZ Tray for direct printer communication.

## 2. Purpose and Scope

The primary purpose of the Desktop App is to provide a reliable and fast interface for:
- Retrieving transaction records.
- Displaying comprehensive transaction details.
- Generating and printing thermal receipts for customers.

It is a web-based application deployed via Firebase Hosting, interacting with the same Firestore database as the PWA and Customer Portal. Its scope is limited to search, view, and print functionalities.

## 3. Key Features

### 3.1. Transaction Search
- **Search Criteria:** Users can search for transactions using either the "Receipt Number" or "Customer Name".
- **Search Results:** A list view displaying matching transactions, similar to the PWA's history page. Each entry shows the receipt number, customer name, transaction date, and total item count.
- **Filtering:** Real-time filtering as the user types, case-insensitive.

### 3.2. Transaction Detail View
- **Display:** Upon selecting a transaction from the search results, a detailed view is presented.
- **Content:** This view is identical to the detail view in the PWA, showing:
    - Receipt Number
    - Customer Name
    - Transaction Date
    - Outlet Name
    - Total Item Count
    - All item details, including fixed categories (Pakaian, Celana Dalam, BH, Kaos Kaki) with their quantities, and dynamic "Lain-lain" items with their names and quantities.
- **Read-Only:** All information in the detail view is read-only; no editing capabilities are present in the Desktop App.

### 3.3. Thermal Receipt Printing
- **Print Trigger:** A dedicated "Print" button is available on the transaction detail view.
- **QZ Tray Integration:** The print function communicates with QZ Tray, a locally installed application, to send print commands directly to a thermal printer.
- **Print Template:** The application generates an ESC/POS formatted receipt based on a predefined template.
    - **Header:** Includes the Outlet Name.
    - **Transaction Details:** Receipt Number, Customer Name, Transaction Date.
    - **Item List:** A clear list of all items (fixed and dynamic) with their respective quantities.
    - **Total:** The total item count.
    - **Footer:** A timestamp of when the receipt was printed.
- **Printer Compatibility:** Designed for 80mm or 58mm thermal printers.
- **Notifications:** Provides success or failure notifications to the user regarding the print job status.

## 4. User Interface (UI)

The Desktop App's UI will be built using React, Vite, TypeScript, Tailwind CSS, and Shadcn/ui, ensuring a consistent look and feel with the PWA where applicable.
- **Layout:** A two-pane layout is envisioned, with search controls and results on one side and the transaction detail view on the other, or a modal for details.
- **Responsiveness:** Optimized for desktop screen sizes.
- **Accessibility:** Adheres to WCAG 2.1 Level AA standards.

## 5. Technical Architecture

### 5.1. Frontend
- **Framework:** React 18 with TypeScript.
- **Build Tool:** Vite for fast development and optimized production builds.
- **Styling:** Tailwind CSS for utility-first styling and Shadcn/ui for accessible, reusable components.
- **State Management:** Zustand for managing local UI state.
- **Deployment:** Hosted on Firebase Hosting.

### 5.2. Backend Interaction
- **Database:** Firestore (shared with PWA and Customer Portal) for all transaction data.
- **Data Access:** Utilizes the same Repository Pattern and Service Layer as the PWA to interact with Firestore, ensuring clean separation of concerns and adherence to architectural principles.
- **Security Rules:** Firestore security rules will enforce read-only access to transaction data for the desktop app, scoped to the assigned outlet.

### 5.3. Printing Mechanism
- **QZ Tray:** A separate, locally installed application that acts as a bridge between the web application and local printing hardware.
- **Communication:** The Desktop App uses JavaScript to send print commands (ESC/POS data) to QZ Tray via a secure WebSocket connection.
- **HTML-to-ESC/POS:** The application will dynamically generate the print content as an HTML template, which QZ Tray can then convert to ESC/POS commands for the thermal printer.

## 6. Integration Points

### 6.1. Firestore
- **Data Source:** The Desktop App directly queries Firestore for transaction data.
- **Security:** Firestore security rules are critical to ensure the desktop app can only read data relevant to its assigned outlet and cannot modify any data.

### 6.2. QZ Tray
- **Local Service:** QZ Tray must be installed and running on the local machine where printing is required.
- **Detection:** The Desktop App will attempt to detect the presence and availability of QZ Tray on page load. If not found, it will provide instructions or a warning.
- **Print Command:** The app sends a JSON object containing the print data and printer configuration to QZ Tray.

## 7. Deployment & Operations

### 7.1. Deployment
- **Hosting:** Deployed as a static web application to Firebase Hosting under a dedicated subdomain (e.g., `desktop.laundrychecklist.app`).
- **Updates:** Updates are managed centrally via Firebase Hosting, ensuring all desktop users always access the latest version without manual intervention.

### 7.2. QZ Tray Installation
- **Prerequisite:** Users must manually install QZ Tray on their machines. The application will guide users if QZ Tray is not detected.
- **Configuration:** QZ Tray needs to be configured with the correct thermal printer settings (e.g., printer name, paper size).

## 8. Non-Functional Considerations

### 8.1. Performance
- **Search Response:** Search queries should return results within 500ms.
- **Print Template Rendering:** The process of generating the print template and sending it to QZ Tray should complete within 2 seconds.

### 8.2. Reliability
- **Print Success Rate:** Aim for a print success rate of ≥ 98%.
- **QZ Tray Availability:** The application must gracefully handle scenarios where QZ Tray is not running or not installed.

### 8.3. Security
- **Data Access:** Strict Firestore security rules to prevent unauthorized data access (e.g., accessing data from other outlets).
- **Search Rate Limiting:** Implement client-side and potentially server-side rate limiting for search queries to prevent brute-force attacks or excessive resource consumption.
- **PII Protection:** Ensure customer names are handled securely, even in printouts.

## 9. Constraints & Assumptions

### 9.1. Constraints
- **Internet Connection Required:** The Desktop App requires an active internet connection to function, as it relies on Firebase Firestore for data. There is no offline mode for the desktop app.
- **QZ Tray Dependency:** Printing functionality is entirely dependent on the separate installation and proper configuration of QZ Tray on the user's machine.
- **Web-Based, Not Native:** The Desktop App is a web application, not a native Electron app. This simplifies deployment and updates but relies on browser capabilities and QZ Tray for hardware interaction.
- **No Input/Edit:** The application is strictly for viewing and printing; it does not allow for creating or editing transactions.

### 9.2. Assumptions
- **QZ Tray Pre-installed:** It is assumed that QZ Tray will be pre-installed and configured on the desktop machines designated for printing.
- **ESC/POS Compatible Printers:** All thermal printers used for printing are assumed to be ESC/POS compatible.
- **Staff Training:** Staff using the Desktop App will be trained on its usage, including QZ Tray setup and troubleshooting.