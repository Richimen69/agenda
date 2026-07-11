import prisma from "./prisma.js";

// ==========================================
// 1. INSERTAR EL REGISTRO
// ==========================================
export const agregarRegistroKpi = async (kpiId, valor, nota, userId) => {
  return await prisma.kpiRegistro.create({
    data: { kpiId, valor, nota, userId }
  });
};

// ==========================================
// 2. EL MOTOR DE ROLL-UP (Efecto Dominó)
// ==========================================
export const ejecutarRollupAsincrono = async (kpiId) => {
  const kpi = await prisma.kpi.findUnique({ 
    where: { id: kpiId },
    include: { accion: true }
  });

  let nuevoValorActual = 0;

  if (kpi.tipo === 'ACUMULABLE') {
    const agregacion = await prisma.kpiRegistro.aggregate({
      _sum: { valor: true },
      where: { kpiId }
    });
    nuevoValorActual = agregacion._sum.valor || 0;
  } else if (kpi.tipo === 'ESTADO') {
    const ultimoRegistro = await prisma.kpiRegistro.findFirst({
      where: { kpiId },
      orderBy: { createdAt: 'desc' }
    });
    nuevoValorActual = ultimoRegistro ? ultimoRegistro.valor : 0;
  }

  // Actualizamos el Caché del KPI
  await prisma.kpi.update({
    where: { id: kpiId },
    data: { valorActual: nuevoValorActual }
  });

  // Pasamos el relevo a la acción padre
  await actualizarAvanceAccion(kpi.accionId);
};

// ==========================================
// FUNCIONES INTERNAS DE RECURSIVIDAD
// ==========================================
const actualizarAvanceAccion = async (accionId) => {
  const accion = await prisma.accion.findUnique({
    where: { id: accionId },
    include: { kpis: true }
  });

  let sumaPorcentajes = 0;
  for (const k of accion.kpis) {
    let porcentaje = (k.valorActual / k.meta) * 100;
    if (porcentaje > 100) porcentaje = 100;
    sumaPorcentajes += porcentaje;
  }

  const avanceAccion = accion.kpis.length > 0 ? (sumaPorcentajes / accion.kpis.length) : 0;

  await prisma.accion.update({
    where: { id: accionId },
    data: { avance: avanceAccion }
  });

  if (accion.parentId) {
    await actualizarAvanceAccion(accion.parentId); // Subir nivel
  } else {
    await actualizarAvanceProyecto(accion.proyectoId); // Llegamos al techo
  }
};

const actualizarAvanceProyecto = async (proyectoId) => {
  const proyecto = await prisma.proyecto.findUnique({
    where: { id: proyectoId },
    include: { acciones: { where: { parentId: null } } }
  });

  let avancePonderado = 0;
  let sumaPesos = 0;

  for (const acc of proyecto.acciones) {
    avancePonderado += (acc.avance * acc.peso);
    sumaPesos += acc.peso;
  }

  const avanceGlobal = sumaPesos > 0 ? (avancePonderado / sumaPesos) : 0;
  const salud = calcularSaludProyecto(proyecto.createdAt, proyecto.fechaObjetivo, avanceGlobal);

  await prisma.proyecto.update({
    where: { id: proyectoId },
    data: { 
      avanceGlobal: parseFloat(avanceGlobal.toFixed(2)), 
      salud 
    }
  });
};

const calcularSaludProyecto = (fechaInicio, fechaObjetivo, avanceGlobal) => {
  const hoy = new Date().getTime();
  const inicio = new Date(fechaInicio).getTime();
  const fin = new Date(fechaObjetivo).getTime();

  if (hoy > fin && avanceGlobal < 100) return 'ROJO';
  if (avanceGlobal >= 100) return 'VERDE';

  const porcentajeTiempo = ((hoy - inicio) / (fin - inicio)) * 100;
  const retraso = porcentajeTiempo - avanceGlobal;

  if (retraso <= 5) return 'VERDE';
  if (retraso > 5 && retraso <= 15) return 'AMARILLO';
  return 'ROJO';
};