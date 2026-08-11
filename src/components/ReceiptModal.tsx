"use client";

import React from "react";
import { useWisp } from "@/context/WispContext";
import { CheckCircle2, Printer, X, Wifi, ShieldCheck, AlertCircle } from "lucide-react";

export default function ReceiptModal() {
  const { selectedReceipt, setSelectedReceipt, customers } = useWisp();

  if (!selectedReceipt) return null;

  const customer = customers.find((c) => c.id === selectedReceipt.customerId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="printable-receipt-backdrop"
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
          #printable-receipt-backdrop {
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
          #printable-receipt-container,
          #printable-receipt-container * {
            visibility: visible !important;
          }
          #printable-receipt-container {
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
        id="printable-receipt-container"
        className="relative w-full max-w-lg rounded-2xl border border-sky-200 bg-white p-6 shadow-2xl text-slate-900"
      >
        {/* Modal Header Controls - Hidden during print */}
        <div className="mb-4 flex items-center justify-between border-b border-sky-100 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Official Payment Receipt (Single Copy)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-sky-700"
            >
              <Printer className="h-4 w-4" />
              Print Single Receipt
            </button>
            <button
              onClick={() => setSelectedReceipt(null)}
              className="rounded-xl border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Content */}
        <div className="space-y-4 text-slate-900">
          {/* Brand Header */}
          <div className="flex items-start justify-between border-b border-slate-300 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-white font-black text-xl shadow-md">
                <Wifi className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">
                  EXTREME FIBER
                </h2>
                <p className="text-xs text-sky-700 font-extrabold">
                  High Speed Optical Fiber Network
                </p>
                <p className="text-[10px] text-slate-600 font-medium">
                  Helpdesk: 0300-888-FIBER | Receipt Voucher
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-block rounded-lg bg-sky-100 border border-sky-300 px-2.5 py-1 text-xs font-mono font-bold text-sky-900">
                #{selectedReceipt.receiptNumber}
              </div>
              <p className="mt-1 text-[11px] text-slate-600 font-semibold">
                Date: {selectedReceipt.paymentDate}
              </p>
            </div>
          </div>

          {/* Customer & Subscriber Info */}
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-300 bg-slate-50 p-3.5 text-xs">
            <div>
              <p className="text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                Subscriber Info
              </p>
              <p className="mt-1 font-black text-slate-900 text-sm">
                {selectedReceipt.customerName}
              </p>
              <p className="mt-0.5 text-sky-800 font-mono font-bold">
                User ID: {selectedReceipt.customerId}
              </p>
              {customer && (
                <>
                  <p className="mt-0.5 text-slate-700 font-semibold">Phone: {customer.phone}</p>
                  <p className="mt-0.5 text-slate-600 font-medium">Sector: {customer.area}</p>
                </>
              )}
            </div>
            <div className="text-right">
              <p className="text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                Billing Details
              </p>
              <p className="mt-1 font-bold text-slate-900">
                Month: <span className="text-sky-900 font-black">{selectedReceipt.paymentMonth}</span>
              </p>
              <p className="mt-0.5 text-slate-700 font-medium">
                Plan: {selectedReceipt.packageName}
              </p>
              <p className="mt-0.5 text-slate-700 font-medium">
                Method: {selectedReceipt.paymentMethod}
              </p>
              <p className="mt-0.5 text-slate-600 font-semibold">
                By: {selectedReceipt.receivedBy}
              </p>
            </div>
          </div>

          {/* FINANCIAL SUMMARY BOX: TOTAL BILL, MONEY RECEIVED, REMAINING DUES */}
          <div className="rounded-xl border-2 border-slate-300 bg-sky-50/50 p-3 space-y-2">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 text-center border-b border-slate-200 pb-1">
              Financial Payment Summary (Hisab Kitab)
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white p-2 rounded-lg border border-slate-300">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">1. Total Bill</span>
                <span className="text-sm font-black font-mono text-slate-900">
                  PKR {selectedReceipt.monthlyDues.toLocaleString()}
                </span>
              </div>

              <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-300">
                <span className="text-[10px] text-emerald-800 font-bold uppercase block">2. Money Paid (Wasool)</span>
                <span className="text-sm font-black font-mono text-emerald-700">
                  PKR {selectedReceipt.amountPaid.toLocaleString()}
                </span>
              </div>

              <div className={`p-2 rounded-lg border ${selectedReceipt.remainingDues > 0 ? "bg-amber-50 border-amber-300 text-amber-900" : "bg-slate-100 border-slate-300 text-slate-700"}`}>
                <span className="text-[10px] font-bold uppercase block">3. Remaining (Baqaya)</span>
                <span className="text-sm font-black font-mono">
                  PKR {selectedReceipt.remainingDues.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Stamp & Verification */}
          <div className="flex items-center justify-between pt-1">
            <div className="rounded-xl border-2 border-dashed border-emerald-600 bg-emerald-50 px-4 py-1.5 text-center rotate-[-2deg]">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-800">
                {selectedReceipt.remainingDues === 0 ? "PAID IN FULL" : "PARTIAL PAYMENT"}
              </span>
              <p className="text-[9px] text-emerald-700 font-bold">Extreme Fiber Verified</p>
            </div>
            <div className="text-right text-[11px] text-slate-600 font-semibold">
              <div className="h-6 border-b border-slate-400 w-28 ml-auto mb-1"></div>
              <p>Authorized Receiver Stamp</p>
            </div>
          </div>

          <div className="border-t border-slate-300 pt-2 text-center text-[10px] text-slate-600 font-semibold">
            Thank you for choosing Extreme Fiber. Please clear all monthly dues by the 10th of every month.
          </div>
        </div>
      </div>
    </div>
  );
}
