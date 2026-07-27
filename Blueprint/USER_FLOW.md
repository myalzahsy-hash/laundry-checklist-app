# USERFLOW.md: Laundry Checklist

## 1. Staff PWA: Record New Laundry Transaction (Kasir)

This flow describes how a laundry staff member records a new customer transaction, detailing the items received.

| No | Actor | Action/Step | System Response | Alternative/Alternative Path/Error Path |
|:---|:---|:---|:---|:---|
| 1 | Laundry Staff | Opens PWA and navigates to "Kasir" page. | System displays a blank transaction form with fields for Customer Name, Transaction Date, Receipt Number, Fixed Item Categories, and an "Lain-lain" section. Total Item count is 0. | - |
| 2 | Laundry Staff | Enters Customer Name (e.g., "John Doe"). | System updates the Customer Name field. | - |
| 3 | Laundry Staff | Enters Transaction Date (defaults to today). | System updates the Transaction Date field. | Staff can select a different date using the date picker. |
| 4 | Laundry Staff | Enters Receipt Number (e.g., "A001-20231027"). | System updates the Receipt Number field. | - |
| 5 | Laundry Staff | Enters quantities for Fixed Item Categories (e.g., Pakaian: 5, Celana Dalam: 2). | System updates the respective quantity fields and automatically recalculates the "Total Item" count. | Staff leaves quantity as 0 for items not present. |
| 6 | Laundry Staff | Clicks "Add Item" button in "Lain-lain" section. | System adds a new row with "Item Name" and "Quantity" input fields. | - |
| 7 | Laundry Staff | Enters "Kaos Tangan" in Item Name and "3" in Quantity for the new row. | System updates the fields and recalculates "Total Item" count. | Staff can click "Delete" icon next to the row to remove it. |
| 8 | Laundry Staff | (Optional) Repeats steps 6-7 for additional dynamic items. | System adds more rows and continuously updates "Total Item" count. | - |
| 9 | Laundry Staff | Clicks "Save Transaction" button. | System performs client-side validation. If valid, it attempts to save the transaction to Firestore. | **Error Path:** If validation fails (e.g., required field empty, quantity out of range), system displays error messages next to invalid fields. |
| 10 | System | Validates Receipt Number uniqueness for the outlet and date. | If unique, transaction data is written to Firestore. If PWA is offline, transaction is queued locally. | **Error Path:** If Receipt Number is not unique, system displays an error "Receipt number already exists for this date and outlet." |
| 11 | System | Upon successful save (or local queueing). | System displays a success toast notification (e.g., "Transaction A001-20231027 saved successfully"). The form is cleared, and "Total Item" resets to 0. | **Alternative Path (Offline):** If offline, system displays a "Transaction queued, syncing when online" notification. |

**Trigger:** Laundry Staff initiates a new transaction recording.
**Pre-conditions:** Staff is logged into the PWA. PWA is either online or has offline capabilities enabled.
**Post-conditions:** A new transaction record is created in Firestore (or queued locally), containing customer details, fixed item counts, and dynamic item details. The "Kasir" form is ready for a new entry.

## 2. Staff PWA: View, Edit, and Delete Laundry Transaction (Riwayat)

This flow describes how a laundry staff member can review, modify, or remove existing transaction records.

| No | Actor | Action/Step | System Response | Alternative/Alternative Path/Error Path |
|:---|:---|:---|:---|:---|
| 1 | Laundry Staff | Navigates to "Riwayat" page. | System displays a list of all transactions for the current outlet, ordered by date (newest first), showing Receipt Number, Customer Name, Date, and Total Items. A search bar is visible. | - |
| 2 | Laundry Staff | Enters search term (e.g., "John" or "A001") into the search bar. | System filters the displayed list in real-time, showing only transactions matching the search term in Customer Name or Receipt Number. | - |
| 3 | Laundry Staff | Clicks on a transaction row or the "Detail" icon for a specific transaction. | System opens a detail view (modal or new page) displaying all transaction information: Receipt Number, Customer Name, Date, Outlet, Total Items, and all itemized details (fixed and dynamic). | - |
| 4 | Laundry Staff | Clicks "Edit" button within the detail view. | System enables editing for item quantities (fixed and dynamic). "Save" and "Cancel" buttons appear. | - |
| 5 | Laundry Staff | Modifies item quantities (e.g., changes Pakaian from 5 to 6, or adds a new dynamic item). | System updates the quantity fields and recalculates the "Total Item" count in the detail view. | - |
| 6 | Laundry Staff | Clicks "Save" button in the detail view. | System performs validation. If valid, it updates the corresponding transaction in Firestore. | **Error Path:** If validation fails, system displays error messages. **Alternative Path:** Staff clicks "Cancel" to discard changes and return to read-only detail view. |
| 7 | System | Upon successful update. | System displays a success toast notification (e.g., "Transaction updated successfully") and reverts the detail view to read-only mode. | - |
| 8 | Laundry Staff | (From Riwayat list or Detail view) Clicks "Delete" icon for a transaction. | System displays a confirmation modal (e.g., "Are you sure you want to delete transaction [Receipt Number]? This action cannot be undone."). | - |
| 9 | Laundry Staff | Clicks "Confirm Delete" in the modal. | System removes the transaction from Firestore. | **Alternative Path:** Staff clicks "Cancel" in the modal, and the transaction remains. |
| 10 | System | Upon successful deletion. | System displays a success toast notification (e.g., "Transaction deleted successfully") and removes the transaction from the "Riwayat" list. | - |

**Trigger:** Laundry Staff needs to review, correct, or remove a transaction.
**Pre-conditions:** Staff is logged into the PWA. Transactions exist in Firestore.
**Post-conditions:** Transaction details are viewed, updated in Firestore, or permanently removed from Firestore. The "Riwayat" list reflects the changes.

## 3. Customer Portal: Search and View Laundry Transaction

This flow describes how a customer can access the read-only portal to verify their laundry transaction details.

| No | Actor | Action/Step | System Response | Alternative/Alternative Path/Error Path |
|:---|:---|:---|:---|:---|
| 1 | Customer | Opens the Customer Portal URL in a web browser. | System displays the portal's landing page with input fields for "Receipt Number" and "Customer Name," and a "Search" button. | - |
| 2 | Customer | Enters their Receipt Number (e.g., "A001-20231027") and Customer Name (e.g., "John Doe"). | System updates the respective input fields. | - |
| 3 | Customer | Clicks "Search" button. | System performs client-side validation for non-empty fields. If valid, it queries Firestore for a transaction matching both the Receipt Number and Customer Name. | **Error Path:** If input fields are empty, system displays "Please enter both receipt number and customer name." |
| 4 | System | Queries Firestore for the transaction. | If a matching transaction is found, system displays a read-only detail view of the transaction, identical to the staff PWA's detail view (Receipt Number, Customer Name, Date, Outlet, Total Items, and all itemized details). | **Error Path:** If no matching transaction is found, system displays "Transaction not found. Please check your receipt number and customer name." |
| 5 | Customer | Reviews the displayed transaction details. | - | - |
| 6 | Customer | Clicks "Back to Search" (if provided) or navigates away. | System returns to the search form, clearing previous inputs. | - |

**Trigger:** Customer wants to verify their laundry item list.
**Pre-conditions:** Customer has their Receipt Number and remembers the Customer Name used during intake. The transaction exists in Firestore.
**Post-conditions:** Customer successfully views their transaction details or receives a "not found" message. No data is modified.

## 4. Desktop App: Search and Print Laundry Transaction

This flow describes how a staff member uses the desktop application to search for a transaction and print a physical receipt using QZ Tray.

| No | Actor | Action/Step | System Response | Alternative/Alternative Path/Error Path |
|:---|:---|:---|:---|:---|
| 1 | Laundry Staff | Opens the Desktop App URL in a web browser. | System displays a search interface, similar to the PWA's "Riwayat" page, with a search bar and a list of transactions (or an empty state). | - |
| 2 | Laundry Staff | Enters a search term (e.g., "John" or "A001") into the search bar. | System filters the displayed list of transactions in real-time based on Customer Name or Receipt Number. | - |
| 3 | Laundry Staff | Clicks on a transaction row from the search results. | System opens a detail view (modal or new page) displaying all transaction information, identical to the PWA's detail view. A "Print Receipt" button is visible. | - |
| 4 | Laundry Staff | Clicks "Print Receipt" button. | System checks for QZ Tray availability. If available, it generates an ESC/POS formatted print job from the transaction data. | **Error Path:** If QZ Tray is not detected or not running, system displays an error message "QZ Tray not running. Please install and start QZ Tray." |
| 5 | System | Sends the print job to QZ Tray. | QZ Tray receives the print job and sends it to the configured thermal printer. | **Error Path:** If QZ Tray encounters a printer error (e.g., printer offline, paper jam), system displays an error message "Printer error: [Error details from QZ Tray]." |
| 6 | System | Upon successful print job completion. | System displays a success toast notification (e.g., "Receipt printed successfully"). | - |
| 7 | Laundry Staff | (Optional) Clicks "Back to Search" or closes the detail view. | System returns to the search interface. | - |

**Trigger:** Laundry Staff needs to print a physical receipt for a customer or for record-keeping.
**Pre-conditions:** Staff is logged into the Desktop App. QZ Tray is installed and running on the desktop machine. A thermal printer is connected and configured with QZ Tray.
**Post-conditions:** A physical receipt is printed, or an error message is displayed if printing fails.