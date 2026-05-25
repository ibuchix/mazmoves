// LocationsGrid.tsx - Hub-page grid of all towns grouped by county.
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { getLocationsByCounty } from "@/data/locations";
import { MapPin } from "lucide-react";

export function LocationsGrid() {
  const grouped = getLocationsByCounty();
  const counties = Object.keys(grouped).sort();

  return (
    <div className="space-y-12">
      {counties.map((county) => (
        <section key={county}>
          <h2 className="text-2xl md:text-3xl font-bold text-brand-slate mb-6 font-montserrat">
            {county}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {grouped[county].map((loc) => (
              <Link key={loc.slug} to={`/removals/${loc.slug}`} className="group">
                <Card className="h-full p-5 hover:shadow-lg transition-shadow border-l-4 border-l-brand-orange/60 group-hover:border-l-brand-orange">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-brand-orange mt-1 shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-brand-slate font-montserrat group-hover:text-brand-orange transition-colors">
                        Removals in {loc.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 font-roboto">
                        {loc.region}
                        {loc.population ? ` · ${loc.population}` : ""}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
