// CommonRoutes.tsx - Town-specific table of common move routes with price bands.
import type { PriceRoute } from "@/data/locations";

interface CommonRoutesProps {
  townName: string;
  routes: PriceRoute[];
}

export function CommonRoutes({ townName, routes }: CommonRoutesProps) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-brand-slate font-montserrat mb-2">
          Common routes from {townName}
        </h2>
        <p className="text-gray-700 font-roboto mb-6">
          Indicative bands for a small 1-2 bed move. Bigger properties, weekend timing or
          specialty items will sit above these ranges.
        </p>
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-brand-slate text-white font-montserrat">
              <tr>
                <th className="px-4 py-3 text-sm">From {townName} to</th>
                <th className="px-4 py-3 text-sm">Typical band (1-2 bed)</th>
                <th className="px-4 py-3 text-sm hidden md:table-cell">Notes</th>
              </tr>
            </thead>
            <tbody className="font-roboto">
              {routes.map((r) => (
                <tr key={r.to} className="border-t">
                  <td className="px-4 py-3 font-medium text-brand-slate">{r.to}</td>
                  <td className="px-4 py-3 text-gray-800">{r.oneBedBand}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm hidden md:table-cell">
                    {r.notes || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
