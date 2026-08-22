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

  // Lógica de Agrupación por Tipo
  if (kpi.type === "ACCUMULABLE" || kpi.type === "FINANCIAL") {
    const aggregation = await prisma.kpiRecord.aggregate({
      _sum: { value: true },
      where: { kpiId },
    });
    newCurrentValue = aggregation._sum.value || 0;
  } else if (kpi.type === "STATUS" || kpi.type === "MILESTONE") {
    const lastRecord = await prisma.kpiRecord.findFirst({
      where: { kpiId },
      orderBy: { createdAt: "desc" },
    });
    newCurrentValue = lastRecord ? lastRecord.value : 0;
  }

  await prisma.kpi.update({
    where: { id: kpiId },
    data: { currentValue: newCurrentValue },
  });

  await updateActionProgress(kpi.actionId);
};

const updateActionProgress = async (actionId) => {
  const action = await prisma.projectAction.findUnique({
    where: { id: actionId },
    include: { kpis: true, children: true },
  });

  let actionProgress = 0;

  // 1. Filtramos estrictamente los KPIs operativos (Ignoramos el dinero)
  const operationalKpis = action.kpis.filter((k) => k.type !== "FINANCIAL");

  if (operationalKpis.length > 0) {
    let sumPercentages = 0;
    for (const k of operationalKpis) {
      let percentage = (k.currentValue / k.target) * 100;
      if (percentage > 100) percentage = 100; // Tope al 100%
      sumPercentages += percentage;
    }
    actionProgress = sumPercentages / operationalKpis.length;
  } else if (action.children.length > 0) {
    // Si no tiene KPIs operativos pero tiene hijas, promediamos a las hijas
    let sumChildren = 0;
    for (const child of action.children) {
      sumChildren += child.progress;
    }
    actionProgress = sumChildren / action.children.length;
  }
  // Si no tiene KPIs operativos ni hijas (Ej. Es puro presupuesto), actionProgress se queda en 0.

  // Guardamos el avance de la acción
  await prisma.projectAction.update({
    where: { id: actionId },
    data: { progress: parseFloat(actionProgress.toFixed(2)) },
  });

  // Burbujeo hacia arriba
  if (action.parentId) {
    await updateActionProgress(action.parentId);
  } else {
    await updateProjectProgress(action.projectId);
  }
};

const updateProjectProgress = async (projectId) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      actions: {
        where: { parentId: null },
        include: { kpis: true, children: true },
      },
    },
  });

  let weightedProgress = 0;
  let totalWeight = 0;

  for (const act of project.actions) {
    const hasOperationalKpi = act.kpis.some((k) => k.type !== "FINANCIAL");
    const hasChildren = act.children.length > 0;

    if (hasOperationalKpi || hasChildren) {
      weightedProgress += act.progress * act.weight;
      totalWeight += act.weight;
    }
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
      health,
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
