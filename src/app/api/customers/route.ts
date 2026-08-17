import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Customer from "@/models/Customer";
import initialData from "@/data/initialData.json";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const customers = await Customer.find({}).sort({ createdAt: -1 }).exec();
    return NextResponse.json({ customers: customers || [], source: "mongodb" });
  } catch (error: any) {
    console.error("Error fetching customers from MongoDB:", error.message || error);
    return NextResponse.json(
      { customers: [], source: "memory_fallback", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    const name = body.name || body.full_name;
    const id = body.id || body.accountNo;
    const packageName = body.packageName || body.plan || "10 Mbps Fiber Plan";
    const area = body.area || body.sector || body.address || "Saeela";

    if (!name || !id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required customer fields: name and id are required.",
        },
        { status: 400 }
      );
    }

    const newCustomer = await Customer.create({
      id: id,
      accountNo: id,
      name: name,
      phone: body.phone || "",
      cnic: body.cnic || "",
      address: body.address || `${area} Sector`,
      area: area,
      sector: area,
      packageId: body.packageId || "PKG-10M",
      packageName: packageName,
      plan: packageName,
      monthlyFee: body.monthlyFee || 1200,
      status: body.status || "Active",
      installationDate: body.installationDate || new Date().toISOString().split("T")[0],
      dueAmount: body.dueAmount ?? body.monthlyFee ?? 1200,
      lastPaymentDate: body.lastPaymentDate || "",
      notes: body.notes || "",
      createdAt: body.createdAt ? new Date(body.createdAt) : new Date(),
    });

    console.log("✅ New customer created in MongoDB 'extreme_fiber':", newCustomer.id);

    return NextResponse.json(
      {
        success: true,
        message: "Customer stored successfully in MongoDB Atlas",
        customer: newCustomer,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error saving customer to MongoDB:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: `Customer with ID '${error.keyValue?.id || error.keyValue?.accountNo || "provided"}' already exists.`,
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || "Failed to persist customer to database." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const id = body.id || body.accountNo;

    if (!id) {
      return NextResponse.json({ success: false, error: "Customer ID is required for update." }, { status: 400 });
    }

    const updated = await Customer.findOneAndUpdate(
      { $or: [{ id: id }, { accountNo: id }] },
      {
        $set: {
          id: id,
          accountNo: id,
          name: body.name,
          phone: body.phone,
          cnic: body.cnic,
          address: body.address,
          area: body.area,
          sector: body.area,
          packageId: body.packageId,
          packageName: body.packageName,
          monthlyFee: body.monthlyFee,
          status: body.status,
          dueAmount: body.dueAmount,
          lastPaymentDate: body.lastPaymentDate,
          notes: body.notes,
        },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, customer: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Customer ID parameter is required." }, { status: 400 });
    }

    await Customer.deleteOne({ $or: [{ id: id }, { accountNo: id }] });
    return NextResponse.json({ success: true, message: `Customer ${id} deleted from database.` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
