import QuoteForm from "@/components/QuoteForm";
import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function QuotePage() {
  const session = await auth();
  return (
    <section className="container py-10">
      <h1 className="text-3xl font-semibold mb-2">Smart Home Quote Builder</h1>
      <p className="text-gray-600 mb-6">Choose devices, set room counts, and get an instant estimate. Save your quote by signing in.</p>
      {!session?.user && (
        <div className="mb-6 p-4 border rounded-xl bg-yellow-50 text-sm">
          You&apos;re not signed in. <Link href="/login" className="underline">Sign in</Link> to save and revisit your quote.
        </div>
      )}
      <QuoteForm />
    </section>
  );
}
