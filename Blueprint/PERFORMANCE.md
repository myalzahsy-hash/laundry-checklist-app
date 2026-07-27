# PERFORMANCE.md: Laundry Checklist

This document outlines the performance goals, strategies, and considerations for the Laundry Checklist application across its Progressive Web App (PWA), Customer Portal, and Desktop App components. Achieving optimal performance is critical for staff efficiency, customer satisfaction, and overall system reliability.

## Performance Goals

The primary performance goals for the Laundry Checklist application, derived from the Non-Functional Requirements (NFRs) in PRD.md, are:

*   **PWA Page Load Time:**
    *   < 2 seconds for cached loads (subsequent visits).
    *   < 3 seconds for first-time loads (initial visit).
*   **Search Response Time:** < 500 milliseconds for filtering transactions in the PWA history and desktop app, and for customer portal searches.
*   **Firestore Latency:**
    *   < 1 second for write operations (e.g., saving a new transaction).
    *   < 500 milliseconds for read operations (e.g., fetching transaction details).
*   **Offline Sync Queue:** Efficiently persist and sync up to 100 transactions locally without user-perceptible delays.
*   **PWA Cache Size:** Maintain a cache footprint of less than 10 MB to minimize device storage impact.
*   **Print Template Rendering:** < 2 seconds for generating print-ready content in the desktop app.
*   **Mobile Performance (Lighthouse PWA Score):** Achieve a Lighthouse PWA score of ≥ 90 for the staff PWA.

## Performance Metrics and Monitoring

Performance will be continuously monitored and measured using a combination of tools and techniques:

*   **Firebase Performance Monitoring:** For tracking network requests, page load times, and custom traces within the application.
*   **Google Lighthouse:** Regular audits (manual and CI/CD integrated) to assess PWA performance, accessibility, best practices, and SEO.
*   **Web Vitals:** Monitoring Core Web Vitals (LCP, FID, CLS) to ensure a good user experience.
*   **Firestore Monitoring:** Utilizing Firebase Console's built-in monitoring for read/write operations, latency, and quota usage.
*   **Custom Logging:** Implementing application-specific logging for critical operations (e.g., offline sync success/failure, print job duration) to identify bottlenecks.
*   **Sentry (Future):** For advanced error tracking and performance monitoring, providing insights into user-perceived performance issues.

## Performance Optimization Strategies

### Frontend (PWA, Portal, Desktop Web)

All frontend applications (PWA, Customer Portal, Desktop App) are built with React, Vite, and TypeScript, and will leverage the following strategies:

1.  **Bundle Size Optimization:**
    *   **Vite's Tree Shaking:** Automatically removes unused code during build.
    *   **Code Splitting:** Lazy load components and routes using `React.lazy()` and dynamic `import()` to reduce initial load time.
    *   **Dependency Analysis:** Regularly review and optimize third-party library usage to avoid unnecessary bloat.
    *   **Minification & Compression:** Vite automatically minifies JavaScript, CSS, and HTML, and Firebase Hosting provides Gzip/Brotli compression.
2.  **Caching Strategies:**
    *   **Service Worker (Workbox):** Implement a robust service worker using `vite-plugin-pwa` and Workbox for:
        *   **App Shell Caching:** Cache the core UI assets (HTML, CSS, JS) for instant loading on subsequent visits.
        *   **Runtime Caching:** Cache API responses (e.g., Firestore data for history page) with appropriate stale-while-revalidate or cache-first strategies.
        *   **Image Caching:** If any images are introduced, cache them efficiently.
    *   **HTTP Caching:** Utilize proper HTTP headers (Cache-Control, ETag) for static assets served by Firebase Hosting.
3.  **Efficient Rendering:**
    *   **React Best Practices:** Optimize component rendering using `React.memo`, `useCallback`, and `useMemo` to prevent unnecessary re-renders.
    *   **Virtualization:** For long lists (e.g., transaction history), implement list virtualization (e.g., `react-window`, `react-virtualized`) to render only visible items, improving scroll performance.
    *   **Zustand State Management:** Leverage Zustand's lightweight and performant nature for global state, ensuring minimal re-renders.
4.  **Network Request Optimization:**
    *   **Firestore Listeners vs. One-Time Fetches:** Use real-time listeners for data that requires immediate updates (e.g., potentially for a "live" view of transactions being added), but prefer one-time fetches for static or less frequently updated data to reduce continuous network traffic and Firestore reads.
    *   **Batching:** Group multiple Firestore writes into a single batch operation where possible (e.g., saving a transaction with many dynamic items) to reduce network overhead and improve write performance.
    *   **Debouncing/Throttling:** Apply debouncing to search inputs to limit Firestore queries during typing.
5.  **UI Responsiveness:**
    *   **CSS Optimization:** Use Tailwind CSS for efficient styling, minimizing custom CSS.
    *   **Animation Performance:** Ensure any UI animations are performant and run smoothly at 60 FPS.

### Backend (Firestore)

Firestore is the single source of truth, and its performance is critical.

1.  **Data Modeling for Efficient Queries:**
    *   **Denormalization:** Denormalize data where appropriate to reduce the number of reads required for common queries (e.g., embedding customer name in transaction documents for history display).
    *   **Subcollections:** Use subcollections for related data that grows with the parent document (e.g., `transactions/{transactionId}/items`) to keep main documents lean and queries efficient.
    *   **Aggregations:** Store aggregated data (e.g., `totalItemCount` in the transaction document) to avoid costly client-side aggregations or multiple reads.
2.  **Indexing:**
    *   **Automatic Indexing:** Firestore automatically indexes single fields.
    *   **Composite Indexes:** Create composite indexes for queries involving multiple fields (e.g., searching by `receiptNumber` AND `customerName`, or ordering by `date` AND filtering by `outletId`).
    *   **Index Optimization:** Regularly review query patterns and optimize indexes to ensure all queries are served efficiently.
3.  **Security Rules Impact:**
    *   **Efficient Rules:** Design Firestore Security Rules to be as efficient as possible, avoiding complex or recursive rules that can impact read/write latency.
    *   **Outlet-Scoped Access:** Ensure rules strictly enforce outlet-level data isolation, which inherently limits the scope of queries and improves performance by reducing the data Firestore needs to evaluate.
4.  **Proximity:** Deploy Firebase project in a region geographically close to the primary user base to minimize network latency.

### Offline Sync

The PWA's offline capabilities require careful performance consideration.

1.  **Efficient Local Storage:**
    *   **IndexedDB:** Use IndexedDB (via a library like `idb` or `localforage`) for storing queued transactions, as it's designed for large, structured data and asynchronous operations.
    *   **Zustand Persistence:** Integrate Zustand with IndexedDB for persisting the offline queue state.
2.  **Background Sync API:** Leverage the Web Background Sync API (if supported by the browser) to automatically sync queued transactions when the device regains connectivity, even if the PWA is closed. For browsers without Background Sync, implement a robust foreground sync mechanism.
3.  **Conflict Resolution:** The "last-write-wins" strategy with server timestamps is efficient as it requires minimal client-side logic for conflict resolution, reducing processing overhead.

### Printing (Desktop App)

The desktop app's printing functionality relies on QZ Tray.

1.  **QZ Tray Communication:**
    *   **Local Communication:** QZ Tray communicates locally via WebSockets, which is generally fast. Minimize the number of messages sent to QZ Tray.
    *   **Batch Printing (Future):** For multiple receipts, consider batching print jobs to QZ Tray to reduce overhead.
2.  **Template Rendering:**
    *   **Optimized HTML Template:** Ensure the HTML template for printing is lightweight and renders quickly. Avoid complex CSS or JavaScript within the print template.
    *   **Pre-rendering:** Pre-render the print template content on the client-side before sending it to QZ Tray to minimize perceived delay.

## Scalability Considerations

The chosen architecture (serverless Firebase Firestore) inherently provides high scalability for database operations.

*   **Firestore Auto-Scaling:** Firestore automatically scales to handle increased read/write loads and concurrent users, supporting the projected transaction volumes (1000 transactions/day per outlet) and concurrent users (50 per outlet).
*   **Firebase Hosting CDN:** Firebase Hosting utilizes a global CDN, ensuring fast content delivery for all frontend applications, regardless of user location.
*   **Security Rules for Isolation:** The strict outlet-level security rules prevent "noisy neighbor" issues by ensuring queries are always scoped, thus maintaining performance even with many outlets.

## Load Testing and Stress Testing

Prior to each phase's launch, load testing will be conducted to:

*   Verify the system's ability to handle peak transaction volumes and concurrent users.
*   Identify potential bottlenecks in Firestore queries, security rules, or frontend performance under stress.
*   Validate the offline sync mechanism under various network conditions.

This will involve simulating user activity for staff PWA, customer portal searches, and desktop app usage to ensure the system performs reliably under expected and peak loads.