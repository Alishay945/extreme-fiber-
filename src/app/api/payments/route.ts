import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import initialData from "@/data/initialData.json";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("extreme_fiber_wisp");
    const payments = await db.collection("payments").find({}).toArray();

    if (payments.length === 0) {
      return NextResponse.json({ payments: initialData.payments, source: "seed" });
    }

    return NextResponse.json({ payments, source: "mongodb" });
  } catch (error: any) {
    return NextResponse.json({ payments: initialData.payments, source: "memory_fallback" });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db("extreme_fiber_wisp");

    const newPayment = {
      ...body,
      createdAt: new Date().toISOString(),
    };

    await db.collection("payments").insertOne(newPayment);

    // Update customer due amount in MongoDB
    if (body.customerId) {
      const cust = await db.collection("customers").findOne({ id: body.customerId });
      if (cust) {
        const newDues = Math.max(0, (cust.dueAmount || 0) - body.amountPaid);
        await db.collection("customers").updateOne(
          { id: body.customerId },
          { $set: { dueAmount: newDues, lastPaymentDate: body.paymentDate } }
        );
      }
    }

    return NextResponse.json({ success: true, payment: newPayment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
