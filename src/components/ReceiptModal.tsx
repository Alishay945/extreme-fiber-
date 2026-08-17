"use client";

import React from "react";
import { useWisp } from "@/context/WispContext";
import { Printer, X, ShieldCheck, MessageCircle } from "lucide-react";

import AuthorizedStamp from "@/components/AuthorizedStamp";

export default function ReceiptModal() {
  const { selectedReceipt, setSelectedReceipt, customers } = useWisp();

  if (!selectedReceipt) return null;

  const customer = customers.find((c) => c.id === selectedReceipt.customerId);

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    const rawPhone = customer?.phone || "";
    let cleanPhone = rawPhone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "92" + cleanPhone.substring(1);
    }

    const messageText = `🧾 *EXTREME FIBER (SMC-PVT) LTD*
*OFFICIAL INVOICE RECEIPT*

*Receipt No:* ${selectedReceipt.receiptNumber.replace(/^#/, "")}
*Date:* ${selectedReceipt.paymentDate}
*Customer Name:* ${selectedReceipt.customerName}
*Phone:* ${customer?.phone || "N/A"}
*Address:* ${customer?.address || customer?.area || "N/A"}

----------------------------------------
*Service Plan:* Internet Package (${selectedReceipt.packageName || "Package"})
*Month:* ${selectedReceipt.paymentMonth}
*Total Amount:* PKR ${selectedReceipt.monthlyDues.toLocaleString()}
*Paid Amount:* PKR ${selectedReceipt.amountPaid.toLocaleString()}
*Balance:* PKR ${selectedReceipt.remainingDues.toLocaleString()}
*Payment Method:* ${selectedReceipt.paymentMethod}
*Received By:* ${selectedReceipt.receivedBy || "Faraz Ahmed"}
----------------------------------------
Thank you for choosing Extreme Fiber!
Helpdesk: 0313 2171069 | 0303 2810006`;

    const encodedMsg = encodeURIComponent(messageText);
    const waUrl = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`
      : `https://api.whatsapp.com/send?text=${encodedMsg}`;

    window.open(waUrl, "_blank");
  };

  return (
    <div
      id="printable-receipt-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs print:bg-white print:p-0 print:fixed print:inset-0 print:block"
    >
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 4mm;
          }
          html, body {
            height: 100% !important;
            max-height: 100vh !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          body > * {
            display: none !important;
          }
          #printable-receipt-backdrop {
            display: flex !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-height: 100vh !important;
            overflow: hidden !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            align-items: flex-start !important;
            justify-content: center !important;
            visibility: visible !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
            page-break-before: avoid !important;
            break-before: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          #printable-receipt-backdrop * {
            visibility: visible !important;
          }
          #printable-receipt-container {
            position: relative !important;
            top: 0 !important;
            left: 0 !important;
            width: 98% !important;
            max-width: 98% !important;
            margin: 0 auto !important;
            padding: 10px !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: 1.5px solid #000000 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .print\:hidden {
            display: none !important;
          }
        }
      `}</style>

      <div
        id="printable-receipt-container"
        className="relative w-full max-w-3xl rounded-xl border border-slate-300 bg-white p-6 shadow-2xl text-slate-900 overflow-hidden"
      >
        {/* Modal Header Controls - Hidden during print */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-red-700" />
            <h3 className="font-bold text-slate-900 text-sm">Official Extreme Fiber Invoice Slip</h3>
          </div>
          <div className="flex items-center gap-2">
            {/* WhatsApp Direct Send Button */}
            <button
              onClick={handleSendWhatsApp}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-700"
              title="Send digital receipt text directly to customer's WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
              Send to WhatsApp
            </button>

            {/* Single Page Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-red-700 px-4 py-1.5 text-xs font-bold text-white shadow-md transition hover:bg-red-800"
            >
              <Printer className="h-4 w-4" />
              Print Receipt (1 Page)
            </button>

            <button
              onClick={() => setSelectedReceipt(null)}
              className="rounded-xl border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Physical Slip Container */}
        <div className="relative border-2 border-slate-800 bg-white p-4 sm:p-5 text-slate-900 rounded-sm">
          {/* Top Maroon Accent Line */}
          <div className="h-1 bg-[#800000] -mx-4 sm:-mx-5 -mt-4 sm:-mt-5 mb-3"></div>

          {/* 1. Header Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2">
            {/* Left: Logo & Red Stamped Number */}
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <svg viewBox="0 0 240 75" className="h-12 w-auto">
                  {/* Outer Black Arc */}
                  <path d="M 45 10 C 12 10, 8 65, 45 65" fill="none" stroke="#111827" strokeWidth="8" strokeLinecap="round" />
                  {/* Inner Red Swoosh */}
                  <path d="M 50 20 C 24 22, 22 55, 60 50 C 78 48, 88 35, 82 25 C 78 16, 62 18, 50 20 Z" fill="#b91c1c" />
                  {/* Fiber Cable Tip & Glow Rays */}
                  <ellipse cx="72" cy="35" rx="7" ry="4" fill="#f87171" transform="rotate(-20 72 35)" />
                  <line x1="80" y1="32" x2="92" y2="28" stroke="#b91c1c" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="82" y1="35" x2="95" y2="35" stroke="#b91c1c" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="80" y1="38" x2="92" y2="42" stroke="#b91c1c" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Text EXTREME FIBER */}
                  <text x="98" y="35" fill="#111827" fontSize="26" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.5">EXTREME</text>
                  <text x="100" y="54" fill="#111827" fontSize="18" fontWeight="800" fontFamily="sans-serif" letterSpacing="3">FIBER</text>
                </svg>
              </div>

              {/* Red Stamped Receipt Number */}
              <div className="ml-1 text-red-600 font-mono font-extrabold text-xl tracking-wide opacity-90 underline decoration-red-400">
                {selectedReceipt.receiptNumber.replace(/^#/, "")}
              </div>
            </div>

            {/* Right: Company Info & Contacts */}
            <div className="text-left sm:text-right text-xs leading-snug font-sans">
              <h2 className="text-sm sm:text-base font-black tracking-tight text-slate-900">
                EXTREME FIBER <span className="text-xs font-bold text-slate-700">(SMC-PVT) LTD</span>
              </h2>
              <p className="text-xs font-bold italic text-[#a81c1c]">
                Internet Services Provider
              </p>
              <p className="mt-1 text-[11px] font-bold text-[#614d18]">
                • Faraz Ahmed: <span className="font-extrabold text-slate-900">0313 2171069</span>
              </p>
              <p className="text-[11px] font-bold text-[#614d18]">
                • Shayan Ahmed: <span className="font-extrabold text-slate-900">0303 2810006</span>
              </p>
            </div>
          </div>

          {/* 2. Maroon Divider Bar */}
          <div className="my-2.5 bg-[#800000] py-1 px-4 text-center text-white font-black text-xs sm:text-sm tracking-widest uppercase shadow-xs">
            ———— INVOICE RECEIPT ————
          </div>

          {/* 3. Slip Content Body (Left Fields & Right Table) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs font-medium text-slate-900 my-3">
            {/* Left Column: Customer Details (5 cols) */}
            <div className="md:col-span-6 space-y-3 pr-0 md:pr-2">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-slate-900 min-w-[110px]">Date:</span>
                <span className="flex-1 border-b border-slate-600 font-mono font-extrabold text-slate-900 pb-0.5 px-1">
                  {selectedReceipt.paymentDate}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-bold text-slate-900 min-w-[110px]">Customer Name:</span>
                <span className="flex-1 border-b border-slate-600 font-black text-slate-900 pb-0.5 px-1 text-sm">
                  {selectedReceipt.customerName}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-bold text-slate-900 min-w-[110px]">Phone:</span>
                <span className="flex-1 border-b border-slate-600 font-mono font-bold text-slate-900 pb-0.5 px-1">
                  {customer?.phone || "03XX-XXXXXXX"}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-bold text-slate-900 min-w-[110px]">Address:</span>
                <span className="flex-1 border-b border-slate-600 font-semibold text-slate-900 pb-0.5 px-1">
                  {customer?.address || customer?.area || "N/A"}
                </span>
              </div>

              <div className="pt-1">
                <span className="font-bold text-slate-900 block mb-1">Payment Method:</span>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-slate-800 border-b border-slate-600 pb-1">
                  {["Cash", "Bank", "Easypaisa", "JazzCash"].map((method) => {
                    const isSelected =
                      selectedReceipt.paymentMethod?.toLowerCase().includes(method.toLowerCase()) ||
                      (method === "Bank" && selectedReceipt.paymentMethod?.toLowerCase().includes("transfer"));
                    return (
                      <span
                        key={method}
                        className={`px-1.5 py-0.5 rounded ${
                          isSelected
                            ? "bg-slate-900 text-white font-extrabold underline"
                            : "text-slate-600"
                        }`}
                      >
                        {isSelected ? `✓ ${method}` : method}
                        {method !== "JazzCash" && <span className="ml-1 text-slate-400 font-normal">/</span>}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Table Dues & Received (6 cols) */}
            <div className="md:col-span-6 flex flex-col justify-between space-y-3">
              <table className="w-full border-collapse border border-slate-800 text-xs">
                <thead>
                  <tr className="bg-[#4e4e54] text-white">
                    <th className="border border-slate-700 px-2 py-1.5 text-left font-bold w-5/12">Service Plan</th>
                    <th className="border border-slate-700 px-2 py-1.5 text-center font-bold w-3/12">Month</th>
                    <th className="border border-slate-700 px-2 py-1.5 text-right font-bold w-4/12">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-400">
                  <tr>
                    <td className="border border-slate-600 px-2 py-1.5 font-bold text-slate-900">
                      Internet Package
                    </td>
                    <td className="border border-slate-600 px-2 py-1.5 text-center font-semibold text-slate-900">
                      {selectedReceipt.paymentMonth}
                    </td>
                    <td className="border border-slate-600 px-2 py-1.5 text-right font-mono font-bold text-slate-900">
                      {selectedReceipt.monthlyDues.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-600 px-2 py-1.5 font-bold text-slate-900">Total Amount</td>
                    <td className="border border-slate-600 px-2 py-1.5"></td>
                    <td className="border border-slate-600 px-2 py-1.5 text-right font-mono font-bold text-slate-900">
                      {selectedReceipt.monthlyDues.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-600 px-2 py-1.5 font-bold text-slate-900">Paid Amount</td>
                    <td className="border border-slate-600 px-2 py-1.5"></td>
                    <td className="border border-slate-600 px-2 py-1.5 text-right font-mono font-black text-emerald-800">
                      {selectedReceipt.amountPaid.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-600 px-2 py-1.5 font-bold text-slate-900">Balance</td>
                    <td className="border border-slate-600 px-2 py-1.5"></td>
                    <td className={`border border-slate-600 px-2 py-1.5 text-right font-mono font-black ${selectedReceipt.remainingDues > 0 ? "text-red-700" : "text-slate-900"}`}>
                      {selectedReceipt.remainingDues.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Received Line */}
              <div className="text-right pt-2">
                <span className="font-bold text-slate-900 text-xs">Received: </span>
                <span className="inline-block border-b border-slate-700 min-w-[160px] text-center font-extrabold text-slate-900 px-2 pb-0.5">
                  {selectedReceipt.receivedBy || "Faraz Ahmed"}
                </span>
              </div>
            </div>
          </div>

          {/* 4. Footer Banner & Accent */}
          <div className="mt-4 pt-1.5 pb-1.5 border-t border-b-2 border-[#800000] text-center text-[11px] font-bold text-slate-900 tracking-tight">
            Thank you for choosing Extreme Fiber • Fast • Reliable • Unlimited Internet
          </div>

          {/* Bottom Accent Double Line */}
          <div className="h-0.5 bg-[#800000] mt-1 -mx-4 sm:-mx-5"></div>

          {/* Floating Official Layer Stamp */}
          <AuthorizedStamp
            receiptNumber={`#${selectedReceipt.receiptNumber}`}
            date={selectedReceipt.paymentDate}
            receiverName={selectedReceipt.receivedBy || "Faraz"}
            className="-bottom-4 -right-2 opacity-85"
          />
        </div>
      </div>
    </div>
  );
}
