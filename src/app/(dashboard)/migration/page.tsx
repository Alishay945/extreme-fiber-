"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { useWisp } from "@/context/WispContext";
import { FileSpreadsheet, Upload, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { CustomerStatus } from "@/types/wisp";

export default function MigrationPage() {
  const { addCustomer, packages } = useWisp();
  const [csvText, setCsvText] = useState(
    `full_name,phone_number,cnic_number,address,area,package_name,status\nFarhan Akhtar,0300-9988771,35202-9988771-1,"House 12, Street 3, Sector A",Saeela,20M Fiber Plan,Active\nNadia Malik,0312-3344556,35201-3344556-2,"Flat 2B, Executive Heights",Nougran,10M Fiber Plan,Active\nRehan Chaudhry,0345-1122334,35202-1122334-3,"Shop 5, Main Commercial",Arsal Town,50M Fiber Plan,DC`
  );

  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  const handleParse = () => {
    const lines = csvText.trim().split("\n");
    if (lines.length <= 1) return;

    const rows = lines.slice(1).map((line, idx) => {
      // Split by comma taking quoted strings into account
      const parts = line.match(/(?:[^\s",]|\"[^\"]*\")+/g) || line.split(",");
      const cleanParts = parts.map((p) => p.replace(/^"|"$/g, "").trim());

      return {
        id: idx + 1,
        full_name: cleanParts[0] || `Subscriber ${idx + 1}`,
        phone_number: cleanParts[1] || "0300-0000000",
        cnic_number: cleanParts[2] || "35202-0000000-0",
        address: cleanParts[3] || "General Address",
        area: cleanParts[4] || "Saeela",
        package_name: cleanParts[5] || "20M Fiber Plan",
        status: (cleanParts[6] as CustomerStatus) || "Active",
      };
    });

    setParsedRows(rows);
    setImportedCount(null);
  };

  const handleCommitImport = () => {
    if (parsedRows.length === 0) return;

    parsedRows.forEach((row) => {
      const matchedPkg = packages.find(
        (p) => p.name.toLowerCase() === row.package_name.toLowerCase()
      );

      addCustomer({
        name: row.full_name,
        phone: row.phone_number,
        cnic: row.cnic_number,
        address: row.address,
        area: row.area || "Saeela",
        packageId: matchedPkg ? matchedPkg.id : packages[0].id,
        packageName: matchedPkg ? matchedPkg.name : row.package_name,
        monthlyFee: matchedPkg ? matchedPkg.monthlyPrice : 2500,
        status: row.status as CustomerStatus,
        installationDate: new Date().toISOString().split("T")[0],
        notes: "Imported via CSV Data Migration Tool",
      });
    });

    setImportedCount(parsedRows.length);
    setParsedRows([]);
  };

  return (
    <main className="flex-1 pb-12 bg-slate-50 min-h-screen text-slate-900">
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 pt-6 space-y-6">
        <div className="border-b border-sky-200 pb-5">
          <div className="text-xs uppercase tracking-widest text-sky-700 font-extrabold">
            Paper Register Digitization
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
            CSV Bulk Data Migration Tool
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            Digitize legacy paper customer logs into Extreme Fiber database in bulk for Saeela, Nougran & Arsal Town.
          </p>
        </div>

        {importedCount !== null && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-100 p-4 text-emerald-900 text-xs font-bold flex items-center gap-3 shadow-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-700" />
            <div>
              Import Complete! Successfully onboarded {importedCount} legacy subscribers into WISP directory.
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-sky-200 bg-white p-6 shadow-md space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Paste CSV Contents (or Drop File)
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            Required Headers: <code className="text-sky-800 font-mono font-bold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">full_name, phone_number, cnic_number, address, area, package_name, status</code>
          </p>

          <textarea
            rows={6}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="w-full rounded-xl border border-sky-300 bg-sky-50/50 p-4 font-mono text-xs text-slate-900 outline-none focus:border-sky-600 focus:bg-white"
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 font-semibold">Supports up to 50,000 subscriber lines per batch</span>
            <button
              onClick={handleParse}
              className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-600/20 hover:bg-sky-700"
            >
              <Upload className="h-4 w-4" /> Parse & Preview CSV
            </button>
          </div>
        </div>

        {/* Preview Table */}
        {parsedRows.length > 0 && (
          <div className="rounded-2xl border border-sky-300 bg-white p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Parsed Preview Data</h3>
                <p className="text-xs text-slate-500 font-medium">Review {parsedRows.length} rows before committing to database.</p>
              </div>

              <button
                onClick={handleCommitImport}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
              >
                Commit Bulk Import ({parsedRows.length} Records) <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-sky-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-sky-50 text-sky-950 font-bold uppercase border-b border-sky-200">
                  <tr>
                    <th className="px-3 py-2.5">Subscriber Name</th>
                    <th className="px-3 py-2.5">Phone</th>
                    <th className="px-3 py-2.5">CNIC</th>
                    <th className="px-3 py-2.5">Address</th>
                    <th className="px-3 py-2.5">Sector Area</th>
                    <th className="px-3 py-2.5">Package Tier</th>
                    <th className="px-3 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-100 text-slate-800 font-medium">
                  {parsedRows.map((r) => (
                    <tr key={r.id} className="hover:bg-sky-50">
                      <td className="px-3 py-2.5 font-bold text-slate-900">{r.full_name}</td>
                      <td className="px-3 py-2.5 font-mono">{r.phone_number}</td>
                      <td className="px-3 py-2.5 text-slate-500">{r.cnic_number}</td>
                      <td className="px-3 py-2.5">{r.address}</td>
                      <td className="px-3 py-2.5 font-bold text-sky-800">{r.area}</td>
                      <td className="px-3 py-2.5 text-sky-700 font-semibold">{r.package_name}</td>
                      <td className="px-3 py-2.5">
                        <span className="rounded-full bg-sky-100 text-sky-900 border border-sky-200 px-2 py-0.5 text-[10px] font-bold">{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
