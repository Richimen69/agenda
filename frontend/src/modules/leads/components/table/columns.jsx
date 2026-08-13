// src/modules/leads/columns.jsx
import { ArrowUpDown, RefreshCcw } from "lucide-react";
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
  { value: "SEMINUEVOS", label: "SEMINUEVOS" },
];

const PHASE_OPTIONS = [
  { value: "R1_POR_CONTACTAR", label: "R1" },
  { value: "R2_CONTACTADO", label: "R2" },
  { value: "R3_ASIGNADO", label: "R3" },
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

export function buildLeadsColumns(
  updateData,
  asesoresOptions,
  responsablesOptions,
  updateMultiple,
) {
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
      filterFn: (row, columnId, filterValues) => {
        if (!filterValues.length) return true;
        return filterValues.includes(row.getValue(columnId));
      },
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
      filterFn: (row, columnId, filterValues) => {
        if (!filterValues.length) return true;
        return filterValues.includes(row.getValue(columnId));
      },
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
      filterFn: (row, columnId, filterValues) => {
        if (!filterValues.length) return true;
        return filterValues.includes(row.getValue(columnId));
      },
      filterFn: (row, columnId, filterValues) => {
        if (!filterValues.length) return true;
        return filterValues.includes(row.getValue(columnId));
      },
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
      filterFn: (row, columnId, filterValues) => {
        return filterValues.includes(row.getValue(columnId));
      },
      cell: (props) => (
        <EditableSelectCell
          {...props}
          updateData={updateData}
          options={PHASE_OPTIONS}
        />
      ),
    },
    {
      accessorKey: "isReturning",
      header: "Reingreso",
      filterFn: (row, columnId, filterValues) => {
        return filterValues.includes(row.getValue(columnId));
      },
      cell: ({ row }) => {
        const isReturning = row.getValue("isReturning");

        if (!isReturning) return null;

        return (
          <span className="flex items-center gap-1.5 text-brand px-2.5 py-1 rounded-md text-xs font-semibold w-max">
            <RefreshCcw className="w-3.5 h-3.5" />
            Reingreso
          </span>
        );
      },
    },
    checkboxColumn("hasAppointment", "Cita", updateData, isVentaLocked),
    checkboxColumn("showedUp", "Show", updateData, isVentaLocked),
    checkboxColumn("hasQuote", "Cotiz.", updateData),
    {
      header: SortableHeader("Monto Generado"),
      accessorKey: "amount",
      filterFn: (row, columnId, filterValues) => {
        if (!filterValues.length) return true;

        const amount = row.getValue(columnId);
        const hasAmount = amount != null && amount > 0;

        // Evaluamos según lo que haya seleccionado el usuario en el menú
        const matchesConVenta =
          filterValues.includes("has_amount") && hasAmount;
        const matchesSinVenta =
          filterValues.includes("no_amount") && !hasAmount;

        return matchesConVenta || matchesSinVenta;
      },
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
