import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, name, password } = await req.json();
  if (!email || !password) return NextResponse.json({ message: "Email and password required" }, { status: 400 });
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ message: "Email already in use" }, { status: 409 });
  const hash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { email, name, password: hash } });
  return NextResponse.json({ ok: true });
}
