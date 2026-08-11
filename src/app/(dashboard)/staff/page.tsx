"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import { useWisp } from "@/context/WispContext";
import { UserCheck, Shield, Phone, Wrench, DollarSign, CheckCircle2 } from "lucide-react";

export default function StaffPage() {
  const { staff, complaints, dailyChores } = useWisp();

  return (
    <main className="flex-1 pb-12 bg-slate-50 min-h-screen text-slate-900">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 pt-6 space-y-6">
        <div className="border-b border-sky-200 pb-5">
          <div className="text-xs uppercase tracking-widest text-sky-700 font-extrabold">
            Human Resources
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
            Staff & Field Technicians Directory
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            View team members, active ticket assignments, daily cash collections, and contact details.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((member) => {
            const activeTickets = complaints.filter(
              (c) => c.assignedStaff.includes(member.name) && (c.status === "Open" || c.status === "In Progress")
            ).length;

            const totalCollected = dailyChores
              .filter((d) => d.assignedStaff.includes(member.name) && d.type === "Collection" && d.status === "Completed")
              .reduce((acc, d) => acc + (d.amount || 0), 0);

            return (
              <div
                key={member.id}
                className="rounded-2xl border border-sky-200 bg-white p-5 shadow-md hover:border-sky-500 transition space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 font-extrabold text-sky-800 border border-sky-200">
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{member.name}</h3>
                      <p className="text-[11px] text-sky-700 font-extrabold">{member.role}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">
                    {member.status}
                  </span>
                </div>

                <div className="space-y-2 border-t border-sky-100 pt-3 text-xs text-slate-800 font-medium">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-sky-600" /> Phone:
                    </span>
                    <span className="font-mono font-bold text-slate-900">{member.phone}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold flex items-center gap-1.5">
                      <Wrench className="h-3.5 w-3.5 text-rose-500" /> Assigned Tickets:
                    </span>
                    <span className="font-bold text-rose-600">{activeTickets} Active</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-600" /> Collected Today:
                    </span>
                    <span className="font-mono font-black text-emerald-700">
                      PKR {totalCollected.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
