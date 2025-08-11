import { prisma } from "@/lib/prisma";

export default async function QuoteView({ params }: { params: { id: string } }) {
  const quote = await prisma.quote.findUnique({
    where: { id: params.id },
    include: { items: { include: { device: true } } }
  });
  if (!quote) return <div className="container py-10">Quote not found.</div>;

  return (
    <section className="container py-10">
      <div className="card">
        <h1 className="text-2xl font-semibold">{quote.title}</h1>
        <p className="text-gray-500 text-sm">Rooms: {quote.rooms} • Labor per room: ${quote.laborRate} • Material tax: {quote.materialTax}%</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Device</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Install</th>
                <th>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {quote.items.map(it => (
                <tr key={it.id} className="border-b last:border-0">
                  <td className="py-2">{it.device.name}</td>
                  <td>{it.quantity}</td>
                  <td>${it.unitCost.toString()}</td>
                  <td>${it.install.toString()}</td>
                  <td>${it.lineTotal.toString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm space-y-1">
          <div>Materials + Install: <b>${(Number(quote.subtotal)).toFixed(2)}</b></div>
          <div>Labor total: <b>${(Number(quote.laborTotal)).toFixed(2)}</b></div>
          <div>Tax total: <b>${(Number(quote.taxTotal)).toFixed(2)}</b></div>
          <div className="text-lg">Grand Total: <b>${(Number(quote.grandTotal)).toFixed(2)}</b></div>
        </div>
      </div>
    </section>
  );
}
