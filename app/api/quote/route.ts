import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { title, rooms, laborRate, materialTax, items } = body || {};
  if (!title || !rooms || !items?.length) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  // Fetch device pricing
  const ids = items.map((i: any) => i.deviceId);
  const devices = await prisma.device.findMany({ where: { id: { in: ids } } });

  let materials = 0, install = 0;
  const quoteItems: any[] = [];
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
