import { fetchJSON, API_URL } from "@core/http";

export const sendWhatsapp = async (phone, message) => {
  const formattedPhone = phone.startsWith("521") ? phone : `521${phone}`;

  const data = {
    phone: formattedPhone,
    message,
  };
  return fetchJSON(`${API_URL}/whatsapp`, "POST", data);
};
