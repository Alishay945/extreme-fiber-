import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const seedComplaints = [
  {
    id: "TKT-501",
    customerId: "EF-SAE-001",
    customerName: "M. Junaid",
    phone: "0300-1234567",
    address: "House in Saeela",
    category: "No Internet",
    description: "Red optical light blinking on fiber ONU modem after thunderstorm.",
    priority: "High",
    status: "Open",
    assignedStaff: "Raza Technician",
    createdAt: "2026-08-08 09:30 AM",
    updatedAt: "2026-08-08 09:30 AM",
  },
  {
    id: "TKT-502",
    customerId: "EF-ARS-002",
    customerName: "Faizan AC",
    phone: "0312-9876543",
    address: "Shop in Arsal Town",
    category: "Slow Speed",
    description: "Ping fluctuating during peak hours.",
    priority: "Medium",
    status: "In Progress",
    assignedStaff: "Ali Technician",
    createdAt: "2026-08-07 04:15 PM",
    updatedAt: "2026-08-08 10:00 AM",
    resolutionNotes: "Checking bandwidth allocation on distribution switch Port 8.",
  },
];

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("extreme_fiber_wisp");
    const complaints = await db.collection("complaints").find({}).toArray();

    if (complaints.length === 0) {
      return NextResponse.json({ complaints: seedComplaints });
    }

    return NextResponse.json({ complaints });
  } catch (error: any) {
    return NextResponse.json({ complaints: seedComplaints });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db("extreme_fiber_wisp");

    await db.collection("complaints").insertOne(body);
    return NextResponse.json({ success: true, complaint: body });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, notes, assignedStaff } = body;

    const client = await clientPromise;
    const db = client.db("extreme_fiber_wisp");

    await db.collection("complaints").updateOne(
      { id },
      {
        $set: {
          status,
          ...(notes ? { resolutionNotes: notes } : {}),
          ...(assignedStaff ? { assignedStaff } : {}),
          updatedAt: new Date().toISOString(),
        },
      }
    );

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
