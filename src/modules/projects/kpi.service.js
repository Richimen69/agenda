import prisma from "#config/prisma";

export const createKpiRecord = async (kpiId, value, note, userId) => {
  return await prisma.kpiRecord.create({
    data: { kpiId, value, note, userId },
  });
};

export const triggerRollupAsync = async (kpiId) => {
  const kpi = await prisma.kpi.findUnique({
    where: { id: kpiId },
    include: { action: true },
  });

  if (!kpi) return;

  let newCurrentValue = 0;

  // Evaluamos según el Enum KpiType de tu esquema
  if (kpi.type === "ACCUMULABLE") {
    const aggregation = await prisma.kpiRecord.aggregate({
      _sum: { value: true },
      where: { kpiId },
    });
    newCurrentValue = aggregation._sum.value || 0;
  } else if (kpi.type === "STATUS") {
    const lastRecord = await prisma.kpiRecord.findFirst({
      where: { kpiId },
      orderBy: { createdAt: "desc" },
    });
    newCurrentValue = lastRecord ? lastRecord.value : 0;
  }

  // Actualizamos el Caché del KPI
  await prisma.kpi.update({
    where: { id: kpiId },
    data: { currentValue: newCurrentValue },
  });

  // Pasamos el relevo a la acción padre (ProjectAction)
  await updateActionProgress(kpi.actionId);
};

// ==========================================
// INTERNAL RECURSIVE FUNCTIONS
// ==========================================
const updateActionProgress = async (actionId) => {
  // Ahora también incluimos a los hijos (children)
  const action = await prisma.projectAction.findUnique({
    where: { id: actionId },
    include: { kpis: true, children: true },
  });

  let actionProgress = 0;

  // ESCENARIO A: Es una Subtarea y tiene su propio KPI (Ej. Juan buscando 25 prospectos)
  if (action.kpis.length > 0) {
    let sumPercentages = 0;
    for (const k of action.kpis) {
      let percentage = (k.currentValue / k.target) * 100;
      if (percentage > 100) percentage = 100;
      sumPercentages += percentage;
    }
    actionProgress = sumPercentages / action.kpis.length;
  }
  // ESCENARIO B: Es una Tarea Padre sin KPI, promediamos a sus hijos
  else if (action.children.length > 0) {
    let sumChildren = 0;
    for (const child of action.children) {
      sumChildren += child.progress;
    }
    actionProgress = sumChildren / action.children.length;
  }

  // Guardamos el avance en la base de datos
  await prisma.projectAction.update({
    where: { id: actionId },
    data: { progress: parseFloat(actionProgress.toFixed(2)) },
  });

  // Burbujeo: Si es subtarea sube al padre, si es raíz sube al proyecto
  if (action.parentId) {
    await updateActionProgress(action.parentId);
  } else {
    await updateProjectProgress(action.projectId);
  }
};

const updateProjectProgress = async (projectId) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { actions: { where: { parentId: null } } },
  });

  let weightedProgress = 0;
  let totalWeight = 0;

  for (const act of project.actions) {
    weightedProgress += act.progress * act.weight;
    totalWeight += act.weight;
  }

  const globalProgress = totalWeight > 0 ? weightedProgress / totalWeight : 0;
  const health = calculateProjectHealth(
    project.createdAt,
    project.targetDate,
    globalProgress,
  );

  await prisma.project.update({
    where: { id: projectId },
    data: {
      globalProgress: parseFloat(globalProgress.toFixed(2)),
      health, // GREEN, YELLOW, RED
    },
  });
};

const calculateProjectHealth = (startDate, targetDate, globalProgress) => {
  const today = new Date().getTime();
  const start = new Date(startDate).getTime();
  const end = new Date(targetDate).getTime();

  if (today > end && globalProgress < 100) return "RED";
  if (globalProgress >= 100) return "GREEN";

  const timePercentage = ((today - start) / (end - start)) * 100;
  const delay = timePercentage - globalProgress;

  if (delay <= 5) return "GREEN";
  if (delay > 5 && delay <= 15) return "YELLOW";
  return "RED";
};
