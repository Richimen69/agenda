export const getAsesoresOptions = (users = []) => {
  return users
    .filter((user) => user?.area?.name === "Asesores de ventas")
    .map((user) => ({ value: user.name, label: user.name }));
};

export const getResponsablesOptions = (users = []) => {
  return users
    .filter((user) => user?.moduleRoles?.includes("LEADS_RESPONSABLE"))
    .map((user) => ({ value: user.name, label: user.name }));
};

// Configuración de filtros para AllTable
export const getAllTableFilters = (users = []) => {
  const asesoresOptions = getAsesoresOptions(users);
  const responsablesOptions = getResponsablesOptions(users);

  return [
    {
      id: "department",
      label: "Departamento",
      options: [
        "NUEVOS",
        "SEMINUEVOS",
        "SERVICIO",
        "DIGITAL",
        "OPERADOR",
        "REFACCIONES",
      ],
    },
    {
      id: "status",
      label: "Estado",
      options: ["NUEVO", "ATENDIDO", "AGENDADO", "PERDIDO"],
    },
    {
      id: "isReturning",
      label: "Tipo de Lead",
      options: [{ label: "Reingreso (Sí)", value: true }],
    },
    {
      id: "assignment",
      label: "Asignación",
      options: asesoresOptions,
    },
    {
      id: "agent",
      label: "Responsable",
      options: responsablesOptions,
    },
    {
      id: "contactState",
      label: "Fase",
      options: ["R1_POR_CONTACTAR", "R2_CONTACTADO", "R3_ASIGNADO"],
    },
    {
      id: "amount",
      label: "Ventas",
      options: [
        { label: "Con Venta", value: "has_amount" },
        { label: "Sin Venta", value: "no_amount" },
      ],
    },
  ];
};

// Configuración de filtros para AuxTable
export const getAuxTableFilters = (users = []) => {
  const asesoresOptions = getAsesoresOptions(users);

  return [
    {
      id: "department",
      label: "Área",
      options: ["NUEVOS", "SEMINUEVOS", "DIGITAL"],
    },
    {
      id: "contactMethod",
      label: "Medio Contacto",
      options: [
        "WHATSAPP",
        "FACEBOOK_MESSENGER",
        "INSTAGRAM",
        "FORMULARIO_WEB",
      ],
    },
    {
      id: "branch",
      label: "Sucursal",
      options: ["GUERRERO", "CHILPANCINGO"],
    },
    {
      id: "assignment",
      label: "Asesor",
      options: asesoresOptions,
    },
    {
      id: "isReturning",
      label: "Tipo de Lead",
      options: [{ label: "Reingreso (Sí)", value: true }],
    },
    {
      id: "contactState",
      label: "Fase",
      options: ["R1_POR_CONTACTAR", "R2_CONTACTADO", "R3_ASIGNADO"],
    },
    {
      id: "amount",
      label: "Ventas",
      options: [
        { label: "Con Venta", value: "has_amount" },
        { label: "Sin Venta", value: "no_amount" },
      ],
    },
  ];
};
