"use client";

import React from "react";
import { Complaint } from "@/types/wisp";
import { Wrench, Printer, X, ShieldAlert, Share2 } from "lucide-react";

interface ComplaintSlipModalProps {
  complaint: Complaint | null;
  onClose: () => void;
}

export default function ComplaintSlipModal({ complaint, onClose }: ComplaintSlipModalProps) {
  if (!complaint) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `🚨 *EXTREME FIBER - TECHNICAL COMPLAINT SLIP* 🚨
----------------------------------------
🎫 *Ticket ID:* ${complaint.id}
👤 *Customer:* ${complaint.customerName} (${complaint.customerId})
📞 *Phone:* ${complaint.phone || "Not provided"}
📍 *Address/Sector:* ${complaint.address}
⚠️ *Category:* ${complaint.category}
🔥 *Priority:* ${complaint.priority}
📌 *Status:* ${complaint.status}
🛠️ *Assigned Tech:* ${complaint.assignedStaff}
----------------------------------------
📝 *Description:*
${complaint.description}
${complaint.resolutionNotes ? `\n✅ *Resolution Notes:* ${complaint.resolutionNotes}` : ""}
----------------------------------------
⏰ *Filed Date:* ${complaint.createdAt}
----------------------------------------
Extreme Fiber Helpdesk 0300-888-FIBER`;

    const encodedText = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, "_blank");
  };

  return (
    <div
      id="printable-complaint-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs print:bg-white print:p-0 print:static print:inset-auto print:block"
    >
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
          }
          body > * {
            visibility: hidden !important;
          }
          #printable-complaint-backdrop {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
            visibility: visible !important;
            box-shadow: none !important;
          }
          #printable-complaint-container,
          #printable-complaint-container * {
            visibility: visible !important;
          }
          #printable-complaint-container {
            position: relative !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 12px !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: 1px solid #94a3b8 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          .print\:hidden {
            display: none !important;
          }
        }
      `}</style>

      <div
        id="printable-complaint-container"
        className="relative w-full max-w-lg rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl text-slate-900"
      >
        {/* Header Controls - Hidden during print */}
        <div className="mb-4 flex items-center justify-between border-b border-rose-100 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-600" />
            <h3 className="font-bold text-slate-900 text-sm">Complaint Voucher & Tech Dispatch Slip</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
              title="Share ticket to WhatsApp Group"
            >
              <Share2 className="h-3.5 w-3.5" />
              WhatsApp Group
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700"
            >
              <Printer className="h-4 w-4" />
              Print Slip
            </button>
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Complaint Slip Body */}
        <div className="space-y-4 text-slate-900">
          {/* Company & Ticket Branding */}
          <div className="flex items-start justify-between border-b border-slate-300 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-600 text-white font-black text-xl shadow-md">
                <Wrench className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">
                  EXTREME FIBER
                </h2>
                <p className="text-xs text-rose-700 font-extrabold">
                  Technical Service & Outage Support
                </p>
                <p className="text-[10px] text-slate-600 font-medium">
                  Helpdesk: 0300-888-FIBER | Field Ticket Slip
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-block rounded-lg bg-rose-100 border border-rose-300 px-2.5 py-1 text-xs font-mono font-bold text-rose-900">
                #{complaint.id}
              </div>
              <p className="mt-1 text-[11px] text-slate-600 font-semibold">
                Filed: {complaint.createdAt}
              </p>
            </div>
          </div>

          {/* Customer & Location Details */}
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-300 bg-slate-50 p-3.5 text-xs">
            <div>
              <p className="text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                Subscriber Details
              </p>
              <p className="mt-1 font-black text-slate-900 text-sm">
                {complaint.customerName}
              </p>
              <p className="mt-0.5 text-rose-800 font-mono font-bold">
                User ID: {complaint.customerId}
              </p>
              <p className="mt-0.5 text-slate-700 font-semibold">Phone: {complaint.phone || "N/A"}</p>
              <p className="mt-0.5 text-slate-600 font-medium">Address: {complaint.address}</p>
            </div>

            <div className="text-right">
              <p className="text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                Ticket Parameters
              </p>
              <p className="mt-1 font-bold text-slate-900">
                Category: <span className="text-rose-900 font-black">{complaint.category}</span>
              </p>
              <p className="mt-0.5 text-slate-700 font-medium">
                Priority: <span className="font-bold">{complaint.priority}</span>
              </p>
              <p className="mt-0.5 text-slate-700 font-medium">
                Assigned Tech: <span className="font-bold text-slate-900">{complaint.assignedStaff}</span>
              </p>
              <p className="mt-0.5 text-slate-600 font-semibold">
                Status: <span className="font-bold uppercase text-rose-700">{complaint.status}</span>
              </p>
            </div>
          </div>

          {/* Issue Description Box */}
          <div className="rounded-xl border border-slate-300 bg-rose-50/40 p-3 space-y-1">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-rose-900">
              Reported Issue Description:
            </p>
            <p className="text-xs text-slate-900 font-medium leading-relaxed">
              {complaint.description}
            </p>
          </div>

          {/* Resolution & Technician Work Notes */}
          <div className="rounded-xl border-2 border-dashed border-slate-300 p-3 min-h-[70px]">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Technician Field Notes & Action Taken:
            </p>
            {complaint.resolutionNotes ? (
              <p className="mt-1 text-xs text-slate-900 font-semibold">
                {complaint.resolutionNotes}
              </p>
            ) : (
              <p className="mt-4 text-[10px] text-slate-400 italic">
                (To be filled by field technician upon resolving connection)
              </p>
            )}
          </div>

          {/* Signatures & Footer */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-left text-[11px] text-slate-600 font-semibold">
              <div className="h-6 border-b border-slate-400 w-28 mb-1"></div>
              <p>Subscriber Signature</p>
            </div>

            <div className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-1 text-center">
              <span className="text-[10px] font-black uppercase text-rose-900">
                Official Support Ticket
              </span>
            </div>

            <div className="text-right text-[11px] text-slate-600 font-semibold">
              <div className="h-6 border-b border-slate-400 w-28 ml-auto mb-1"></div>
              <p>Field Tech Signature</p>
            </div>
          </div>

          <div className="border-t border-slate-300 pt-2 text-center text-[10px] text-slate-600 font-semibold">
            Extreme Fiber Technical Support • Emergency Line: 0300-888-FIBER
          </div>
        </div>
      </div>
    </div>
  );
}
