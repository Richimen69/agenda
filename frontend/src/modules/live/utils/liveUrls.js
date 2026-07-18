/**
 * Utilidades para generar los enlaces de acceso y compartir sesiones
 * de Toyota Live por WhatsApp / portapapeles.
 */

export function getSessionUrls(session) {
  const baseUri = window.location.origin;
  return {
    techUrl: `${baseUri}/live-tech?room=${session.id}&label=${encodeURIComponent(session.roomName)}`,
    clientUrl: `${baseUri}/?role=client&room=${session.id}&label=${encodeURIComponent(session.roomName)}`,
    specUrl: `${baseUri}/?role=spectator&room=${session.id}&label=${encodeURIComponent(session.roomName)}`
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
  alert(`Link de dispositivo de ${user.name} copiado!`);
}

export function shareSessionViaWhatsApp(session) {
  const { clientUrl } = getSessionUrls(session);
  const message = `Hola ${session.customerName}, Toyota Kyojin te comparte el enlace de monitoreo del servicio en tiempo real para tu vehículo: ${clientUrl}`;
  const whatsappUrl = `https://wa.me/${session.customerPhone}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}

export function copySupervisorLink(session) {
  const { specUrl } = getSessionUrls(session);
  navigator.clipboard.writeText(specUrl);
  alert('Link de Supervisor copiado!');
}