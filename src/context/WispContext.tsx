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
  { id: "PKG-10M", name: "10M Fiber Plan", speedMbps: 10, monthlyPrice: 1500, description: "Basic browsing & SD streaming", subscriberCount: 0 },
  { id: "PKG-20M", name: "20M Fiber Plan", speedMbps: 20, monthlyPrice: 2500, description: "HD streaming & home WiFi", subscriberCount: 0 },
  { id: "PKG-50M", name: "50M Fiber Plan", speedMbps: 50, monthlyPrice: 4000, description: "Ultra-low latency gaming & 4K", subscriberCount: 0 },
  { id: "PKG-100M", name: "100M Fiber Plan", speedMbps: 100, monthlyPrice: 7500, description: "Dedicated enterprise bandwidth", subscriberCount: 0 },
];

const initialCustomers: Customer[] = [];
const initialPayments: Payment[] = [];
const initialComplaints: Complaint[] = [];
const initialDailyChores: DailyChore[] = [];

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
  // Staff Actions
  addStaff: (data: Omit<Staff, "id" | "activeTicketsCount" | "todayCollections">) => void;
  updateStaff: (data: Staff) => void;
  deleteStaff: (id: string) => void;
  // Bulk Import
  importBulkCustomers: (items: Array<{
    name: string;
    phone?: string;
    cnic?: string;
    address?: string;
    area?: string;
    packageName?: string;
    monthlyFee?: number;
    status?: CustomerStatus;
    dueAmount?: number;
    paidAmount?: number;
    isPaid?: boolean;
  }>) => { added: number; updated: number; paid: number; unpaid: number };
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

  const [staff, setStaff] = useState<Staff[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ef_wisp_staff");
      if (saved) try { return JSON.parse(saved); } catch (e) {}
    }
    return initialStaff;
  });
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  // Fetch from MongoDB Atlas on mount if available
  useEffect(() => {
    async function loadCustomersFromDb() {
      try {
        const res = await fetch("/api/customers");
        if (res.ok) {
          const json = await res.json();
          if (json.customers && Array.isArray(json.customers)) {
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
      localStorage.setItem("ef_wisp_staff", JSON.stringify(staff));
    }
  }, [staff]);

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

  const addStaff = (data: Omit<Staff, "id" | "activeTicketsCount" | "todayCollections">) => {
    const nextNum = staff.length + 1;
    const newMember: Staff = {
      ...data,
      id: `STF-${String(nextNum).padStart(2, "0")}`,
      activeTicketsCount: 0,
      todayCollections: 0,
    };
    setStaff((prev) => [...prev, newMember]);
  };

  const updateStaff = (updated: Staff) => {
    setStaff((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const deleteStaff = (id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
  };

  const importBulkCustomers = (
    items: Array<{
      name: string;
      phone?: string;
      cnic?: string;
      address?: string;
      area?: string;
      packageName?: string;
      monthlyFee?: number;
      status?: CustomerStatus;
      dueAmount?: number;
      paidAmount?: number;
      isPaid?: boolean;
    }>
  ) => {
    let added = 0;
    let updated = 0;
    let paid = 0;
    let unpaid = 0;

    let updatedCustomersList = [...customers];
    let newPayments: Payment[] = [];

    const todayStr = new Date().toISOString().split("T")[0];
    const monthStr = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

    items.forEach((item) => {
      const cleanName = item.name ? item.name.trim() : "";
      if (!cleanName) return;

      const matchedIndex = updatedCustomersList.findIndex((c) => {
        if (c.name.toLowerCase() === cleanName.toLowerCase()) return true;
        if (item.phone && c.phone && c.phone.replace(/\D/g, "") === item.phone.replace(/\D/g, "") && item.phone.replace(/\D/g, "").length >= 7) return true;
        if (item.cnic && c.cnic && c.cnic.replace(/\D/g, "") === item.cnic.replace(/\D/g, "") && item.cnic.replace(/\D/g, "").length >= 7) return true;
        return false;
      });

      const matchedPkg = packages.find(
        (p) => item.packageName && p.name.toLowerCase().includes(item.packageName.toLowerCase())
      ) || packages[0];

      const monthlyPrice = item.monthlyFee && item.monthlyFee > 0 ? item.monthlyFee : matchedPkg.monthlyPrice;
      const isPaid = item.isPaid || (item.paidAmount !== undefined && item.paidAmount >= monthlyPrice) || item.status === "Active";
      const paidAmt = item.paidAmount !== undefined ? item.paidAmount : (isPaid ? monthlyPrice : 0);
      const remainingDue = item.dueAmount !== undefined ? item.dueAmount : Math.max(0, monthlyPrice - paidAmt);
      const finalStatus: CustomerStatus = item.status || (remainingDue === 0 ? "Active" : "Overdue");

      if (isPaid || paidAmt > 0) {
        paid++;
      } else {
        unpaid++;
      }

      if (matchedIndex !== -1) {
        // Update existing customer
        updated++;
        const existing = updatedCustomersList[matchedIndex];
        const newDue = Math.max(0, existing.dueAmount - paidAmt);
        updatedCustomersList[matchedIndex] = {
          ...existing,
          name: cleanName || existing.name,
          phone: item.phone || existing.phone,
          cnic: item.cnic || existing.cnic,
          address: item.address || existing.address,
          area: item.area || existing.area,
          packageName: matchedPkg.name,
          packageId: matchedPkg.id,
          monthlyFee: monthlyPrice,
          dueAmount: remainingDue !== undefined ? remainingDue : newDue,
          status: finalStatus,
          lastPaymentDate: paidAmt > 0 ? todayStr : existing.lastPaymentDate,
        };

        if (paidAmt > 0) {
          const payId = `PAY-${payments.length + newPayments.length + 8005}`;
          const recNum = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
          newPayments.push({
            id: payId,
            customerId: existing.id,
            customerName: cleanName,
            packageName: matchedPkg.name,
            amountPaid: paidAmt,
            monthlyDues: monthlyPrice,
            remainingDues: remainingDue,
            paymentMonth: monthStr,
            paymentDate: todayStr,
            paymentMethod: "Cash",
            receivedBy: "Excel Import Tool",
            status: remainingDue === 0 ? "Paid" : "Partial",
            receiptNumber: recNum,
          });
        }
      } else {
        // Add new customer
        added++;
        const nextIdNum = updatedCustomersList.length + 1001;
        const newId = `EF-${nextIdNum}`;
        const newCust: Customer = {
          id: newId,
          name: cleanName,
          phone: item.phone || "0300-0000000",
          cnic: item.cnic || "35202-0000000-0",
          address: item.address || "General Address",
          area: item.area || "Saeela",
          packageId: matchedPkg.id,
          packageName: matchedPkg.name,
          monthlyFee: monthlyPrice,
          status: finalStatus,
          installationDate: todayStr,
          dueAmount: remainingDue,
          lastPaymentDate: paidAmt > 0 ? todayStr : undefined,
          notes: "Imported via Excel Sync Tool",
        };
        updatedCustomersList.unshift(newCust);

        if (paidAmt > 0) {
          const payId = `PAY-${payments.length + newPayments.length + 8005}`;
          const recNum = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
          newPayments.push({
            id: payId,
            customerId: newId,
            customerName: cleanName,
            packageName: matchedPkg.name,
            amountPaid: paidAmt,
            monthlyDues: monthlyPrice,
            remainingDues: remainingDue,
            paymentMonth: monthStr,
            paymentDate: todayStr,
            paymentMethod: "Cash",
            receivedBy: "Excel Import Tool",
            status: remainingDue === 0 ? "Paid" : "Partial",
            receiptNumber: recNum,
          });
        }
      }
    });

    setCustomers(updatedCustomersList);
    if (newPayments.length > 0) {
      setPayments((prev) => [...newPayments, ...prev]);
    }

    return { added, updated, paid, unpaid };
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
        addStaff,
        updateStaff,
        deleteStaff,
        importBulkCustomers,
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
