/**
 * Utilidades para generar los enlaces de acceso y compartir sesiones
 * de Toyota Live por WhatsApp / portapapeles.
 */
import { sendWhatsapp } from "@services/whatsapp.api";
import { sileo } from "sileo";

export function getSessionUrls(session) {
  const baseUri = window.location.origin;
  return {
    techUrl: `${baseUri}/live-tech?room=${session.id}&label=${encodeURIComponent(session.roomName)}`,
    clientUrl: `${baseUri}/?role=client&room=${session.id}&label=${encodeURIComponent(session.roomName)}`,
    specUrl: `${baseUri}/?role=spectator&room=${session.id}&label=${encodeURIComponent(session.roomName)}`,
  };
}

/**
 * Link FIJO del kiosco de un técnico. A diferencia de getSessionUrls(),
 * este NO depende de una sesión — se genera una sola vez por técnico/celular
 * al dar de alta el dispositivo. El celular se queda con este link guardado
 * en su pantalla de inicio y se autoconecta solo cada vez que el asesor le
 * asigna un servicio nuevo (ver TechnicianKiosk.jsx).
 */
export function getTechnicianKioskUrl(user) {
  const baseUri = window.location.origin;
  return `${baseUri}/?role=technician-kiosk&technicianId=${user.id}&name=${encodeURIComponent(user.name)}`;
}

export function copyTechnicianKioskUrl(user) {
  const url = getTechnicianKioskUrl(user);
  navigator.clipboard.writeText(url);
  sileo.success({
    title: `Link de dispositivo de ${user.name} copiado!`,
    fill: "#D8F3DC",
    styles: {
      title: "text-black/75!",
      description: "text-black/75!",
      badge: "bg-white!",
    },
  });
}

export const shareSessionViaWhatsApp = async (session) => {
  try {
    const { clientUrl } = getSessionUrls(session);

    // 1. Asegurar que la URL tenga el protocolo http:// o https://
    const clickableUrl = clientUrl.startsWith("http")
      ? clientUrl
      : `https://${clientUrl}`;

    // 2. Usar saltos de línea (\n) para separar la URL del texto
    const message = `Hola ${session.customerName}, Toyota Guerrero te comparte el enlace de monitoreo del servicio en tiempo real para tu vehículo:\n\n${clickableUrl} \n\n (Si no puedes abir el link, agréganos a tus contactos)`;

    const result = await sendWhatsapp(session.customerPhone, message);
    return result;
  } catch (error) {
    sileo.error({
      title: "Error",
      description: "No se pudo mandar el mensaje por WhatsApp",
      fill: "#EB0A1E",
      styles: {
        title: "text-white!",
        description: "text-white!",
        badge: "bg-white!",
      },
    });
    throw error;
  }
};

export function copySupervisorLink(session) {
  const { specUrl } = getSessionUrls(session);
  navigator.clipboard.writeText(specUrl);
  sileo.success({
    title: "Link de Supervisor copiado!",
    fill: "#D8F3DC",
    styles: {
      title: "text-black/75!",
      description: "text-black/75!",
      badge: "bg-white!",
    },
  });
}

export function copyClientLink(session) {
  const { clientUrl } = getSessionUrls(session);
  navigator.clipboard.writeText(clientUrl);
  sileo.success({
    title: "Link de cliente copiado!",
    fill: "#D8F3DC",
    styles: {
      title: "text-black/75!",
      description: "text-black/75!",
      badge: "bg-white!",
    },
  });
}
