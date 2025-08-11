"use client";

import { useEffect, useMemo, useState } from "react";

type Device = {
  id: string;
  slug: string;
  name: string;
  category: string;
  unit: string;
  price: string;
  install: string;
};

type Catalog = Record<string, Device[]>;

export default function QuoteForm() {
  const [catalog, setCatalog] = useState<Catalog>({});
  const [rooms, setRooms] = useState(4);
  const [laborRate, setLaborRate] = useState(25);
  const [materialTax, setMaterialTax] = useState(7.5);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [title, setTitle] = useState("4-Bedroom Smart Home");
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/devices").then(r => r.json()).then((list: Device[]) => {
      const byCat: Catalog = {};
      list.forEach(d => {
        if (!byCat[d.category]) byCat[d.category] = [];
        byCat[d.category].push(d);
      });
      setCatalog(byCat);
    });
  }, []);

  const totals = useMemo(() => {
    let materials = 0;
    let install = 0;
    for (const cat of Object.values(catalog)) {
      for (const d of cat) {
        const q = quantities[d.id] || 0;
        materials += q * parseFloat(d.price);
        install += q * parseFloat(d.install);
      }
    }
    const labor = rooms * Number(laborRate);
    const tax = materials * (Number(materialTax)/100);
    const subtotal = materials + install;
    const grand = subtotal + tax + labor;
    return { materials, install, labor, tax, subtotal, grand };
  }, [catalog, quantities, rooms, laborRate, materialTax]);

  const saveQuote = async () => {
    setSaving(true);
    const items = [];
    for (const cat of Object.values(catalog)) {
      for (const d of cat) {
        const q = quantities[d.id] || 0;
        if (q > 0) items.push({ deviceId: d.id, quantity: q });
      }
    }
    const res = await fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, rooms, laborRate, materialTax, items
      })
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setSavedId(data.id);
      alert("Quote saved.");
    } else {
      const j = await res.json().catch(()=>({message:"Failed"}));
      alert(j.message || "Failed to save quote");
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="card space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label>Project title</label>
              <input value={title} onChange={e=>setTitle(e.target.value)} />
            </div>
            <div>
              <label>Number of rooms</label>
              <input type="number" min={1} value={rooms} onChange={e=>setRooms(parseInt(e.target.value||"1"))} />
            </div>
            <div>
              <label>Labor per room ($)</label>
              <input type="number" min={0} value={laborRate} onChange={e=>setLaborRate(Number(e.target.value||"0"))} />
            </div>
            <div>
              <label>Material tax (%)</label>
              <input type="number" min={0} value={materialTax} onChange={e=>setMaterialTax(Number(e.target.value||"0"))} />
            </div>
          </div>

          {Object.entries(catalog).map(([cat, items]) => (
            <div key={cat}>
              <h3 className="text-lg font-semibold mt-4 mb-2">{cat}</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {items.map(d => (
                  <div key={d.id} className="border rounded-xl p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-medium">{d.name}</div>
                        <div className="text-xs text-gray-500">{d.unit} • ${d.price} + install ${d.install}</div>
                      </div>
                      <input
                        type="number"
                        min={0}
                        value={quantities[d.id] || 0}
                        onChange={e => setQuantities(s => ({ ...s, [d.id]: parseInt(e.target.value || "0") }))}
                        className="w-24"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Estimate</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Materials</span><span>${totals.materials.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Install</span><span>${totals.install.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Labor</span><span>${totals.labor.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>${totals.tax.toFixed(2)}</span></div>
            <div className="border-t my-2"></div>
            <div className="flex justify-between font-semibold"><span>Total</span><span>${totals.grand.toFixed(2)}</span></div>
          </div>
          <button onClick={saveQuote} className="btn w-full mt-4" disabled={saving}>{saving? "Saving..." : "Save Quote"}</button>
          {savedId && <a className="block text-center mt-3 text-blue-600" href={`/quote/${savedId}`}>View saved quote →</a>}
        </div>
      </div>
    </div>
  );
}
