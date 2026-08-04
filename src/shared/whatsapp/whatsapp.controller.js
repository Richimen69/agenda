
import {
  detenerWhatsApp,
  encenderWhatsApp,
  getStatusWhatsApp,
  sendWhatsAppMessage
} from "./whatsapp.js";

export const startWhatsApp = (req, res) => {
  try {
    const result = encenderWhatsApp();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const stopWhatsApp = async (req, res) => {
  try {
    const result = await detenerWhatsApp();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getWhatsAppStatus = (req, res) => {
  try {
    const status = getStatusWhatsApp();
    res.json(status);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const sendMessage = async (req, res) => {
  const { phone, message } = req.body;

  // Validación básica de los datos de entrada
  if (!phone || !message) {
    return res.status(400).json({
      error: "Se requieren los campos 'phone' y 'message' en el cuerpo de la petición."
    });
  }

  try {
    const response = await sendWhatsAppMessage(phone, message);
    
    return res.status(200).json({
      success: true,
      message: "Mensaje enviado correctamente",
      data: response
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Error al enviar el mensaje de WhatsApp"
    });
  }
};