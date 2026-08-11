"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { useWisp } from "@/context/WispContext";
import {
  AlertCircle,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Wrench,
  UserCheck,
  Edit,
  X,
  MessageSquare,
  ShieldAlert,
  Printer,
  Share2,
} from "lucide-react";
import { ComplaintStatus, ComplaintPriority, ComplaintCategory, Customer, Complaint } from "@/types/wisp";
import QuickPhoneWhatsAppModal from "@/components/QuickPhoneWhatsAppModal";
import ComplaintSlipModal from "@/components/ComplaintSlipModal";

export default function ComplaintsPage() {
  const { complaints, customers, staff, addComplaint, updateComplaintStatus } = useWisp();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [resolutionNotesInput, setResolutionNotesInput] = useState("");
  const [waCustomer, setWaCustomer] = useState<Customer | null>(null);
  const [techInput, setTechInput] = useState("");
  const [selectedComplaintForSlip, setSelectedComplaintForSlip] = useState<Complaint | null>(null);

  const handleShareComplaintToWhatsApp = (tkt: Complaint) => {
    const text = `🚨 *EXTREME FIBER - TECHNICAL COMPLAINT SLIP* 🚨
----------------------------------------
🎫 *Ticket ID:* ${tkt.id}
👤 *Customer:* ${tkt.customerName} (${tkt.customerId})
📞 *Phone:* ${tkt.phone || "Not provided"}
📍 *Address/Sector:* ${tkt.address}
⚠️ *Category:* ${tkt.category}
🔥 *Priority:* ${tkt.priority}
📌 *Status:* ${tkt.status}
🛠️ *Assigned Tech:* ${tkt.assignedStaff}
----------------------------------------
📝 *Description:*
${tkt.description}
${tkt.resolutionNotes ? `\n✅ *Resolution Notes:* ${tkt.resolutionNotes}` : ""}
----------------------------------------
⏰ *Filed Date:* ${tkt.createdAt}
----------------------------------------
Extreme Fiber Helpdesk 0300-888-FIBER`;

    const encodedText = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, "_blank");
  };

  const [form, setForm] = useState({
    customerId: customers[0]?.id || "",
    category: "No Internet" as ComplaintCategory,
    description: "",
    priority: "Medium" as ComplaintPriority,
    assignedStaff: staff.find((s) => s.role === "Field Technician")?.name || "Ali Technician",
  });

  // Filtered Tickets
  const filteredComplaints = complaints.filter((t) => {
    const matchesSearch =
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.includes(searchQuery) ||
      t.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "ALL" || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || !form.description) return;
    const cust = customers.find((c) => c.id === form.customerId);

    addComplaint({
      customerId: form.customerId,
      customerName: cust ? cust.name : "Subscriber",
      phone: cust ? cust.phone : "",
      address: cust ? cust.address : "",
      category: form.category,
      description: form.description,
      priority: form.priority,
      status: "Open",
      assignedStaff: form.assignedStaff,
    });

    setShowAddModal(false);
    setForm({
      customerId: customers[0]?.id || "",
      category: "No Internet",
      description: "",
      priority: "Medium",
      assignedStaff: staff.find((s) => s.role === "Field Technician")?.name || "Ali Technician",
    });
  };

  const handleUpdateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicketId) return;
    const currentTicket = complaints.find((c) => c.id === editingTicketId);
    if (currentTicket) {
      updateComplaintStatus(
        editingTicketId,
        currentTicket.status,
        resolutionNotesInput,
        techInput
      );
    }
    setEditingTicketId(null);
  };

  return (
    <main className="flex-1 pb-12 bg-slate-50 min-h-screen text-slate-900">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenNewComplaintModal={() => setShowAddModal(true)}
      />

      <div className="mx-auto max-w-7xl px-6 pt-6 space-y-6">
        {/* Title Bar & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-200 pb-5">
          <div>
            <div className="text-xs uppercase tracking-widest text-sky-700 font-extrabold">
              Helpdesk & Field Support
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
              User Complaints & Technical Tickets
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Manage technical outages, LOS red lights, fiber line cuts, speed issues, and technician dispatches.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-600/20 transition hover:bg-rose-700"
          >
            <Plus className="h-4 w-4" /> Log Complaint Ticket
          </button>
        </div>

        {/* Status Count Badges */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-rose-200 bg-white p-4 shadow-sm border-l-4 border-l-rose-500">
            <span className="text-xs text-slate-500 uppercase font-extrabold">Open Tickets</span>
            <div className="mt-2 text-2xl font-black text-rose-600">
              {complaints.filter((c) => c.status === "Open").length}
            </div>
            <p className="mt-1 text-[11px] text-slate-500 font-semibold">Awaiting technician visit</p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm border-l-4 border-l-amber-500">
            <span className="text-xs text-slate-500 uppercase font-extrabold">In Progress</span>
            <div className="mt-2 text-2xl font-black text-amber-600">
              {complaints.filter((c) => c.status === "In Progress").length}
            </div>
            <p className="mt-1 text-[11px] text-slate-500 font-semibold">Tech currently working</p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm border-l-4 border-l-emerald-500">
            <span className="text-xs text-slate-500 uppercase font-extrabold">Resolved Today</span>
            <div className="mt-2 text-2xl font-black text-emerald-600">
              {complaints.filter((c) => c.status === "Resolved" || c.status === "Closed").length}
            </div>
            <p className="mt-1 text-[11px] text-slate-500 font-semibold">Successfully restored</p>
          </div>

          <div className="rounded-2xl border border-sky-200 bg-white p-4 shadow-sm border-l-4 border-l-sky-600">
            <span className="text-xs text-slate-500 uppercase font-extrabold">Critical Outages</span>
            <div className="mt-2 text-2xl font-black text-slate-900">
              {complaints.filter((c) => c.priority === "Critical").length}
            </div>
            <p className="mt-1 text-[11px] text-sky-700 font-bold">Fiber joint breaks</p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-600 font-bold mr-1">Status Filter:</span>
            {["ALL", "Open", "In Progress", "Resolved", "Closed"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  statusFilter === s
                    ? "bg-sky-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-sky-100 hover:text-sky-900"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-bold">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-xl border border-sky-300 bg-sky-50/50 px-3 py-1.5 text-xs text-slate-900 font-medium outline-none focus:border-sky-600"
            >
              <option value="ALL">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Complaints Data Table */}
        <div className="rounded-2xl border border-sky-200 bg-white shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-sky-200 bg-sky-50 text-sky-950 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5">Ticket ID & Created</th>
                  <th className="px-4 py-3.5">Subscriber & Address</th>
                  <th className="px-4 py-3.5">Category & Description</th>
                  <th className="px-4 py-3.5">Priority</th>
                  <th className="px-4 py-3.5">Status (Dropdown)</th>
                  <th className="px-4 py-3.5">Assigned Tech</th>
                  <th className="px-4 py-3.5 text-right">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100 text-slate-800">
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 font-semibold">
                      No complaint tickets found matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((tkt) => (
                    <tr key={tkt.id} className="hover:bg-sky-50/60 transition group">
                      {/* Ticket ID */}
                      <td className="px-4 py-3.5 font-mono">
                        <div className="font-bold text-sky-700 text-xs">{tkt.id}</div>
                        <div className="text-[10px] text-slate-500 font-medium">{tkt.createdAt}</div>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 group-hover:text-sky-700">
                          {tkt.customerName}
                        </div>
                        <div className="text-[10px] font-mono text-sky-700 font-bold">ID: {tkt.customerId}</div>
                        <div className="mt-0.5">
                          <button
                            onClick={() => {
                              const existing = customers.find((c) => c.id === tkt.customerId);
                              setWaCustomer(
                                existing || {
                                  id: tkt.customerId,
                                  name: tkt.customerName,
                                  phone: tkt.phone,
                                  cnic: "",
                                  address: tkt.address,
                                  area: "Saeela",
                                  packageId: "PKG-20M",
                                  packageName: "20M Fiber Plan",
                                  monthlyFee: 2500,
                                  status: "Active",
                                  installationDate: "",
                                  dueAmount: 0,
                                }
                              );
                            }}
                            className="inline-flex items-center gap-1 text-[10px] text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300 transition"
                            title="Click to edit phone or send WhatsApp message"
                          >
                            <MessageSquare className="h-3 w-3 text-emerald-600" />
                            <span>{tkt.phone || "Add Phone"}</span>
                            <Edit className="h-2.5 w-2.5 text-emerald-600" />
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">{tkt.address}</div>
                      </td>

                      {/* Category & Description */}
                      <td className="px-4 py-3.5 max-w-xs">
                        <span className="rounded-full bg-sky-100 border border-sky-200 text-sky-900 text-[10px] font-bold px-2 py-0.5">
                          {tkt.category}
                        </span>
                        <p className="mt-1 text-slate-800 font-medium line-clamp-2">{tkt.description}</p>
                        {tkt.resolutionNotes && (
                          <div className="mt-1 text-[10px] text-emerald-800 font-bold italic bg-emerald-50 p-1.5 rounded-lg border border-emerald-200">
                            Resolution: {tkt.resolutionNotes}
                          </div>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                            tkt.priority === "Critical"
                              ? "bg-rose-100 text-rose-800 border-rose-300"
                              : tkt.priority === "High"
                              ? "bg-amber-100 text-amber-800 border-amber-300"
                              : "bg-sky-100 text-sky-800 border-sky-300"
                          }`}
                        >
                          {tkt.priority}
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="px-4 py-3.5">
                        <select
                          value={tkt.status}
                          onChange={(e) =>
                            updateComplaintStatus(tkt.id, e.target.value as ComplaintStatus)
                          }
                          className={`rounded-xl border px-2.5 py-1 text-xs font-bold outline-none cursor-pointer ${
                            tkt.status === "Open"
                              ? "border-rose-300 bg-rose-50 text-rose-800"
                              : tkt.status === "In Progress"
                              ? "border-amber-300 bg-amber-50 text-amber-800"
                              : "border-emerald-300 bg-emerald-50 text-emerald-800"
                          }`}
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>

                      {/* Assigned Tech */}
                      <td className="px-4 py-3.5 font-bold text-slate-800">
                        {tkt.assignedStaff}
                      </td>

                      {/* Actions, Print Slip & WhatsApp Group */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedComplaintForSlip(tkt)}
                            className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-600 hover:text-white transition shadow-xs"
                            title="Print Technical Complaint Slip Voucher"
                          >
                            <Printer className="h-3 w-3" />
                            <span>Print Slip</span>
                          </button>

                          <button
                            onClick={() => handleShareComplaintToWhatsApp(tkt)}
                            className="inline-flex items-center gap-1 rounded-xl border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-600 hover:text-white transition shadow-xs"
                            title="Share Ticket to WhatsApp Group"
                          >
                            <Share2 className="h-3 w-3" />
                            <span>Share Group</span>
                          </button>

                          <button
                            onClick={() => {
                              setEditingTicketId(tkt.id);
                              setResolutionNotesInput(tkt.resolutionNotes || "");
                              setTechInput(tkt.assignedStaff);
                            }}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-sky-100 hover:text-sky-900 transition"
                          >
                            Edit
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
      </div>

      {/* MODAL 1: LOG NEW COMPLAINT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-sky-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Log User Complaint Ticket</h3>
            <p className="text-xs text-slate-500 mb-4">Create ticket for technician dispatch.</p>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Subscriber *</label>
                <select
                  value={form.customerId}
                  onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                  className="w-full rounded-xl border border-sky-300 bg-sky-50/50 px-3 py-2 text-slate-900 font-medium outline-none focus:border-sky-600"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id}) - Area: {c.area}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full rounded-xl border border-sky-300 bg-sky-50/50 px-3 py-2 text-slate-900 font-medium outline-none focus:border-sky-600"
                  >
                    <option value="No Internet">No Internet (LOS Red Light)</option>
                    <option value="Slow Speed">Slow Speed / High Ping</option>
                    <option value="Fiber Wire Cut">Fiber Wire Cut</option>
                    <option value="Router Fault">Router / ONU Fault</option>
                    <option value="Billing Discrepancy">Billing Issue</option>
                    <option value="Relocation">Connection Relocation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                    className="w-full rounded-xl border border-sky-300 bg-sky-50/50 px-3 py-2 text-slate-900 font-medium outline-none focus:border-sky-600"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Issue Description *</label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Details of complaint reported..."
                  className="w-full rounded-xl border border-sky-300 bg-sky-50/50 px-3 py-2 text-slate-900 font-medium outline-none focus:border-sky-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Assigned Technician</label>
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
                  className="rounded-xl bg-rose-600 px-4 py-2 font-bold text-white hover:bg-rose-700 shadow-md shadow-rose-600/20"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT RESOLUTION NOTES */}
      {editingTicketId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-sky-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Update Ticket ({editingTicketId})</h3>
            <p className="text-xs text-slate-500 mb-4">Add resolution details or reassign technician.</p>

            <form onSubmit={handleUpdateTicketSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Reassign Technician</label>
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  className="w-full rounded-xl border border-sky-300 bg-sky-50/50 px-3 py-2 text-slate-900 font-medium outline-none focus:border-sky-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Resolution / Technical Notes</label>
                <textarea
                  rows={3}
                  value={resolutionNotesInput}
                  onChange={(e) => setResolutionNotesInput(e.target.value)}
                  placeholder="e.g. Spliced 4-core fiber wire with new joint box..."
                  className="w-full rounded-xl border border-sky-300 bg-sky-50/50 px-3 py-2 text-slate-900 font-medium outline-none focus:border-sky-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => setEditingTicketId(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-slate-700 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-sky-600 px-4 py-2 font-bold text-white hover:bg-sky-700 shadow-md shadow-sky-600/20"
                >
                  Save Notes
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

      {/* --- PRINTABLE COMPLAINT SLIP VOUCHER MODAL --- */}
      <ComplaintSlipModal
        complaint={selectedComplaintForSlip}
        onClose={() => setSelectedComplaintForSlip(null)}
      />
    </main>
  );
}
