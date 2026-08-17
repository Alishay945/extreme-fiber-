"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { useWisp } from "@/context/WispContext";
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Users,
  CheckCircle,
  Clock,
  RefreshCw,
  FileUp,
  DollarSign
} from "lucide-react";
import * as XLSX from "xlsx";
import { CustomerStatus } from "@/types/wisp";

interface PreviewRow {
  id: number;
  name: string;
  phone: string;
  cnic: string;
  address: string;
  area: string;
  packageName: string;
  monthlyFee: number;
  status: CustomerStatus;
  dueAmount: number;
  paidAmount: number;
  isPaid: boolean;
  isExisting: boolean;
}

export default function MigrationPage() {
  const { customers, importBulkCustomers } = useWisp();

  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<PreviewRow[]>([]);
  const [csvText, setCsvText] = useState("");
  const [importResult, setImportResult] = useState<{
    added: number;
    updated: number;
    paid: number;
    unpaid: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper to map row object keys flexibly
  const parseRawRow = (row: any, idx: number): PreviewRow => {
    const keys = Object.keys(row);
    const getVal = (possibleKeys: string[], defaultVal: string = ""): string => {
      for (const pk of possibleKeys) {
        const foundKey = keys.find((k) => k.toLowerCase().trim() === pk.toLowerCase());
        if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
          return String(row[foundKey]).trim();
        }
      }
      return defaultVal;
    };

    const getNum = (possibleKeys: string[], defaultVal: number = 0): number => {
      const valStr = getVal(possibleKeys, "");
      if (!valStr) return defaultVal;
      const num = parseFloat(valStr.replace(/[^0-9.]/g, ""));
      return isNaN(num) ? defaultVal : num;
    };

    const rawName = getVal(["full_name", "name", "customer name", "subscriber name", "subscriber", "user name", "user", "naam", "naam user"], `Subscriber ${idx + 1}`);
    const phone = getVal(["phone_number", "phone", "mobile", "contact", "mobile number", "cell", "phone no"], "0300-0000000");
    const cnic = getVal(["cnic_number", "cnic", "id card", "cnic no", "identity"], "35202-0000000-0");
    const address = getVal(["address", "location", "house address", "street", "pata"], "General Address");
    const area = getVal(["area", "sector", "zone", "location area", "ilaka"], "Saeela");
    const packageName = getVal(["package_name", "package", "plan", "internet plan", "speed", "package tier"], "20M Fiber Plan");

    const monthlyFee = getNum(["monthly_fee", "monthly fee", "fee", "package price", "price", "rate"], 2500);
    const paidAmount = getNum(["paid_amount", "paid amount", "cash paid", "received", "wasool"], -1);
    const dueAmount = getNum(["due_amount", "due amount", "pending", "baqi", "remaining dues", "dues"], -1);

    const rawStatus = getVal(["status", "payment status", "paid status", "state"], "").toLowerCase();

    // Check if subscriber exists in database
    const existingIndex = customers.findIndex((c) => {
      if (c.name.toLowerCase() === rawName.toLowerCase()) return true;
      if (phone && c.phone && c.phone.replace(/\D/g, "") === phone.replace(/\D/g, "") && phone.replace(/\D/g, "").length >= 7) return true;
      return false;
    });

    const isExisting = existingIndex !== -1;

    let isPaid = false;
    if (rawStatus === "paid" || rawStatus === "active" || rawStatus === "yes" || rawStatus === "1") {
      isPaid = true;
    } else if (paidAmount >= monthlyFee && paidAmount > 0) {
      isPaid = true;
    } else if (dueAmount === 0) {
      isPaid = true;
    }

    const finalPaidAmt = paidAmount !== -1 ? paidAmount : (isPaid ? monthlyFee : 0);
    const finalDueAmt = dueAmount !== -1 ? dueAmount : (isPaid ? 0 : Math.max(0, monthlyFee - finalPaidAmt));
    const finalStatus: CustomerStatus = isPaid ? "Active" : (finalDueAmt > 0 ? "Overdue" : "Active");

    return {
      id: idx + 1,
      name: rawName,
      phone,
      cnic,
      address,
      area,
      packageName,
      monthlyFee,
      status: finalStatus,
      dueAmount: finalDueAmt,
      paidAmount: finalPaidAmt,
      isPaid,
      isExisting,
    };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const wb = XLSX.read(buffer, { type: "array" });
        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];

        const rawData: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });
        const mapped = rawData.map((row, idx) => parseRawRow(row, idx));

        setParsedRows(mapped);
      } catch (err) {
        console.error("Failed to parse file:", err);
        alert("Could not read file. Please ensure it is a valid Excel (.xlsx, .xls) or CSV file.");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handlePasteParse = () => {
    if (!csvText.trim()) return;
    try {
      setIsProcessing(true);
      setImportResult(null);
      const lines = csvText.trim().split("\n");
      if (lines.length <= 1) return;

      const headers = lines[0].split(",").map((h) => h.replace(/^"|"$/g, "").trim());
      const rowsData: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].match(/(?:[^\s",]|\"[^\"]*\")+/g) || lines[i].split(",");
        const cleanParts = parts.map((p) => p.replace(/^"|"$/g, "").trim());
        const rowObj: any = {};
        headers.forEach((h, colIdx) => {
          rowObj[h] = cleanParts[colIdx] || "";
        });
        rowsData.push(rowObj);
      }

      const mapped = rowsData.map((row, idx) => parseRawRow(row, idx));
      setParsedRows(mapped);
      setFileName("Pasted CSV Text");
    } catch (err) {
      console.error(err);
      alert("Failed to parse pasted text. Check CSV formatting.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCommitImport = () => {
    if (parsedRows.length === 0) return;

    const res = importBulkCustomers(
      parsedRows.map((r) => ({
        name: r.name,
        phone: r.phone,
        cnic: r.cnic,
        address: r.address,
        area: r.area,
        packageName: r.packageName,
        monthlyFee: r.monthlyFee,
        status: r.status,
        dueAmount: r.dueAmount,
        paidAmount: r.paidAmount,
        isPaid: r.isPaid,
      }))
    );

    setImportResult(res);
    setParsedRows([]);
    setFileName(null);
    setCsvText("");
  };

  const downloadSampleTemplate = () => {
    const sampleData = [
      {
        "Full Name": "Muhammad Usman",
        Phone: "0300-1234567",
        CNIC: "35202-1234567-1",
        Address: "House 14, Street 5",
        Area: "Saeela",
        Package: "20M Fiber Plan",
        "Monthly Fee": 2500,
        "Paid Amount": 2500,
        "Due Amount": 0,
        Status: "Paid",
      },
      {
        "Full Name": "Tariq Mehmood",
        Phone: "0312-9876543",
        CNIC: "35201-9876543-2",
        Address: "Flat 3A, Sector B",
        Area: "Nougran",
        Package: "10M Fiber Plan",
        "Monthly Fee": 1500,
        "Paid Amount": 0,
        "Due Amount": 1500,
        Status: "Unpaid",
      },
      {
        "Full Name": "Kamran Khan",
        Phone: "0333-5554433",
        CNIC: "35202-5554433-3",
        Address: "Shop 12, Main Bazaar",
        Area: "Arsal Town",
        Package: "50M Fiber Plan",
        "Monthly Fee": 4000,
        "Paid Amount": 4000,
        "Due Amount": 0,
        Status: "Paid",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Subscribers_Data");
    XLSX.writeFile(wb, "Extreme_Fiber_Subscribers_Template.xlsx");
  };

  // Stats calculation for previewed file
  const totalPreviewCount = parsedRows.length;
  const newUsersCount = parsedRows.filter((r) => !r.isExisting).length;
  const existingUsersCount = parsedRows.filter((r) => r.isExisting).length;
  const paidUsersCount = parsedRows.filter((r) => r.isPaid).length;
  const unpaidUsersCount = parsedRows.filter((r) => !r.isPaid).length;

  const totalCollectedPreview = parsedRows.reduce((acc, r) => acc + r.paidAmount, 0);
  const totalPendingPreview = parsedRows.reduce((acc, r) => acc + r.dueAmount, 0);

  return (
    <main className="flex-1 pb-12 bg-slate-50 min-h-screen text-slate-900">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 pt-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-sky-200 pb-5 gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-sky-700 font-extrabold flex items-center gap-1.5">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Excel & CSV Bulk Data Sync
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
              Upload Excel Sheet (Subscribers & Dues Data)
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Upload subscriber sheets (.xlsx, .xls, .csv). Automatically adds new users, updates existing ones, and syncs paid/unpaid status.
            </p>
          </div>

          <button
            onClick={downloadSampleTemplate}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-800 transition"
          >
            <Download className="h-4 w-4" /> Download Sample Excel Template
          </button>
        </div>

        {/* Success Alert */}
        {importResult && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-emerald-950 space-y-3 shadow-md">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-shrink-0" />
              <div>
                <h3 className="font-extrabold text-sm text-emerald-900">Excel Data Sync Completed Successfully!</h3>
                <p className="text-xs text-emerald-800 font-medium">
                  Subscribers database and payment registers have been updated.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-white p-3 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-emerald-700 font-bold uppercase">New Users Added</span>
                <p className="text-lg font-black text-emerald-900">+{importResult.added}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-sky-700 font-bold uppercase">Users Updated</span>
                <p className="text-lg font-black text-sky-900">{importResult.updated}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-emerald-700 font-bold uppercase">Paid Accounts</span>
                <p className="text-lg font-black text-emerald-700">{importResult.paid}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-rose-700 font-bold uppercase">Unpaid / Pending</span>
                <p className="text-lg font-black text-rose-600">{importResult.unpaid}</p>
              </div>
            </div>
          </div>
        )}

        {/* File Dropzone & Paste Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Box 1: File Upload (.xlsx, .csv) */}
          <div className="rounded-2xl border border-sky-300 bg-white p-6 shadow-md space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 font-bold text-sky-700">
                  <FileUp className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Option 1: Upload Excel File (.xlsx / .csv)</h2>
                  <p className="text-[11px] text-slate-500 font-medium">Drag and drop or browse your local Excel file</p>
                </div>
              </div>

              <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/50 p-8 text-center cursor-pointer hover:border-sky-600 hover:bg-sky-100/50 transition">
                <Upload className="h-8 w-8 text-sky-600 mb-2" />
                <span className="text-xs font-bold text-sky-950">
                  {fileName ? `Selected: ${fileName}` : "Click to Browse or Drag Excel File"}
                </span>
                <span className="text-[10px] text-slate-500 mt-1 font-semibold">
                  Supports .xlsx, .xls, .csv files with headers
                </span>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <p className="text-[10px] text-slate-400 font-semibold italic text-center">
              Auto-detects columns: Name, Phone, Area, Package, Status, Paid Amount, Due Amount.
            </p>
          </div>

          {/* Box 2: Manual CSV Paste */}
          <div className="rounded-2xl border border-sky-300 bg-white p-6 shadow-md space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Option 2: Paste Raw CSV Text
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Headers: <code className="text-sky-800 font-mono font-bold bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">name, phone, area, package, status, paid_amount, due_amount</code>
              </p>

              <textarea
                rows={5}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={`Name,Phone,Area,Package,Status,Paid Amount,Due Amount\nFarhan Akhtar,0300-9988771,Saeela,20M Fiber Plan,Paid,2500,0\nNadia Malik,0312-3344556,Nougran,10M Fiber Plan,Unpaid,0,1500`}
                className="w-full rounded-xl border border-sky-200 bg-sky-50/50 p-3 font-mono text-xs text-slate-900 outline-none focus:border-sky-600 focus:bg-white"
              />
            </div>

            <button
              onClick={handlePasteParse}
              disabled={!csvText.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-700 py-2.5 text-xs font-bold text-white shadow-md disabled:opacity-50 hover:bg-sky-800 transition"
            >
              <RefreshCw className="h-4 w-4" /> Parse Pasted CSV Text
            </button>
          </div>
        </div>

        {/* Parsed Excel Preview Section */}
        {parsedRows.length > 0 && (
          <div className="rounded-2xl border border-sky-300 bg-white p-6 space-y-5 shadow-xl animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-sky-100 pb-4 gap-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Excel Sheet Parsed & Verified
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  Review calculated statistics and data preview before importing into Extreme Fiber WISP system.
                </p>
              </div>

              <button
                onClick={handleCommitImport}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-black text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition"
              >
                Commit Data Sync ({parsedRows.length} Subscribers) <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Stats Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
                <div className="text-[10px] uppercase font-bold text-sky-800 flex items-center gap-1">
                  <Users className="h-3 w-3" /> Total Sheet Rows
                </div>
                <div className="text-lg font-black text-sky-950 mt-1">{totalPreviewCount}</div>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <div className="text-[10px] uppercase font-bold text-emerald-800 flex items-center gap-1">
                  <Users className="h-3 w-3 text-emerald-600" /> New Users
                </div>
                <div className="text-lg font-black text-emerald-900 mt-1">+{newUsersCount}</div>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                <div className="text-[10px] uppercase font-bold text-blue-800 flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 text-blue-600" /> Existing Users
                </div>
                <div className="text-lg font-black text-blue-900 mt-1">{existingUsersCount}</div>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <div className="text-[10px] uppercase font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-emerald-600" /> Paid Users
                </div>
                <div className="text-lg font-black text-emerald-700 mt-1">{paidUsersCount}</div>
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                <div className="text-[10px] uppercase font-bold text-rose-800 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-rose-600" /> Unpaid / Pending
                </div>
                <div className="text-lg font-black text-rose-700 mt-1">{unpaidUsersCount}</div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <div className="text-[10px] uppercase font-bold text-amber-800 flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-amber-600" /> Total Dues (PKR)
                </div>
                <div className="text-sm font-black text-amber-900 mt-1.5">
                  {totalPendingPreview.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Table Preview */}
            <div className="overflow-x-auto rounded-xl border border-sky-200 max-h-96">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-sky-100 text-sky-950 font-bold uppercase border-b border-sky-200">
                  <tr>
                    <th className="px-3 py-2.5">Type</th>
                    <th className="px-3 py-2.5">Subscriber Name</th>
                    <th className="px-3 py-2.5">Phone</th>
                    <th className="px-3 py-2.5">Sector Area</th>
                    <th className="px-3 py-2.5">Package</th>
                    <th className="px-3 py-2.5">Monthly Fee</th>
                    <th className="px-3 py-2.5">Paid Amount</th>
                    <th className="px-3 py-2.5">Pending Dues</th>
                    <th className="px-3 py-2.5">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-100 text-slate-800 font-medium">
                  {parsedRows.map((r) => (
                    <tr key={r.id} className="hover:bg-sky-50">
                      <td className="px-3 py-2">
                        {r.isExisting ? (
                          <span className="rounded-md bg-blue-100 text-blue-900 border border-blue-200 px-2 py-0.5 text-[10px] font-bold">
                            Update
                          </span>
                        ) : (
                          <span className="rounded-md bg-emerald-100 text-emerald-900 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                            + New User
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-bold text-slate-900">{r.name}</td>
                      <td className="px-3 py-2 font-mono text-slate-600">{r.phone}</td>
                      <td className="px-3 py-2 font-bold text-sky-800">{r.area}</td>
                      <td className="px-3 py-2 text-sky-700 font-semibold">{r.packageName}</td>
                      <td className="px-3 py-2 font-mono">PKR {r.monthlyFee.toLocaleString()}</td>
                      <td className="px-3 py-2 font-mono font-bold text-emerald-700">
                        PKR {r.paidAmount.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 font-mono font-bold text-rose-600">
                        PKR {r.dueAmount.toLocaleString()}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${
                            r.isPaid
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : "bg-rose-100 text-rose-800 border-rose-300"
                          }`}
                        >
                          {r.isPaid ? "Paid" : "Unpaid / Pending"}
                        </span>
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
