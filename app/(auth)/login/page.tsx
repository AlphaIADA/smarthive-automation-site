"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";

function LoginForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false, redirectTo: "/dashboard" });
    if (res?.error) setError("Invalid credentials");
    else router.push(res?.url || "/dashboard");
    setLoading(false);
  };

  return (
    <div className="container max-w-md py-10">
      <div className="card">
        <h1 className="text-2xl font-semibold mb-6">Sign in</h1>
        {params.get("registered") && <p className="text-green-700 text-sm mb-2">Account created. Please sign in.</p>}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label>Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
          </div>
          <div>
            <label>Password</label>
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button disabled={loading} className="btn w-full">{loading? "Signing in..." : "Sign in"}</button>
          <p className="text-sm text-gray-600">No account? <a href="/register">Create one</a></p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container max-w-md py-10"><div className="card text-sm text-gray-500">Loading sign in...</div></div>}>
      <LoginForm />
    </Suspense>
  );
}
