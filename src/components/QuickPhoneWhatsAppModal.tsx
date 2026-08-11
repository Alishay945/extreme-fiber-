"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle, Phone, X, Save, ExternalLink, Check, Wifi, DollarSign } from "lucide-react";
import { Customer } from "@/types/wisp";
import { useWisp } from "@/context/WispContext";

interface QuickPhoneWhatsAppModalProps {
  customer: Customer | null;
  onClose: () => void;
}

export default function QuickPhoneWhatsAppModal({
  customer,
  onClose,
}: QuickPhoneWhatsAppModalProps) {
  const { updateCustomer } = useWisp();
  const [phone, setPhone] = useState("");
  const [customMsg, setCustomMsg] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<"reminder" | "complaint" | "general" | "custom">("reminder");

  useEffect(() => {
    if (customer) {
      setPhone(customer.phone || "");
      setSelectedTemplate("reminder");
      setSavedSuccess(false);
    }
  }, [customer]);

  if (!customer) return null;

  // Format Pakistani numbers (03001234567 -> 923001234567)
  const getFormattedWhatsAppNumber = (numStr: string) => {
    let clean = numStr.replace(/\D/g, "");
    if (clean.startsWith("0")) {
      clean = "92" + clean.slice(1);
    } else if (!clean.startsWith("92") && clean.length === 10) {
      clean = "92" + clean;
    }
    return clean;
  };

  const getTemplateText = () => {
    if (selectedTemplate === "reminder") {
      return `السلام علیکم ${customer.name} صاحب!\nایکسٹریم فائبر (Extreme Fiber) کی طرف سے آپ کا ${customer.packageName} کا ماہانہ بل PKR ${customer.dueAmount || customer.monthlyFee} واجب الادا ہے۔ براہ کرم جلد از جلد بل ادا فرمائیں۔ شکریہ!`;
    } else if (selectedTemplate === "complaint") {
      return `السلام علیکم ${customer.name} صاحب!\nایکسٹریم فائبر ٹیم آپ کی شکایت (Ticket) پر کام کر رہی ہے۔ جلد مسئلہ حل کر دیا جائے گا۔ رابطہ: 0300-888-FIBER`;
    } else if (selectedTemplate === "general") {
      return `Hello ${customer.name}, greeting from Extreme Fiber High Speed Network! How can we assist you today?`;
    }
    return customMsg;
  };

  const handleSavePhone = async () => {
    const updated: Customer = {
      ...customer,
      phone: phone.trim(),
    };
    updateCustomer(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);

    // Also attempt API update if backend exists
    try {
      await fetch("/api/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: customer.id, phone: phone.trim() }),
      });
    } catch (e) {
      // Graceful fallback
    }
  };

  const handleSendWhatsApp = () => {
    handleSavePhone();
    const targetNum = getFormattedWhatsAppNumber(phone);
    const text = encodeURIComponent(getTemplateText());
    const waUrl = `https://wa.me/${targetNum}?text=${text}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl border border-emerald-300 bg-white p-6 shadow-2xl text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Quick WhatsApp & Phone Edit</h3>
              <p className="text-[11px] text-emerald-700 font-semibold">
                User ID: {customer.id} • {customer.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Quick Edit Phone Number Input */}
          <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-3.5 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-sky-600" />
              WhatsApp / Phone Number (Update Instantly)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0300-1234567 or 0312-9876543"
                className="flex-1 rounded-xl border border-sky-300 bg-white px-3 py-2 text-sm font-mono font-bold text-slate-900 placeholder-slate-400 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20"
              />
              <button
                onClick={handleSavePhone}
                className="flex items-center gap-1 rounded-xl bg-sky-600 px-3 py-2 text-xs font-bold text-white hover:bg-sky-700 shadow-sm transition"
              >
                {savedSuccess ? <Check className="h-4 w-4 text-emerald-300" /> : <Save className="h-4 w-4" />}
                {savedSuccess ? "Saved!" : "Save"}
              </button>
            </div>
            {savedSuccess && (
              <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <Check className="h-3 w-3" /> Phone number updated successfully!
              </p>
            )}
          </div>

          {/* WhatsApp Message Template Chooser */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Select Message Template:</label>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                onClick={() => setSelectedTemplate("reminder")}
                className={`rounded-xl p-2 text-left font-bold border transition ${
                  selectedTemplate === "reminder"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                💰 Bill Reminder (PKR {customer.dueAmount || customer.monthlyFee})
              </button>
              <button
                onClick={() => setSelectedTemplate("complaint")}
                className={`rounded-xl p-2 text-left font-bold border transition ${
                  selectedTemplate === "complaint"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                🛠️ Ticket / Complaint Update
              </button>
              <button
                onClick={() => setSelectedTemplate("general")}
                className={`rounded-xl p-2 text-left font-bold border transition ${
                  selectedTemplate === "general"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                🌐 Welcome / General Greeting
              </button>
              <button
                onClick={() => setSelectedTemplate("custom")}
                className={`rounded-xl p-2 text-left font-bold border transition ${
                  selectedTemplate === "custom"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                ✏️ Custom Message
              </button>
            </div>
          </div>

          {/* Message Preview Box */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Message Preview:
            </label>
            {selectedTemplate === "custom" ? (
              <textarea
                rows={3}
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Type custom message to send on WhatsApp..."
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-emerald-600"
              />
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 font-medium whitespace-pre-line dir-rtl text-right">
                {getTemplateText()}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSendWhatsApp}
              disabled={!phone}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Save & Open WhatsApp</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
