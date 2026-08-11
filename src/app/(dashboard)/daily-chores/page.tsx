"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { useWisp } from "@/context/WispContext";
import {
  DollarSign,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  CheckSquare,
  Wrench,
  TrendingDown,
  TrendingUp,
  Wallet,
  User,
  Calendar,
} from "lucide-react";
import { DailyChoreType, DailyChoreStatus } from "@/types/wisp";

export default function DailyChoresPage() {
  const { dailyChores, staff, addDailyChore, updateDailyChoreStatus, deleteDailyChore } = useWisp();

  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    title: "",
    type: "Expense" as DailyChoreType,
    amount: 1500,
    assignedStaff: staff[0]?.name || "Reception Office",
    status: "Completed" as DailyChoreStatus,
    priority: "Medium" as const,
    notes: "",
  });

  // Calculate Cash Register Summary for Today
  const totalCollections = dailyChores
    .filter((d) => d.type === "Collection" && d.status === "Completed")
    .reduce((acc, d) => acc + (d.amount || 0), 0);

  const totalExpenses = dailyChores
    .filter((d) => d.type === "Expense" && d.status === "Completed")
    .reduce((acc, d) => acc + (d.amount || 0), 0);

  const netCashHandover = totalCollections - totalExpenses;

  const pendingTasksCount = dailyChores.filter(
    (d) => d.status === "Pending" || d.status === "In Progress"
  ).length;

  // Filtering
  const filteredChores = dailyChores.filter((c) => {
    const matchesType = typeFilter === "ALL" || c.type === typeFilter;
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesType && matchesStatus;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    addDailyChore({
      date: form.date,
      title: form.title,
      type: form.type,
      amount: form.amount > 0 ? form.amount : undefined,
      assignedStaff: form.assignedStaff,
      status: form.status,
      priority: form.priority,
      notes: form.notes,
    });

    setShowAddModal(false);
    setForm({
      date: new Date().toISOString().split("T")[0],
      title: "",
      type: "Expense",
      amount: 1500,
      assignedStaff: staff[0]?.name || "Reception Office",
      status: "Completed",
      priority: "Medium",
      notes: "",
    });
  };

  return (
    <main className="flex-1 pb-12 bg-slate-50 min-h-screen text-slate-900">
      <Navbar onOpenRecordPaymentModal={() => {}} />

      <div className="mx-auto max-w-7xl px-6 pt-6 space-y-6">
        {/* Title Bar & Quick Add */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-200 pb-5">
          <div>
            <div className="text-xs uppercase tracking-widest text-sky-700 font-extrabold">
              Field & Office Logistics
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
              Daily Chores & Money Cash Register
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Track daily field maintenance tasks, cash collections, and company operational expenses.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-600/20 transition hover:bg-sky-700"
          >
            <Plus className="h-4 w-4" /> Log Daily Chore / Expense
          </button>
        </div>

        {/* Daily Cash Register Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Card 1: Today Collections */}
          <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm border-l-4 border-l-emerald-600">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">
                Total Cash Collections
              </span>
              <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700 border border-emerald-300">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-black text-emerald-700 font-mono">
              PKR {totalCollections.toLocaleString()}
            </div>
            <p className="mt-2 text-[11px] text-slate-500 font-semibold">Cash received from field & reception</p>
          </div>

          {/* Card 2: Today Expenses */}
          <div className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm border-l-4 border-l-rose-500">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">
                Total Daily Expenses
              </span>
              <div className="rounded-xl bg-rose-100 p-2 text-rose-700 border border-rose-300">
                <TrendingDown className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-black text-rose-700 font-mono">
              PKR {totalExpenses.toLocaleString()}
            </div>
            <p className="mt-2 text-[11px] text-slate-500 font-semibold">Hardware wire, fuel, repairs & meals</p>
          </div>

          {/* Card 3: Net Cash Handover */}
          <div className="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm border-l-4 border-l-sky-600">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">
                Net Cash Handover
              </span>
              <div className="rounded-xl bg-sky-100 p-2 text-sky-700 border border-sky-300">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-black text-slate-900 font-mono">
              PKR {netCashHandover.toLocaleString()}
            </div>
            <p className="mt-2 text-[11px] text-sky-700 font-bold">
              Net balance in cash drawer
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-600 font-bold mr-1">Filter Type:</span>
            {["ALL", "Collection", "Expense", "Maintenance Task", "Admin Task"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  typeFilter === t
                    ? "bg-sky-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-sky-100 hover:text-sky-900"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-bold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-sky-300 bg-sky-50/50 px-3 py-1.5 text-xs text-slate-900 font-medium outline-none focus:border-sky-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Daily Chores Data Table */}
        <div className="rounded-2xl border border-sky-200 bg-white shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-sky-200 bg-sky-50 text-sky-950 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5">Chore Title & Notes</th>
                  <th className="px-4 py-3.5">Category Type</th>
                  <th className="px-4 py-3.5">Money Amount (PKR)</th>
                  <th className="px-4 py-3.5">Assigned Staff</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100 text-slate-800">
                {filteredChores.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 font-semibold">
                      No daily chores or money logs found matching filter.
                    </td>
                  </tr>
                ) : (
                  filteredChores.map((chore) => (
                    <tr key={chore.id} className="hover:bg-sky-50/60 transition group">
                      {/* Chore Title */}
                      <td className="px-4 py-3.5 max-w-sm">
                        <div className="font-bold text-slate-900 text-xs group-hover:text-sky-700">
                          {chore.title}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                          {chore.date} • Created at {chore.createdAt}
                        </div>
                        {chore.notes && (
                          <div className="mt-1 text-[11px] text-slate-700 italic bg-sky-50 p-1.5 rounded-lg border border-sky-200">
                            {chore.notes}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold border ${
                            chore.type === "Collection"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : chore.type === "Expense"
                              ? "bg-rose-100 text-rose-800 border-rose-300"
                              : chore.type === "Maintenance Task"
                              ? "bg-amber-100 text-amber-800 border-amber-300"
                              : "bg-sky-100 text-sky-800 border-sky-300"
                          }`}
                        >
                          {chore.type === "Collection" && "💰 "}
                          {chore.type === "Expense" && "💸 "}
                          {chore.type === "Maintenance Task" && "🔧 "}
                          {chore.type}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3.5 font-mono text-sm font-bold">
                        {chore.amount ? (
                          <span
                            className={
                              chore.type === "Collection"
                                ? "text-emerald-700"
                                : chore.type === "Expense"
                                ? "text-rose-700"
                                : "text-slate-800"
                            }
                          >
                            {chore.type === "Collection" ? "+" : chore.type === "Expense" ? "-" : ""}
                            PKR {chore.amount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs font-normal">Task Only</span>
                        )}
                      </td>

                      {/* Staff */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800">{chore.assignedStaff}</div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => {
                            const nextSt: DailyChoreStatus =
                              chore.status === "Completed"
                                ? "Pending"
                                : chore.status === "Pending"
                                ? "In Progress"
                                : "Completed";
                            updateDailyChoreStatus(chore.id, nextSt);
                          }}
                          className={`rounded-full px-3 py-1 text-[11px] font-bold border transition ${
                            chore.status === "Completed"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : chore.status === "In Progress"
                              ? "bg-amber-100 text-amber-800 border-amber-300"
                              : "bg-slate-100 text-slate-700 border-slate-300"
                          }`}
                        >
                          {chore.status}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => deleteDailyChore(chore.id)}
                          className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-100 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* MODAL: ADD DAILY CHORE / EXPENSE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-sky-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Log Daily Chore or Money Transaction</h3>
            <p className="text-xs text-slate-500 mb-4">Record field tasks, daily collection, or company expenses.</p>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Title / Description *</label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Purchased 2 Roll Fiber Optical Drop Wire (1000m)"
                  className="w-full rounded-xl border border-sky-300 bg-sky-50/50 px-3 py-2 text-slate-900 font-medium outline-none focus:border-sky-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Chore Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as DailyChoreType })}
                    className="w-full rounded-xl border border-sky-300 bg-sky-50/50 px-3 py-2 text-slate-900 font-medium outline-none focus:border-sky-600"
                  >
                    <option value="Expense">Expense (💸)</option>
                    <option value="Collection">Collection (💰)</option>
                    <option value="Maintenance Task">Maintenance Task (🔧)</option>
                    <option value="Admin Task">Admin Task (📋)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Amount (PKR)</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full rounded-xl border border-sky-300 bg-sky-50/50 px-3 py-2 text-slate-900 font-mono font-bold outline-none focus:border-sky-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Assigned Staff</label>
                  <select
                    value={form.assignedStaff}
                    onChange={(e) => setForm({ ...form, assignedStaff: e.target.value })}
                    className="w-full rounded-xl border border-sky-300 bg-sky-50/50 px-3 py-2 text-slate-900 font-medium outline-none focus:border-sky-600"
                  >
                    {staff.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as DailyChoreStatus })}
                    className="w-full rounded-xl border border-sky-300 bg-sky-50/50 px-3 py-2 text-slate-900 font-medium outline-none focus:border-sky-600"
                  >
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Notes / Invoice #</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Optional details, receipt number, hardware specs..."
                  className="w-full rounded-xl border border-sky-300 bg-sky-50/50 px-3 py-2 text-slate-900 font-medium outline-none focus:border-sky-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-slate-700 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-sky-600 px-4 py-2 font-bold text-white hover:bg-sky-700 shadow-md shadow-sky-600/20"
                >
                  Save Chore Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
