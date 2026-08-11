"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  AlertCircle,
  UserCheck,
  FileSpreadsheet,
  Wifi,
  DollarSign,
  MapPin,
  X,
} from "lucide-react";
import { useWisp } from "@/context/WispContext";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { customers, complaints, dailyChores } = useWisp();

  const saeelaCount = customers.filter((c) => c.area === "Saeela").length;
  const nougranCount = customers.filter((c) => c.area === "Nougran").length;
  const arsalCount = customers.filter((c) => c.area === "Arsal Town").length;

  const openComplaintsCount = complaints.filter((c) => c.status === "Open" || c.status === "In Progress").length;
  const pendingChoresCount = dailyChores.filter((d) => d.status === "Pending" || d.status === "In Progress").length;

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/customers",
      label: "Subscribers & Sectors",
      icon: Users,
      badge: `${customers.length} Users`,
      badgeTone: "sky",
    },
    {
      href: "/payments",
      label: "Payments & Ledger",
      icon: CreditCard,
    },
    {
      href: "/daily-chores",
      label: "Daily Chores & Money",
      icon: DollarSign,
      badge: pendingChoresCount > 0 ? `${pendingChoresCount} Tasks` : undefined,
      badgeTone: "amber",
    },
    {
      href: "/complaints",
      label: "User Complaints",
      icon: AlertCircle,
      badge: openComplaintsCount > 0 ? `${openComplaintsCount} Open` : undefined,
      badgeTone: "rose",
    },
    {
      href: "/staff",
      label: "Staff & Techs",
      icon: UserCheck,
    },
    {
      href: "/migration",
      label: "Excel / CSV Import Tool",
      icon: FileSpreadsheet,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-sky-200 bg-sky-100/95 backdrop-blur-xl flex flex-col justify-between shadow-xl transition-transform duration-300 ease-in-out md:translate-x-0 print:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="border-b border-sky-200 px-5 py-4 flex items-center justify-between bg-sky-200/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white font-bold shadow-md shadow-sky-600/30">
                <Wifi className="h-6 w-6" />
              </div>
              <div>
                <div className="text-base font-extrabold tracking-tight text-sky-950 flex items-center gap-1.5">
                  EXTREME FIBER
                </div>
                <div className="text-[10px] font-bold tracking-wider uppercase text-sky-700">
                  Staff WISP System
                </div>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-sky-800 hover:bg-sky-200 md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 p-3 overflow-y-auto max-h-[calc(100vh-140px)]">
            <div className="px-3 pb-1 pt-1 text-[10px] font-extrabold uppercase tracking-wider text-sky-800">
              Main Operations
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-all ${
                    isActive
                      ? "bg-sky-600 text-white font-bold shadow-md shadow-sky-600/25"
                      : "text-sky-950 font-semibold hover:bg-sky-200/80 hover:text-sky-950"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-sky-700"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : item.badgeTone === "rose"
                          ? "bg-rose-500 text-white"
                          : item.badgeTone === "amber"
                          ? "bg-amber-500 text-white"
                          : "bg-sky-600 text-white"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Quick Sector Shortcut Badge Box */}
            <div className="mt-4 pt-3 border-t border-sky-200/80 px-2 space-y-1.5">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-sky-800 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-sky-700" /> Sector Counts
              </div>
              <div className="grid grid-cols-1 gap-1 text-[11px]">
                <div className="flex justify-between items-center bg-white/70 px-2.5 py-1 rounded-lg border border-sky-200 font-semibold text-slate-800">
                  <span>Saeela:</span>
                  <span className="font-extrabold text-sky-700">{saeelaCount}</span>
                </div>
                <div className="flex justify-between items-center bg-white/70 px-2.5 py-1 rounded-lg border border-sky-200 font-semibold text-slate-800">
                  <span>Nougran:</span>
                  <span className="font-extrabold text-sky-700">{nougranCount}</span>
                </div>
                <div className="flex justify-between items-center bg-white/70 px-2.5 py-1 rounded-lg border border-sky-200 font-semibold text-slate-800">
                  <span>Arsal Town:</span>
                  <span className="font-extrabold text-sky-700">{arsalCount}</span>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Staff Status Footer */}
        <div className="border-t border-sky-200 p-3.5 bg-sky-200/40">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 font-bold text-white text-xs shadow-sm">
                EF
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-sky-950 truncate">Staff Operator</p>
              <p className="text-[10px] font-semibold text-sky-700 truncate">Shift Active • Admin</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
