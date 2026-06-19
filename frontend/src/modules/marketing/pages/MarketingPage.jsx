import { useEffect, useState, useCallback } from "react";
import CreateShortLinkForm from "../components/CreateShortLinkForm";
import ShortLinkList from "../components/ShortLinkList";
import { getLinks, getStats } from "@services/shortlinks.api";
import MarketingDashboard from "../components/MarketingDashboard";

export default function MarketingPage({ authUser }) {
  const [links, setLinks] = useState([]);
  const [stats, setStats] = useState(null); // Nuevo estado para KPIs
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Pedimos links y stats al mismo tiempo para mayor rapidez
      const [linksData, statsData] = await Promise.all([
        getLinks(),
        getStats(),
      ]);
      setLinks(linksData);
      setStats(statsData);
    } catch (error) {
      console.error("Error al cargar módulo de marketing:", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Marketing
        </h1>
        <p className="text-gray-500">
          Gestiona y mide tus enlaces cortos corporativos desde un solo lugar.
        </p>
      </div>

      {/* DASHBOARD DE KPIS */}
      {!loading && <MarketingDashboard stats={stats} />}

      {/* FORMULARIO */}
      {/* Al crear un link, recargamos tanto la lista como el dashboard */}
      <CreateShortLinkForm onLinkCreated={fetchData} userId={authUser.id} />

      {/* LISTA DE ENLACES */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Enlaces Activos</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <ShortLinkList links={links} />
      )}
    </div>
  );
}
