import {
  getTechnicianKioskUrl,
  copyTechnicianKioskUrl,
} from "../utils/liveUrls";

/**
 * Alta de dispositivos de técnico: genera el link FIJO de kiosco por
 * persona (una sola vez, no por servicio). Se escanea el QR una vez desde
 * el celular del técnico al configurarlo, o se copia el link y se guarda
 * como acceso directo en su pantalla de inicio.
 */
export function TechnicianDevices({ users }) {
  const technicians = users || [];

  if (technicians.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-400 text-sm shadow-sm">
        No hay personal registrado todavía. Da de alta técnicos en el módulo de
        Administración.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl p-4">
        Genera este link <strong>una sola vez por técnico</strong> al configurar
        su celular. El dispositivo se queda con este acceso guardado y se
        autoconecta solo cada vez que le asignes un servicio nuevo — no se
        vuelve a compartir por sesión.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {technicians
          .filter((user) => user.area?.name === "Tecnicos")
          .map((user) => (
            <TechnicianDeviceCard key={user.id} user={user} />
          ))}
      </div>
    </div>
  );
}

function TechnicianDeviceCard({ user }) {
  const kioskUrl = getTechnicianKioskUrl(user);
  // Generador público de QR, sin dependencias que instalar. Si prefieres
  // no depender de un servicio externo, se puede cambiar luego por una
  // librería como 'qrcode' instalada en el proyecto.
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(kioskUrl)}`;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col items-center gap-3 text-center">
      <h3 className="font-bold text-sm text-gray-900">{user.name}</h3>
      <img
        src={qrSrc}
        alt={`QR de acceso de ${user.name}`}
        className="w-32 h-32 rounded-lg border border-gray-100"
      />
      <p className="text-[10px] text-gray-400 leading-relaxed">
        Escanear una vez desde el celular del técnico, o abrir el link y
        guardarlo en la pantalla de inicio.
      </p>
      <button
        onClick={() => copyTechnicianKioskUrl(user)}
        className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold py-2 rounded-xl transition-colors cursor-pointer"
      >
        Copiar Link de Dispositivo
      </button>
    </div>
  );
}
