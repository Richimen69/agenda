import prisma from "#config/prisma";

export const getGeneratedAmount = async (req, res) => {
  const { month, department } = req.query;

  // Validación básica
  if (!department) {
    return res
      .status(400)
      .json({ success: false, error: "Se requiere el parámetro department" });
  }

  try {
    // 1. Armamos las fechas igual que en tu otro endpoint
    const startDate = new Date(`${month}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // 2. Preparamos los departamentos
    const departmentList = department.split(",");

    // 3. Filtro base
    const baseWhere = {
      department: { in: departmentList },
      date: { gte: startDate, lt: endDate },
      // Opcional: podrías agregar una condición para solo sumar ventas cerradas
      // status: "VENTA"
    };

    // 4. Hacemos la suma (aggregate) en Prisma
    const aggregations = await prisma.lead.aggregate({
      where: baseWhere,
      _sum: {
        amount: true, // Aquí le decimos a Prisma que sume la columna "amount"
      },
    });

    // Si no hay registros, Prisma devuelve null, por eso ponemos el || 0
    const totalAmount = aggregations._sum.amount || 0;

    // 5. Devolvemos el resultado
    res.json({
      success: true,
      data: {
        department: departmentList,
        month,
        totalAmount,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, error: "Error al obtener el monto generado" });
  }
};

export const getLeadsCount = async (req, res) => {
  const { month } = req.query;

  if (!month) {
    return res
      .status(400)
      .json({ success: false, error: "Se requiere el parámetro month" });
  }

  try {
    // 1. Armamos las fechas
    const startDate = new Date(`${month}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // 2. Filtro base de fechas
    const baseWhere = {
      date: { gte: startDate, lt: endDate },
    };

    // 3. Agrupamos y contamos con Prisma (groupBy)
    const groupedLeads = await prisma.lead.groupBy({
      by: ["department"], // Le decimos que separe los resultados por departamento
      where: baseWhere,
      _count: {
        _all: true, // Le decimos que cuente cuántos registros hay en cada grupo
      },
    });

    // 4. Prisma devuelve un formato un poco anidado: [{ department: 'NUEVOS', _count: { _all: 10 } }]
    // Vamos a mapearlo para que el Frontend lo reciba más limpio y fácil de graficar:
    const formattedData = groupedLeads.map((item) => ({
      department: item.department,
      count: item._count._all,
    }));

    const totalLeads = formattedData.reduce((sum, item) => sum + item.count, 0);

    // 5. Devolvemos la respuesta
    res.json({
      success: true,
      data: {
        month,
        totalLeads,
        leadsByDepartment: formattedData,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, error: "Error al obtener el KPI de leads" });
  }
};

export const getRecoveryFunnel = async (req, res) => {
  const { month } = req.query;

  try {
    const startDate = new Date(`${month}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

const targetDepartments = { in: ["NUEVOS", "SEMINUEVOS"] };

    const [
      conversaciones,
      enSeguimiento,
      noContactables,
      recuperados,
      traidosDeVuelta,
      totalLeads,
    ] = await Promise.all([
      // 1. Comentarios totales (solo de los departamentos seleccionados)
      prisma.leadComment.count({
        where: { 
          lead: { 
            date: { gte: startDate, lt: endDate },
            department: targetDepartments
          } 
        },
      }),
      // 2. Leads en seguimiento
      prisma.lead.count({
        where: {
          recoveryStatus: "EN_SEGUIMIENTO",
          date: { gte: startDate, lt: endDate },
          department: targetDepartments
        },
      }),
      // 3. Leads no contactables
      prisma.lead.count({
        where: {
          recoveryStatus: "NO_CONTACTABLE",
          date: { gte: startDate, lt: endDate },
          department: targetDepartments
        },
      }),
      // 4. Leads recuperados
      prisma.lead.count({
        where: {
          contactState: "R2_CONTACTADO",
          date: { gte: startDate, lt: endDate },
          department: targetDepartments
        },
      }),
      // 5. Comentarios de reactivación
      prisma.leadComment.count({
        where: {
          type: "SYSTEM_REACTIVATED",
          lead: { 
            date: { gte: startDate, lt: endDate },
            department: targetDepartments
          },
        },
      }),
      // 6. Total de leads de esos departamentos
      prisma.lead.count({ 
        where: { 
          date: { gte: startDate, lt: endDate },
          department: targetDepartments 
        } 
      }),
    ]);

    res.json({
      success: true,
      data: {
        conversaciones,
        enSeguimiento,
        noContactables,
        recuperados,
        traidosDeVuelta,
        conversionRate:
          conversaciones > 0
            ? +((enSeguimiento / conversaciones) * 100).toFixed(1)
            : 0,
        recuperacionRate:
          enSeguimiento + noContactables > 0
            ? +((recuperados / (enSeguimiento + noContactables)) * 100).toFixed(
                1,
              )
            : 0,
        efectividadRate:
          totalLeads > 0
            ? +((traidosDeVuelta / totalLeads) * 100).toFixed(1)
            : 0,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Error al obtener funnel de recuperación",
    });
  }
};

export const getDigitalFunnel = async (req, res) => {
  const { month, department } = req.query;

  if (!department) {
    return res
      .status(400)
      .json({ success: false, error: "Se requiere el parámetro department" });
  }

  try {
    const startDate = new Date(`${month}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const departmentList = department.split(",");

    const baseWhere = {
      department: { in: departmentList },
      date: { gte: startDate, lt: endDate },
    };

    const [leads, contactados, citas, shows, ventas] = await Promise.all([
      prisma.lead.count({ where: baseWhere }),
      prisma.lead.count({ where: { ...baseWhere, status: { not: "NUEVO" } } }),
      prisma.lead.count({ where: { ...baseWhere, hasAppointment: true } }),
      prisma.lead.count({ where: { ...baseWhere, showedUp: true } }),
      prisma.lead.count({
        where: { ...baseWhere, amount: { not: null, gt: 0 } },
      }),
    ]);

    const calcPercent = (value) =>
      leads > 0 ? +((value / leads) * 100).toFixed(0) : 0;

    res.json({
      success: true,
      data: {
        department: departmentList,
        leads,
        contactados,
        citas,
        shows,
        ventas, // Ya se calcula dinámicamente
        contactadosPercent: calcPercent(contactados),
        citasPercent: calcPercent(citas),
        showsPercent: calcPercent(shows),
        ventasPercent: calcPercent(ventas),
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, error: "Error al obtener funnel digital" });
  }
};
