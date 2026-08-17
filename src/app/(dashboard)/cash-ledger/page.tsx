"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { useWisp } from "@/context/WispContext";
import { Payment, Customer } from "@/types/wisp";
import ReceiptModal from "@/components/ReceiptModal";
import {
  Banknote,
  DollarSign,
  Clock,
  CheckCircle2,
  Search,
  Plus,
  Filter,
  Receipt,
  UserCheck,
  MapPin,
  X,
  AlertTriangle,
  ArrowUpRight
} from "lucide-react";

export default function CashLedgerPage() {
  const { customers, payments, staff, recordPayment, setSelectedReceipt } = useWisp();

  const [activeTab, setActiveTab] = useState<"cash" | "pending">("cash");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStaffFilter, setSelectedStaffFilter] = useState("All");
  const [selectedAreaFilter, setSelectedAreaFilter] = useState("All");

  // Modals
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [isPendingCollectModalOpen, setIsPendingCollectModalOpen] = useState(false);
  const [targetCustomer, setTargetCustomer] = useState<Customer | null>(null);

  // Cash Modal Form
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [cashAmount, setCashAmount] = useState<number | "">("");
  const [receivedByStaff, setReceivedByStaff] = useState(staff[0]?.name || "Reception Office");
  const [paymentMonth, setPaymentMonth] = useState("August 2026");
  const [paymentNotes, setPaymentNotes] = useState("");

  // Stats Calculations
  const todayStr = new Date().toISOString().split("T")[0];
  const cashPayments = payments.filter((p) => p.paymentMethod === "Cash");

  const todayCashTotal = cashPayments
    .filter((p) => p.paymentDate === todayStr)
    .reduce((sum, p) => sum + p.amountPaid, 0);

  const monthlyCashTotal = cashPayments
    .reduce((sum, p) => sum + p.amountPaid, 0);

  const pendingSubscribers = customers.filter((c) => c.dueAmount > 0 || c.status === "Overdue" || c.status === "Pending");
  const totalPendingDues = pendingSubscribers.reduce((sum, c) => sum + c.dueAmount, 0);

  // Filtered lists
  const filteredCashPayments = cashPayments.filter((p) => {
    const matchesSearch =
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStaff = selectedStaffFilter === "All" || p.receivedBy === selectedStaffFilter;
    return matchesSearch && matchesStaff;
  });

  const filteredPendingSubscribers = pendingSubscribers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = selectedAreaFilter === "All" || c.area === selectedAreaFilter;
    return matchesSearch && matchesArea;
  });

  const handleOpenCollectCash = (customer: Customer) => {
    setTargetCustomer(customer);
    setSelectedCustomerId(customer.id);
    setCashAmount(customer.dueAmount > 0 ? customer.dueAmount : customer.monthlyFee);
    setIsPendingCollectModalOpen(true);
  };

  const handleSaveCashEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !cashAmount || Number(cashAmount) <= 0) return;

    const newPayment = recordPayment({
      customerId: selectedCustomerId,
      amountPaid: Number(cashAmount),
      paymentMonth,
      paymentMethod: "Cash",
      receivedBy: receivedByStaff,
    });

    setIsCashModalOpen(false);
    setIsPendingCollectModalOpen(false);
    setSelectedCustomerId("");
    setCashAmount("");
    setTargetCustomer(null);
  };

  return (
    <main className="flex-1 pb-12 bg-slate-50 min-h-screen text-slate-900">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 pt-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-sky-200 pb-5 gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-sky-700 font-extrabold flex items-center gap-1.5">
              <Banknote className="h-4 w-4 text-emerald-600" /> Cash Management & Recovery
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
              Cash Ledger & Pending Dues Register
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Record incoming physical cash collections and track outstanding pending dues by subscriber and technician.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedCustomerId(customers[0]?.id || "");
              setCashAmount(customers[0]?.monthlyFee || 2500);
              setIsCashModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
          >
            <Plus className="h-4 w-4" /> + Record Cash Entry (Paisy Add Krn)
          </button>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
              <span>Cash Collected Today</span>
              <Banknote className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-slate-900">
              PKR {todayCashTotal.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Physical cash collected today</p>
          </div>

          <div className="rounded-2xl border border-sky-200 bg-white p-4 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-sky-800">
              <span>Total Cash (August)</span>
              <DollarSign className="h-4 w-4 text-sky-600" />
            </div>
            <div className="text-xl font-black text-slate-900">
              PKR {monthlyCashTotal.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Total monthly cash in hand</p>
          </div>

          <div className="rounded-2xl border border-rose-200 bg-white p-4 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-rose-800">
              <span>Pending Outstanding Dues</span>
              <Clock className="h-4 w-4 text-rose-600" />
            </div>
            <div className="text-xl font-black text-rose-700">
              PKR {totalPendingDues.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Uncollected dues remaining</p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-amber-800">
              <span>Pending Subscribers</span>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-xl font-black text-slate-900">
              {pendingSubscribers.length} Accounts
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Subscribers owing money</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-sky-200 space-x-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab("cash")}
            className={`pb-3 transition flex items-center gap-2 border-b-2 ${
              activeTab === "cash"
                ? "border-emerald-600 text-emerald-800 font-black"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Banknote className="h-4 w-4" /> Cash Received Log ({cashPayments.length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`pb-3 transition flex items-center gap-2 border-b-2 ${
              activeTab === "pending"
                ? "border-rose-600 text-rose-800 font-black"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Clock className="h-4 w-4" /> Pending Dues & Recovery ({pendingSubscribers.length})
          </button>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-sky-200 shadow-xs">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={activeTab === "cash" ? "Search customer or receipt..." : "Search pending subscriber..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-sky-200 bg-sky-50/50 pl-9 pr-4 py-2 text-xs text-slate-900 outline-none focus:border-sky-600 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {activeTab === "cash" ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-bold">Received By:</span>
                <select
                  value={selectedStaffFilter}
                  onChange={(e) => setSelectedStaffFilter(e.target.value)}
                  className="rounded-xl border border-sky-200 bg-white px-3 py-1.5 font-bold text-slate-800 outline-none"
                >
                  <option value="All">All Technicians & Staff</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-bold">Sector Area:</span>
                <select
                  value={selectedAreaFilter}
                  onChange={(e) => setSelectedAreaFilter(e.target.value)}
                  className="rounded-xl border border-sky-200 bg-white px-3 py-1.5 font-bold text-slate-800 outline-none"
                >
                  <option value="All">All Sectors</option>
                  <option value="Saeela">Saeela</option>
                  <option value="Nougran">Nougran</option>
                  <option value="Arsal Town">Arsal Town</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* TAB 1: Cash Payments Register */}
        {activeTab === "cash" && (
          <div className="rounded-2xl border border-sky-200 bg-white shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sky-50 text-sky-950 font-bold uppercase border-b border-sky-200">
                  <tr>
                    <th className="px-4 py-3">Receipt No</th>
                    <th className="px-4 py-3">Subscriber Name</th>
                    <th className="px-4 py-3">Package</th>
                    <th className="px-4 py-3">Cash Amount Paid</th>
                    <th className="px-4 py-3">Payment Month</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Received By (Tech)</th>
                    <th className="px-4 py-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-100 font-medium text-slate-800">
                  {filteredCashPayments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                        No cash payment records match your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredCashPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-sky-50">
                        <td className="px-4 py-3 font-mono font-bold text-sky-700">{p.receiptNumber}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{p.customerName}</td>
                        <td className="px-4 py-3 text-slate-600">{p.packageName}</td>
                        <td className="px-4 py-3 font-mono font-black text-emerald-700 text-sm">
                          PKR {p.amountPaid.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{p.paymentMonth}</td>
                        <td className="px-4 py-3 font-mono text-slate-500">{p.paymentDate}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 rounded-md bg-sky-100 px-2 py-0.5 font-bold text-sky-900 border border-sky-200">
                            <UserCheck className="h-3 w-3 text-sky-600" /> {p.receivedBy}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setSelectedReceipt(p)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-800"
                          >
                            <Receipt className="h-3.5 w-3.5" /> View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Pending Dues Tracker */}
        {activeTab === "pending" && (
          <div className="rounded-2xl border border-sky-200 bg-white shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-rose-50 text-rose-950 font-bold uppercase border-b border-rose-200">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Subscriber Name</th>
                    <th className="px-4 py-3">Contact Phone</th>
                    <th className="px-4 py-3">Sector Area</th>
                    <th className="px-4 py-3">Package Tier</th>
                    <th className="px-4 py-3">Monthly Fee</th>
                    <th className="px-4 py-3">Pending Due Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-100 font-medium text-slate-800">
                  {filteredPendingSubscribers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                        Great news! No pending dues match your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredPendingSubscribers.map((c) => (
                      <tr key={c.id} className="hover:bg-rose-50/50">
                        <td className="px-4 py-3 font-mono text-slate-500 font-bold">{c.id}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{c.name}</td>
                        <td className="px-4 py-3 font-mono text-slate-600">{c.phone}</td>
                        <td className="px-4 py-3 font-bold text-sky-800">{c.area}</td>
                        <td className="px-4 py-3 text-slate-600">{c.packageName}</td>
                        <td className="px-4 py-3 font-mono">PKR {c.monthlyFee.toLocaleString()}</td>
                        <td className="px-4 py-3 font-mono font-black text-rose-600 text-sm">
                          PKR {c.dueAmount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-rose-100 text-rose-800 border border-rose-300 px-2.5 py-0.5 text-[10px] font-bold">
                            ● {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleOpenCollectCash(c)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-extrabold text-white shadow-sm hover:bg-emerald-700 transition"
                          >
                            <Banknote className="h-3.5 w-3.5" /> Collect Cash
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Record Cash Payment Modal */}
      {(isCashModalOpen || isPendingCollectModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-sky-200 bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
                  <Banknote className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Record Physical Cash Received (Paisy Cash Entry)
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Log cash collected by technician and update subscriber dues.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCashModalOpen(false);
                  setIsPendingCollectModalOpen(false);
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCashEntry} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Subscriber *</label>
                <select
                  required
                  value={selectedCustomerId}
                  onChange={(e) => {
                    setSelectedCustomerId(e.target.value);
                    const cust = customers.find((c) => c.id === e.target.value);
                    if (cust) {
                      setCashAmount(cust.dueAmount > 0 ? cust.dueAmount : cust.monthlyFee);
                    }
                  }}
                  className="w-full rounded-xl border border-sky-200 bg-sky-50/50 p-2.5 font-semibold text-slate-900 outline-none focus:border-sky-600 focus:bg-white"
                >
                  <option value="" disabled>-- Select Subscriber --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id}) - Dues: PKR {c.dueAmount} ({c.area})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Cash Amount Received (PKR) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="e.g. 2500"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value ? Number(e.target.value) : "")}
                    className="w-full rounded-xl border border-sky-200 bg-sky-50/50 p-2.5 font-mono text-sm font-extrabold text-slate-900 outline-none focus:border-sky-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Received By (Technician) *</label>
                  <select
                    value={receivedByStaff}
                    onChange={(e) => setReceivedByStaff(e.target.value)}
                    className="w-full rounded-xl border border-sky-200 bg-sky-50/50 p-2.5 font-semibold text-slate-900 outline-none focus:border-sky-600 focus:bg-white"
                  >
                    {staff.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Billing Month</label>
                  <select
                    value={paymentMonth}
                    onChange={(e) => setPaymentMonth(e.target.value)}
                    className="w-full rounded-xl border border-sky-200 bg-sky-50/50 p-2.5 text-slate-900 outline-none focus:border-sky-600 focus:bg-white font-semibold"
                  >
                    <option value="August 2026">August 2026</option>
                    <option value="July 2026">July 2026</option>
                    <option value="September 2026">September 2026</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Payment Channel</label>
                  <input
                    disabled
                    value="Physical Cash"
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 p-2.5 font-bold text-slate-600 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsCashModalOpen(false);
                    setIsPendingCollectModalOpen(false);
                  }}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-4 w-4" /> Record Cash & Print Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Receipt Modal Popup */}
      <ReceiptModal />
    </main>
  );
}
