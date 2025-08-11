import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  const quotes = await prisma.quote.findMany({ where: { userId: user!.id }, orderBy: { createdAt: "desc" } });

  return (
    <section className="container py-10">
      <h1 className="text-3xl font-semibold mb-2">Welcome back</h1>
      <p className="text-gray-600 mb-6">Your saved quotes</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quotes.map(q => (
          <Link key={q.id} href={`/quote/${q.id}`} className="card hover:shadow-xl transition">
            <div className="text-lg font-semibold">{q.title}</div>
            <div className="text-sm text-gray-500">Total ${Number(q.grandTotal).toFixed(2)}</div>
            <div className="text-xs text-gray-400 mt-2">{q.createdAt.toDateString?.() || new Date(q.createdAt).toDateString()}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
