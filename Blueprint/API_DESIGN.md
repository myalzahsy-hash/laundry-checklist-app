# API_DESIGN.md: Laundry Checklist

## Overview

This document defines the API contract, data models, Firestore collection structure, and integration patterns for the Laundry Checklist system. It serves as the single source of truth for backend design, ensuring consistency across PWA, Portal, and Desktop applications.

**Key Principles:**
- Firestore as primary data store (no REST API layer in Phase 1)
- Client-side SDK integration via Firebase Admin SDK (backend) and Firebase Web SDK (frontend)
- Security rules enforce outlet-level isolation and role-based access
- Offline-first architecture with eventual consistency
- Timestamp-based conflict resolution (last-write-wins)

---

## Firestore Data Model

### Collection Structure

```
firestore/
├── outlets/
│   └── {outletId}/
│       ├── profile/
│       ├── transactions/
│       │   └── {transactionId}/
│       │       ├── items/
│       │       │   └── {itemId}/
│       └── users/
│           └── {userId}/
├── users/
│   └── {userId}/
└── auditLogs/
    └── {logId}/
```

### Collection Definitions

#### 1. `outlets` Collection

**Purpose:** Store outlet (branch) metadata and configuration.

**Document ID:** `{outletId}` (auto-generated UUID or custom slug)

**Schema:**

```typescript
interface OutletProfile {
  id: string;                    // Firestore document ID
  name: string;                  // Outlet name (e.g., "Laundry Pusat")
  notes: string;                 // Optional remarks (max 500 chars)
  createdAt: Timestamp;          // Outlet creation timestamp
  updatedAt: Timestamp;          // Last update timestamp
  isActive: boolean;             // Soft delete flag
  region?: string;               // Optional: region/city for multi-outlet queries
  address?: string;              // Optional: physical address
}
```

**Firestore Path:** `outlets/{outletId}`

**Example Document:**

```json
{
  "id": "outlet_001",
  "name": "Laundry Pusat Jakarta",
  "notes": "Main branch, open 24/7",
  "createdAt": "2024-01-15T08:00:00Z",
  "updatedAt": "2024-01-20T10:30:00Z",
  "isActive": true,
  "region": "Jakarta Pusat",
  "address": "Jl. Merdeka No. 123"
}
```

---

#### 2. `outlets/{outletId}/transactions` Subcollection

**Purpose:** Store all intake transactions for an outlet.

**Document ID:** `{transactionId}` (auto-generated UUID)

**Schema:**

```typescript
interface Transaction {
  id: string;                    // Firestore document ID
  outletId: string;              // Reference to parent outlet
  receiptNumber: string;         // Unique per outlet per day (e.g., "RCP-20240120-001")
  customerName: string;          // Customer name (max 100 chars)
  transactionDate: Timestamp;    // Date of intake (user-selected)
  totalItems: number;            // Auto-calculated sum of all item quantities
  createdAt: Timestamp;          // Server timestamp (intake creation)
  updatedAt: Timestamp;          // Last modification timestamp
  createdBy: string;             // User ID of staff who created transaction
  updatedBy: string;             // User ID of staff who last edited transaction
  status: "active" | "archived"; // Soft delete via status
  syncStatus?: "synced" | "pending" | "conflict"; // Offline sync state (client-side only)
}
```

**Firestore Path:** `outlets/{outletId}/transactions/{transactionId}`

**Example Document:**

```json
{
  "id": "txn_20240120_001",
  "outletId": "outlet_001",
  "receiptNumber": "RCP-20240120-001",
  "customerName": "Budi Santoso",
  "transactionDate": "2024-01-20T00:00:00Z",
  "totalItems": 25,
  "createdAt": "2024-01-20T09:15:00Z",
  "updatedAt": "2024-01-20T09:15:00Z",
  "createdBy": "staff_user_123",
  "updatedBy": "staff_user_123",
  "status": "active"
}
```

**Indexes Required:**
- Composite: `(outletId, transactionDate DESC, createdAt DESC)` — for history list
- Composite: `(outletId, status, transactionDate DESC)` — for active transactions only
- Single: `receiptNumber` — for uniqueness validation

---

#### 3. `outlets/{outletId}/transactions/{transactionId}/items` Subcollection

**Purpose:** Store individual item records for a transaction (fixed + dynamic).

**Document ID:** `{itemId}` (auto-generated UUID or category name for fixed items)

**Schema:**

```typescript
interface Item {
  id: string;                    // Firestore document ID
  transactionId: string;         // Reference to parent transaction
  itemName: string;              // Fixed category or custom name (e.g., "Pakaian", "Sajadah")
  quantity: number;              // Item count (1–9999)
  itemType: "fixed" | "dynamic"; // Category type
  order: number;                 // Display order (fixed items: 1–4; dynamic: 5+)
  createdAt: Timestamp;          // Item creation timestamp
  updatedAt: Timestamp;          // Last modification timestamp
}
```

**Firestore Path:** `outlets/{outletId}/transactions/{transactionId}/items/{itemId}`

**Example Documents:**

```json
[
  {
    "id": "item_pakaian",
    "transactionId": "txn_20240120_001",
    "itemName": "Pakaian",
    "quantity": 10,
    "itemType": "fixed",
    "order": 1,
    "createdAt": "2024-01-20T09:15:00Z",
    "updatedAt": "2024-01-20T09:15:00Z"
  },
  {
    "id": "item_celana_dalam",
    "transactionId": "txn_20240120_001",
    "itemName": "Celana Dalam",
    "quantity": 5,
    "itemType": "fixed",
    "order": 2,
    "createdAt": "2024-01-20T09:15:00Z",
    "updatedAt": "2024-01-20T09:15:00Z"
  },
  {
    "id": "item_sajadah",
    "transactionId": "txn_20240120_001",
    "itemName": "Sajadah",
    "quantity": 2,
    "itemType": "dynamic",
    "order": 5,
    "createdAt": "2024-01-20T09:15:00Z",
    "updatedAt": "2024-01-20T09:15:00Z"
  }
]
```

**Indexes Required:**
- Single: `(transactionId, order ASC)` — for ordered item retrieval

---

#### 4. `outlets/{outletId}/users` Subcollection

**Purpose:** Store staff user assignments and roles per outlet.

**Document ID:** `{userId}` (Firebase Auth UID)

**Schema:**

```typescript
interface OutletUser {
  userId: string;                // Firebase Auth UID
  outletId: string;              // Reference to parent outlet
  email: string;                 // User email (denormalized for quick lookup)
  role: "staff" | "manager";     // Role within outlet
  assignedAt: Timestamp;         // Assignment date
  isActive: boolean;             // Soft delete flag
  lastLoginAt?: Timestamp;       // Last login timestamp (optional)
}
```

**Firestore Path:** `outlets/{outletId}/users/{userId}`

**Example Document:**

```json
{
  "userId": "user_staff_001",
  "outletId": "outlet_001",
  "email": "staff@laundry.com",
  "role": "staff",
  "assignedAt": "2024-01-10T08:00:00Z",
  "isActive": true,
  "lastLoginAt": "2024-01-20T09:00:00Z"
}
```

---

#### 5. `users` Collection (Global)

**Purpose:** Store global user profile and outlet assignments.

**Document ID:** `{userId}` (Firebase Auth UID)

**Schema:**

```typescript
interface UserProfile {
  userId: string;                // Firebase Auth UID
  email: string;                 // User email
  displayName: string;           // User display name
  primaryOutletId: string;       // Default outlet for login
  assignedOutlets: string[];     // Array of outlet IDs user can access
  createdAt: Timestamp;          // Account creation timestamp
  updatedAt: Timestamp;          // Last profile update
  isActive: boolean;             // Account status
}
```

**Firestore Path:** `users/{userId}`

**Example Document:**

```json
{
  "userId": "user_staff_001",
  "email": "staff@laundry.com",
  "displayName": "Budi Santoso",
  "primaryOutletId": "outlet_001",
  "assignedOutlets": ["outlet_001"],
  "createdAt": "2024-01-10T08:00:00Z",
  "updatedAt": "2024-01-20T09:00:00Z",
  "isActive": true
}
```

---

#### 6. `auditLogs` Collection (Global)

**Purpose:** Track all mutations for compliance and debugging.

**Document ID:** `{logId}` (auto-generated UUID)

**Schema:**

```typescript
interface AuditLog {
  id: string;                    // Firestore document ID
  timestamp: Timestamp;          // Event timestamp
  userId: string;                // User who performed action
  outletId: string;              // Affected outlet
  action: string;                // Action type (e.g., "CREATE_TRANSACTION", "UPDATE_ITEM", "DELETE_TRANSACTION")
  resourceType: string;          // Resource type (e.g., "Transaction", "Item")
  resourceId: string;            // Resource ID (e.g., transactionId)
  changes?: Record<string, any>; // Before/after values (optional)
  ipAddress?: string;            // Client IP (optional)
  userAgent?: string;            // Browser user agent (optional)
}
```

**Firestore Path:** `auditLogs/{logId}`

**Example Document:**

```json
{
  "id": "log_20240120_001",
  "timestamp": "2024-01-20T09:15:00Z",
  "userId": "user_staff_001",
  "outletId": "outlet_001",
  "action": "CREATE_TRANSACTION",
  "resourceType": "Transaction",
  "resourceId": "txn_20240120_001",
  "changes": {
    "receiptNumber": "RCP-20240120-001",
    "customerName": "Budi Santoso"
  },
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0..."
}
```

---

## Firestore Security Rules

### Rule Strategy

- **Outlet-Level Isolation:** Staff can only access transactions for their assigned outlet
- **Role-Based Access:** Managers can edit/delete; staff can create/view
- **Read-Only Portal:** Portal queries use custom claims or separate read-only rules
- **Audit Log Append-Only:** Only backend can write; frontend can read own logs

### Security Rules (Pseudocode)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isStaffInOutlet(outletId) {
      return isAuthenticated() &&
             exists(/databases/$(database)/documents/outlets/$(outletId)/users/$(request.auth.uid));
    }
    
    function isManagerInOutlet(outletId) {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/outlets/$(outletId)/users/$(request.auth.uid)).data.role == 'manager';
    }
    
    function getUserOutlets() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.assignedOutlets;
    }
    
    // Outlets collection
    match /outlets/{outletId} {
      allow read: if isStaffInOutlet(outletId);
      allow write: if isManagerInOutlet(outletId);
      
      // Transactions subcollection
      match /transactions/{transactionId} {
        allow read: if isStaffInOutlet(outletId);
        allow create: if isStaffInOutlet(outletId) &&
                        request.resource.data.outletId == outletId &&
                        request.resource.data.createdBy == request.auth.uid;
        allow update: if isStaffInOutlet(outletId) &&
                        resource.data.outletId == outletId &&
                        request.resource.data.updatedBy == request.auth.uid;
        allow delete: if isManagerInOutlet(outletId);
        
        // Items subcollection
        match /items/{itemId} {
          allow read: if isStaffInOutlet(outletId);
          allow write: if isStaffInOutlet(outletId) &&
                          get(/databases/$(database)/documents/outlets/$(outletId)/transactions/$(transactionId)).data.outletId == outletId;
        }
      }
      
      // Users subcollection
      match /users/{userId} {
        allow read: if isManagerInOutlet(outletId) || request.auth.uid == userId;
        allow write: if isManagerInOutlet(outletId);
      }
    }
    
    // Global users collection
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId || isAdmin();
    }
    
    // Audit logs (append-only)
    match /auditLogs/{logId} {
      allow read: if isAuthenticated() && 
                     get(/databases/$(database)/documents/auditLogs/$(logId)).data.userId == request.auth.uid;
      allow create: if false; // Backend only
    }
  }
}
```

---

## API Operations (Client-Side SDK)

### Authentication

#### Sign In (Email/Password)

**Operation:** `signInWithEmailAndPassword(email, password)`

**Input:**
```typescript
{
  email: string;      // Staff email
  password: string;   // Staff password
}
```

**Output:**
```typescript
{
  user: {
    uid: string;
    email: string;
    displayName: string;
  };
  token: string;      // ID token for subsequent requests
}
```

**Error Handling:**
- `auth/user-not-found` → Display "Email not registered"
- `auth/wrong-password` → Display "Incorrect password"
- `auth/too-many-requests` → Display "Too many login attempts, try again later"

**Firestore Side Effect:** Update `users/{userId}.lastLoginAt` timestamp

---

#### Sign Out

**Operation:** `signOut()`

**Input:** None

**Output:** None

**Side Effects:**
- Clear local Zustand state
- Clear IndexedDB offline queue
- Clear service worker cache (optional)

---

### Transaction Operations

#### Create Transaction (Kasir Page)

**Operation:** `createTransaction(outletId, transactionData, items)`

**Input:**
```typescript
{
  outletId: string;
  transactionData: {
    receiptNumber: string;      // Must be unique per outlet per day
    customerName: string;
    transactionDate: Date;
    notes?: string;
  };
  items: Array<{
    itemName: string;
    quantity: number;
    itemType: "fixed" | "dynamic";
    order: number;
  }>;
}
```

**Firestore Operations:**

1. **Validate Receipt Number Uniqueness:**
   ```
   Query: outlets/{outletId}/transactions
   Where: receiptNumber == input.receiptNumber
   Where: transactionDate >= startOfDay(input.transactionDate)
   Where: transactionDate < endOfDay(input.transactionDate)
   Where: status == "active"
   Expected: 0 results
   ```

2. **Create Transaction Document:**
   ```
   POST outlets/{outletId}/transactions/{transactionId}
   {
     receiptNumber: string,
     customerName: string,
     transactionDate: Timestamp,
     totalItems: number (sum of all item quantities),
     createdAt: serverTimestamp(),
     updatedAt: serverTimestamp(),
     createdBy: request.auth.uid,
     updatedBy: request.auth.uid,
     status: "active"
   }
   ```

3. **Create Item Documents (Batch Write):**
   ```
   For each item:
     POST outlets/{outletId}/transactions/{transactionId}/items/{itemId}
     {
       itemName: string,
       quantity: number,
       itemType: "fixed" | "dynamic",
       order: number,
       createdAt: serverTimestamp(),
       updatedAt: serverTimestamp()
     }
   ```

4. **Write Audit Log:**
   ```
   POST auditLogs/{logId}
   {
     timestamp: serverTimestamp(),
     userId: request.auth.uid,
     outletId: outletId,
     action: "CREATE_TRANSACTION",
     resourceType: "Transaction",
     resourceId: transactionId,
     changes: { receiptNumber, customerName, totalItems }
   }
   ```

**Output:**
```typescript
{
  transactionId: string;
  receiptNumber: string;
  totalItems: number;
  createdAt: Timestamp;
}
```

**Error Handling:**
- `receipt-number-duplicate` → Display "Receipt number already exists today"
- `validation-error` → Display field-specific error (e.g., "Customer name required")
- `firestore/permission-denied` → Display "You don't have permission to create transactions"
- `offline` → Queue transaction locally; show "Saved offline, will sync when online"

**Offline Behavior:**
- If offline, save to IndexedDB with `syncStatus: "pending"`
- Auto-sync when online
- Show sync indicator in UI

---

#### Read Transaction List (Riwayat Page)

**Operation:** `getTransactionList(outletId, filters)`

**Input:**
```typescript
{
  outletId: string;
  filters?: {
    searchQuery?: string;        // Search by receiptNumber or customerName
    startDate?: Date;
    endDate?: Date;
    limit?: number;              // Default: 20
    offset?: number;             // For pagination
  };
}
```

**Firestore Query:**

```
Base Query:
  Collection: outlets/{outletId}/transactions
  Where: status == "active"
  OrderBy: transactionDate DESC, createdAt DESC
  Limit: filters.limit (default 20)
  Offset: filters.offset (default 0)

If searchQuery provided:
  Client-side filter (post-query):
    receiptNumber.includes(searchQuery) OR
    customerName.toLowerCase().includes(searchQuery.toLowerCase())
```

**Output:**
```typescript
{
  transactions: Array<{
    id: string;
    receiptNumber: string;
    customerName: string;
    transactionDate: Timestamp;
    totalItems: number;
    createdAt: Timestamp;
  }>;
  hasMore: boolean;              // Indicates if more results available
  total: number;                 // Total count (optional, for pagination UI)
}
```

**Caching Strategy:**
- Cache results in Zustand for 5 minutes
- Invalidate cache on create/update/delete
- Firestore real-time listener for live updates (optional Phase 2)

---

#### Read Transaction Detail (Riwayat Detail Page)

**Operation:** `getTransactionDetail(outletId, transactionId)`

**Input:**
```typescript
{
  outletId: string;
  transactionId: string;
}
```

**Firestore Operations:**

1. **Fetch Transaction Document:**
   ```
   GET outlets/{outletId}/transactions/{transactionId}
   ```

2. **Fetch Items Subcollection:**
   ```
   GET outlets/{outletId}/transactions/{transactionId}/items
   OrderBy: order ASC
   ```

**Output:**
```typescript
{
  transaction: {
    id: string;
    receiptNumber: string;
    customerName: string;
    transactionDate: Timestamp;
    totalItems: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    createdBy: string;
    updatedBy: string;
  };
  items: Array<{
    id: string;
    itemName: string;
    quantity: number;
    itemType: "fixed" | "dynamic";
    order: number;
  }>;
}
```

**Error Handling:**
- `not-found` → Display "Transaction not found"
- `permission-denied` → Display "You don't have access to this transaction"

---

#### Update Transaction (Riwayat Edit)

**Operation:** `updateTransaction(outletId, transactionId, updates)`

**Input:**
```typescript
{
  outletId: string;
  transactionId: string;
  updates: {
    items: Array<{
      id: string;
      itemName: string;
      quantity: number;
      itemType: "fixed" | "dynamic";
      order: number;
    }>;
  };
}
```

**Firestore Operations:**

1. **Fetch Current Transaction (for conflict detection):**
   ```
   GET outlets/{outletId}/transactions/{transactionId}
   ```

2. **Check Last-Write-Wins (Timestamp Comparison):**
   ```
   If request.resource.updatedAt > resource.data.updatedAt:
     Proceed with update
   Else:
     Return conflict error
   ```

3. **Update Transaction Document:**
   ```
   PATCH outlets/{outletId}/transactions/{transactionId}
   {
     totalItems: number (recalculated),
     updatedAt: serverTimestamp(),
     updatedBy: request.auth.uid
   }
   ```

4. **Update/Delete/Create Items (Batch Write):**
   ```
   For each item in updates.items:
     If item.id exists:
       PATCH outlets/{outletId}/transactions/{transactionId}/items/{itemId}
     Else:
       POST outlets/{outletId}/transactions/{transactionId}/items/{newItemId}
   
   For each item in current.items not in updates.items:
     DELETE outlets/{outletId}/transactions/{transactionId}/items/{itemId}
   ```

5. **Write Audit Log:**
   ```
   POST auditLogs/{logId}
   {
     action: "UPDATE_TRANSACTION",
     changes: { before: currentItems, after: updatedItems }
   }
   ```

**Output:**
```typescript
{
  transactionId: string;
  totalItems: number;
  updatedAt: Timestamp;
}
```

**Error Handling:**
- `conflict` → Display "Transaction was modified by another user. Refresh and try again."
- `validation-error` → Display field-specific error
- `permission-denied` → Display "Only managers can edit transactions"

---

#### Delete Transaction (Riwayat Delete)

**Operation:** `deleteTransaction(outletId, transactionId)`

**Input:**
```typescript
{
  outletId: string;
  transactionId: string;
}
```

**Firestore Operations:**

1. **Soft Delete (Update Status):**
   ```
   PATCH outlets/{outletId}/transactions/{transactionId}
   {
     status: "archived",
     updatedAt: serverTimestamp(),
     updatedBy: request.auth.uid
   }
   ```

2. **Write Audit Log:**
   ```
   POST auditLogs/{logId}
   {
     action: "DELETE_TRANSACTION",
     resourceId: transactionId
   }
   ```

**Output:**
```typescript
{
  success: boolean;
  transactionId: string;
}
```

**Error Handling:**
- `permission-denied` → Display "Only managers can delete transactions"
- `not-found` → Display "Transaction not found"

---

### Outlet Operations

#### Read Outlet Profile (Pengaturan Page)

**Operation:** `getOutletProfile(outletId)`

**Input:**
```typescript
{
  outletId: string;
}
```

**Firestore Query:**
```
GET outlets/{outletId}
```

**Output:**
```typescript
{
  id: string;
  name: string;
  notes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}
```

---

#### Update Outlet Profile (Pengaturan Save)

**Operation:** `updateOutletProfile(outletId, updates)`

**Input:**
```typescript
{
  outletId: string;
  updates: {
    name?: string;
    notes?: string;
  };
}
```

**Firestore Operations:**

1. **Update Outlet Document:**
   ```
   PATCH outlets/{outletId}
   {
     name: string (if provided),
     notes: string (if provided),
     updatedAt: serverTimestamp()
   }
   ```

2. **Write Audit Log:**
   ```
   POST auditLogs/{logId}
   {
     action: "UPDATE_OUTLET",
     changes: updates
   }
   ```

**Output:**
```typescript
{
  success: boolean;
  outlet: OutletProfile;
}
```

**Error Handling:**
- `permission-denied` → Display "Only managers can update outlet settings"
- `validation-error` → Display field-specific error

---

### Portal Operations (Read-Only)

#### Portal Search Transaction

**Operation:** `portalSearchTransaction(receiptNumber, customerName)`

**Input:**
```typescript
{
  receiptNumber: string;
  customerName: string;
}
```

**Firestore Query:**

```
Query all outlets (no outlet context for portal):
  Collection: outlets/{outletId}/transactions
  Where: receiptNumber == input.receiptNumber
  Where: customerName == input.customerName (case-insensitive)
  Where: status == "active"
  Limit: 1
```

**Output:**
```typescript
{
  transaction: {
    id: string;
    receiptNumber: string;
    customerName: string;
    transactionDate: Timestamp;
    totalItems: number;
    outletName: string;
  };
  items: Array<{
    itemName: string;
    quantity: number;
  }>;
} | null
```

**Security Considerations:**
- Rate-limit to 5 requests per minute per IP
- Log all portal searches for audit
- No error message distinguishing "not found" vs "wrong customer name" (prevent enumeration)

**Error Handling:**
- `not-found` → Display "Transaction not found. Please check receipt number and customer name."
- `rate-limit-exceeded` → Display "Too many search attempts. Try again in a few minutes."

---

## Offline Sync Architecture

### Offline Queue (Zustand Store)

**State Structure:**

```typescript
interface OfflineQueue {
  queue: Array<{
    id: string;                  // Unique operation ID
    type: "CREATE" | "UPDATE" | "DELETE";
    resourceType: "Transaction" | "Item";
    outletId: string;
    payload: any;
    timestamp: number;           // Client timestamp
    syncStatus: "pending" | "synced" | "failed";
    retryCount: number;
    error?: string;
  }>;
  isOnline: boolean;
  lastSyncAt?: number;
}
```

### Sync Flow

1. **Offline Operation:**
   - User creates/updates transaction while offline
   - Operation saved to IndexedDB + Zustand queue
   - UI shows "Saved offline" indicator
   - `syncStatus: "pending"`

2. **Online Detection:**
   - Service worker detects network restoration
   - Zustand store updates `isOnline: true`
   - Trigger sync process

3. **Sync Process:**
   - For each pending operation in queue:
     - Attempt Firestore write
     - If success: update `syncStatus: "synced"`, remove from queue
     - If conflict (last-write-wins): show conflict UI, allow user to retry or discard
     - If error: increment `retryCount`, show error toast
   - Max 3 retries per operation
   - Exponential backoff: 1s, 2s, 4s

4. **Conflict Resolution:**
   - Server timestamp wins
   - If local `updatedAt` < server `updatedAt`: discard local changes
   - Show UI: "This transaction was modified. Refresh to see latest version."

### IndexedDB Schema

```typescript
interface OfflineDB {
  store: "offlineQueue" {
    keyPath: "id",
    indexes: [
      { name: "syncStatus", keyPath: "syncStatus" },
      { name: "outletId", keyPath: "outletId" }
    ]
  };
  store: "cachedTransactions" {
    keyPath: "id",
    indexes: [
      { name: "outletId", keyPath: "outletId" },
      { name: "transactionDate", keyPath: "transactionDate" }
    ]
  };
}
```

---

## Batch Operations

### Batch Write (Create Transaction + Items)

**Purpose:** Atomically create transaction and all items in single batch.

**Firestore Batch API:**

```typescript
const batch = db.batch();

// Add transaction document
const txnRef = db.collection('outlets').doc(outletId)
  .collection('transactions').doc(transactionId);
batch.set(txnRef, transactionData);

// Add item documents
items.forEach((item, index) => {
  const itemRef = txnRef.collection('items').doc(`item_${index}`);
  batch.set(itemRef, itemData);
});

// Commit batch
await batch.commit();
```

**Atomicity:** All writes succeed or all fail (no partial updates)

---

## Real-Time Listeners (Phase 2+)

### Transaction List Listener

**Purpose:** Keep transaction list in sync across devices/tabs.

**Firestore Listener:**

```typescript
const unsubscribe = db.collection('outlets').doc(outletId)
  .collection('transactions')
  .where('status', '==', 'active')
  .orderBy('transactionDate', 'desc')
  .limit(20)
  .onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        // New transaction
        updateZustandStore(change.doc.data());
      } else if (change.type === 'modified') {
        // Transaction updated
        updateZustandStore(change.doc.data());
      } else if (change.type === 'removed') {
        // Transaction deleted
        removeFromZustandStore(change.doc.id);
      }
    });
  });
```

**Deferred to Phase 2** (MVP uses polling/manual refresh)

---

## Error Handling & Retry Strategy

### Error Categories

| Error Code | HTTP Status | Cause | Retry? | User Message |
|:---|:---:|:---|:---:|:---|
| `permission-denied` | 403 | Security rule violation | No | "You don't have permission" |
| `not-found` | 404 | Document doesn't exist | No | "Transaction not found" |
| `already-exists` | 409 | Duplicate receipt number | No | "Receipt number already exists" |
| `unavailable` | 503 | Firestore temporarily down | Yes | "Service temporarily unavailable" |
| `deadline-exceeded` | 504 | Request timeout | Yes | "Request timed out" |
| `unauthenticated` | 401 | Auth token expired | Yes (re-auth) | "Session expired, please login again" |
| `resource-exhausted` | 429 | Quota exceeded | Yes (backoff) | "Too many requests, try again later" |
| `internal` | 500 | Server error | Yes | "An error occurred, please try again" |

### Retry Logic

```typescript
async function retryWithBackoff(
  operation: () => Promise<any>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<any> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const isRetryable = [
        'unavailable',
        'deadline-exceeded',
        'resource-exhausted'
      ].includes(error.code);
      
      if (!isRetryable || attempt === maxRetries - 1) {
        throw error;
      }
      
      const delayMs = initialDelayMs * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}
```

---

## Data Validation Rules

### Transaction-Level Validation

| Field | Rule | Error Message |
|:---|:---|:---|
| `receiptNumber` | Required, alphanumeric, max 50 chars, unique per outlet per day | "Receipt number is required and must be unique today" |
| `customerName` | Required, max 100 chars, no leading/trailing spaces | "Customer name is required (max 100 chars)" |
| `transactionDate` | Required, must be today or past date, not future | "Transaction date cannot be in the future" |
| `items` | At least 1 item required | "At least one item must be added" |
| `totalItems` | Auto-calculated, must be > 0 | N/A |

### Item-Level Validation

| Field | Rule | Error Message |
|:---|:---|:---|
| `itemName` | Required, max 50 chars, no leading/trailing spaces | "Item name is required (max 50 chars)" |
| `quantity` | Required, integer, 1–9999 | "Quantity must be between 1 and 9999" |
| `itemType` | Must be "fixed" or "dynamic" | N/A (enforced client-side) |

### Outlet-Level Validation

| Field | Rule | Error Message |
|:---|:---|:---|
| `name` | Required, max 100 chars | "Outlet name is required (max 100 chars)" |
| `notes` | Optional, max 500 chars | "Notes must not exceed 500 characters" |

---

## Rate Limiting & Quotas

### Firestore Quotas (Phase 1 Estimates)

| Metric | Limit | Rationale |
|:---|:---|:---|
| **Reads/day** | 100,000 | ~1000 transactions/day × 100 reads per transaction |
| **Writes/day** | 50,000 | ~1000 transactions/day × 50 writes (txn + items + audit) |
| **Stored Data** | 1 GB | ~2 years of transactions at 1000/day |
| **Concurrent Connections** | 100 | 50 staff × 2 concurrent operations |

### Client-Side Rate Limiting

| Operation | Limit | Window | Enforcement |
|:---|:---|:---|:---|
| **Create Transaction** | 10 | 1 minute | Zustand state + toast warning |
| **Portal Search** | 5 | 1 minute | IP-based (backend) |
| **History Search** | 20 | 1 second | Debounce input |

---

## API Response Format

### Success Response

```typescript
{
  success: true;
  data: any;                     // Operation-specific payload
  timestamp: number;             // Server timestamp (ms)
}
```

### Error Response

```typescript
{
  success: false;
  error: {
    code: string;                // Error code (e.g., "receipt-number-duplicate")
    message: string;             // User-friendly message
    details?: Record<string, any>; // Additional context (optional)
  };
  timestamp: number;
}
```

---

## Monitoring & Observability

### Metrics to Track

| Metric | Collection Method | Alert Threshold |
|:---|:---|:---|
| **Firestore Write Latency** | Firebase Performance Monitoring | > 2s |
| **Firestore Read Latency** | Firebase Performance Monitoring | > 1s |
| **Offline Sync Failure Rate** | Custom logging | > 5% |
| **Receipt Number Collision Rate** | Audit logs | > 0.1% |
| **Auth Token Expiration** | Firebase Auth logs | Any |
| **Portal Search Rate** | Custom logging | > 100/hour (potential abuse) |

### Logging Strategy

- **Client-Side:** Console logs (dev only); Sentry integration (Phase 2)
- **Server-Side:** Firestore audit logs; Firebase Cloud Logging
- **Sensitive Data:** Never log customer names, receipt numbers in plaintext

---

## API Versioning Strategy

### Version 1.0 (Current)

- Firestore collections as defined above
- Client SDK integration (no REST API)
- Last-write-wins conflict resolution

### Future Versions (Phase 2+)

- REST API layer (if third-party integrations needed)
- Real-time listeners (WebSocket via Firestore)
- Batch export/import operations
- Advanced search filters

---

## Integration Points

### Firebase Authentication

- **Sign-in:** Email/password via Firebase Auth
- **Token Refresh:** Automatic via Firebase SDK
- **Custom Claims:** (Future) Role-based access control

### Firebase Hosting

- **PWA Deployment:** `app.laundrychecklist.app`
- **Portal Deployment:** `portal.laundrychecklist.app`
- **Desktop Deployment:** `desktop.laundrychecklist.app`

### QZ Tray Integration (Desktop)

See [COMPONENT_STRUCTURE.md](COMPONENT_STRUCTURE.md) for print template details.

---

## Appendix: Firestore Indexes

### Required Composite Indexes

```
Collection: outlets/{outletId}/transactions
Fields:
  - outletId (Ascending)
  - status (Ascending)
  - transactionDate (Descending)
  - createdAt (Descending)

Collection: outlets/{outletId}/transactions
Fields:
  - outletId (Ascending)
  - transactionDate (Descending)
  - createdAt (Descending)
```

### Single-Field Indexes

```
Collection: outlets/{outletId}/transactions
Field: receiptNumber (Ascending)

Collection: outlets/{outletId}/transactions/items
Field: order (Ascending)
```

---

**Document Version:** 1.0  
**Last Updated:** [Current Date]  
**Status:** Ready for Implementation