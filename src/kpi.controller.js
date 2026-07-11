import { agregarRegistroKpi, ejecutarRollupAsincrono } from './kpi.service.js';

export const registrarAvanceKpi = async (req, res) => {
  try {
    const { kpiId } = req.params;
    const { valor, nota, userId } = req.body; // Nota: userId idealmente vendría de req.user

    // 1. Guardamos el registro en la BD
    const registro = await agregarRegistroKpi(kpiId, valor, nota, userId);

    // 2. Disparamos el recálculo (Magia en background, NO usamos await aquí)
    ejecutarRollupAsincrono(kpiId).catch(err => {
      console.error("Error crítico en el Background Job de Roll-up:", err);
    });

    // 3. Respondemos de inmediato al frontend
    return res.status(201).json({
      message: "Avance registrado. El dashboard se actualizará en breve.",
      data: registro
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al registrar avance" });
  }
};