"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(()=>({message:"Failed"}));
      setError(j.message || "Registration failed");
      return;
    }
    router.push("/login?registered=1");
  };

  return (
    <div className="container max-w-md py-10">
      <div className="card">
        <h1 className="text-2xl font-semibold mb-6">Create your account</h1>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label>Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
          </div>
          <div>
            <label>Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} />
          </div>
          <div>
            <label>Password</label>
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button disabled={loading} className="btn w-full">{loading? "Creating..." : "Create account"}</button>
          <p className="text-sm text-gray-600">Already have an account? <a href="/login">Sign in</a></p>
        </form>
      </div>
    </div>
  );
}
