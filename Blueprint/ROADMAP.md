# ROADMAP.md: Laundry Checklist

## Phased Delivery Plan

This roadmap outlines the planned phases for the Laundry Checklist project. The durations are indicative and subject to change based on team velocity, unforeseen challenges, and feedback.

**Disclaimer:** Timeline assumes a team of 3 developers. Adjust proportionally for different team sizes.

| Phase | Duration | Goals |
|:---|:---|:---|
| **Phase 1: PWA for Staff (MVP)** | 8–10 weeks | Deliver a fully functional Progressive Web App for laundry staff to record item intake, manage transaction history, and configure outlet settings, with robust offline capabilities. |
| **Phase 2: Customer Portal** | 3–4 weeks | Launch a read-only web portal allowing customers to search and view their transaction details based on receipt number and customer name. |
| **Phase 3: Desktop App + Printing** | 4–5 weeks | Develop a web-based desktop application for staff to search transactions and print thermal receipts using QZ Tray integration. |
| **Post-Launch & Iteration** | Ongoing | Continuous improvement, bug fixes, performance optimization, and implementation of P2 features. |

## MVP Feature List

This section categorizes features based on their priority for initial and subsequent releases. For detailed descriptions, refer to PRD.md.

### P0: Must Have for Launch (Phase 1 - PWA for Staff)

These features are critical for the initial release of the PWA for staff.

*   **FR-1.1:** Authentication & Outlet Assignment
*   **FR-1.2:** Kasir (Intake) Page - Input Section (Customer Info, Fixed Items)
*   **FR-1.3:** Kasir (Intake) Page - Dynamic "Lain-lain" (Other) Section
*   **FR-1.4:** Kasir (Intake) Page - Auto-Calculation & Submission
*   **FR-1.5:** Riwayat (History) Page - List View (Search, Edit, Delete)
*   **FR-1.6:** Riwayat (History) Page - Detail View (Edit, Delete)
*   **FR-1.7:** Pengaturan (Settings) Page (Outlet Name, Notes)
*   **FR-1.8:** Offline Capability (Queueing, Sync)
*   **FR-1.9:** PWA Installation & Manifest

### P1: Should Have within 1 Month Post-Launch (Phase 2 - Customer Portal)

These features are planned for the immediate follow-up release after the PWA MVP.

*   **FR-2.1:** Portal Authentication (Search by Receipt + Name)
*   **FR-2.2:** Portal Search & Display (Read-only transaction view)
*   **FR-2.3:** Portal Hosting

### P2: Nice to Have for Future (Phase 3 - Desktop App & Beyond)

These features are planned for later phases or future iterations.

*   **FR-3.1:** Desktop Search Interface
*   **FR-3.2:** Desktop Detail & Print (QZ Tray integration)
*   **FR-3.3:** Desktop Deployment
*   **Out of Scope (Phase 1) items from PRD.md, such as:**
    *   Advanced search filters (date range, item type)
    *   Multi-language support
    *   Dark mode
    *   Analytics and reporting
    *   Real-time collaboration (if deemed necessary)

## Milestones

Key checkpoints and deliverables throughout the project lifecycle.

| Milestone | Phase | Target Date (Indicative) | Deliverables |
|:---|:---|:---|:---|
| **M1: PWA Core Intake** | Phase 1 | Week 5 | Functional Kasir page (FR-1.2, FR-1.3, FR-1.4), basic transaction saving to Firestore. |
| **M2: PWA History & Settings** | Phase 1 | Week 8 | Riwayat page (FR-1.5, FR-1.6) with search, edit, delete. Pengaturan page (FR-1.7). |
| **M3: PWA MVP Ready for UAT** | Phase 1 | Week 10 | Full PWA functionality (FR-1.1 to FR-1.9), offline sync, security rules, initial UAT. |
| **M4: Customer Portal Launch** | Phase 2 | Week 14 | Customer Portal (FR-2.1, FR-2.2, FR-2.3) deployed and accessible for customer verification. |
| **M5: Desktop App & Printing** | Phase 3 | Week 19 | Desktop search (FR-3.1), detail view, and QZ Tray printing (FR-3.2, FR-3.3) integrated and tested. |
| **M6: Post-Launch Review** | Post-Launch | Month 6 | Review of performance, user feedback, bug reports, and planning for next feature iterations. |

## Dependencies

### External Dependencies

*   **Firebase Project Setup:** A Google Cloud project with Firebase enabled (Firestore, Authentication, Hosting).
*   **QZ Tray Installation:** QZ Tray application must be installed on desktop machines requiring printing capabilities.
*   **Domain & DNS Configuration:** Registration and configuration of domain/subdomains for PWA, Customer Portal, and Desktop App (e.g., `app.laundrychecklist.app`, `portal.laundrychecklist.app`, `desktop.laundrychecklist.app`).
*   **Thermal Printer:** Access to an ESC/POS compatible thermal printer (80mm or 58mm) for testing and production.
*   **Browser Compatibility:** Modern web browsers (Chrome, Safari, Firefox, Edge) on target devices.

### Internal Dependencies

*   **PRD.md:** The Product Requirement Document serves as the single source of truth for all functional and non-functional requirements.
*   **Software Architecture.md:** Defines the overall system architecture, clean architecture principles, and modular design.
*   **Firestore Design.md:** Detailed schema design for Firestore collections and documents, including security rules.
*   **API Design.md:** Specifications for the service layer and repository patterns.
*   **User Flow.md:** Visual representation of user interactions within the PWA, Portal, and Desktop apps.
*   **Component Structure.md:** Guidelines for UI component design and reusability.
*   **UI/UX Mockups & Wireframes:** Visual designs for all key screens across PWA, Portal, and Desktop.
*   **Coding Standards.md & Development Rules.md:** Established guidelines for code quality, testing, and development practices.

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|:---|:---|:---|:---|
| **Firestore quota exceeded during peak intake** | Service degradation; transactions fail to save | Medium | Implement batch writes; set up quota alerts; design for horizontal scaling (multi-region if needed); monitor usage patterns. |
| **Offline sync conflicts (same receipt edited on multiple devices)** | Data inconsistency; customer disputes | Medium | Implement last-write-wins strategy with server timestamp; audit log of changes; educate staff on sync behavior. |
| **QZ Tray unavailable on desktop (user hasn't installed)** | Print feature fails silently; staff unable to print | High | Detect QZ Tray on app load; display clear setup instructions; provide fallback (e.g., browser print dialog for non-thermal). |
| **Customer portal search reveals sensitive data (e.g., via brute-force receipt number guessing)** | Privacy breach; customer data exposure | Low | Require both receipt number AND customer name (2-factor search); implement rate-limiting on search queries; log suspicious search attempts. |
| **PWA cache bloat over time (old transactions cached)** | Storage exhaustion on mobile devices; performance degradation | Low | Implement cache expiration policies (e.g., 30-day rolling window for transactions); provide manual cache clear option in settings. |
| **Staff forgets to sync before going offline; loses queued transactions** | Data loss; customer disputes; operational disruption | Medium | Auto-save to IndexedDB; persistent sync indicator; warning before logout if unsynced queue exists; regular staff training. |
| **Firestore security rules misconfigured; staff access other outlets' data** | Data breach; multi-outlet isolation failure; legal implications | Low | Strict security rules (outlet-scoped queries); unit tests for rule validation; regular security audits; least privilege principle. |