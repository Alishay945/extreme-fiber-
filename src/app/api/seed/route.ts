import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import initialData from "@/data/initialData.json";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ message: "Use POST to trigger database seed." });
}

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db("extreme_fiber_wisp");

    // Clear existing collections
    await db.collection("customers").deleteMany({});
    await db.collection("payments").deleteMany({});

    // Seed 511 Subscribers & 1,403 Payments from Excel JSON
    await db.collection("customers").insertMany(initialData.customers);
    await db.collection("payments").insertMany(initialData.payments);

    return NextResponse.json({
      success: true,
      message: "Successfully seeded MongoDB with 511 subscribers and 1,403 payment receipts from Excel master file!",
      subscribersCount: initialData.customers.length,
      paymentsCount: initialData.payments.length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
