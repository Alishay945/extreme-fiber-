import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("extreme_fiber_wisp");

    await db.collection("customers").deleteMany({});
    await db.collection("payments").deleteMany({});
    await db.collection("complaints").deleteMany({});
    await db.collection("dailyChores").deleteMany({});

    return NextResponse.json({
      success: true,
      message: "All database collections cleared successfully!"
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
