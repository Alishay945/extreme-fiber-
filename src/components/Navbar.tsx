"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, CreditCard, Wrench, Calendar, Menu } from "lucide-react";

interface NavbarProps {
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
  onOpenNewCustomerModal?: () => void;
  onOpenRecordPaymentModal?: () => void;
  onOpenNewComplaintModal?: () => void;
  onToggleMobileSidebar?: () => void;
}

export default function Navbar({
  onSearchChange,
  searchQuery = "",
  onOpenNewCustomerModal,
  onOpenRecordPaymentModal,
  onOpenNewComplaintModal,
  onToggleMobileSidebar,
}: NavbarProps) {
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
    };
    updateTime();
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-sky-200 bg-sky-100/90 px-4 md:px-6 py-3.5 backdrop-blur-xl shadow-sm gap-2 print:hidden">
      <div className="flex items-center gap-2 flex-1 max-w-md">
        {/* Mobile Sidebar Hamburger Toggle */}
        <button
          onClick={onToggleMobileSidebar}
          className="rounded-xl border border-sky-300 bg-white p-2 text-sky-800 hover:bg-sky-50 md:hidden flex-shrink-0"
          title="Open Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Live Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-600" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search Name, Phone, ID..."
            className="w-full rounded-xl border border-sky-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-sky-700/60 outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 shadow-sm"
          />
        </div>
      </div>

      {/* Action Buttons & Time Badge */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        {/* Date Display */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-xs text-sky-900 font-bold shadow-sm">
          <Calendar className="h-3.5 w-3.5 text-sky-600" />
          <span>{currentDate || "Aug 8, 2026"}</span>
        </div>

        {/* Quick Payment Button */}
        {onOpenRecordPaymentModal && (
          <button
            onClick={onOpenRecordPaymentModal}
            className="flex items-center gap-1 rounded-xl bg-emerald-600 px-2.5 md:px-3.5 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Pay</span>
          </button>
        )}

        {/* New Customer Button */}
        {onOpenNewCustomerModal && (
          <button
            onClick={onOpenNewCustomerModal}
            className="flex items-center gap-1 rounded-xl bg-sky-600 px-2.5 md:px-3.5 py-2 text-xs font-bold text-white transition hover:bg-sky-700 shadow-md shadow-sky-600/20"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">+ Subscriber</span>
          </button>
        )}

        {/* Log Complaint Button */}
        {onOpenNewComplaintModal && (
          <button
            onClick={onOpenNewComplaintModal}
            className="flex items-center gap-1 rounded-xl bg-rose-600 px-2.5 md:px-3.5 py-2 text-xs font-bold text-white transition hover:bg-rose-700 shadow-md shadow-rose-600/20"
          >
            <Wrench className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ticket</span>
          </button>
        )}
      </div>
    </header>
  );
}
