# PWA_STRATEGY.md: Laundry Checklist

## Introduction

The Progressive Web App (PWA) is the primary interface for laundry staff to record item intake transactions. This document outlines the strategy for building a robust, performant, and reliable PWA that functions seamlessly across various devices and network conditions, including offline scenarios.

## PWA Core Principles & Benefits

The Laundry Checklist PWA will adhere to the core principles of Progressive Web Apps to deliver an app-like experience directly from the web browser.

### Reliability
The PWA will be reliable, ensuring it loads instantly and consistently, regardless of network conditions. This is critical for staff operating in potentially unstable internet environments.

### Speed
Optimized for fast loading and responsiveness, the PWA will provide a smooth user experience, minimizing wait times during transaction entry and history browsing.

### Engagement
The PWA will be installable, allowing users to add it to their home screen, launch it in a standalone window, and receive a more immersive, app-like experience without the need for an app store.

## PWA Features Implementation

### 1. Installability
The PWA will be installable on Android and iOS devices, as well as desktop browsers that support PWA features.
-   **Web App Manifest:** A `manifest.json` file will define the app's metadata, including name, short name, icons, start URL, display mode (`standalone`), theme color, and background color.
-   **Installation Prompt:** The PWA will provide a user-friendly prompt to install the app, leveraging browser-native installation mechanisms.
-   **Standalone Mode:** Once installed, the PWA will launch in a standalone window, free from browser UI elements, providing a native app feel.
-   **Splash Screen:** A custom splash screen will be displayed during app launch, enhancing the user experience.

### 2. Offline Capability
Offline functionality is a critical requirement for the PWA, ensuring staff can continue working even without an internet connection.
-   **Asset Caching (Workbox):** All static assets (HTML, CSS, JavaScript, images, fonts) will be cached using a service worker (via Vite PWA Plugin and Workbox) to enable instant loading on repeat visits, even offline.
-   **Data Caching (IndexedDB/Zustand):**
    -   **Read Operations:** Previously viewed transactions will be cached locally using IndexedDB or a similar mechanism, allowing staff to browse history offline.
    -   **Write Operations (Offline Sync Queue):** New transactions created while offline will be stored in a local queue (managed by Zustand and persisted to IndexedDB).
    -   **Sync Indicator:** A clear UI indicator will show the current online/offline status and the presence of pending offline transactions.
-   **Background Sync:** When the device regains connectivity, the service worker will automatically attempt to synchronize queued transactions to Firestore.
-   **Conflict Resolution:** A "last-write-wins" strategy will be implemented for data synchronization, using server-side timestamps to resolve potential conflicts.

### 3. Performance Optimization
-   **Vite Build Tool:** Leveraged for its fast development server and optimized production builds, including code splitting, tree-shaking, and minification.
-   **Image Optimization:** Images will be compressed and served in modern formats (e.g., WebP) to reduce load times.
-   **Lazy Loading:** Components and routes will be lazy-loaded to reduce the initial bundle size and improve perceived performance.
-   **Lighthouse Audits:** Regular Lighthouse audits will be performed to monitor and improve PWA performance, accessibility, and best practices.

### 4. Responsive Design
The PWA will be fully responsive, adapting its layout and UI elements to provide an optimal experience across various screen sizes, from small smartphones to tablets and desktop browsers. Tailwind CSS and Shadcn/ui will facilitate this.

### 5. Security
-   **HTTPS Everywhere:** The PWA will be served exclusively over HTTPS to ensure secure communication and enable service worker registration.
-   **Firebase Authentication:** User authentication will be handled by Firebase Authentication, providing secure login and session management.
-   **Firestore Security Rules:** Strict Firestore security rules will enforce data access control, ensuring staff can only access data relevant to their assigned outlet.

## Technology Stack for PWA

-   **Frontend Framework:** React 18 + TypeScript
-   **Build Tool:** Vite
-   **Styling:** Tailwind CSS + Shadcn/ui
-   **State Management:** Zustand (for global state and offline queue)
-   **PWA Tools:** Vite PWA Plugin + Workbox
-   **Form Validation:** React Hook Form + Zod
-   **Backend & Database:** Firebase (Firestore, Authentication, Hosting)

## PWA Manifest Configuration

The `manifest.json` file will be configured as follows:

```json
{
  "name": "Laundry Checklist",
  "short_name": "LaundryApp",
  "description": "Rekap item laundry untuk petugas",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4CAF50",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "orientation": "portrait",
  "prefer_related_applications": false
}
```

## Service Worker Implementation

The service worker will be generated and managed by the `vite-plugin-pwa` which integrates Workbox.

### Caching Strategies
-   **Pre-caching:** All essential static assets (HTML, CSS, JS bundles, core images) will be pre-cached during installation for immediate offline availability.
-   **Runtime Caching:**
    -   **Stale-While-Revalidate:** For frequently updated assets like API responses (Firestore data), a stale-while-revalidate strategy will be used. This serves cached content immediately while revalidating in the background.
    -   **Cache-First:** For less frequently updated assets (e.g., specific images), a cache-first strategy might be employed.

### Background Sync
-   The Workbox `BackgroundSyncPlugin` will be configured to queue failed network requests (specifically Firestore write operations) and retry them when connectivity is restored.
-   A unique tag will be used for each sync queue to manage different types of offline operations.

## Offline Data Synchronization Strategy

The PWA will implement an "online-first with graceful degradation" strategy for data.

1.  **Initial Load:** When online, the PWA fetches data directly from Firestore.
2.  **Offline Data Entry:**
    *   New transactions are stored locally in a Zustand store, which is persisted to IndexedDB.
    *   A unique temporary ID is assigned to these local transactions.
    *   The UI reflects these local changes immediately.
3.  **Re-connection & Sync:**
    *   Upon regaining connectivity, the PWA detects pending local transactions.
    *   These transactions are then sent to Firestore.
    *   Firestore security rules and server-side logic will handle uniqueness checks (e.g., receipt number per outlet per day).
    *   If a transaction is successfully written to Firestore, its temporary ID is replaced with the Firestore-generated ID, and it's removed from the local queue.
    *   If a write fails (e.g., due to a duplicate receipt number already entered by another staff member online), the user will be notified, and the transaction will remain in the local queue for manual resolution.
4.  **Conflict Resolution:** For updates to existing transactions, the "last-write-wins" strategy will be applied at the Firestore level, using server timestamps. The PWA will re-fetch the updated data from Firestore after a successful sync to ensure the local view is consistent with the server.

## Deployment and Hosting

The PWA will be deployed to Firebase Hosting.
-   **CDN:** Firebase Hosting provides a global CDN, ensuring fast content delivery to users worldwide.
-   **Automatic HTTPS:** All content will be served over HTTPS by default.
-   **Zero-Config Deployment:** Integration with Firebase CLI allows for easy and automated deployments.

## PWA-Specific Testing and Monitoring

-   **Lighthouse Audits:** Automated Lighthouse checks will be integrated into the CI/CD pipeline to ensure continuous adherence to PWA best practices, performance, and accessibility.
-   **Offline Testing:** Manual and automated tests will simulate various network conditions (offline, slow 3G) to verify the service worker's caching and background sync functionality.
-   **Installation Testing:** Verification of PWA installation prompts and standalone mode behavior across target devices (Android, iOS, Desktop browsers).
-   **Firebase Performance Monitoring:** Integration with Firebase Performance Monitoring to track PWA load times, network requests, and overall user experience metrics.
-   **Firebase Crashlytics (Future):** For robust error reporting and crash tracking in production.