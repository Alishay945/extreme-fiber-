"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { useWisp } from "@/context/WispContext";
import { Package, Wifi, Plus, Users, Zap, Check } from "lucide-react";

export default function PackagesPage() {
  const { packages, customers, addPackage } = useWisp();
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    speedMbps: 30,
    monthlyPrice: 3000,
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || form.speedMbps <= 0) return;
    addPackage(form);
    setShowAddModal(false);
    setForm({ name: "", speedMbps: 30, monthlyPrice: 3000, description: "" });
  };

  return (
    <main className="flex-1 pb-12 bg-slate-50 min-h-screen text-slate-900">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 pt-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-200 pb-5">
          <div>
            <div className="text-xs uppercase tracking-widest text-sky-700 font-extrabold">
              Bandwidth Tiers
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
              Internet Package Plans
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Manage speeds (Mbps), monthly pricing tariffs, and view subscriber allocation per tier.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-600/20 transition hover:bg-sky-700"
          >
            <Plus className="h-4 w-4" /> Create Package Plan
          </button>
        </div>

        {/* Package Grid Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {packages.map((pkg) => {
            const count = customers.filter((c) => c.packageId === pkg.id).length;

            return (
              <div
                key={pkg.id}
                className="relative overflow-hidden rounded-2xl border border-sky-200 bg-white p-5 shadow-md hover:border-sky-500 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-sky-700 font-extrabold uppercase">
                      {pkg.id}
                    </span>
                    <span className="rounded-full bg-sky-100 text-sky-900 border border-sky-200 px-2.5 py-0.5 font-bold text-xs">
                      {pkg.speedMbps} Mbps
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-bold text-slate-900">{pkg.name}</h3>
                  <p className="mt-1 text-xs text-slate-600 font-medium min-h-[36px]">{pkg.description}</p>

                  <div className="mt-4 border-t border-b border-sky-100 py-3">
                    <div className="text-2xl font-black text-emerald-700 font-mono">
                      PKR {pkg.monthlyPrice.toLocaleString()}
                      <span className="text-xs font-normal text-slate-500">/month</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-700 font-semibold">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Users className="h-4 w-4 text-sky-600" />
                    {count || pkg.subscriberCount} Active Users
                  </span>
                  <span className="text-emerald-700 font-bold text-[11px]">Unlimited Fiber</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: ADD PACKAGE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-sky-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Create Internet Package Tier</h3>
            <p className="text-xs text-slate-500 mb-4">Define speed and monthly tariff rate.</p>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Plan Name *</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Gamer Speed Max"
                  className="w-full rounded-xl border border-sky-300 bg-sky-50/50 px-3 py-2 text-slate-900 font-medium outline-none focus:border-sky-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Speed (Mbps) *</label>
                  <input
                    required
                    type="number"
                    value={form.speedMbps}
                    onChange={(e) => setForm({ ...form, speedMbps: Number(e.target.value) })}
                    className="w-full rounded-xl border border-sky-300 bg-sky-50/50 px-3 py-2 text-slate-900 font-mono font-bold outline-none focus:border-sky-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Monthly Price (PKR) *</label>
                  <input
                    required
                    type="number"
                    value={form.monthlyPrice}
                    onChange={(e) => setForm({ ...form, monthlyPrice: Number(e.target.value) })}
                    className="w-full rounded-xl border border-sky-300 bg-sky-50/50 px-3 py-2 text-slate-900 font-mono font-bold outline-none focus:border-sky-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Plan Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief feature description..."
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
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
