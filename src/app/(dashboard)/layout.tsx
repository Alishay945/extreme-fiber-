"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ReceiptModal from "@/components/ReceiptModal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      {/* Responsive Sidebar */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="md:ml-64 flex-1 flex flex-col min-h-screen bg-white w-full overflow-x-hidden">
        {children}
      </div>

      {/* Printable Receipt Modal */}
      <ReceiptModal />
    </div>
  );
}
