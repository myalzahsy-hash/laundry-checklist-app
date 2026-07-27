export type UserRole = "STAFF" | "MANAGER";

export type SyncStatus = "SYNCED" | "PENDING" | "FAILED";

export type ItemCategory = "FIXED" | "DYNAMIC";

export interface Outlet {
  id: string;
  name: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OutletSetting {
  id: string;
  outletId: string;
  notes: string;
  dataRetentionDays: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  outletId: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  outletId: string;
  receiptNumber: string;
  customerName: string;
  transactionDate: Date;
  totalItemCount: number;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: SyncStatus;
}

export interface TransactionItem {
  id: string;
  transactionId: string;
  itemName: string;
  quantity: number;
  category: ItemCategory;
  displayOrder: number;
  createdAt: Date;
}
