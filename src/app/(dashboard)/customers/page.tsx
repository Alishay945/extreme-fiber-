"use client";

import React, { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { useWisp } from "@/context/WispContext";
import {
  Users,
  Search,
  Plus,
  CreditCard,
  Phone,
  MapPin,
  Calendar,
  Zap,
  Power,
  Edit,
  Trash2,
  Eye,
  X,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Map,
  ShieldCheck,
  Table as TableIcon,
  Grid,
  Filter,
  DollarSign,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { Customer, CustomerStatus } from "@/types/wisp";
import * as XLSX from "xlsx";
import QuickPhoneWhatsAppModal from "@/components/QuickPhoneWhatsAppModal";

export default function CustomersPage() {
  const {
    customers,
    packages,
    payments,
    addCustomer,
    updateCustomerStatus,
    updateCustomer,
    deleteCustomer,
    recordPayment,
  } = useWisp();

  // Primary Location Filter: "Saeela" | "Nougran" | "Arsal Town" | "ALL"
  const [activeArea, setActiveArea] = useState<string>("Saeela");

  // Secondary Status Filter: "ALL" | "Paid" | "Unpaid" | "Active" | "DC"
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Dedicated Per-Location Search Query
  const [locationSearchQuery, setLocationSearchQuery] = useState("");

  // View Mode: "table" | "excel"
  const [viewMode, setViewMode] = useState<"table" | "excel">("table");

  // Drawer & Modals state
  const [selectedUser, setSelectedUser] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [waCustomer, setWaCustomer] = useState<Customer | null>(null);

  // File import state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Form state
  const [formCust, setFormCust] = useState<Partial<Customer>>({
    name: "",
    phone: "",
    cnic: "",
    address: "",
    area: "Saeela",
    packageId: packages[0]?.id || "PKG-20M",
    packageName: packages[0]?.name || "20M Fiber Plan",
    monthlyFee: packages[0]?.monthlyPrice || 2500,
    status: "Active",
    installationDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [payAmount, setPayAmount] = useState<number>(2500);
  const [payMonth, setPayMonth] = useState<string>("August 2026");

  // --- LOCATION STATS & COUNTS ---
  const saeelaCustomers = customers.filter((c) => c.area === "Saeela");
  const nougranCustomers = customers.filter((c) => c.area === "Nougran");
  const arsalCustomers = customers.filter((c) => c.area === "Arsal Town");

  // Get current active location pool
  const currentAreaCustomers =
    activeArea === "Saeela"
      ? saeelaCustomers
      : activeArea === "Nougran"
      ? nougranCustomers
      : activeArea === "Arsal Town"
      ? arsalCustomers
      : customers;

  // Key Metrics for Active Location
  const locTotal = currentAreaCustomers.length;
  const locPaidCount = currentAreaCustomers.filter((c) => c.dueAmount === 0).length;
  const locUnpaidCount = currentAreaCustomers.filter((c) => c.dueAmount > 0).length;
  const locActiveCount = currentAreaCustomers.filter((c) => c.status === "Active").length;
  const locDcCount = currentAreaCustomers.filter((c) => c.status === "DC").length;

  const locTotalMonthlyRevenue = currentAreaCustomers.reduce((acc, c) => acc + c.monthlyFee, 0);
  const locTotalDuesOutstanding = currentAreaCustomers.reduce((acc, c) => acc + c.dueAmount, 0);
  const locTotalMoneyCollected = locTotalMonthlyRevenue - locTotalDuesOutstanding;

  // Unpaid Customers by 10th Date Deadline
  const unpaidCustomers10th = currentAreaCustomers.filter((c) => c.dueAmount > 0);

  // Helper to generate WhatsApp Reminder URL for 10th Due Date
  const getWhatsAppReminderUrl = (customer: Customer, monthName = "August 2026") => {
    const cleanPhone = customer.phone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("03") ? `92${cleanPhone.slice(1)}` : cleanPhone;
    const paidAmount = customer.monthlyFee - customer.dueAmount;

    const message =
      `*EXTREME FIBER PAYMENT REMINDER* 📶\n\n` +
      `Salam *${customer.name}*!\n` +
      `Aapka Extreme Fiber internet bill *${monthName}* pending hai:\n\n` +
      `• User ID: *${customer.id}*\n` +
      `• Sector Area: ${customer.area}\n` +
      `• Total Package Bill: PKR ${customer.monthlyFee}\n` +
      `• Wasool / Paid: PKR ${paidAmount > 0 ? paidAmount : 0}\n` +
      `• *Baqaya / Pending Dues: PKR ${customer.dueAmount}*\n\n` +
      `Meharbani farma kar *10 tarikh* tak apna bill ada kar dein taake aapki connection line disconnect (DC) na ho.\n\n` +
      `Shukriya!\nExtreme Fiber Office Helpdesk`;

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  };

  // Filter Customers by Search Query & Status Filter
  const filteredCustomers = currentAreaCustomers.filter((c) => {
    const q = locationSearchQuery.trim().toLowerCase();
    const matchesSearch =
      q === "" ||
      c.name.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.cnic.includes(q) ||
      c.address.toLowerCase().includes(q) ||
      c.packageName.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : statusFilter === "Paid"
        ? c.dueAmount === 0
        : statusFilter === "Unpaid"
        ? c.dueAmount > 0
        : statusFilter === "Active"
        ? c.status === "Active"
        : statusFilter === "DC"
        ? c.status === "DC"
        : true;

    return matchesSearch && matchesStatus;
  });

  // --- HANDLERS ---
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCust.name || !formCust.phone) return;
    const pkg = packages.find((p) => p.id === formCust.packageId);

    addCustomer({
      name: formCust.name!,
      phone: formCust.phone!,
      cnic: formCust.cnic || "35202-0000000-0",
      address: formCust.address || "Sector House",
      area: formCust.area || (activeArea === "ALL" ? "Saeela" : activeArea),
      packageId: formCust.packageId || "PKG-20M",
      packageName: pkg ? pkg.name : "20M Fiber Plan",
      monthlyFee: pkg ? pkg.monthlyPrice : 2500,
      status: (formCust.status as CustomerStatus) || "Active",
      installationDate: formCust.installationDate || new Date().toISOString().split("T")[0],
      notes: formCust.notes || "",
    });

    setShowAddModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCust.id || !formCust.name) return;
    updateCustomer(formCust as Customer);
    setShowEditModal(false);
    if (selectedUser?.id === formCust.id) {
      setSelectedUser(formCust as Customer);
    }
  };

  const handleRecordPaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    recordPayment({
      customerId: selectedUser.id,
      amountPaid: payAmount,
      paymentMonth: payMonth,
      paymentMethod: "Cash",
      receivedBy: "Reception Office",
    });
    setShowPayModal(false);
  };

  // Export location subscribers to real Excel file (.xlsx)
  const exportToExcel = () => {
    const dataToExport = filteredCustomers.map((c, index) => ({
      "Sr #": index + 1,
      "User ID": c.id,
      "Subscriber Name": c.name,
      "Phone Number": c.phone,
      "CNIC": c.cnic,
      "Sector Area": c.area,
      "Address": c.address,
      "Package Name": c.packageName,
      "Total Fee (PKR)": c.monthlyFee,
      "Money Received (PKR)": c.monthlyFee - c.dueAmount > 0 ? c.monthlyFee - c.dueAmount : 0,
      "Remaining Dues (PKR)": c.dueAmount,
      "Line Status": c.status,
      "Billing Status": c.dueAmount === 0 ? "PAID" : "UNPAID",
      "Last Payment Date": c.lastPaymentDate || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${activeArea} Users`);

    const fileName = `Extreme_Fiber_${activeArea}_${statusFilter}_Users_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Import Excel / CSV file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        let addedCount = 0;
        data.forEach((row) => {
          const name = row["Subscriber Name"] || row["Name"] || row["name"];
          const phone = row["Phone Number"] || row["Phone"] || row["phone"] || "0300-0000000";
          const area = row["Sector Area"] || row["Area"] || row["area"] || activeArea;
          const monthlyFee = Number(row["Monthly Fee (PKR)"] || row["Monthly Fee"] || row["monthlyFee"]) || 2500;
          const status = row["Line Status"] || row["Status"] || row["status"] || "Active";

          if (name) {
            addCustomer({
              name,
              phone: String(phone),
              cnic: row["CNIC"] || row["cnic"] || "35202-0000000-0",
              address: row["Address"] || row["address"] || "Sector House",
              area: area === "ALL" ? "Saeela" : area,
              packageId: "PKG-20M",
              packageName: row["Package Name"] || "20M Fiber Plan",
              monthlyFee,
              status: status === "DC" ? "DC" : "Active",
              installationDate: new Date().toISOString().split("T")[0],
              notes: "Imported via Excel Sheet",
            });
            addedCount++;
          }
        });

        setImportStatus(`Successfully imported ${addedCount} subscribers from ${file.name}`);
        setTimeout(() => setShowImportModal(false), 2000);
      } catch (err) {
        setImportStatus("Error parsing Excel file. Please ensure valid .xlsx or .csv format.");
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <main className="flex-1 pb-16 bg-slate-50 min-h-screen text-slate-900">
      <Navbar
        searchQuery={locationSearchQuery}
        onSearchChange={setLocationSearchQuery}
        onOpenNewCustomerModal={() => {
          setFormCust({
            name: "",
            phone: "",
            cnic: "",
            address: "",
            area: activeArea === "ALL" ? "Saeela" : activeArea,
            packageId: packages[0]?.id || "PKG-20M",
            packageName: packages[0]?.name || "20M Fiber Plan",
            monthlyFee: packages[0]?.monthlyPrice || 2500,
            status: "Active",
            installationDate: new Date().toISOString().split("T")[0],
            notes: "",
          });
          setShowAddModal(true);
        }}
      />

      <div className="mx-auto max-w-7xl px-6 pt-6 space-y-6">
        {/* Header Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sky-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-sky-700 font-extrabold">
              <ShieldCheck className="h-4 w-4 text-sky-600" /> Extreme Fiber Sector Management
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              Subscribers Directory & Billing Ledger
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Separated view for <span className="font-bold text-sky-700">Saeela</span>, <span className="font-bold text-sky-700">Nougran</span>, and <span className="font-bold text-sky-700">Arsal Town</span> with WhatsApp Reminders (10th Deadline).
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowWhatsAppModal(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700"
            >
              <MessageCircle className="h-4 w-4" /> 10th Date WhatsApp Reminders ({locUnpaidCount})
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 rounded-xl border border-sky-300 bg-white px-3.5 py-2 text-xs font-bold text-sky-800 shadow-sm transition hover:bg-sky-50"
            >
              <Upload className="h-4 w-4 text-sky-600" /> Import Excel
            </button>

            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 shadow-sm transition hover:bg-emerald-100"
            >
              <Download className="h-4 w-4 text-emerald-600" /> Export Excel
            </button>

            <button
              onClick={() => {
                setFormCust({
                  name: "",
                  phone: "",
                  cnic: "",
                  address: "",
                  area: activeArea === "ALL" ? "Saeela" : activeArea,
                  packageId: packages[0]?.id || "PKG-20M",
                  packageName: packages[0]?.name || "20M Fiber Plan",
                  monthlyFee: packages[0]?.monthlyPrice || 2500,
                  status: "Active",
                  installationDate: new Date().toISOString().split("T")[0],
                  notes: "",
                });
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-sky-600/20 transition hover:bg-sky-700"
            >
              <Plus className="h-4 w-4" /> Add Subscriber
            </button>
          </div>
        </div>

        {/* 1. LOCATION SECTOR TABS (SEPARATE SAEELA, NOUGRAN, ARSAL TOWN) */}
        <div className="grid gap-3 sm:grid-cols-4">
          {/* Saeela Sector Tab */}
          <button
            onClick={() => {
              setActiveArea("Saeela");
              setStatusFilter("ALL");
            }}
            className={`rounded-2xl border p-4 text-left transition-all ${
              activeArea === "Saeela"
                ? "border-sky-500 bg-sky-600 text-white ring-2 ring-sky-500/30 shadow-lg"
                : "border-sky-200 bg-white text-slate-800 hover:bg-sky-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-extrabold uppercase tracking-wider ${activeArea === "Saeela" ? "text-sky-100" : "text-sky-700"}`}>
                Saeela Sector
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${activeArea === "Saeela" ? "bg-white/20 text-white" : "bg-sky-100 text-sky-800 border border-sky-200"}`}>
                Area 1
              </span>
            </div>
            <div className="mt-2 text-3xl font-black">{saeelaCustomers.length}</div>
            <div className="mt-1 flex items-center justify-between text-[11px] font-semibold">
              <span className={activeArea === "Saeela" ? "text-emerald-200" : "text-emerald-600 font-bold"}>
                Paid: {saeelaCustomers.filter((c) => c.dueAmount === 0).length}
              </span>
              <span className={activeArea === "Saeela" ? "text-amber-200" : "text-amber-600 font-bold"}>
                Unpaid: {saeelaCustomers.filter((c) => c.dueAmount > 0).length}
              </span>
            </div>
          </button>

          {/* Nougran Sector Tab */}
          <button
            onClick={() => {
              setActiveArea("Nougran");
              setStatusFilter("ALL");
            }}
            className={`rounded-2xl border p-4 text-left transition-all ${
              activeArea === "Nougran"
                ? "border-sky-500 bg-sky-600 text-white ring-2 ring-sky-500/30 shadow-lg"
                : "border-sky-200 bg-white text-slate-800 hover:bg-sky-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-extrabold uppercase tracking-wider ${activeArea === "Nougran" ? "text-sky-100" : "text-sky-700"}`}>
                Nougran Sector
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${activeArea === "Nougran" ? "bg-white/20 text-white" : "bg-sky-100 text-sky-800 border border-sky-200"}`}>
                Area 2
              </span>
            </div>
            <div className="mt-2 text-3xl font-black">{nougranCustomers.length}</div>
            <div className="mt-1 flex items-center justify-between text-[11px] font-semibold">
              <span className={activeArea === "Nougran" ? "text-emerald-200" : "text-emerald-600 font-bold"}>
                Paid: {nougranCustomers.filter((c) => c.dueAmount === 0).length}
              </span>
              <span className={activeArea === "Nougran" ? "text-amber-200" : "text-amber-600 font-bold"}>
                Unpaid: {nougranCustomers.filter((c) => c.dueAmount > 0).length}
              </span>
            </div>
          </button>

          {/* Arsal Town Sector Tab */}
          <button
            onClick={() => {
              setActiveArea("Arsal Town");
              setStatusFilter("ALL");
            }}
            className={`rounded-2xl border p-4 text-left transition-all ${
              activeArea === "Arsal Town"
                ? "border-sky-500 bg-sky-600 text-white ring-2 ring-sky-500/30 shadow-lg"
                : "border-sky-200 bg-white text-slate-800 hover:bg-sky-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-extrabold uppercase tracking-wider ${activeArea === "Arsal Town" ? "text-sky-100" : "text-sky-700"}`}>
                Arsal Town
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${activeArea === "Arsal Town" ? "bg-white/20 text-white" : "bg-sky-100 text-sky-800 border border-sky-200"}`}>
                Area 3
              </span>
            </div>
            <div className="mt-2 text-3xl font-black">{arsalCustomers.length}</div>
            <div className="mt-1 flex items-center justify-between text-[11px] font-semibold">
              <span className={activeArea === "Arsal Town" ? "text-emerald-200" : "text-emerald-600 font-bold"}>
                Paid: {arsalCustomers.filter((c) => c.dueAmount === 0).length}
              </span>
              <span className={activeArea === "Arsal Town" ? "text-amber-200" : "text-amber-600 font-bold"}>
                Unpaid: {arsalCustomers.filter((c) => c.dueAmount > 0).length}
              </span>
            </div>
          </button>

          {/* All Sectors Tab */}
          <button
            onClick={() => {
              setActiveArea("ALL");
              setStatusFilter("ALL");
            }}
            className={`rounded-2xl border p-4 text-left transition-all ${
              activeArea === "ALL"
                ? "border-sky-500 bg-sky-600 text-white ring-2 ring-sky-500/30 shadow-lg"
                : "border-sky-200 bg-white text-slate-800 hover:bg-sky-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-extrabold uppercase tracking-wider ${activeArea === "ALL" ? "text-sky-100" : "text-sky-700"}`}>
                All Sectors
              </span>
              <Map className="h-4 w-4" />
            </div>
            <div className="mt-2 text-3xl font-black">{customers.length}</div>
            <div className="mt-1 flex items-center justify-between text-[11px] font-semibold">
              <span className={activeArea === "ALL" ? "text-emerald-200" : "text-emerald-600 font-bold"}>
                Paid: {customers.filter((c) => c.dueAmount === 0).length}
              </span>
              <span className={activeArea === "ALL" ? "text-amber-200" : "text-amber-600 font-bold"}>
                Unpaid: {customers.filter((c) => c.dueAmount > 0).length}
              </span>
            </div>
          </button>
        </div>

        {/* 2. FINANCIAL STATS SUMMARY (TOTAL MONEY AYA vs KITNA RAHTA HAI) */}
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-sky-200 bg-white p-3.5 shadow-sm">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Monthly Target
            </div>
            <div className="mt-1 text-2xl font-black text-slate-900 font-mono">
              PKR {locTotalMonthlyRevenue.toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] font-semibold text-slate-600">
              Total tariff for {locTotal} subscribers
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 shadow-sm">
            <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
              <span>Money Received (Aya Howa)</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-1 text-2xl font-black text-emerald-700 font-mono">
              PKR {locTotalMoneyCollected.toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] font-bold text-emerald-800">
              {locPaidCount} Paid Subscribers Clear
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 shadow-sm">
            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center justify-between">
              <span>Remaining Dues (Kitna Rahta Hai)</span>
              <AlertCircle className="h-4 w-4 text-amber-600" />
            </div>
            <div className="mt-1 text-2xl font-black text-amber-700 font-mono">
              PKR {locTotalDuesOutstanding.toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] font-extrabold text-amber-900">
              {locUnpaidCount} Unpaid Users by 10th Date
            </div>
          </div>

          <div className="rounded-xl border border-sky-200 bg-white p-3.5 shadow-sm">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Line Connections
            </div>
            <div className="mt-1 flex items-center gap-3">
              <div className="text-xl font-extrabold text-emerald-700">
                {locActiveCount} <span className="text-[11px] font-semibold text-emerald-800">Active</span>
              </div>
              <div className="text-xl font-extrabold text-rose-600">
                {locDcCount} <span className="text-[11px] font-semibold text-rose-800">DC</span>
              </div>
            </div>
            <div className="mt-1 text-[11px] font-semibold text-slate-600">
              Disconnection rate: {locTotal > 0 ? ((locDcCount / locTotal) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>

        {/* 3. DEDICATED LOCATION SEARCH BAR & FILTERS TOOLBAR */}
        <div className="rounded-2xl border border-sky-200 bg-white p-4 shadow-md space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* DEDICATED SEARCH BAR FOR THE ACTIVE LOCATION */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-600" />
              <input
                type="text"
                value={locationSearchQuery}
                onChange={(e) => setLocationSearchQuery(e.target.value)}
                placeholder={`Search ${activeArea} users by Name, User ID (EF-SAE-xxx), Phone, CNIC, Address...`}
                className="w-full rounded-xl border border-sky-300 bg-sky-50/50 pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-500 font-medium outline-none transition focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-500/20"
              />
              {locationSearchQuery && (
                <button
                  onClick={() => setLocationSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* View Mode Switcher (Table vs Excel Grid) */}
            <div className="flex items-center gap-1.5 bg-sky-100/70 p-1 rounded-xl border border-sky-200">
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  viewMode === "table" ? "bg-white text-sky-900 shadow-sm" : "text-sky-800 hover:text-sky-950"
                }`}
              >
                <TableIcon className="h-3.5 w-3.5" /> Table View
              </button>
              <button
                onClick={() => setViewMode("excel")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  viewMode === "excel" ? "bg-white text-emerald-800 shadow-sm" : "text-sky-800 hover:text-sky-950"
                }`}
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Excel Grid View
              </button>
            </div>
          </div>

          {/* STATUS FILTER PILLS (PAID / UNPAID / ACTIVE / DC) */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-sky-100">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-500 font-bold mr-1 flex items-center gap-1">
                <Filter className="h-3.5 w-3.5 text-sky-600" /> Billing & Status Filter:
              </span>

              {[
                { label: "All Users", value: "ALL", count: currentAreaCustomers.length },
                { label: "Paid Users", value: "Paid", count: currentAreaCustomers.filter((c) => c.dueAmount === 0).length },
                { label: "Unpaid Bills (10th)", value: "Unpaid", count: currentAreaCustomers.filter((c) => c.dueAmount > 0).length },
                { label: "Active Lines", value: "Active", count: currentAreaCustomers.filter((c) => c.status === "Active").length },
                { label: "DC Lines", value: "DC", count: currentAreaCustomers.filter((c) => c.status === "DC").length },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                    statusFilter === tab.value
                      ? "bg-sky-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-sky-100 hover:text-sky-900"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      statusFilter === tab.value
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="text-xs font-semibold text-slate-600">
              Showing <span className="font-extrabold text-sky-700">{filteredCustomers.length}</span> subscribers in <span className="font-extrabold text-slate-900">{activeArea}</span>
            </div>
          </div>
        </div>

        {/* 4. VIEW MODE 1: HIGH-CONTRAST CLEAN TABLE VIEW WITH WHATSAPP BUTTONS */}
        {viewMode === "table" && (
          <div className="rounded-2xl border border-sky-200 bg-white shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-sky-200 bg-sky-50 text-sky-950 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3.5">User ID & Name</th>
                    <th className="px-4 py-3.5">Sector Area</th>
                    <th className="px-4 py-3.5">Package Plan</th>
                    <th className="px-4 py-3.5">Line Status</th>
                    <th className="px-4 py-3.5">Payment Dues & Status</th>
                    <th className="px-4 py-3.5 text-right">Actions & WhatsApp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-100 text-slate-800">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 font-semibold">
                        No subscribers found matching "{locationSearchQuery}" in {activeArea} ({statusFilter}).
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-sky-50/70 transition group">
                        {/* User ID & Name */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 font-bold text-sky-700 text-xs border border-sky-200 shadow-sm">
                              {cust.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs group-hover:text-sky-700">
                                {cust.name}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[11px] font-mono text-sky-700 font-bold">
                                  ID: {cust.id}
                                </span>
                                <button
                                  onClick={() => setWaCustomer(cust)}
                                  className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300 transition"
                                  title="Click to edit phone number or send WhatsApp message"
                                >
                                  <MessageCircle className="h-3 w-3 text-emerald-600" />
                                  <span>{cust.phone}</span>
                                  <Edit className="h-2.5 w-2.5 text-emerald-600" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Area / Sector */}
                        <td className="px-4 py-3.5">
                          <span className="rounded-full bg-sky-100 text-sky-800 border border-sky-200 px-2.5 py-1 text-[11px] font-bold">
                            {cust.area}
                          </span>
                        </td>

                        {/* Package Plan */}
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900">{cust.packageName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">PKR {cust.monthlyFee.toLocaleString()}/mo</div>
                        </td>

                        {/* Line Status */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-[11px] font-bold border ${
                                cust.status === "Active"
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                  : "bg-rose-100 text-rose-800 border-rose-300"
                              }`}
                            >
                              {cust.status === "DC" ? "DC (Disconnected)" : "Active"}
                            </span>

                            <button
                              onClick={() =>
                                updateCustomerStatus(
                                  cust.id,
                                  cust.status === "Active" ? "DC" : "Active"
                                )
                              }
                              title={`Click to toggle status`}
                              className={`rounded-lg p-1.5 transition ${
                                cust.status === "Active"
                                  ? "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
                                  : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200"
                              }`}
                            >
                              <Power className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Payment Dues & Status */}
                        <td className="px-4 py-3.5">
                          {cust.dueAmount > 0 ? (
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 text-[10px] font-extrabold uppercase">
                                  UNPAID
                                </span>
                                <span className="font-mono font-black text-amber-700">
                                  PKR {cust.dueAmount.toLocaleString()}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                                Paid: PKR {cust.monthlyFee - cust.dueAmount > 0 ? cust.monthlyFee - cust.dueAmount : 0}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 text-[10px] font-extrabold uppercase">
                                  PAID
                                </span>
                                <span className="font-mono text-emerald-700 text-[11px] font-bold">
                                  PKR {cust.monthlyFee.toLocaleString()}
                                </span>
                              </div>
                              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                                (Remaining: PKR 0)
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Actions & WhatsApp Reminder Button */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* WHATSAPP REMINDER BUTTON FOR UNPAID USERS */}
                            {cust.dueAmount > 0 && (
                              <a
                                href={getWhatsAppReminderUrl(cust)}
                                target="_blank"
                                rel="noreferrer"
                                title="Send WhatsApp Bill Reminder (10th Due Date)"
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 text-white px-2 py-1 text-[10px] font-extrabold hover:bg-emerald-700 shadow-xs transition"
                              >
                                <MessageCircle className="h-3 w-3" /> WA Msg
                              </a>
                            )}

                            <button
                              onClick={() => setSelectedUser(cust)}
                              title="View Profile"
                              className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-700 hover:bg-sky-100 hover:text-sky-900"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedUser(cust);
                                setPayAmount(cust.dueAmount || cust.monthlyFee);
                                setShowPayModal(true);
                              }}
                              title="Record Payment"
                              className="rounded-lg bg-sky-600 text-white px-2 py-1 text-[10px] font-bold hover:bg-sky-700 shadow-sm"
                            >
                              Pay
                            </button>

                            <button
                              onClick={() => {
                                setFormCust(cust);
                                setShowEditModal(true);
                              }}
                              title="Edit Subscriber"
                              className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-700 hover:bg-sky-100 hover:text-sky-900"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`Delete subscriber ${cust.name} (${cust.id})?`)) {
                                  deleteCustomer(cust.id);
                                }
                              }}
                              title="Delete Subscriber"
                              className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. VIEW MODE 2: EXCEL SPREADSHEET GRID VIEW */}
        {viewMode === "excel" && (
          <div className="rounded-2xl border-2 border-emerald-300 bg-white shadow-xl overflow-hidden">
            {/* Excel Sheet Header Bar */}
            <div className="bg-emerald-700 px-4 py-2 text-white flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-emerald-200" />
                <span>Microsoft Excel Sheet - {activeArea} ({filteredCustomers.length} Records)</span>
              </div>
              <button
                onClick={exportToExcel}
                className="flex items-center gap-1 bg-white text-emerald-800 px-2.5 py-1 rounded font-extrabold hover:bg-emerald-50 transition shadow-sm text-[11px]"
              >
                <Download className="h-3.5 w-3.5" /> Download .XLSX
              </button>
            </div>

            {/* Excel Grid Table */}
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full border-collapse text-left font-mono text-[11px] border border-slate-300">
                <thead>
                  <tr className="bg-slate-200 text-slate-700 font-bold border-b border-slate-300">
                    <th className="w-12 border-r border-slate-300 p-2 text-center bg-slate-300">#</th>
                    <th className="border-r border-slate-300 p-2">A: User ID</th>
                    <th className="border-r border-slate-300 p-2">B: Subscriber Name</th>
                    <th className="border-r border-slate-300 p-2">C: Phone</th>
                    <th className="border-r border-slate-300 p-2">D: CNIC</th>
                    <th className="border-r border-slate-300 p-2">E: Sector Area</th>
                    <th className="border-r border-slate-300 p-2">F: Address</th>
                    <th className="border-r border-slate-300 p-2">G: Package</th>
                    <th className="border-r border-slate-300 p-2 text-right">H: Total Fee</th>
                    <th className="border-r border-slate-300 p-2 text-right">I: Money Paid</th>
                    <th className="border-r border-slate-300 p-2 text-right">J: Remaining Dues</th>
                    <th className="border-r border-slate-300 p-2 text-center">K: Billing Status</th>
                    <th className="p-2 text-center">L: WhatsApp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((cust, idx) => (
                    <tr
                      key={cust.id}
                      className={`border-b border-slate-200 hover:bg-emerald-50/60 ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                      }`}
                    >
                      <td className="border-r border-slate-300 p-2 text-center bg-slate-100 font-bold text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="border-r border-slate-300 p-2 font-bold text-sky-800">{cust.id}</td>
                      <td className="border-r border-slate-300 p-2 font-sans font-bold text-slate-900">{cust.name}</td>
                      <td className="border-r border-slate-300 p-2">{cust.phone}</td>
                      <td className="border-r border-slate-300 p-2 text-slate-500">{cust.cnic}</td>
                      <td className="border-r border-slate-300 p-2 font-bold text-sky-900">{cust.area}</td>
                      <td className="border-r border-slate-300 p-2 font-sans text-slate-600 truncate max-w-[150px]">{cust.address}</td>
                      <td className="border-r border-slate-300 p-2 font-sans">{cust.packageName}</td>
                      <td className="border-r border-slate-300 p-2 text-right font-bold">PKR {cust.monthlyFee}</td>
                      <td className="border-r border-slate-300 p-2 text-right font-bold text-emerald-700">
                        PKR {cust.monthlyFee - cust.dueAmount > 0 ? cust.monthlyFee - cust.dueAmount : 0}
                      </td>
                      <td className="border-r border-slate-300 p-2 text-right font-bold text-amber-700">
                        PKR {cust.dueAmount}
                      </td>
                      <td className="border-r border-slate-300 p-2 text-center">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            cust.dueAmount === 0 ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                          }`}
                        >
                          {cust.dueAmount === 0 ? "PAID" : "UNPAID"}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        {cust.dueAmount > 0 ? (
                          <a
                            href={getWhatsAppReminderUrl(cust)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:underline"
                          >
                            <MessageCircle className="h-3 w-3" /> Msg
                          </a>
                        ) : (
                          <span className="text-slate-400 text-[10px]">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* --- MODAL 1: VIEW SUBSCRIBER PROFILE DRAWER --- */}
      {selectedUser && !showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="h-full w-full max-w-xl overflow-y-auto rounded-2xl border border-sky-200 bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-sky-100 pb-4">
              <div>
                <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">
                  Sector: {selectedUser.area}
                </span>
                <h2 className="text-xl font-bold text-slate-900">{selectedUser.name}</h2>
                <p className="text-xs text-slate-500 font-mono">User ID: {selectedUser.id}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* WhatsApp Direct Reminder Button */}
            {selectedUser.dueAmount > 0 && (
              <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                    <MessageCircle className="h-4 w-4 text-emerald-600" />
                    10th Date Payment Overdue Reminder
                  </h4>
                  <p className="text-[11px] text-emerald-800 font-medium">Send automated WhatsApp notice for PKR {selectedUser.dueAmount} dues.</p>
                </div>
                <a
                  href={getWhatsAppReminderUrl(selectedUser)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-emerald-600 text-white px-3.5 py-2 text-xs font-bold hover:bg-emerald-700 transition shadow-sm flex items-center gap-1"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Send WA Msg
                </a>
              </div>
            )}

            {/* Line Status Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-sky-200 bg-sky-50/60 p-4">
              <div>
                <span className="text-xs text-slate-600 font-semibold">Line Connection Status:</span>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-0.5 text-xs font-bold border ${
                      selectedUser.status === "Active"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : "bg-rose-100 text-rose-800 border-rose-300"
                    }`}
                  >
                    {selectedUser.status === "DC" ? "DC (Disconnected)" : "Active"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  const newSt = selectedUser.status === "Active" ? "DC" : "Active";
                  updateCustomerStatus(selectedUser.id, newSt);
                  setSelectedUser({ ...selectedUser, status: newSt });
                }}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedUser.status === "Active"
                    ? "bg-rose-600 text-white hover:bg-rose-700"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                <Power className="h-3.5 w-3.5" />
                {selectedUser.status === "Active" ? "Make DC" : "Activate Line"}
              </button>
            </div>

            {/* Subscriber Details */}
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-sky-100 bg-slate-50 p-4 text-xs">
              <div>
                <p className="text-slate-500 font-bold uppercase text-[10px]">Area Sector</p>
                <p className="mt-1 font-bold text-sky-800">{selectedUser.area}</p>
              </div>
              <div>
                <p className="text-slate-500 font-bold uppercase text-[10px]">Package Speed</p>
                <p className="mt-1 font-bold text-slate-900">{selectedUser.packageName}</p>
              </div>
              <div>
                <p className="text-slate-500 font-bold uppercase text-[10px]">Monthly Tariff</p>
                <p className="mt-1 font-mono font-bold text-slate-900">PKR {selectedUser.monthlyFee}</p>
              </div>
              <div>
                <p className="text-slate-500 font-bold uppercase text-[10px]">Money Paid vs Dues</p>
                <p className="mt-1 font-mono font-bold">
                  <span className="text-emerald-700">Paid: PKR {selectedUser.monthlyFee - selectedUser.dueAmount > 0 ? selectedUser.monthlyFee - selectedUser.dueAmount : 0}</span>
                  <br />
                  <span className="text-amber-700">Remaining: PKR {selectedUser.dueAmount}</span>
                </p>
              </div>
            </div>

            {/* Payment Ledger History */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                Payment Ledger History ({selectedUser.name})
              </h3>

              <div className="space-y-2">
                {payments.filter((p) => p.customerId === selectedUser.id).length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No payment transactions recorded yet.</p>
                ) : (
                  payments
                    .filter((p) => p.customerId === selectedUser.id)
                    .map((pay) => (
                      <div
                        key={pay.id}
                        className="flex items-center justify-between rounded-xl border border-sky-100 bg-sky-50/50 p-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{pay.paymentMonth}</div>
                          <div className="text-[10px] text-slate-500">
                            {pay.paymentDate} • {pay.paymentMethod} • #{pay.receiptNumber}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-extrabold text-emerald-700">
                            PKR {pay.amountPaid.toLocaleString()}
                          </div>
                          <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[9px] font-bold">
                            {pay.status}
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ADD NEW SUBSCRIBER --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-sky-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Add New Subscriber</h3>
            <p className="text-xs text-slate-500 mb-4">Register subscriber in Saeela, Nougran, or Arsal Town.</p>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Subscriber Name *</label>
                  <input
                    required
                    type="text"
                    value={formCust.name}
                    onChange={(e) => setFormCust({ ...formCust, name: e.target.value })}
                    placeholder="Full Name"
                    className="w-full rounded-xl border border-sky-300 bg-sky-50/50 px-3 py-2 text-slate-900 font-medium outline-none focus:border-sky-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Phone Number *</label>
                  <input
                    required
                    type="text"
                    value={formCust.phone}
                    onChange={(e) => setFormCust({ ...formCust, phone: e.target.value })}
                    placeholder="0300-1234567"
                    className="w-full rounded-xl border border-sky-300 bg-sky-50/50 px-3 py-2 text-slate-900 font-medium outline-none focus:border-sky-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Sector Area *</label>
                  <select
                    value={formCust.area}
                    onChange={(e) => setFormCust({ ...formCust, area: e.target.value })}
                    className="w-full rounded-xl border border-sky-300 bg-sky-50/50 px-3 py-2 text-slate-900 font-medium outline-none focus:border-sky-600 focus:bg-white"
                  >
                    <option value="Saeela">Saeela Sector</option>
                    <option value="Nougran">Nougran Sector</option>
                    <option value="Arsal Town">Arsal Town</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Line Status</label>
                  <select
                    value={formCust.status}
                    onChange={(e) => setFormCust({ ...formCust, status: e.target.value as CustomerStatus })}
                    className="w-full rounded-xl border border-sky-300 bg-sky-50/50 px-3 py-2 text-slate-900 font-medium outline-none focus:border-sky-600 focus:bg-white"
                  >
                    <option value="Active">Active Line</option>
                    <option value="DC">DC (Disconnected)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Address *</label>
                <textarea
                  required
                  rows={2}
                  value={formCust.address}
                  onChange={(e) => setFormCust({ ...formCust, address: e.target.value })}
                  placeholder="Street #, House #..."
                  className="w-full rounded-xl border border-sky-300 bg-sky-50/50 px-3 py-2 text-slate-900 font-medium outline-none focus:border-sky-600 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-sky-600 px-4 py-2 font-bold text-white hover:bg-sky-700 shadow-md shadow-sky-600/20"
                >
                  Create Subscriber
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: RECORD PAYMENT --- */}
      {showPayModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-sky-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Record Bill Payment ({selectedUser.name})</h3>
            <p className="text-xs text-slate-500 mb-4">User ID: {selectedUser.id} • Sector: {selectedUser.area}</p>

            <form onSubmit={handleRecordPaySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Amount Paid (PKR) *</label>
                <input
                  required
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-sky-300 bg-sky-50/50 px-3 py-2 text-slate-900 font-mono font-bold text-sm outline-none focus:border-sky-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Payment Month</label>
                <input
                  type="text"
                  value={payMonth}
                  onChange={(e) => setPayMonth(e.target.value)}
                  placeholder="August 2026"
                  className="w-full rounded-xl border border-sky-300 bg-sky-50/50 px-3 py-2 text-slate-900 font-medium outline-none focus:border-sky-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-slate-700 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                >
                  Confirm & Print Single Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: 10TH DATE WHATSAPP REMINDERS DISPATCHER --- */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl overflow-y-auto max-h-[85vh] rounded-2xl border border-emerald-300 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-emerald-600" />
                  10th Date Automated WhatsApp Reminders ({activeArea})
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {unpaidCustomers10th.length} subscribers in {activeArea} have pending dues. Click to send direct WhatsApp message.
                </p>
              </div>
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {unpaidCustomers10th.length === 0 ? (
                <p className="py-8 text-center text-emerald-700 font-extrabold">
                  🎉 Fantastic! All subscribers in {activeArea} have cleared their payments for the 10th deadline!
                </p>
              ) : (
                unpaidCustomers10th.map((cust) => (
                  <div
                    key={cust.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50/50 transition"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{cust.name} ({cust.id})</div>
                      <div className="text-[11px] text-slate-600 font-mono">
                        Phone: {cust.phone} • Pending Dues: <span className="font-extrabold text-amber-700">PKR {cust.dueAmount}</span>
                      </div>
                    </div>

                    <a
                      href={getWhatsAppReminderUrl(cust)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl bg-emerald-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-sm"
                    >
                      <MessageCircle className="h-4 w-4" /> Send Reminder
                    </a>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-sky-100">
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-slate-700 font-bold hover:bg-slate-100"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 5: IMPORT EXCEL SHEET --- */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-sky-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                Import Excel Sheet (.xlsx / .csv)
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <p className="text-slate-600">
                Select your Excel sheet containing subscriber details. Columns detected automatically: <span className="font-bold">Subscriber Name, Phone, Sector Area, Monthly Fee, Line Status</span>.
              </p>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/50 p-6 rounded-xl text-center cursor-pointer transition"
              >
                <Upload className="h-8 w-8 text-sky-600 mx-auto mb-2" />
                <p className="font-bold text-slate-800">Click to choose Excel file</p>
                <p className="text-[11px] text-slate-500 mt-1">Supports .xlsx, .xls, and .csv</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {importStatus && (
                <div className="p-3 rounded-xl bg-sky-100 border border-sky-200 text-sky-900 font-bold text-xs">
                  {importStatus}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-sky-100">
              <button
                onClick={() => setShowImportModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-slate-700 font-bold hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- QUICK PHONE EDIT & WHATSAPP MODAL --- */}
      {waCustomer && (
        <QuickPhoneWhatsAppModal
          customer={waCustomer}
          onClose={() => setWaCustomer(null)}
        />
      )}
    </main>
  );
}
