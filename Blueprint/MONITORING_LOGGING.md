# MONITORING.md: Laundry Checklist

## Introduction

This document outlines the monitoring strategy for the "Laundry Checklist" application, encompassing the Progressive Web App (PWA), Customer Portal, and Desktop App. Effective monitoring is crucial for ensuring system reliability, performance, security, and a positive user experience across all project phases. It provides visibility into application health, identifies issues proactively, and supports data-driven decision-making.

## Monitoring Goals

The primary goals of our monitoring strategy are to:

*   **Ensure Uptime and Availability:** Verify that all application components (PWA, Portal, Desktop, Firestore) are operational and accessible.
*   **Track Performance:** Measure and optimize response times, load speeds, and overall application responsiveness.
*   **Detect and Resolve Errors:** Proactively identify, report, and diagnose application errors and exceptions across the frontend and backend.
*   **Monitor Resource Utilization:** Keep track of Firebase service consumption to manage costs and prevent quota issues.
*   **Maintain Security Posture:** Detect suspicious activities, unauthorized access attempts, and security rule violations.
*   **Understand User Behavior:** Gather insights into how users interact with the application to inform future improvements.
*   **Validate Business Metrics:** Monitor key performance indicators (KPIs) to assess the project's success and impact.

## Monitoring Areas and Tools

### Application Performance Monitoring (APM) & Error Tracking

This area focuses on the health and performance of the client-side applications (PWA, Portal, Desktop) and the detection of runtime errors.

*   **Tool:** Sentry (as identified in the tech stack for future implementation, but critical for comprehensive monitoring)
*   **Purpose:**
    *   **Error Tracking:** Capture unhandled exceptions, JavaScript errors, network request failures, and UI crashes in real-time.
    *   **Performance Monitoring:** Track frontend performance metrics like page load times, asset loading, and long tasks.
    *   **User Session Replay (Future):** Reconstruct user interactions leading up to an error for faster debugging.
    *   **Release Health:** Monitor the impact of new deployments on error rates and performance.
*   **Specifics for Laundry Checklist:**
    *   Monitor PWA and Portal page load times (aligning with NFRs).
    *   Track errors during transaction creation, editing, and deletion.
    *   Monitor QZ Tray communication errors in the Desktop app.
    *   Capture offline sync failures and successful sync events.

### Infrastructure & Backend Monitoring

This covers the health, performance, and resource usage of the Firebase backend services.

*   **Tool:** Firebase Console Monitoring (built-in for Firestore, Authentication, Hosting)
*   **Purpose:**
    *   **Firestore:** Monitor read/write/delete operations, document counts, storage usage, and query performance. Identify slow queries or potential security rule bottlenecks.
    *   **Authentication:** Track sign-in attempts, user creation, and authentication errors.
    *   **Hosting:** Monitor request rates, bandwidth usage, and response latency for the PWA, Portal, and Desktop web apps.
    *   **Cloud Functions (if implemented later):** Monitor invocations, execution times, and errors.
*   **Specifics for Laundry Checklist:**
    *   Monitor Firestore document reads/writes/deletes to ensure operations stay within quotas, especially during peak intake.
    *   Track Firestore security rule violations to detect unauthorized data access attempts.
    *   Monitor hosting performance for all three frontends.

### Real User Monitoring (RUM) & Analytics

Understanding how users interact with the application and measuring key business metrics.

*   **Tool:** Google Analytics / Firebase Analytics
*   **Purpose:**
    *   **User Flow Analysis:** Track user journeys through the PWA and Portal.
    *   **Feature Usage:** Monitor which features are most used (e.g., transaction creation, search, print).
    *   **Conversion Tracking:** Measure PWA installation rates, customer portal adoption (search volume).
    *   **Demographics (if applicable):** Understand user base.
*   **Specifics for Laundry Checklist:**
    *   Track the number of transactions created per outlet.
    *   Monitor the average transaction entry time (PWA).
    *   Measure customer portal search volume and success rate.
    *   Track print job volume from the Desktop app.
    *   Monitor PWA installation rates.

### Security Monitoring

Focuses on detecting and alerting on potential security threats and policy violations.

*   **Tool:** Firebase Console (Authentication logs, Firestore security rules logs), Sentry (for application-level security errors)
*   **Purpose:**
    *   **Authentication:** Monitor failed login attempts, suspicious login patterns.
    *   **Authorization:** Log and alert on Firestore security rule violations (e.g., staff trying to access other outlets' data).
    *   **Rate Limiting:** Monitor triggers for rate limits on the Customer Portal search to prevent brute-force attacks.
*   **Specifics for Laundry Checklist:**
    *   Alert on repeated failed login attempts for staff accounts.
    *   Monitor for any attempts to bypass outlet-level data isolation.
    *   Track and alert on excessive search queries from the Customer Portal.

### PWA & Web Performance Auditing

Regular assessment of the PWA's adherence to best practices and performance.

*   **Tool:** Lighthouse CI (integrated into CI/CD pipeline)
*   **Purpose:**
    *   Automate performance, accessibility, best practices, SEO, and PWA scores.
    *   Ensure consistent PWA quality across deployments.
*   **Specifics for Laundry Checklist:**
    *   Ensure the PWA consistently meets the target Lighthouse PWA score (≥ 90).
    *   Monitor for regressions in performance or PWA capabilities.

## Key Metrics to Monitor

The following metrics will be continuously monitored, aligning with the Non-Functional Requirements and KPIs defined in PRD.md:

### Availability & Uptime

*   **PWA/Portal/Desktop App Uptime:** Percentage of time the applications are accessible.
*   **Firestore Uptime:** Availability of the database service.

### Performance

*   **PWA Page Load Time:** Time taken for the PWA to become interactive (target: < 2s cached, < 3s first load).
*   **Customer Portal Load Time:** Time taken for the portal to load search interface and results.
*   **Firestore Latency:** Average response time for database reads and writes (target: < 500ms read, < 1s write).
*   **Search Response Time:** Time taken to return search results on History page and Portal (target: < 500ms).
*   **Offline Sync Success Rate:** Percentage of queued offline transactions successfully synced to Firestore (target: ≥ 99%).
*   **Print Success Rate:** Percentage of successful print jobs initiated from the Desktop app (target: ≥ 98%).

### Error Rates

*   **Frontend Error Rate:** Percentage of user sessions encountering JavaScript errors or UI crashes.
*   **Backend Error Rate:** Percentage of Firestore operations resulting in errors (e.g., write failures, security rule rejections).
*   **QZ Tray Communication Errors:** Errors during communication between Desktop app and QZ Tray.
*   **Offline Sync Failure Rate:** Percentage of queued transactions that fail to sync after multiple retries.

### Resource Utilization (Firebase)

*   **Firestore Document Reads/Writes/Deletes:** Daily/hourly counts to monitor quota usage.
*   **Firestore Storage:** Total data stored.
*   **Firebase Authentication Requests:** Number of sign-in and user management operations.
*   **Firebase Hosting Bandwidth:** Data transferred for serving PWA, Portal, and Desktop assets.

### Security

*   **Failed Login Attempts:** Number of unsuccessful staff login attempts.
*   **Firestore Security Rule Violations:** Number of attempts to access data outside of defined permissions.
*   **Customer Portal Search Rate Limit Triggers:** Number of times the rate limit for portal search is hit.

### Business Metrics

*   **Transactions Created:** Daily/weekly count of new transactions.
*   **Average Transaction Entry Time:** Time taken for staff to complete a transaction (target: ≤ 2 minutes).
*   **Customer Portal Search Volume:** Number of successful searches by customers.
*   **PWA Installation Rate:** Percentage of staff who have installed the PWA.
*   **Data Accuracy (Item Count Disputes):** Tracked via customer feedback and audit logs (target: ≤ 2% discrepancy rate).

## Alerting Strategy

Critical metrics will have defined thresholds that trigger alerts to the development and operations teams.

*   **Severity Levels:**
    *   **Critical:** Immediate action required (e.g., system downtime, high error rate, security breach). Notifications via PagerDuty/SMS.
    *   **Warning:** Potential issue developing, requires investigation (e.g., elevated latency, approaching quota limits). Notifications via Slack/Email.
    *   **Informational:** Routine events or minor deviations (e.g., successful deployment, low-priority errors). Notifications via Slack channel.
*   **Channels:** Email, Slack, and PagerDuty (for critical alerts).
*   **Alert Configuration:**
    *   **Uptime:** Alert if any service is down for > 5 minutes.
    *   **Error Rate:** Alert if frontend or backend error rate exceeds 1% over a 5-minute window.
    *   **Performance:** Alert if average page load time or API latency exceeds NFR targets by 20% for > 10 minutes.
    *   **Quotas:** Alert if Firestore reads/writes/storage usage exceeds 80% of daily quota.
    *   **Security:** Alert on multiple failed login attempts from a single IP, or any Firestore security rule violation.

## Logging Strategy

Comprehensive logging is essential for debugging, auditing, and security analysis.

*   **Client-Side Logging:**
    *   All application errors and warnings captured by Sentry.
    *   Informational logs (e.g., successful offline sync, QZ Tray connection status) sent to Sentry or Firebase Analytics.
*   **Backend Logging (Firebase Cloud Logging):**
    *   Firestore security rule evaluation logs.
    *   Firebase Authentication activity logs.
    *   Hosting access logs.
    *   Audit logs for critical actions (e.g., transaction edits, deletes, outlet setting changes) stored in a dedicated Firestore collection or Cloud Logging. These logs will include user ID, timestamp, action, and affected data.

## Monitoring Dashboard

A centralized dashboard will provide a real-time overview of the system's health and key metrics.

*   **Tools:** Firebase Console Dashboards, Sentry Dashboards, Google Analytics Dashboards.
*   **Key Views:**
    *   **System Health:** Overall uptime, error rates, and performance trends.
    *   **Firebase Resource Usage:** Firestore, Auth, Hosting consumption.
    *   **Application Performance:** PWA/Portal/Desktop load times, API latency.
    *   **Business Metrics:** Transaction volume, customer portal usage, print counts.
    *   **Security Events:** Failed logins, security rule violations.

## Phased Monitoring Implementation

Monitoring capabilities will evolve with the project phases:

*   **Phase 1 (PWA MVP):**
    *   Basic Firebase Console monitoring for Firestore, Auth, Hosting.
    *   Initial Sentry setup for PWA error tracking and performance.
    *   Google Analytics for PWA usage and transaction volume.
    *   Lighthouse CI integration for PWA quality.
*   **Phase 2 (Customer Portal):**
    *   Extend Sentry and Google Analytics to cover the Portal.
    *   Implement specific monitoring for Portal search performance and rate limiting.
*   **Phase 3 (Desktop App + Printing):**
    *   Extend Sentry to cover Desktop app errors, especially QZ Tray communication.
    *   Monitor print success/failure rates.
    *   Track Desktop app usage via Google Analytics.

This comprehensive monitoring strategy ensures that the "Laundry Checklist" application remains robust, performant, and secure throughout its lifecycle.