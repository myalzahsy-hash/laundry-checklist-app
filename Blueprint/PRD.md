# PRD: Laundry Checklist

## Executive Summary & Product Vision

**Laundry Checklist** is a specialized item inventory recording system for laundry service operations. It captures and reconciles customer clothing item counts at intake, ensuring staff and customers maintain identical item records throughout the service lifecycle.

**Core Value Proposition:**
- Single source of truth for item counts (eliminates discrepancies at handoff)
- Staff-first PWA for rapid intake recording
- Customer-facing read-only portal for transparency
- Desktop printing capability for thermal receipt generation

**Product is NOT:**
- Point-of-sale (POS) system
- Laundry management platform (no workflow, scheduling, or service tracking)
- Laundry tracking system (no real-time location or status updates)

**Phased Delivery:**
1. **Phase 1 (MVP):** PWA for staff intake recording
2. **Phase 2:** Customer portal (read-only)
3. **Phase 3:** Desktop app with thermal printing via QZ Tray

All phases share single Firestore database.

---

## Problem Statement & Target Users

**Problem:**
Laundry service operations lack standardized item intake documentation, causing disputes between staff and customers over item counts and types. Manual paper-based systems are error-prone and unverifiable.

**Target Users:**

| User Role | Primary Need | Context |
|:---|:---|:---|
| **Laundry Staff (Intake)** | Rapid, accurate item recording | High-volume intake periods; mobile/offline environments |
| **Laundry Manager** | Outlet configuration; data access | Single or multi-outlet operations |
| **Customer** | Verify received items; dispute resolution | Post-intake transparency; read-only access |

---

## System Scope & User Roles

### Functional Scope

**Included:**
- Item intake recording (fixed + dynamic categories)
- Transaction history with search/edit/delete
- Customer portal (read-only search)
- Desktop search and thermal printing
- Multi-outlet support with outlet-level settings
- Offline-first PWA capability

**Excluded (Phase 1):**
- Real-time collaboration/multi-user editing
- Service workflow (washing, drying, ironing states)
- Pricing/billing
- Customer authentication (portal uses receipt number + customer name)
- Analytics/reporting
- SMS/email notifications

### User Roles & Permissions Matrix

| Feature | Staff (PWA) | Manager (PWA) | Customer (Portal) | Desktop App |
|:---|:---:|:---:|:---:|:---:|
| Create transaction | ✓ | ✓ | ✗ | ✗ |
| View own outlet transactions | ✓ | ✓ | ✗ | ✓ |
| Edit transaction | ✓ | ✓ | ✗ | ✗ |
| Delete transaction | ✓ | ✓ | ✗ | ✗ |
| Configure outlet settings | ✗ | ✓ | ✗ | ✗ |
| Search by receipt number | ✓ | ✓ | ✓ | ✓ |
| Search by customer name | ✓ | ✓ | ✓ | ✓ |
| Print receipt | ✗ | ✗ | ✗ | ✓ |
| View transaction detail | ✓ | ✓ | ✓ | ✓ |

---

## Functional Requirements

### Phase 1: PWA for Staff (Priority)

#### FR-1.1: Authentication & Outlet Assignment
- Staff login via Firebase Authentication (email/password or custom token)
- Automatic outlet assignment based on user profile
- Session persistence across PWA restarts
- Logout functionality with session termination

#### FR-1.2: Kasir (Intake) Page - Input Section
- **Customer Information:**
  - Text input: Customer name (required, max 100 chars)
  - Date picker: Transaction date (required, defaults to today)
  - Text input: Receipt number (required, alphanumeric, max 50 chars, must be unique per outlet per day)
  
- **Fixed Item Categories:**
  - Numeric input: Pakaian (clothing) — quantity only
  - Numeric input: Celana Dalam (underwear) — quantity only
  - Numeric input: BH (bra) — quantity only
  - Numeric input: Kaos Kaki (socks) — quantity only
  - All default to 0; accept 0–9999 range

#### FR-1.3: Kasir (Intake) Page - Dynamic "Lain-lain" (Other) Section
- Add button to insert custom item rows
- Each row contains:
  - Text input: Item name (required, max 50 chars; examples: Kaos Tangan, Sajadah, Boneka, Karpet)
  - Numeric input: Quantity (required, 1–9999)
- Delete button per row
- Unlimited rows allowed
- Rows persist in form state until transaction saved

#### FR-1.4: Kasir (Intake) Page - Auto-Calculation & Submission
- Total item count calculated automatically (sum of all fixed + dynamic items)
- Display total prominently
- Submit button saves transaction to Firestore
- Success toast notification with receipt number
- Form clears after successful save
- Validation: all required fields must be populated; receipt number must be unique per outlet per day

#### FR-1.5: Riwayat (History) Page - List View
- Display all transactions for current outlet in reverse chronological order (newest first)
- Show per transaction:
  - Receipt number
  - Customer name
  - Transaction date
  - Total item count
- Search bar (real-time filter by receipt number OR customer name, case-insensitive)
- Pagination or infinite scroll (load 20 per batch)
- Edit icon per row → opens detail view in edit mode
- Delete icon per row → confirmation modal, then removes from Firestore

#### FR-1.6: Riwayat (History) Page - Detail View
- Modal or dedicated page showing:
  - Receipt number (read-only)
  - Customer name (read-only)
  - Transaction date (read-only)
  - Outlet name (read-only)
  - Total item count (read-only, auto-calculated)
  - All item details:
    - Fixed categories with quantities
    - Dynamic items with names and quantities
- Edit button → enables inline editing of quantities (fixed + dynamic)
- Save button → validates and updates Firestore
- Cancel button → discards changes
- Delete button → confirmation modal, removes transaction

#### FR-1.7: Pengaturan (Settings) Page
- Text input: Outlet name (required, max 100 chars)
- Text area: Notes/remarks (optional, max 500 chars)
- Save button → persists to Firestore under outlet profile
- Display current outlet name and notes on page load
- Success notification after save

#### FR-1.8: Offline Capability
- PWA works offline for viewing cached transactions
- New transactions created offline are queued locally (Zustand store)
- Sync indicator shows connection status
- When online, queued transactions auto-sync to Firestore
- Conflict resolution: server-side timestamp wins (last-write-wins)

#### FR-1.9: PWA Installation & Manifest
- Web app manifest with app name, icons, theme colors
- Install prompt on Android/iOS
- Standalone mode (fullscreen, no browser chrome)
- Splash screen on launch
- App icon on home screen

### Phase 2: Customer Portal (Read-Only)

#### FR-2.1: Portal Authentication
- No login required
- Customer searches by receipt number + customer name (both required)
- Search validates against Firestore; if match found, displays transaction
- If no match, shows "Transaction not found" message

#### FR-2.2: Portal Search & Display
- Search form: Receipt number (text input) + Customer name (text input)
- Submit button queries Firestore
- Result displays identical data to staff detail view:
  - Receipt number, customer name, date, outlet, total items
  - All item details (fixed + dynamic)
- No edit/delete capabilities
- Back button returns to search form

#### FR-2.3: Portal Hosting
- Deployed to Firebase Hosting at separate subdomain (e.g., `portal.laundrychecklist.app`)
- Responsive design for mobile + desktop
- Same Firestore database as PWA

### Phase 3: Desktop App with Printing

#### FR-3.1: Desktop Search Interface
- Search form: Receipt number OR customer name
- Results list (same as PWA history)
- Click row to open detail view

#### FR-3.2: Desktop Detail & Print
- Detail view identical to PWA
- Print button → triggers QZ Tray
- Print template (ESC/POS format):
  - Header: Outlet name
  - Receipt number, customer name, date
  - Item list (fixed + dynamic) with quantities
  - Total item count
  - Footer: Timestamp
- QZ Tray sends to thermal printer (80mm or 58mm)
- Print success/failure notification

#### FR-3.3: Desktop Deployment
- React + Vite web app (not Electron)
- Deployed to Firebase Hosting at separate subdomain (e.g., `desktop.laundrychecklist.app`)
- QZ Tray installed separately on user machine
- Desktop app detects QZ Tray availability on page load

---

## Non-Functional Requirements

| Requirement | Target | Rationale |
|:---|:---|:---|
| **Page Load Time (PWA)** | < 2s (cached); < 3s (first load) | Mobile network conditions; staff efficiency |
| **Search Response** | < 500ms | Real-time filtering on history page |
| **Firestore Latency** | < 1s (write); < 500ms (read) | Staff workflow speed |
| **Offline Sync Queue** | Persist up to 100 transactions locally | Handle extended offline periods |
| **PWA Cache Size** | < 10 MB | Mobile device storage constraints |
| **Uptime (Firebase)** | 99.95% | Business continuity |
| **Data Retention** | 2 years (configurable per outlet) | Compliance + storage cost |
| **Concurrent Users** | 50 per outlet (Phase 1) | Typical laundry staff size |
| **Transaction Volume** | 1000 transactions/day per outlet | Peak intake periods |
| **Mobile Browser Support** | Chrome, Safari (iOS 14+), Firefox | Staff device diversity |
| **Desktop Browser Support** | Chrome, Firefox, Edge (latest 2 versions) | Manager/admin machines |
| **Print Template Rendering** | < 2s | User experience during printing |
| **Security: Data Encryption** | TLS 1.3 in transit; Firestore encryption at rest | PII protection (customer names) |
| **Security: Authentication** | Firebase Auth with email/password; no plaintext storage | Staff account security |
| **Accessibility (WCAG 2.1)** | Level AA | Inclusive design |

---

## Technology Stack & Rationale

| Component | Technology | Why |
|:---|:---|:---|
| **Frontend Framework** | React 18 + TypeScript | Type safety; component reusability; large ecosystem |
| **Build Tool** | Vite | Fast HMR; optimized PWA bundling; ESM-native |
| **Styling** | Tailwind CSS + Shadcn/ui | Rapid UI development; accessible component library; consistent design system |
| **State Management** | Zustand | Lightweight; minimal boilerplate; ideal for offline queue management |
| **Backend** | Firebase (Firestore + Auth + Hosting) | Serverless; real-time sync; built-in security rules; no DevOps overhead |
| **PWA Tools** | Vite PWA Plugin + Workbox | Automatic service worker generation; offline caching strategy; manifest generation |
| **Offline Sync** | Online-first + Workbox static caching | Graceful degradation; staff can view cached data offline; auto-sync when online |
| **Form Validation** | React Hook Form + Zod | Type-safe validation; minimal re-renders; schema-driven |
| **Testing** | Vitest | Fast unit tests; Vite-native; ESM support |
| **Printing** | QZ Tray + HTML-to-ESC/POS template | Thermal printer support; no Electron bloat; cross-platform |
| **Desktop Deployment** | React + Vite (web app, not Electron) | Reduced bundle size; easier updates; single codebase for PWA + desktop |
| **Hosting** | Firebase Hosting | CDN-backed; automatic HTTPS; zero-config deployment; same vendor as backend |
| **Monitoring (Future)** | Sentry | Error tracking; performance monitoring; user session replay |

---

## Success Metrics & KPIs

| Metric | Target | Measurement Method |
|:---|:---|:---|
| **PWA Installation Rate** | ≥ 60% of staff | Firebase Analytics; app manifest installs |
| **Offline Sync Success Rate** | ≥ 99% | Firestore write logs; queue completion tracking |
| **Average Transaction Entry Time** | ≤ 2 minutes | User timing via analytics; staff feedback |
| **Search Accuracy** | 100% (exact match) | QA testing; customer portal search validation |
| **Print Success Rate** | ≥ 98% | QZ Tray error logs; print job tracking |
| **Customer Portal Adoption** | ≥ 40% of transactions verified | Portal analytics; search queries |
| **Data Accuracy (Item Count Disputes)** | ≤ 2% discrepancy rate | Customer feedback; transaction audit logs |
| **System Uptime** | ≥ 99.5% | Firebase monitoring; Firestore availability |
| **Mobile Performance (Lighthouse PWA)** | ≥ 90 score | Lighthouse CI; Vite build analysis |
| **Staff Satisfaction** | ≥ 4.0/5.0 | In-app survey; NPS tracking |

---

## Risk Analysis & Mitigation

| Risk | Impact | Probability | Mitigation Strategy |
|:---|:---|:---|:---|
| **Firestore quota exceeded during peak intake** | Service degradation; transactions fail to save | Medium | Implement batch writes; set up quota alerts; design for horizontal scaling (multi-region if needed) |
| **Offline sync conflicts (same receipt edited on multiple devices)** | Data inconsistency; customer disputes | Medium | Last-write-wins strategy with server timestamp; conflict resolution UI; audit log of changes |
| **QZ Tray unavailable on desktop (user hasn't installed)** | Print feature fails silently | High | Detect QZ Tray on app load; show setup instructions; provide fallback (browser print dialog) |
| **Customer portal search reveals sensitive data (e.g., via brute-force receipt number guessing)** | Privacy breach; customer data exposure | Low | Require both receipt number AND customer name (2-factor search); rate-limit search queries; log search attempts |
| **PWA cache bloat over time (old transactions cached)** | Storage exhaustion on mobile devices | Low | Implement cache expiration (30-day rolling window); manual cache clear in settings; monitor cache size |
| **Staff forgets to sync before going offline; loses queued transactions** | Data loss; customer disputes | Medium | Auto-save to IndexedDB; sync indicator always visible; warning before logout if unsync'd queue exists |
| **Firestore security rules misconfigured; staff can access other outlets' data** | Data breach; multi-outlet isolation failure | Low | Strict security rules (outlet-scoped queries); unit tests for rule validation; regular security audit |
| **Receipt number collision (duplicate receipt numbers on same day)** | Transaction overwrite; data loss | Low | Enforce unique constraint at Firestore write time; client-side validation; error toast if duplicate detected |

---

## Constraints & Assumptions

### Constraints

- **Single Firestore Database:** All phases (PWA, portal, desktop) share one Firestore project; no data silos
- **No Real-Time Collaboration:** Phase 1 does not support simultaneous multi-user editing of same transaction
- **Outlet-Level Isolation:** Staff can only access transactions for their assigned outlet (enforced via Firestore security rules)
- **Receipt Number Uniqueness:** Per outlet, per day (not globally unique)
- **No Pricing/Billing:** Item counts only; no cost calculation or payment processing
- **No Service Workflow:** No status tracking (e.g., "washing", "drying", "ready for pickup")
- **No Customer Authentication:** Portal uses receipt number + customer name (no login); assumes customer has receipt
- **No SMS/Email Notifications:** No automated alerts to customers or staff
- **No Analytics Dashboard:** Phase 1 has no reporting or KPI visualization
- **Desktop App is Web-Based:** Uses QZ Tray for printing; not a native Electron app
- **Offline Capability Limited to PWA:** Desktop app requires internet connection (no offline mode)

### Assumptions

- Staff have smartphones or tablets (iOS 14+ or Android 8+) for PWA access
- Laundry outlets have stable internet connectivity (or can tolerate brief offline periods)
- Customers have access to receipt number and remember customer name for portal search
- QZ Tray is pre-installed on desktop machines used for printing
- Thermal printers are ESC/POS compatible (80mm or 58mm)
- Firebase Firestore quotas are sufficient for projected transaction volume (1000/day per outlet)
- Staff are trained on PWA usage and offline sync behavior
- Multi-outlet operations have centralized user management (Firebase Auth)

---

## Out of Scope (Phase 1)

**Explicitly NOT included in MVP:**

- Real-time multi-user collaboration (simultaneous editing)
- Service workflow states (washing, drying, ironing, ready, delivered)
- Pricing, billing, or payment processing
- Customer authentication or login
- SMS/email notifications
- Analytics dashboard or reporting
- Barcode/QR code scanning
- Photo capture of items
- Delivery tracking or GPS
- Staff performance metrics
- Inventory management (stock levels)
- Supplier management
- Accounting integration
- Multi-language support (English only in Phase 1)
- Dark mode (Phase 2+)
- Advanced search filters (date range, item type, etc.)
- Bulk operations (export, import, batch delete)
- API for third-party integrations
- Mobile app (native iOS/Android) — PWA only
- Electron desktop app — web-based only

**Deferred to Phase 2+:**
- Customer portal enhancements (login, transaction history, notifications)
- Desktop app advanced features (batch printing, custom templates)
- Multi-language support
- Analytics and reporting
- Real-time collaboration
- Service workflow integration

---

## Acceptance Criteria

### Phase 1 MVP Completion

- [ ] PWA loads in < 3s on 4G network
- [ ] All fixed item categories (Pakaian, Celana Dalam, BH, Kaos Kaki) accept numeric input
- [ ] Dynamic "Lain-lain" items can be added/removed without limit
- [ ] Total item count auto-calculates correctly
- [ ] Receipt number enforced as unique per outlet per day
- [ ] Transactions persist to Firestore with correct outlet assignment
- [ ] History page displays all transactions with search by receipt number or customer name
- [ ] Edit functionality updates Firestore without data loss
- [ ] Delete functionality removes transaction with confirmation
- [ ] Settings page saves outlet name and notes
- [ ] PWA works offline (cached transactions visible; new transactions queued)
- [ ] Offline transactions sync to Firestore when online
- [ ] PWA installable on Android and iOS
- [ ] All Firestore security rules enforce outlet-level isolation
- [ ] No console errors or warnings in production build
- [ ] Lighthouse PWA score ≥ 90
- [ ] Mobile responsive (tested on iPhone SE, Pixel 4, iPad)

### Phase 2 Portal Completion

- [ ] Portal accessible at separate subdomain
- [ ] Search by receipt number + customer name returns correct transaction
- [ ] Portal displays identical data to staff detail view
- [ ] No edit/delete buttons visible to customer
- [ ] Search rate-limited to prevent brute-force attacks
- [ ] Portal responsive on mobile and desktop

### Phase 3 Desktop Completion

- [ ] Desktop app loads transaction history
- [ ] Search by receipt number or customer name works
- [ ] Print button triggers QZ Tray
- [ ] Print template renders correctly on 80mm and 58mm thermal printers
- [ ] ESC/POS formatting correct (no garbled characters)
- [ ] QZ Tray unavailability detected and user notified

---

## Roadmap & Timeline (Indicative)

| Phase | Duration | Deliverables | Go-Live Criteria |
|:---|:---|:---|:---|
| **Phase 1: PWA MVP** | 8–10 weeks | Kasir, Riwayat, Pengaturan; offline sync; Firestore schema | Staff testing; 100% acceptance criteria met |
| **Phase 2: Portal** | 3–4 weeks | Customer search; read-only detail view; portal hosting | Customer UAT; 40% adoption target |
| **Phase 3: Desktop + Printing** | 4–5 weeks | Desktop search; QZ Tray integration; print template | Print quality validation; staff training |
| **Post-Launch** | Ongoing | Bug fixes; performance optimization; monitoring setup | < 2% critical bug rate; 99.5% uptime |

---

## Glossary

| Term | Definition |
|:---|:---|
| **Kasir** | Intake page where staff record customer items and transaction details |
| **Riwayat** | History page displaying all transactions with search, edit, delete |
| **Pengaturan** | Settings page for outlet configuration |
| **Lain-lain** | "Other" category for dynamic, non-fixed items (e.g., Sajadah, Boneka) |
| **Receipt Number** | Unique transaction identifier per outlet per day |
| **Outlet** | Individual laundry service location (branch) |
| **PWA** | Progressive Web App; installable web app with offline capability |
| **Firestore** | Google Cloud Firestore; real-time NoSQL database |
| **QZ Tray** | Desktop application for thermal printer communication via ESC/POS |
| **ESC/POS** | Thermal printer command protocol for formatting and printing |
| **Sync Queue** | Local storage of transactions created offline; synced to Firestore when online |
| **Last-Write-Wins** | Conflict resolution strategy; server timestamp determines final state |

---

**Document Version:** 1.0  
**Last Updated:** [Current Date]  
**Status:** Approved for Phase 1 Development