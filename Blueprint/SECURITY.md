# SECURITY.md: Laundry Checklist

This document outlines the security considerations, design principles, and mitigation strategies for the Laundry Checklist application, encompassing the Progressive Web App (PWA), Customer Portal, and Desktop App.

## 1. Threat Model

A threat model identifies potential threats, vulnerabilities, and risks to the application.

| Threat Category | Description | Potential Impact | Mitigation Strategy |
|:---|:---|:---|:---|
| **Data Confidentiality** | Unauthorized access to customer names, transaction details, or outlet settings. | Privacy breach, reputational damage, legal non-compliance. | Firestore Security Rules, TLS encryption, minimal data exposure in portal. |
| **Data Integrity** | Unauthorized modification or deletion of transaction records, or data corruption. | Financial loss, customer disputes, operational disruption. | Firestore Security Rules, input validation, audit logs, last-write-wins for offline sync. |
| **Data Availability** | Denial of service, inability to access or record transactions. | Operational standstill, customer dissatisfaction. | Firebase platform resilience, quota monitoring, offline PWA capability. |
| **Authentication Bypass** | Unauthorized users gaining access to staff PWA or manager functions. | Full system compromise, data manipulation. | Firebase Authentication, strong password policies, multi-factor authentication (future). |
| **Authorization Bypass** | Authenticated staff accessing data outside their assigned outlet or performing unauthorized actions (e.g., manager functions). | Data breach, internal fraud. | Strict Firestore Security Rules, role-based access control. |
| **Client-Side Attacks** | XSS, CSRF, malicious code injection via PWA or Portal. | Session hijacking, data theft, defacement. | React's built-in protections, input sanitization, Content Security Policy (CSP). |
| **Offline Data Compromise** | Local data on staff devices being accessed if device is lost/stolen. | Data exposure. | Minimal sensitive data caching, device-level security (OS). |
| **QZ Tray Exploitation** | Malicious commands sent to QZ Tray, or QZ Tray vulnerabilities. | Local system compromise, unauthorized printing. | QZ Tray's security model (signed applets, trusted domains), user education. |
| **Receipt Number Enumeration** | Brute-forcing receipt numbers in the Customer Portal to view transactions. | Privacy breach. | "2-factor search" (receipt number + customer name), rate limiting. |

## 2. Authentication and Authorization Design

### 2.1 Staff Authentication (PWA & Desktop App)

*   **Mechanism:** Firebase Authentication (Email/Password provider).
*   **User Management:** Staff accounts are managed within Firebase Auth. Each staff member is assigned to a specific `outletId` via custom claims or a user profile document in Firestore.
*   **Password Policy:** Enforce strong password requirements (minimum length, complexity).
*   **Session Management:** Firebase Auth handles secure session tokens and persistence. Logout functionality terminates the session.
*   **Multi-Factor Authentication (MFA):** Not in MVP, but a planned enhancement for enhanced security.

### 2.2 Customer Portal Access

*   **Mechanism:** No direct user authentication. Access is granted via a "2-factor search" using `receiptNumber` AND `customerName`.
*   **Validation:** Both fields must match a valid transaction record in Firestore.
*   **Rate Limiting:** Implement server-side rate limiting on search attempts to prevent brute-force enumeration of receipt numbers or customer names.
*   **Data Exposure:** Only the specific transaction details matching the search criteria are displayed. No other customer or outlet data is accessible.

### 2.3 Authorization (Access Control)

*   **Principle:** Least Privilege. Users should only have access to the data and functionality necessary for their role.
*   **Firestore Security Rules:** This is the primary mechanism for enforcing authorization.
    *   **Outlet-Level Isolation:** All data (transactions, settings) in Firestore will be scoped by `outletId`. Staff users will only be able to read/write data belonging to their assigned `outletId`.
    *   **Role-Based Access:**
        *   **Staff:** Can create, read, update, delete (CRUD) transactions for their assigned outlet. Can view outlet settings.
        *   **Manager:** (Assumed higher privilege than staff) Can CRUD transactions, configure outlet settings.
        *   **Customer:** Read-only access to *their specific* transaction via the portal search.
    *   **Data Validation:** Security rules will also enforce data structure, types, and uniqueness constraints (e.g., `receiptNumber` uniqueness per outlet per day).
*   **Client-Side Enforcement:** While UI elements may be hidden based on user roles, this is for user experience only. Server-side (Firestore Security Rules) is the ultimate authority for access control.

## 3. Data Encryption

*   **Data in Transit (TLS/SSL):**
    *   All communication between client applications (PWA, Portal, Desktop App) and Firebase services (Firestore, Authentication, Hosting) will be encrypted using Transport Layer Security (TLS 1.3). Firebase Hosting automatically provides HTTPS.
    *   QZ Tray communication with the local printer is typically over a local, unencrypted connection, but QZ Tray itself communicates with the web application over HTTPS.
*   **Data at Rest:**
    *   **Firestore:** Data stored in Firestore is automatically encrypted at rest by Google Cloud Platform.
    *   **Client-Side (Offline Data):**
        *   Transactions queued for offline sync (using Zustand and potentially IndexedDB) will be stored locally on the user's device. While not encrypted at the application layer, the underlying operating system (iOS/Android) provides device-level encryption if configured by the user.
        *   No highly sensitive PII (e.g., payment information) is stored. Customer names and item lists are considered less critical than financial data.

## 4. OWASP Top 10 Mitigations

The application design incorporates mitigations for common web application security risks:

*   **A01: Broken Access Control:** Addressed by comprehensive Firestore Security Rules enforcing outlet-level isolation and role-based permissions.
*   **A02: Cryptographic Failures:** Addressed by mandatory TLS 1.3 for all network communication and Firestore's inherent encryption at rest. Avoid storing sensitive data unencrypted.
*   **A03: Injection:**
    *   **Firestore:** The Firebase SDK automatically escapes data, preventing NoSQL injection.
    *   **Client-Side:** React's JSX automatically escapes rendered content, mitigating HTML injection (XSS). All user inputs will be validated client-side (React Hook Form + Zod) and server-side (Firestore Security Rules).
*   **A04: Insecure Design:** Addressed through a security-first design approach, threat modeling, and adherence to the principle of least privilege. The "2-factor search" for the customer portal is an example of secure design.
*   **A05: Security Misconfiguration:** Firebase services are configured with secure defaults. Firestore Security Rules will be rigorously tested. Firebase Hosting provides automatic HTTPS.
*   **A06: Vulnerable and Outdated Components:** Regular updates of frontend libraries (React, Vite, TypeScript) and Firebase SDKs. Dependency scanning will be part of the CI/CD pipeline (future).
*   **A07: Identification and Authentication Failures:** Addressed by Firebase Authentication's robust mechanisms, strong password policies, and secure session management.
*   **A08: Software and Data Integrity Failures:** Input validation (client and server), Firestore Security Rules for data structure, and last-write-wins for conflict resolution.
*   **A09: Security Logging and Monitoring:** Firebase provides logging for authentication and Firestore operations. Integration with Sentry (future) will enhance error tracking and security event monitoring.
*   **A10: Server-Side Request Forgery (SSRF):** Not directly applicable as the application is serverless (Firebase) and does not make arbitrary server-side requests based on user input.

## 5. Client-Side Security

*   **PWA Manifest & Service Worker:**
    *   The PWA manifest will be configured securely, defining app scope and start URL to prevent URL manipulation.
    *   The Service Worker (managed by Workbox) will be carefully configured to cache only necessary assets and data, preventing caching of sensitive information. Updates to the Service Worker will be managed to ensure users are on the latest secure version.
*   **Input Validation & Sanitization:** All user inputs are validated client-side (React Hook Form + Zod) and server-side (Firestore Security Rules) to prevent malicious data entry and ensure data integrity.
*   **Local Storage:** Only non-sensitive data (e.g., user preferences, cached UI state, offline transaction queue) will be stored in browser local storage or IndexedDB. No authentication tokens or highly sensitive PII will be stored unencrypted.
*   **Content Security Policy (CSP):** Implement a strict CSP to mitigate XSS attacks by restricting sources of scripts, styles, and other resources.

## 6. QZ Tray Security

The Desktop App interacts with QZ Tray for thermal printing.

*   **Trusted Domains:** QZ Tray uses a certificate-based trust model. The Desktop App's domain (e.g., `desktop.laundrychecklist.app`) must be explicitly trusted by QZ Tray on the client machine. This prevents unauthorized websites from interacting with the local printer.
*   **User Interaction:** QZ Tray typically requires user permission for the first connection from a new domain, adding a layer of security.
*   **Local Access:** QZ Tray runs locally on the user's machine and can access local devices (printers). While powerful, this access is restricted by the trust model.
*   **No Direct Data Exposure:** The Desktop App sends print data to QZ Tray, but QZ Tray does not send local system data back to the web application.

## 7. Compliance Requirements

While specific regulatory compliance (e.g., GDPR, HIPAA) was not explicitly requested, the application adheres to general data protection principles:

*   **Data Minimization:** Collect and store only necessary customer and transaction data.
*   **Purpose Limitation:** Data is used solely for item reconciliation and transaction history.
*   **Transparency:** The Customer Portal provides transparency to customers regarding their item counts.
*   **Data Integrity & Confidentiality:** As outlined in sections 3 and 4.
*   **Data Retention:** Data retention policies (e.g., 2 years as per PRD) will be implemented, potentially via Firestore TTL policies or scheduled cleanup functions.

## 8. Penetration Test Scope

A penetration test should cover the following areas:

*   **PWA:**
    *   Authentication bypass (staff login).
    *   Authorization bypass (accessing other outlets' data, performing manager actions as staff).
    *   Client-side vulnerabilities (XSS, CSRF, DOM-based attacks).
    *   Offline data manipulation and security.
    *   Service Worker integrity and caching vulnerabilities.
*   **Customer Portal:**
    *   Receipt number/customer name enumeration (brute-force attacks).
    *   Rate limiting effectiveness.
    *   Data exposure beyond the requested transaction.
    *   Client-side vulnerabilities.
*   **Firestore Security Rules:**
    *   Thorough testing of all rules to ensure correct outlet-level isolation and role-based access.
    *   Validation of data integrity rules (e.g., `receiptNumber` uniqueness).
*   **Firebase Configuration:**
    *   Review of Firebase project settings, API keys, and service account permissions.
*   **QZ Tray Integration:**
    *   Verification of trusted domain configuration.
    *   Testing for potential command injection or unauthorized printing.

## 9. Incident Response Plan (High-Level)

In the event of a security incident:

1.  **Detection:** Monitoring (Firebase logs, Sentry) and user reports.
2.  **Containment:** Isolate affected systems/accounts, disable compromised credentials.
3.  **Eradication:** Identify root cause, patch vulnerabilities, remove malicious artifacts.
4.  **Recovery:** Restore services from backups, verify system integrity.
5.  **Post-Incident Analysis:** Document incident, review processes, implement preventative measures.
6.  **Communication:** Notify affected parties as required by law and policy.