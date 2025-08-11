"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: true, callbackUrl: "/dashboard" });
    // next-auth handles redirect on success; on error it returns null
    if (!res) setError("Invalid credentials");
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
