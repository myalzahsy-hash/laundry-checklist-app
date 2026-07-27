# DEPLOYMENT.md: Laundry Checklist

## 1. Overview

This document outlines the deployment strategy for the Laundry Checklist application, encompassing the Progressive Web App (PWA) for staff, the read-only Customer Portal, and the Desktop web application for printing. All components leverage Firebase services for hosting, backend, and authentication, ensuring a streamlined and scalable deployment process.

## 2. Environment Strategy

To ensure isolation, facilitate testing, and manage changes effectively, the project will utilize distinct Firebase projects for each environment.

### 2.1. Environments

| Environment | Purpose | Firebase Project ID Convention | Data Isolation | Access |
|:---|:---|:---|:---|:---|
| **Development** | Local development, feature branch testing, rapid iteration. | `laundry-checklist-dev` | Isolated from Staging/Production. | Developers only. |
| **Staging** | Integration testing, UAT, performance testing, pre-production validation. | `laundry-checklist-stg` | Isolated from Production. | QA, Stakeholders. |
| **Production** | Live application serving end-users. | `laundry-checklist-prod` | Live customer data. | End-users, Operations. |

### 2.2. Firebase Project Structure

Each environment (Development, Staging, Production) will correspond to a dedicated Firebase project. Within each Firebase project, the following services will be configured:

*   **Firebase Hosting**: For deploying the PWA, Customer Portal, and Desktop web app.
*   **Cloud Firestore**: The single source of truth database for all applications within that environment.
*   **Firebase Authentication**: For staff user management and authentication.
*   **Firebase Storage**: (If needed for future features, e.g., images).
*   **Firebase Functions**: (If needed for future backend logic, e.g., complex data processing).

## 3. CI/CD Pipeline

A Continuous Integration/Continuous Deployment (CI/CD) pipeline will automate the build, test, and deployment processes using GitHub Actions.

### 3.1. Workflow Triggers

*   **Push to `main` branch**: Triggers deployment to the **Staging** environment.
*   **Manual Trigger (from `main` branch)**: Triggers deployment to the **Production** environment after successful Staging validation.
*   **Pull Request (PR) to `main` branch**: Triggers build and unit tests.

### 3.2. Pipeline Stages

1.  **Checkout Code**: Fetches the latest code from the repository.
2.  **Install Dependencies**: Installs Node.js dependencies for all frontend applications.
3.  **Build**:
    *   Builds the PWA (`pwa` directory).
    *   Builds the Customer Portal (`portal` directory).
    *   Builds the Desktop App (`desktop` directory).
    *   Generates production-ready static assets and service workers.
4.  **Test**:
    *   Runs unit tests for all applications using Vitest.
    *   Runs Firestore security rules tests.
5.  **Deploy to Firebase Hosting**:
    *   Deploys the built PWA to its designated Firebase Hosting target.
    *   Deploys the built Customer Portal to its designated Firebase Hosting target.
    *   Deploys the built Desktop App to its designated Firebase Hosting target.
6.  **Deploy Firestore Rules**: Deploys the `firestore.rules` file to the target Firebase project.
7.  **Deploy Firebase Authentication Rules**: Deploys `firebase.json` authentication configurations (if any custom rules are defined beyond basic email/password).
8.  **Cache Invalidation**: Invalidates CDN cache for Firebase Hosting.

### 3.3. GitHub Actions Configuration

The CI/CD pipeline will be defined in `.github/workflows/deploy.yml` and will use `firebase-tools` for deployment. Firebase project IDs and service account keys will be stored as GitHub Secrets.

## 4. Hosting Configuration

All frontend applications (PWA, Portal, Desktop) will be hosted on Firebase Hosting, leveraging its global CDN, automatic SSL, and custom domain capabilities.

### 4.1. Firebase Hosting Targets

Within each Firebase project (dev, stg, prod), distinct hosting targets will be configured for each application:

*   **PWA**: `laundry-checklist-pwa`
*   **Customer Portal**: `laundry-checklist-portal`
*   **Desktop App**: `laundry-checklist-desktop`

### 4.2. Domain Mapping

| Application | Environment | Subdomain (Example) |
|:---|:---|:---|
| PWA | Production | `app.laundrychecklist.com` |
| Customer Portal | Production | `portal.laundrychecklist.com` |
| Desktop App | Production | `desktop.laundrychecklist.com` |
| PWA | Staging | `app.stg.laundrychecklist.com` |
| Customer Portal | Staging | `portal.stg.laundrychecklist.com` |
| Desktop App | Staging | `desktop.stg.laundrychecklist.com` |

Firebase Hosting will automatically provision and renew SSL certificates for these custom domains.

### 4.3. `firebase.json` Configuration

The `firebase.json` file will define the hosting configurations, including:

*   **Rewrites**: For single-page application routing.
*   **Headers**: For security (e.g., Content Security Policy) and PWA requirements (e.g., `Cache-Control` for service worker).
*   **Public directories**: Mapping `build` outputs to hosting targets.
*   **PWA specific configurations**: Ensuring `manifest.json` and service worker are correctly served.

Example snippet for `firebase.json`:

```json
{
  "hosting": [
    {
      "target": "laundry-checklist-pwa",
      "public": "apps/pwa/dist",
      "ignore": [
        "firebase.json",
        "**/.*",
        "**/node_modules/**"
      ],
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ],
      "headers": [
        {
          "source": "/service-worker.js",
          "headers": [
            {
              "key": "Cache-Control",
              "value": "no-cache"
            }
          ]
        },
        {
          "source": "**/*.{js,css,html,png,jpg,jpeg,gif,svg,ico,json}",
          "headers": [
            {
              "key": "Cache-Control",
              "value": "max-age=31536000"
            }
          ]
        }
      ]
    },
    {
      "target": "laundry-checklist-portal",
      "public": "apps/portal/dist",
      "ignore": [
        "firebase.json",
        "**/.*",
        "**/node_modules/**"
      ],
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    },
    {
      "target": "laundry-checklist-desktop",
      "public": "apps/desktop/dist",
      "ignore": [
        "firebase.json",
        "**/.*",
        "**/node_modules/**"
      ],
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    }
  ]
}
```

## 5. Firestore Configuration

Firestore database rules and indexes are critical for security and performance.

### 5.1. Security Rules Deployment

Firestore security rules (`firestore.rules`) will be version-controlled in the repository and deployed via the CI/CD pipeline using `firebase deploy --only firestore:rules`. These rules enforce data access control, ensuring:

*   Staff can only read/write transactions for their assigned outlet.
*   Customers can only read specific transaction data via the portal search (based on receipt number and customer name).
*   Data integrity constraints (e.g., unique receipt numbers per outlet per day).

### 5.2. Indexing

Firestore indexes will be defined in `firestore.indexes.json` to optimize query performance, especially for search operations on the `Riwayat` page and Customer Portal. These will be deployed alongside security rules.

## 6. Firebase Authentication Configuration

Firebase Authentication provides user management for staff.

### 6.1. Authentication Rules

While Firebase Authentication primarily handles user sign-up/sign-in, any custom rules or configurations (e.g., email verification settings, allowed sign-in methods) can be defined in `firebase.json` and deployed via `firebase deploy --only auth`.

### 6.2. User Management

Staff user accounts will be managed directly within the Firebase Console for each environment. For production, a robust process for creating and deactivating staff accounts will be established.

## 7. PWA Specific Deployment

The PWA aspects are handled during the build and hosting phases.

### 7.1. Service Worker

The Vite PWA Plugin and Workbox will generate the `service-worker.js` file during the build process. Firebase Hosting will serve this file, enabling:

*   **Offline Caching**: Static assets and application shell are cached for offline access.
*   **Offline Sync**: New transactions created offline are stored locally (using Zustand and IndexedDB) and synchronized to Firestore when connectivity is restored. The service worker helps manage network requests and background sync.

### 7.2. Web App Manifest

The `manifest.json` file, generated by the Vite PWA Plugin, will be served by Firebase Hosting, allowing users to install the PWA to their home screen on compatible devices.

## 8. Monitoring and Logging

Firebase provides built-in tools for monitoring and logging.

### 8.1. Firebase Monitoring

*   **Firebase Hosting**: Provides metrics on requests, data transfer, and response times.
*   **Cloud Firestore**: Offers insights into read/write operations, latency, and quota usage.
*   **Firebase Authentication**: Tracks sign-in events and user activity.
*   **Crashlytics (Future)**: Can be integrated into the PWA to monitor client-side crashes and errors.
*   **Performance Monitoring (Future)**: Can track application performance metrics (e.g., page load times, network request latency) for the PWA.

### 8.2. Sentry Integration (Future)

As mentioned in PRD.md, Sentry can be integrated for advanced error tracking, performance monitoring, and user session replay across all frontend applications. This would provide more granular insights than Firebase's default offerings.

## 9. Rollback Procedures

Firebase Hosting and Firestore rules provide straightforward rollback mechanisms.

### 9.1. Firebase Hosting Rollback

Firebase Hosting maintains a history of deployments. In case of issues, a previous version can be quickly rolled back via the Firebase Console or using the Firebase CLI:

```bash
firebase hosting:disable <target-name> --version <version-id>
firebase hosting:enable <target-name> --version <version-id>
```

### 9.2. Firestore Rules Rollback

Firestore security rules are versioned. Previous versions can be restored via the Firebase Console. Additionally, since rules are version-controlled in Git, reverting to a previous commit and redeploying is also an option.

### 9.3. Database Rollback

Rolling back data in Firestore is more complex and typically involves:

*   **Point-in-Time Recovery (PITR)**: If enabled, Firestore allows recovery to any point in time within a specified duration.
*   **Database Backups**: Regular backups (e.g., daily exports to Cloud Storage) can be used to restore data.
*   **Audit Logs**: For critical data changes, an audit log within Firestore (e.g., a `_history` subcollection) can help identify and revert specific changes.

## 10. QZ Tray Deployment (Desktop App)

The Desktop App relies on QZ Tray for thermal printing.

### 10.1. Client-Side Installation

QZ Tray is a separate desktop application that must be installed on each machine intended for printing. It is not part of the web application deployment. Instructions for QZ Tray installation will be provided to staff.

### 10.2. QZ Tray Detection

The Desktop App will include logic to detect if QZ Tray is running and accessible. If not, it will display a user-friendly message guiding the user to install or start QZ Tray.