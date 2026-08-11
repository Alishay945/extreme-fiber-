import { z } from "zod";

export const packageSchema = z.object({
  package_name: z.string().min(2).max(50),
  speed_mbps: z.number().int().positive(),
  monthly_price: z.number().nonnegative(),
});

export const customerSchema = z.object({
  full_name: z.string().min(2).max(100),
  phone_number: z.string().min(7).max(20),
  cnic_number: z.string().max(20).optional().or(z.literal("")),
  address: z.string().min(5),
  package_id: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(["Active", "Overdue", "Suspended"]).default("Active"),
  installation_date: z.string().min(1),
});

export const paymentSchema = z.object({
  customer_id: z.string().uuid(),
  amount_paid: z.number().positive(),
  payment_month: z.string().min(1),
  payment_method: z.enum(["Cash", "EasyPaisa", "JazzCash", "Bank"]),
  received_by: z.string().min(2).max(50),
});

export const complaintSchema = z.object({
  customer_id: z.string().uuid(),
  issue_description: z.string().min(10),
  priority: z.enum(["Low", "Medium", "High", "Critical"]).default("Medium"),
  assigned_technician: z.string().max(100).optional(),
});
