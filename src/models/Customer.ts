import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICustomer extends Document {
  id: string;
  name: string;
  phone?: string;
  cnic?: string;
  address?: string;
  area?: string;
  packageId?: string;
  packageName?: string;
  monthlyFee?: number;
  status?: string;
  installationDate?: string;
  dueAmount?: number;
  lastPaymentDate?: string;
  notes?: string;
  accountNo?: string;
  plan?: string;
  sector?: string;
  createdAt?: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    id: {
      type: String,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    phone: { type: String, default: "" },
    cnic: { type: String, default: "" },
    address: { type: String, default: "" },
    area: { type: String, default: "" },
    packageId: { type: String, default: "PKG-10M" },
    packageName: { type: String, default: "10 Mbps Fiber Plan" },
    monthlyFee: { type: Number, default: 1200 },
    status: { type: String, default: "Active" },
    installationDate: { type: String, default: "" },
    dueAmount: { type: Number, default: 0 },
    lastPaymentDate: { type: String, default: "" },
    notes: { type: String, default: "" },
    accountNo: {
      type: String,
      sparse: true,
      trim: true,
    },
    plan: { type: String, default: "" },
    sector: { type: String, default: "" },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Customer: Model<ICustomer> =
  mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema);

export default Customer;
