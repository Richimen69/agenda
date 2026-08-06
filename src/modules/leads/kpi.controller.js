import prisma from "#config/prisma";

export const getGeneratedAmount = async (req, res) => {
  const { month, department } = req.query;

  // Validación básica
  if (!department) {
    return res.status(400).json({ success: false, error: "Se requiere el parámetro department" });
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
    res.status(500).json({ success: false, error: "Error al obtener el monto generado" });
  }
};

export const getLeadsCount = async (req, res) => {
  const { month } = req.query;

  if (!month) {
    return res.status(400).json({ success: false, error: "Se requiere el parámetro month" });
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
      by: ['department'], // Le decimos que separe los resultados por departamento
      where: baseWhere,
      _count: {
        _all: true, // Le decimos que cuente cuántos registros hay en cada grupo
      },
    });

    // 4. Prisma devuelve un formato un poco anidado: [{ department: 'NUEVOS', _count: { _all: 10 } }]
    // Vamos a mapearlo para que el Frontend lo reciba más limpio y fácil de graficar:
    const formattedData = groupedLeads.map(item => ({
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
    res.status(500).json({ success: false, error: "Error al obtener el KPI de leads" });
  }
};