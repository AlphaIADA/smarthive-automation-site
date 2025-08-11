import Link from "next/link";

export default function Home() {
  return (
    <section className="container py-16">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight">Live smart, stay secured.</h1>
          <p className="text-lg text-gray-600 mt-4">
            We design and install modern smart home solutions—lighting, climate, security, media, and more.
            Get instant ballpark pricing with our quote builder, then explore a live 3D demo of a 4‑bedroom apartment.
          </p>
          <div className="mt-6 flex gap-3">
            <Link className="btn" href="/quote">Generate a Quote</Link>
            <Link className="btn-outline" href="/demo">Try the 3D Demo</Link>
          </div>
        </div>
        <div className="card">
          <h3 className="text-xl font-semibold">What you get</h3>
          <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
            <li>Fast online estimates with itemized devices and installation</li>
            <li>Secure client portal to save, edit, and download quotes</li>
            <li>Interactive 3D apartment to visualize your setup</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
