import { useState } from "react";
import { createLink } from "@services/shortlinks.api";

export default function CreateShortLinkForm({ onLinkCreated, userId  }) {
  const [formData, setFormData] = useState({ originalUrl: "", shortCode: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Le agregamos el userId a la data que enviamos a la API 👇
      await createLink({ ...formData, userId });
      setFormData({ originalUrl: "", shortCode: "" });
      if (onLinkCreated) onLinkCreated();
    } catch (err) {
      setError(err.message || "Ocurrió un error al crear el enlace");
    } finally {
      setLoading(false);
    }
  };
  // ... (El resto del return JSX se mantiene exactamente igual que antes)
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
      {/* ... */}
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Crear Nuevo Enlace
      </h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row gap-4 items-start md:items-end"
      >
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL Original (Destino) *
          </label>
          <input
            type="url"
            required
            placeholder="https://ejemplo.com/campaña-muy-larga..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={formData.originalUrl}
            onChange={(e) =>
              setFormData({ ...formData, originalUrl: e.target.value })
            }
          />
        </div>

        <div className="w-full md:w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alias Personalizado (Opcional)
          </label>
          <input
            type="text"
            placeholder="mi-campaña"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={formData.shortCode}
            onChange={(e) =>
              setFormData({ ...formData, shortCode: e.target.value })
            }
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Generando..." : "Acortar URL"}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
