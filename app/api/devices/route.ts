import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const list = await prisma.device.findMany({ orderBy: { category: "asc" } });
  return NextResponse.json(list);
}
