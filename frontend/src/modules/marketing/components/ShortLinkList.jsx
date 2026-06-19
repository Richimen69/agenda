import { useState } from 'react';

export default function ShortLinkList({ links }) {
  const [copiedId, setCopiedId] = useState(null);

  // Helper para construir la URL corta pública basado en el entorno actual
  const buildShortUrl = (shortCode) => {
    return `${window.location.origin}/s/${shortCode}`;
  };

  const handleCopy = (shortCode, id) => {
    const url = buildShortUrl(shortCode);
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000); // Quitar estado de "Copiado" después de 2s
    });
  };

  if (!links || links.length === 0) {
    return <div className="text-center text-gray-500 py-10">No hay enlaces generados aún.</div>;
  }

  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-lg overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
            <th className="p-4 font-medium">URL Corta</th>
            <th className="p-4 font-medium">URL Original</th>
            <th className="p-4 font-medium text-center">Clics</th>
            <th className="p-4 font-medium">Fecha de Creación</th>
            <th className="p-4 font-medium text-center">Acción</th>
          </tr>
        </thead>
        <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
          {links.map((link) => (
            <tr key={link.id} className="hover:bg-gray-50 transition">
              <td className="p-4 font-medium text-blue-600 truncate max-w-xs">
                <a href={buildShortUrl(link.shortCode)} target="_blank" rel="noopener noreferrer">
                  /{link.shortCode}
                </a>
              </td>
              <td className="p-4 truncate max-w-md" title={link.originalUrl}>
                {link.originalUrl}
              </td>
              <td className="p-4 text-center font-semibold">
                <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-xs">
                  {link.clicks}
                </span>
              </td>
              <td className="p-4 text-gray-500">
                {new Date(link.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric', month: 'short', day: 'numeric'
                })}
              </td>
              <td className="p-4 text-center">
                <button
                  onClick={() => handleCopy(link.shortCode, link.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                    copiedId === link.id
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                  }`}
                >
                  {copiedId === link.id ? '¡Copiado!' : 'Copiar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}