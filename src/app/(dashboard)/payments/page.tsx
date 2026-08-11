"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { useWisp } from "@/context/WispContext";
import {
  CreditCard,
  Printer,
  Plus,
  Search,
  Filter,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import { PaymentMethod, Customer } from "@/types/wisp";
import QuickPhoneWhatsAppModal from "@/components/QuickPhoneWhatsAppModal";

export default function PaymentsPage() {
  const { customers, payments, recordPayment, setSelectedReceipt } = useWisp();

  const [searchQuery, setSearchQuery] = useState("");
  const [monthFilter, setMonthFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [waCustomer, setWaCustomer] = useState<Customer | null>(null);

  const [showRecordModal, setShowRecordModal] = useState(false);

  const [form, setForm] = useState({
    customerId: customers[0]?.id || "",
    amountPaid: customers[0]?.dueAmount || 2500,
    paymentMonth: "August 2026",
    paymentMethod: "Cash" as PaymentMethod,
    receivedBy: "Reception Office",
  });

  // Unique list of payment months
  const availableMonths = Array.from(new Set(payments.map((p) => p.paymentMonth)));

  // Filtered Payments
  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMonth = monthFilter === "ALL" || p.paymentMonth === monthFilter;
    const matchesMethod = methodFilter === "ALL" || p.paymentMethod === methodFilter;

    return matchesSearch && matchesMonth && matchesMethod;
  });

  // Calculate Summary Totals
  const totalAmountCollected = filteredPayments.reduce((acc, p) => acc + p.amountPaid, 0);
  const totalRemainingDues = filteredPayments.reduce((acc, p) => acc + p.remainingDues, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || form.amountPaid <= 0) return;
    recordPayment(form);
    setShowRecordModal(false);
  };

  return (
    <main className="flex-1 pb-12 bg-slate-50 min-h-screen text-slate-900">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenRecordPaymentModal={() => setShowRecordModal(true)}
      />

      <div className="mx-auto max-w-7xl px-6 pt-6 space-y-6">
        {/* Title Bar & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-200 pb-5">
          <div>
            <div className="text-xs uppercase tracking-widest text-sky-700 font-extrabold">
              Financial Billing Ledger
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
              Payment Receipts & Dues Tracker
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Track payment months, payment dates, monthly dues, paid amounts, and generate printable receipts.
            </p>
          </div>

          <button
            onClick={() => setShowRecordModal(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700"
          >
            <CreditCard className="h-4 w-4" /> Log New Payment
          </button>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm border-l-4 border-l-emerald-600">
            <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">
              Total Collections (Filtered)
            </span>
            <div className="mt-2 text-2xl font-black text-emerald-700 font-mono">
              PKR {totalAmountCollected.toLocaleString()}
            </div>
            <p className="mt-1 text-[11px] text-emerald-800 font-bold">
              {filteredPayments.length} Paid Transactions
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm border-l-4 border-l-amber-500">
            <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">
              Remaining Pending Dues
            </span>
            <div className="mt-2 text-2xl font-black text-amber-700 font-mono">
              PKR {totalRemainingDues.toLocaleString()}
            </div>
            <p className="mt-1 text-[11px] text-amber-800 font-bold">Balance to be recovered</p>
          </div>

          <div className="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm border-l-4 border-l-sky-600">
            <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">
              Collection Method Breakdown
            </span>
            <div className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-800">
              <span className="rounded-full bg-sky-100 border border-sky-200 px-2.5 py-1 text-sky-900">
                Cash: {payments.filter((p) => p.paymentMethod === "Cash").length}
              </span>
              <span className="rounded-full bg-sky-100 border border-sky-200 px-2.5 py-1 text-sky-900">
                Online: {payments.filter((p) => p.paymentMethod !== "Cash").length}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-sky-700 font-bold">Official Extreme Fiber Ledger</p>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            {/* Month Filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-600 font-bold flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-sky-600" /> Month:
              </span>
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="rounded-xl border border-sky-300 bg-sky-50/50 px-3 py-1.5 text-xs text-slate-900 font-medium outline-none focus:border-sky-600"
              >
                <option value="ALL">All Payment Months</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Method Filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-600 font-bold flex items-center gap-1">
                <Filter className="h-3.5 w-3.5 text-sky-600" /> Method:
              </span>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="rounded-xl border border-sky-300 bg-sky-50/50 px-3 py-1.5 text-xs text-slate-900 font-medium outline-none focus:border-sky-600"
              >
                <option value="ALL">All Payment Methods</option>
                <option value="Cash">Cash</option>
                <option value="EasyPaisa">EasyPaisa</option>
                <option value="JazzCash">JazzCash</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-600">
            Showing <span className="font-extrabold text-sky-700">{filteredPayments.length}</span> payment records
          </div>
        </div>

        {/* Financial Ledger Data Table */}
        <div className="rounded-2xl border border-sky-200 bg-white shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-sky-200 bg-sky-50 text-sky-950 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5">Receipt # & Date</th>
                  <th className="px-4 py-3.5">User ID & Subscriber</th>
                  <th className="px-4 py-3.5">Plan & Month</th>
                  <th className="px-4 py-3.5">Monthly Dues</th>
                  <th className="px-4 py-3.5">Paid Amount</th>
                  <th className="px-4 py-3.5">Method & Receiver</th>
                  <th className="px-4 py-3.5 text-right">Print Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100 text-slate-800">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 font-semibold">
                      No payment records match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-sky-50/60 transition group">
                      <td className="px-4 py-3.5">
                        <div className="font-mono font-extrabold text-sky-700 text-xs">
                          {pay.receiptNumber}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">{pay.paymentDate}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 group-hover:text-sky-700">
                          {pay.customerName}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-mono text-sky-700 font-bold">
                            ID: {pay.customerId}
                          </span>
                          <button
                            onClick={() => {
                              const existing = customers.find((c) => c.id === pay.customerId);
                              setWaCustomer(
                                existing || {
                                  id: pay.customerId,
                                  name: pay.customerName,
                                  phone: "",
                                  cnic: "",
                                  address: "",
                                  area: "Saeela",
                                  packageId: "PKG-20M",
                                  packageName: pay.packageName,
                                  monthlyFee: pay.monthlyDues,
                                  status: "Active",
                                  installationDate: "",
                                  dueAmount: pay.remainingDues,
                                }
                              );
                            }}
                            className="inline-flex items-center gap-1 text-[10px] text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300 transition"
                            title="Click to edit phone or send WhatsApp"
                          >
                            <span>WhatsApp</span>
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800">{pay.packageName}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">{pay.paymentMonth}</div>
                      </td>

                      <td className="px-4 py-3.5 font-mono font-bold text-slate-700">
                        PKR {pay.monthlyDues.toLocaleString()}
                      </td>

                      <td className="px-4 py-3.5 font-mono">
                        <span className="font-extrabold text-emerald-700">
                          PKR {pay.amountPaid.toLocaleString()}
                        </span>
                        {pay.remainingDues > 0 && (
                          <div className="text-[10px] text-rose-600 font-bold">
                            Pending: PKR {pay.remainingDues}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800">{pay.paymentMethod}</div>
                        <div className="text-[10px] text-slate-500 font-medium">{pay.receivedBy}</div>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedReceipt(pay)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-800 hover:bg-sky-600 hover:text-white transition shadow-sm"
                        >
                          <Printer className="h-3.5 w-3.5" /> Receipt
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: RECORD PAYMENT */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-sky-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Log Bill Payment</h3>
            <p className="text-xs text-slate-500 mb-4">Record fee collection and generate instant receipt.</p>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Subscriber *</label>
                <select
                  value={form.customerId}
                  onChange={(e) => {
                    const cust = customers.find((c) => c.id === e.target.value);
                    setForm({
                      ...form,
                      customerId: e.target.value,
                      amountPaid: cust?.dueAmount || cust?.monthlyFee || 2500,
                    });
                  }}
                  className="w-full rounded-xl border border-sky-300 bg-sky-50/50 px-3 py-2 text-slate-900 font-medium outline-none focus:border-sky-600"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id}) - Area: {c.area} - Dues: PKR {c.dueAmount}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Amount Paid (PKR) *</label>
                  <input
                    required
                    type="number"
                    value={form.amountPaid}
                    onChange={(e) => setForm({ ...form, amountPaid: Number(e.target.value) })}
                    className="w-full rounded-xl border border-sky-300 bg-sky-50/50 px-3 py-2 text-slate-900 font-mono font-bold outline-none focus:border-sky-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Payment Month</label>
                  <input
                    type="text"
                    value={form.paymentMonth}
                    onChange={(e) => setForm({ ...form, paymentMonth: e.target.value })}
                    placeholder="August 2026"
                    className="w-full rounded-xl border border-sky-300 bg-sky-50/50 px-3 py-2 text-slate-900 font-medium outline-none focus:border-sky-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Payment Method</label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as any })}
                    className="w-full rounded-xl border border-sky-300 bg-sky-50/50 px-3 py-2 text-slate-900 font-medium outline-none focus:border-sky-600"
                  >
                    <option value="Cash">Cash</option>
                    <option value="EasyPaisa">EasyPaisa</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Received By (Staff)</label>
                  <input
                    type="text"
                    value={form.receivedBy}
                    onChange={(e) => setForm({ ...form, receivedBy: e.target.value })}
                    className="w-full rounded-xl border border-sky-300 bg-sky-50/50 px-3 py-2 text-slate-900 font-medium outline-none focus:border-sky-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-slate-700 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                >
                  Record Payment & View Receipt
                </button>
              </div>
            </form>
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
