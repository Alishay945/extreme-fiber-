export type CustomerStatus = 'Active' | 'DC' | 'Suspended' | 'Pending' | 'Overdue';

export interface Customer {
  id: string; // e.g. "EF-1001"
  name: string;
  phone: string;
  cnic: string;
  address: string;
  area: string;
  packageId: string;
  packageName: string;
  monthlyFee: number;
  status: CustomerStatus;
  installationDate: string;
  dueAmount: number;
  lastPaymentDate?: string;
  notes?: string;
}

export interface Package {
  id: string;
  name: string;
  speedMbps: number;
  monthlyPrice: number;
  description: string;
  subscriberCount: number;
}

export type PaymentMethod = 'Cash' | 'EasyPaisa' | 'JazzCash' | 'Bank Transfer';
export type PaymentStatus = 'Paid' | 'Partial' | 'Overdue';

export interface Payment {
  id: string; // e.g. "PAY-8001"
  customerId: string; // e.g. "EF-1001"
  customerName: string;
  packageName: string;
  amountPaid: number;
  monthlyDues: number;
  remainingDues: number;
  paymentMonth: string; // e.g. "August 2026"
  paymentDate: string; // "2026-08-08"
  paymentMethod: PaymentMethod;
  receivedBy: string; // Staff member name
  status: PaymentStatus;
  receiptNumber: string;
}

export type ComplaintStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type ComplaintCategory = 'No Internet' | 'Slow Speed' | 'Fiber Wire Cut' | 'Router Fault' | 'Billing Discrepancy' | 'Relocation';

export interface Complaint {
  id: string; // e.g. "TKT-501"
  customerId: string;
  customerName: string;
  phone: string;
  address: string;
  category: ComplaintCategory;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assignedStaff: string;
  createdAt: string;
  updatedAt: string;
  resolutionNotes?: string;
}

export type DailyChoreType = 'Collection' | 'Expense' | 'Maintenance Task' | 'Admin Task';
export type DailyChoreStatus = 'Pending' | 'In Progress' | 'Completed';

export interface DailyChore {
  id: string; // e.g. "CHR-101"
  date: string; // "2026-08-08"
  title: string;
  type: DailyChoreType;
  amount?: number; // Money amount for expense or collection
  assignedStaff: string;
  status: DailyChoreStatus;
  priority: 'Low' | 'Medium' | 'High';
  notes?: string;
  createdAt: string;
}

export interface Staff {
  id: string;
  name: string;
  role: 'Admin' | 'Receptionist' | 'Field Technician' | 'Collector';
  phone: string;
  status: 'Active' | 'On Leave';
  activeTicketsCount: number;
  todayCollections: number;
  assignedArea?: string;
  notes?: string;
}

