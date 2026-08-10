// src/modules/leads/columns.jsx
import { ArrowUpDown } from "lucide-react";
import {
  EditableTextCell,
  EditableSelectCell,
  BadgeSelectCell,
  CheckboxCell,
  VentaCell,
} from "./cells/EditableCells";
import {
  formatDate,
  formatCurrency,
  VENTA_AUTO_LOCK_DEPARTMENTS,
} from "../../utils/leadsHelpers";

const SortableHeader =
  (label) =>
  ({ column }) => (
    <button
      className="flex items-center gap-1 hover:text-gray-700"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <ArrowUpDown className="w-3 h-3 text-gray-400" />
    </button>
  );

const STATUS_OPTIONS = [
  { value: "NUEVO", label: "Nuevo" },
  { value: "ASIGNADO", label: "Asignado" },
  { value: "ATENDIDO", label: "Atendido" },
  { value: "AGENDADO", label: "Agendado" },
  { value: "PERDIDO", label: "Perdido" },
];

const SUCURSAL = [
  { value: "GUERRERO", label: "GUERRERO" },
  { value: "CHILPANCINGO", label: "CHILPANCINGO" },
  { value: "DIGITAL", label: "DIGITAL" },
];

const DEPARTMENT_OPTIONS = [
  { value: "SERVICIO", label: "Citas de Servicio" },
  { value: "NUEVOS", label: "Nuevos" },
  { value: "OPERADOR", label: "Operador" },
  { value: "REFACCIONES", label: "Refacciones" },
  { value: "DIGITAL", label: "Digital" },
  { value: "COMONUEVOS", label: "Comonuevos" },
];

const PHASE_OPTIONS = [
  { value: "R1_POR_CONTACTAR", label: "R1" },
  { value: "R2_CONTACTADO", label: "R2" },
];

const checkboxColumn = (accessorKey, label, updateData, getDisabled) => ({
  header: SortableHeader(label),
  accessorKey,
  cell: (props) => (
    <CheckboxCell
      {...props}
      updateData={updateData}
      disabled={getDisabled ? getDisabled(props.row.original) : false}
    />
  ),
});

export function buildLeadsColumns(updateData, users, updateMultiple) {
  const asesoresOptions = (users || [])
    .filter((user) => user?.area?.name === "Asesores de ventas")
    .map((user) => ({
      value: user.name,
      label: user.name,
    }));
  const responsablesOptions = (users || [])
    .filter((user) => user?.moduleRoles?.includes("LEADS_RESPONSABLE"))
    .map((user) => ({
      value: user.name,
      label: user.name,
    }));
  const isVentaLocked = (lead) =>
    VENTA_AUTO_LOCK_DEPARTMENTS.includes(lead.department) &&
    !!lead.amount &&
    lead.amount > 0;
  return [
    {
      header: SortableHeader("Fecha"),
      accessorKey: "date",
      cell: ({ getValue }) => (
        <div className="text-[13px] text-gray-700 py-1.5 px-1 whitespace-nowrap">
          {formatDate(getValue())}
        </div>
      ),
    },
    {
      header: SortableHeader("Nombre"),
      accessorKey: "fullName",
      cell: (props) => <EditableTextCell {...props} updateData={updateData} />,
    },
    {
      header: SortableHeader("Teléfono"),
      accessorKey: "phone",
      cell: (props) => <EditableTextCell {...props} updateData={updateData} />,
    },
    {
      header: SortableHeader("Origen"),
      accessorKey: "source",
      cell: (props) => <EditableTextCell {...props} updateData={updateData} />,
    },
    {
      header: SortableHeader("Área"),
      accessorKey: "department",
      cell: (props) => (
        <BadgeSelectCell
          {...props}
          updateData={updateData}
          options={DEPARTMENT_OPTIONS}
        />
      ),
    },
    {
      header: SortableHeader("Responsable"),
      accessorKey: "agent",
      cell: (props) => (
        <BadgeSelectCell
          {...props}
          updateData={updateData}
          options={responsablesOptions}
        />
      ),
    },
    {
      header: SortableHeader("Interés"),
      accessorKey: "interest",
      cell: (props) => <EditableTextCell {...props} updateData={updateData} />,
    },
    {
      header: SortableHeader("Asignación"),
      accessorKey: "assignment",
      cell: (props) => (
        <BadgeSelectCell
          {...props}
          updateData={updateData}
          options={asesoresOptions}
        />
      ),
    },
    {
      header: SortableHeader("T. Contacto"),
      accessorKey: "firstContactTime",
      cell: (props) => (
        <div className="w-16">
          <EditableTextCell {...props} updateData={updateData} type="number" />
        </div>
      ),
    },
    {
      header: SortableHeader("Estado"),
      accessorKey: "status",
      cell: (props) => (
        <BadgeSelectCell
          {...props}
          updateData={updateData}
          options={STATUS_OPTIONS}
        />
      ),
    },
    {
      header: SortableHeader("Fase"),
      accessorKey: "contactState",
      cell: (props) => (
        <EditableSelectCell
          {...props}
          updateData={updateData}
          options={PHASE_OPTIONS}
        />
      ),
    },
    checkboxColumn("isReturning", "Reingreso", updateData),
    checkboxColumn("hasAppointment", "Cita", updateData, isVentaLocked),
    checkboxColumn("showedUp", "Show", updateData, isVentaLocked),
    checkboxColumn("hasQuote", "Cotiz.", updateData),
    {
      header: SortableHeader("Monto Generado"),
      accessorKey: "amount",
      cell: (props) => (
        <div className="flex items-center w-24">
          <span className="text-gray-500 mr-1">$</span>
          <VentaCell
            {...props}
            updateData={updateData}
            type="number"
            placeholder="0.00"
            updateMultiple={updateMultiple}
          />
        </div>
      ),
    },
    {
      header: SortableHeader("Sucursal"),
      accessorKey: "branch",
      cell: (props) => (
        <BadgeSelectCell
          {...props}
          updateData={updateData}
          options={SUCURSAL}
        />
      ),
    },
  ];
}

export { formatCurrency };
