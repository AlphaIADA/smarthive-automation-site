import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const quoteRequestSchema = z.object({
  title: z.string().trim().min(1).max(120),
  rooms: z.number().int().min(1).max(100),
  laborRate: z.number().min(0).max(1_000_000),
  materialTax: z.number().min(0).max(100),
  items: z.array(z.object({
    deviceId: z.string().min(1),
    quantity: z.number().int().min(1).max(10_000),
  })).min(1).max(500),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const parsed = quoteRequestSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid quote details" }, { status: 400 });
  }
  const { title, rooms, laborRate, materialTax, items } = parsed.data;

  // Fetch device pricing
  const ids = items.map((item) => item.deviceId);
  const devices = await prisma.device.findMany({ where: { id: { in: ids } } });

  let materials = 0, install = 0;
  const quoteItems: Array<{
    deviceId: string;
    quantity: number;
    unitCost: number;
    install: number;
    lineTotal: number;
  }> = [];
  for (const it of items) {
    const d = devices.find(x => x.id === it.deviceId);
    if (!d) continue;
    const unitCost = Number(d.price);
    const inst = Number(d.install);
    const qty = Number(it.quantity);
    const lineTotal = qty * (unitCost + inst);
    materials += qty * unitCost;
    install += qty * inst;
    quoteItems.push({
      deviceId: d.id,
      quantity: qty,
      unitCost: unitCost,
      install: inst,
      lineTotal,
    });
  }

  const labor = Number(laborRate) * Number(rooms);
  const tax = materials * (Number(materialTax)/100);
  const subtotal = materials + install;
  const grand = subtotal + labor + tax;

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

  const saved = await prisma.quote.create({
    data: {
      userId: user.id,
      title,
      rooms,
      laborRate,
      materialTax,
      subtotal,
      taxTotal: tax,
      laborTotal: labor,
      grandTotal: grand,
      items: { create: quoteItems }
    }
  });

  return NextResponse.json({ id: saved.id });
}
