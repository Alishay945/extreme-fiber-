import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const seedComplaints: any[] = [];

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("extreme_fiber_wisp");
    const complaints = await db.collection("complaints").find({}).toArray();
    return NextResponse.json({ complaints: complaints || [] });
  } catch (error: any) {
    return NextResponse.json({ complaints: [] });
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
