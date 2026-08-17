"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { useWisp } from "@/context/WispContext";
import { Staff } from "@/types/wisp";
import {
  UserCheck,
  UserPlus,
  Edit,
  Trash2,
  Phone,
  Wrench,
  DollarSign,
  X,
  CheckCircle2,
  Shield,
  MapPin,
  FileText
} from "lucide-react";

export default function StaffPage() {
  const { staff, complaints, dailyChores, addStaff, updateStaff, deleteStaff } = useWisp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [role, setRole] = useState<Staff["role"]>("Field Technician");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<Staff["status"]>("Active");
  const [assignedArea, setAssignedArea] = useState("Saeela");
  const [notes, setNotes] = useState("");

  const openAddModal = () => {
    setEditingStaff(null);
    setName("");
    setRole("Field Technician");
    setPhone("");
    setStatus("Active");
    setAssignedArea("Saeela");
    setNotes("");
    setIsModalOpen(true);
  };

  const openEditModal = (member: Staff) => {
    setEditingStaff(member);
    setName(member.name);
    setRole(member.role);
    setPhone(member.phone);
    setStatus(member.status);
    setAssignedArea(member.assignedArea || "Saeela");
    setNotes(member.notes || "");
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    if (editingStaff) {
      updateStaff({
        ...editingStaff,
        name: name.trim(),
        role,
        phone: phone.trim(),
        status,
        assignedArea,
        notes: notes.trim(),
      });
    } else {
      addStaff({
        name: name.trim(),
        role,
        phone: phone.trim(),
        status,
        assignedArea,
        notes: notes.trim(),
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, staffName: string) => {
    if (confirm(`Are you sure you want to remove "${staffName}" from staff list?`)) {
      deleteStaff(id);
    }
  };

  return (
    <main className="flex-1 pb-12 bg-slate-50 min-h-screen text-slate-900">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 pt-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-sky-200 pb-5 gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-sky-700 font-extrabold flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-sky-600" /> Human Resources & Field Team
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
              Staff & Technicians Management
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Add new technicians, edit existing staff details, assign sectors, and monitor field collection performance.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-600/20 hover:bg-sky-700 transition"
          >
            <UserPlus className="h-4 w-4" /> + Add New Technician
          </button>
        </div>

        {/* Staff Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                className="rounded-2xl border border-sky-200 bg-white p-5 shadow-md hover:border-sky-400 transition space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-600 font-black text-white text-sm shadow-md shadow-sky-600/20">
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          {member.name}
                        </h3>
                        <span className="inline-block rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-extrabold text-sky-800 border border-sky-200 mt-0.5">
                          {member.role}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(member)}
                        title="Edit Technician"
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-sky-100 hover:text-sky-700 transition"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id, member.name)}
                        title="Delete Technician"
                        className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-sky-100 pt-3 text-xs text-slate-800 font-medium">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-sky-600" /> Contact Phone:
                      </span>
                      <span className="font-mono font-bold text-slate-900">{member.phone}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold flex items-center gap-1.5">
                        <Wrench className="h-3.5 w-3.5 text-rose-500" /> Active Tickets:
                      </span>
                      <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {activeTickets} Open
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5 text-emerald-600" /> Cash Collected Today:
                      </span>
                      <span className="font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        PKR {totalCollected.toLocaleString()}
                      </span>
                    </div>

                    {member.assignedArea && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-slate-500 font-bold flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-amber-600" /> Primary Sector:
                        </span>
                        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {member.assignedArea}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-sky-100 pt-3 flex items-center justify-between text-[11px]">
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-extrabold border ${
                      member.status === "Active"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : "bg-amber-100 text-amber-800 border-amber-300"
                    }`}
                  >
                    ● {member.status}
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">ID: {member.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Technician Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-sky-200 bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white font-bold">
                  {editingStaff ? <Edit className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {editingStaff ? `Edit Staff: ${editingStaff.name}` : "Add New Technician / Staff"}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {editingStaff ? "Update technician contact and role assignment." : "Create new team profile for ticketing and cash collections."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Name / Technician Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ali Technician"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-sky-200 bg-sky-50/50 p-2.5 text-slate-900 outline-none focus:border-sky-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Staff Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Staff["role"])}
                    className="w-full rounded-xl border border-sky-200 bg-sky-50/50 p-2.5 text-slate-900 outline-none focus:border-sky-600 focus:bg-white font-semibold"
                  >
                    <option value="Field Technician">Field Technician</option>
                    <option value="Admin">Admin / Supervisor</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Collector">Cash Collector</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Work Status *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Staff["status"])}
                    className="w-full rounded-xl border border-sky-200 bg-sky-50/50 p-2.5 text-slate-900 outline-none focus:border-sky-600 focus:bg-white font-semibold"
                  >
                    <option value="Active">Active Duty</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Mobile / Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="0300-1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-sky-200 bg-sky-50/50 p-2.5 font-mono text-slate-900 outline-none focus:border-sky-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Primary Sector Area</label>
                  <select
                    value={assignedArea}
                    onChange={(e) => setAssignedArea(e.target.value)}
                    className="w-full rounded-xl border border-sky-200 bg-sky-50/50 p-2.5 text-slate-900 outline-none focus:border-sky-600 focus:bg-white font-semibold"
                  >
                    <option value="Saeela">Saeela</option>
                    <option value="Nougran">Nougran</option>
                    <option value="Arsal Town">Arsal Town</option>
                    <option value="All Sectors">All Sectors</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Notes / Field Specialization</label>
                <input
                  type="text"
                  placeholder="e.g. Fiber Splicer & Joint Box Expert"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-sky-200 bg-sky-50/50 p-2.5 text-slate-900 outline-none focus:border-sky-600 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-sky-700"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {editingStaff ? "Save Changes" : "Create Technician"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
