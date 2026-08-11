"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Customer,
  Package,
  Payment,
  Complaint,
  DailyChore,
  Staff,
  CustomerStatus,
  ComplaintStatus,
  DailyChoreStatus,
  PaymentStatus,
} from "@/types/wisp";

import initialData from "@/data/initialData.json";

// Seed Data from Excel (511 Real Subscribers, 1403 Real Receipts)
const initialPackages: Package[] = [
  { id: "PKG-10M", name: "10M Fiber Plan", speedMbps: 10, monthlyPrice: 1500, description: "Basic browsing & SD streaming", subscriberCount: 85 },
  { id: "PKG-20M", name: "20M Fiber Plan", speedMbps: 20, monthlyPrice: 2500, description: "HD streaming & home WiFi", subscriberCount: 380 },
  { id: "PKG-50M", name: "50M Fiber Plan", speedMbps: 50, monthlyPrice: 4000, description: "Ultra-low latency gaming & 4K", subscriberCount: 46 },
  { id: "PKG-100M", name: "100M Fiber Plan", speedMbps: 100, monthlyPrice: 7500, description: "Dedicated enterprise bandwidth", subscriberCount: 12 },
];

const initialCustomers: Customer[] = initialData.customers as Customer[];
const initialPayments: Payment[] = initialData.payments as Payment[];

const initialComplaints: Complaint[] = [
  {
    id: "TKT-501",
    customerId: "EF-1002",
    customerName: "Muhammad Usman",
    phone: "0312-9876543",
    address: "Flat 4A, Al-Rehman Plaza",
    category: "No Internet",
    description: "Red optical light blinking on fiber ONU modem after thunderstorm.",
    priority: "High",
    status: "Open",
    assignedStaff: "Raza Technician",
    createdAt: "2026-08-08 09:30 AM",
    updatedAt: "2026-08-08 09:30 AM",
  },
  {
    id: "TKT-502",
    customerId: "EF-1005",
    customerName: "Bilal Ahmed",
    phone: "0333-8889900",
    address: "Shop 12, Commercial Market",
    category: "Slow Speed",
    description: "Ping fluctuating during peak hours from 6 PM to 10 PM.",
    priority: "Medium",
    status: "In Progress",
    assignedStaff: "Ali Technician",
    createdAt: "2026-08-07 04:15 PM",
    updatedAt: "2026-08-08 10:00 AM",
    resolutionNotes: "Checking bandwidth allocation on distribution switch Port 8.",
  },
  {
    id: "TKT-503",
    customerId: "EF-1003",
    customerName: "Tariq Mahmood",
    phone: "0345-5551234",
    address: "Street 9, House 88, Model Town",
    category: "Fiber Wire Cut",
    description: "Fiber drop cable snapped by road construction tractor.",
    priority: "Critical",
    status: "Resolved",
    assignedStaff: "Kamran Field Tech",
    createdAt: "2026-08-06 11:00 AM",
    updatedAt: "2026-08-06 03:30 PM",
    resolutionNotes: "Spliced 4-core fiber wire with new joint box. Connection restored.",
  },
];

const initialDailyChores: DailyChore[] = [
  {
    id: "CHR-101",
    date: "2026-08-08",
    title: "Collect monthly fees from Block B overdues",
    type: "Collection",
    amount: 12500,
    assignedStaff: "Ali Technician",
    status: "In Progress",
    priority: "High",
    notes: "Targeting 5 overdue accounts in Sector B",
    createdAt: "08:00 AM",
  },
  {
    id: "CHR-102",
    date: "2026-08-08",
    title: "Purchased 2 Roll Fiber Optical Drop Wire (1000m)",
    type: "Expense",
    amount: 18500,
    assignedStaff: "Reception / Office Admin",
    status: "Completed",
    priority: "High",
    notes: "Invoice #FB-402 from Wholesale Cable Trader",
    createdAt: "10:15 AM",
  },
  {
    id: "CHR-103",
    date: "2026-08-08",
    title: "DC (Disconnect) 3 non-paying users in Model Town",
    type: "Maintenance Task",
    assignedStaff: "Kamran Field Tech",
    status: "Completed",
    priority: "High",
    notes: "Removed patch cord from NAP splitter #14",
    createdAt: "11:30 AM",
  },
  {
    id: "CHR-104",
    date: "2026-08-08",
    title: "Fuel Allowance for Field Bikes (2 Techs)",
    type: "Expense",
    amount: 1500,
    assignedStaff: "Raza Technician",
    status: "Completed",
    priority: "Medium",
    notes: "Field maintenance patrol fuel receipt",
    createdAt: "01:00 PM",
  },
  {
    id: "CHR-105",
    date: "2026-08-08",
    title: "Deposit Cash Collection in Meezan Bank",
    type: "Admin Task",
    amount: 45000,
    assignedStaff: "Reception / Office Admin",
    status: "Pending",
    priority: "High",
    notes: "Bank branch closing at 5:00 PM",
    createdAt: "02:00 PM",
  },
];

const initialStaff: Staff[] = [
  { id: "STF-01", name: "Supervisor Admin", role: "Admin", phone: "0300-1110000", status: "Active", activeTicketsCount: 0, todayCollections: 0 },
  { id: "STF-02", name: "Reception Office", role: "Receptionist", phone: "0300-2220000", status: "Active", activeTicketsCount: 0, todayCollections: 12500 },
  { id: "STF-03", name: "Ali Technician", role: "Field Technician", phone: "0300-3330000", status: "Active", activeTicketsCount: 1, todayCollections: 2500 },
  { id: "STF-04", name: "Raza Technician", role: "Field Technician", phone: "0300-4440000", status: "Active", activeTicketsCount: 1, todayCollections: 0 },
  { id: "STF-05", name: "Kamran Field Tech", role: "Field Technician", phone: "0300-5550000", status: "Active", activeTicketsCount: 0, todayCollections: 0 },
];

interface WispContextType {
  customers: Customer[];
  packages: Package[];
  payments: Payment[];
  complaints: Complaint[];
  dailyChores: DailyChore[];
  staff: Staff[];
  selectedReceipt: Payment | null;
  setSelectedReceipt: (payment: Payment | null) => void;
  // Customer Actions
  addCustomer: (customer: Omit<Customer, "id" | "dueAmount">) => void;
  updateCustomerStatus: (id: string, status: CustomerStatus) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  // Payment Actions
  recordPayment: (data: {
    customerId: string;
    amountPaid: number;
    paymentMonth: string;
    paymentMethod: Payment["paymentMethod"];
    receivedBy: string;
  }) => Payment;
  // Complaint Actions
  addComplaint: (data: Omit<Complaint, "id" | "createdAt" | "updatedAt">) => void;
  updateComplaintStatus: (id: string, status: ComplaintStatus, notes?: string, assignedStaff?: string) => void;
  // Daily Chore Actions
  addDailyChore: (data: Omit<DailyChore, "id" | "createdAt">) => void;
  updateDailyChoreStatus: (id: string, status: DailyChoreStatus) => void;
  deleteDailyChore: (id: string) => void;
  // Package Actions
  addPackage: (pkg: Omit<Package, "id" | "subscriberCount">) => void;
}

const WispContext = createContext<WispContextType | undefined>(undefined);

export const WispProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ef_wisp_customers");
      if (saved) try { return JSON.parse(saved); } catch (e) {}
    }
    return initialCustomers;
  });

  const [packages, setPackages] = useState<Package[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ef_wisp_packages");
      if (saved) try { return JSON.parse(saved); } catch (e) {}
    }
    return initialPackages;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ef_wisp_payments");
      if (saved) try { return JSON.parse(saved); } catch (e) {}
    }
    return initialPayments;
  });

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ef_wisp_complaints");
      if (saved) try { return JSON.parse(saved); } catch (e) {}
    }
    return initialComplaints;
  });

  const [dailyChores, setDailyChores] = useState<DailyChore[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ef_wisp_daily_chores");
      if (saved) try { return JSON.parse(saved); } catch (e) {}
    }
    return initialDailyChores;
  });

  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  // Fetch from MongoDB Atlas on mount if available
  useEffect(() => {
    async function loadCustomersFromDb() {
      try {
        const res = await fetch("/api/customers");
        if (res.ok) {
          const json = await res.json();
          if (json.customers && Array.isArray(json.customers) && json.customers.length > 0) {
            setCustomers(json.customers);
          }
        }
      } catch (err) {
        console.error("Failed to load customers from API:", err);
      }
    }
    loadCustomersFromDb();
  }, []);

  // Sync to local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ef_wisp_customers", JSON.stringify(customers));
    }
  }, [customers]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ef_wisp_payments", JSON.stringify(payments));
    }
  }, [payments]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ef_wisp_complaints", JSON.stringify(complaints));
    }
  }, [complaints]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ef_wisp_daily_chores", JSON.stringify(dailyChores));
    }
  }, [dailyChores]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ef_wisp_packages", JSON.stringify(packages));
    }
  }, [packages]);

  // Actions
  const addCustomer = async (data: Omit<Customer, "id" | "dueAmount">) => {
    const nextIdNum = customers.length + 1001;
    const newId = `EF-${nextIdNum}`;
    const newCustomer: Customer = {
      ...data,
      id: newId,
      dueAmount: data.monthlyFee,
    };

    setCustomers((prev) => [newCustomer, ...prev]);

    setPackages((prev) =>
      prev.map((p) => (p.id === data.packageId ? { ...p, subscriberCount: p.subscriberCount + 1 } : p))
    );

    // Send payload to /api/customers to store in MongoDB Atlas database
    try {
      await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newId,
          accountNo: newId,
          name: data.name,
          phone: data.phone || "",
          cnic: data.cnic || "",
          address: data.address || "",
          area: data.area || "",
          packageId: data.packageId,
          packageName: data.packageName,
          monthlyFee: data.monthlyFee,
          status: data.status || "Active",
          installationDate: data.installationDate || new Date().toISOString().split("T")[0],
          dueAmount: data.monthlyFee,
          notes: data.notes || "",
          createdAt: new Date().toISOString(),
        }),
      });
      console.log("✅ Customer successfully submitted and persisted to MongoDB Atlas API.");
    } catch (error) {
      console.error("❌ Failed to send customer to MongoDB API:", error);
    }
  };

  const updateCustomerStatus = async (id: string, status: CustomerStatus) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
    try {
      await fetch("/api/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
    } catch (err) {
      console.error("Failed to update status in MongoDB API:", err);
    }
  };

  const updateCustomer = async (updated: Customer) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
    try {
      await fetch("/api/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error("Failed to update customer in MongoDB API:", err);
    }
  };

  const deleteCustomer = async (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    try {
      await fetch(`/api/customers?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete customer from MongoDB API:", err);
    }
  };

  const recordPayment = (data: {
    customerId: string;
    amountPaid: number;
    paymentMonth: string;
    paymentMethod: Payment["paymentMethod"];
    receivedBy: string;
  }): Payment => {
    const customer = customers.find((c) => c.id === data.customerId);
    const customerName = customer ? customer.name : "Unknown Customer";
    const packageName = customer ? customer.packageName : "Fiber Plan";
    const monthlyDues = customer ? customer.monthlyFee : data.amountPaid;

    const remainingDues = Math.max(0, monthlyDues - data.amountPaid);
    const paymentStatus: PaymentStatus = remainingDues === 0 ? "Paid" : "Partial";

    const payCount = payments.length + 8005;
    const newPayment: Payment = {
      id: `PAY-${payCount}`,
      customerId: data.customerId,
      customerName,
      packageName,
      amountPaid: data.amountPaid,
      monthlyDues,
      remainingDues,
      paymentMonth: data.paymentMonth,
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod: data.paymentMethod,
      receivedBy: data.receivedBy,
      status: paymentStatus,
      receiptNumber: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    setPayments((prev) => [newPayment, ...prev]);

    if (customer) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === data.customerId) {
            const updatedDues = Math.max(0, c.dueAmount - data.amountPaid);
            const newStatus = updatedDues === 0 && c.status === "Overdue" ? "Active" : c.status;
            return {
              ...c,
              dueAmount: updatedDues,
              status: newStatus,
              lastPaymentDate: newPayment.paymentDate,
            };
          }
          return c;
        })
      );
    }

    const newChore: DailyChore = {
      id: `CHR-${Date.now().toString().slice(-4)}`,
      date: newPayment.paymentDate,
      title: `Payment collected from ${customerName} (${data.paymentMonth})`,
      type: "Collection",
      amount: data.amountPaid,
      assignedStaff: data.receivedBy,
      status: "Completed",
      priority: "Medium",
      notes: `Receipt #${newPayment.receiptNumber} via ${data.paymentMethod}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setDailyChores((prev) => [newChore, ...prev]);

    setSelectedReceipt(newPayment);
    return newPayment;
  };

  const addComplaint = (data: Omit<Complaint, "id" | "createdAt" | "updatedAt">) => {
    const nextId = complaints.length + 504;
    const nowStr = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
    const newTicket: Complaint = {
      ...data,
      id: `TKT-${nextId}`,
      createdAt: nowStr,
      updatedAt: nowStr,
    };
    setComplaints((prev) => [newTicket, ...prev]);
  };

  const updateComplaintStatus = (
    id: string,
    status: ComplaintStatus,
    notes?: string,
    assignedStaff?: string
  ) => {
    const nowStr = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
    setComplaints((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            status,
            updatedAt: nowStr,
            ...(notes ? { resolutionNotes: notes } : {}),
            ...(assignedStaff ? { assignedStaff } : {}),
          };
        }
        return t;
      })
    );
  };

  const addDailyChore = (data: Omit<DailyChore, "id" | "createdAt">) => {
    const id = `CHR-${Date.now().toString().slice(-4)}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newChore: DailyChore = {
      ...data,
      id,
      createdAt: timeStr,
    };
    setDailyChores((prev) => [newChore, ...prev]);
  };

  const updateDailyChoreStatus = (id: string, status: DailyChoreStatus) => {
    setDailyChores((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
  };

  const deleteDailyChore = (id: string) => {
    setDailyChores((prev) => prev.filter((c) => c.id !== id));
  };

  const addPackage = (pkg: Omit<Package, "id" | "subscriberCount">) => {
    const id = `PKG-${pkg.speedMbps}M`;
    const newPkg: Package = {
      ...pkg,
      id,
      subscriberCount: 0,
    };
    setPackages((prev) => [...prev, newPkg]);
  };

  return (
    <WispContext.Provider
      value={{
        customers,
        packages,
        payments,
        complaints,
        dailyChores,
        staff,
        selectedReceipt,
        setSelectedReceipt,
        addCustomer,
        updateCustomerStatus,
        updateCustomer,
        deleteCustomer,
        recordPayment,
        addComplaint,
        updateComplaintStatus,
        addDailyChore,
        updateDailyChoreStatus,
        deleteDailyChore,
        addPackage,
      }}
    >
      {children}
    </WispContext.Provider>
  );
};

export const useWisp = () => {
  const context = useContext(WispContext);
  if (!context) {
    throw new Error("useWisp must be used within a WispProvider");
  }
  return context;
};
