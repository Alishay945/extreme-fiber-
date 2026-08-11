export type Status = "Active" | "Overdue" | "Suspended";
export type ComplaintStatus = "Open" | "In Progress" | "Resolved";
export type Priority = "Low" | "Medium" | "High" | "Critical";

export interface PackageItem {
  id: string;
  package_name: string;
  speed_mbps: number;
  monthly_price: number;
  created_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  phone_number: string;
  cnic_number?: string | null;
  address: string;
  package_id?: string | null;
  status: Status;
  installation_date: string;
  created_at: string;
}

export interface Payment {
  id: string;
  customer_id: string;
  amount_paid: number;
  payment_date: string;
  payment_month: string;
  payment_method: "Cash" | "EasyPaisa" | "JazzCash" | "Bank";
  received_by: string;
  created_at: string;
}

export interface Complaint {
  id: string;
  customer_id: string;
  issue_description: string;
  priority: Priority;
  status: ComplaintStatus;
  assigned_technician?: string | null;
  resolution_notes?: string | null;
  created_at: string;
  updated_at: string;
}
