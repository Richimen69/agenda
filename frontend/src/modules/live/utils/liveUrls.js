/**
 * Utilidades para generar los enlaces de acceso y compartir sesiones
 * de Toyota Live por WhatsApp. Centralizadas aquí para no repetir
 * la lógica entre AdminLive y cualquier otro consumidor futuro.
 */

export function getSessionUrls(session) {
  const baseUri = window.location.origin;
  return {
    techUrl: `${baseUri}/live-tech?room=${session.id}&label=${encodeURIComponent(session.roomName)}`,
    clientUrl: `${baseUri}/?role=client&room=${session.id}&label=${encodeURIComponent(session.roomName)}`
  };
}

export function shareSessionViaWhatsApp(session) {
  const { clientUrl } = getSessionUrls(session);
  const message = `Hola ${session.customerName}, Toyota Kyojin te comparte el enlace de monitoreo del servicio en tiempo real para tu vehículo: ${clientUrl}`;
  const whatsappUrl = `https://wa.me/${session.customerPhone}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}