import { createKpiRecord, triggerRollupAsync } from './kpi.service.js';
import prisma from '#config/prisma';

export const createKpi = async (req, res) => {
  try {
    const { id: actionId } = req.params;
    const { name, unit, target, type } = req.body; 

    const newKpi = await prisma.kpi.create({
      data: {
        name,
        unit,
        target: parseFloat(target),
        type,
        actionId
      }
    });

    return res.status(201).json({ success: true, data: newKpi });
  } catch (error) {
    console.error("Error creating KPI:", error);
    return res.status(500).json({ success: false, error: "Error creating KPI." });
  }
};

export const addKpiRecord = async (req, res) => {
  try {
    const { kpiId } = req.params;
    const { value, note, userId } = req.body; // userId idealmente de req.user

    // 1. Guardamos el registro
    const record = await createKpiRecord(kpiId, parseFloat(value), note, userId);

    // 2. Disparamos la recursividad en background
    triggerRollupAsync(kpiId).catch(err => {
      console.error("Error crítico en el Background Job de Roll-up:", err);
    });

    // 3. Respondemos al frontend
    return res.status(201).json({
      success: true,
      message: "Avance registrado. El dashboard se actualizará en breve.",
      data: record
    });

  } catch (error) {
    console.error("Error in addKpiRecord:", error);
    return res.status(500).json({ success: false, error: "Error al registrar avance" });
  }
};