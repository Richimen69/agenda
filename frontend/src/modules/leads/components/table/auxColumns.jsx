import { ArrowUpDown, RefreshCcw } from "lucide-react";
import {
  EditableTextCell,
  BadgeSelectCell,
  CheckboxCell,
  EditableSelectCell,
  VentaCell,
} from "./cells/EditableCells";
import { RecoveryStatusCell } from "./cells/RecoveryStatusCell";
import { EstadoBadge } from "./cells/EstadoBadge";
import { formatDate } from "../../utils/leadsHelpers";
import { VENTA_AUTO_LOCK_DEPARTMENTS } from "../../utils/leadsHelpers";

const SortableHeader =
  (label) =>
  ({ column }) => (
    <button
      className="flex items-center gap-1 hover:text-gray-700 cursor-pointer"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <ArrowUpDown className="w-3 h-3 text-gray-400" />
    </button>
  );

const CONTACT_METHOD_OPTIONS = [
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "FACEBOOK_MESSENGER", label: "Messenger" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "FORMULARIO_WEB", label: "Formulario Web" },
];

const BRANCH_OPTIONS = [
  { value: "GUERRERO", label: "GUERRERO" },
  { value: "CHILPANCINGO", label: "CHILPANCINGO" },
];

const DEPARTMENT_OPTIONS = [
  { value: "NUEVOS", label: "Nuevos" },
  { value: "SEMINUEVOS", label: "Seminuevos" },
  { value: "DIGITAL", label: "Digital" },
];

const PHASE_OPTIONS = [
  { value: "R1_POR_CONTACTAR", label: "R1" },
  { value: "R2_CONTACTADO", label: "R2" },
  { value: "R2_ASIGNADO", label: "R3" },
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

export function buildAuxColumns(
  updateData,
  onOpenTimeline,
  users,
  updateMultiple,
) {
  const asesoresOptions = (users || [])
    .filter((user) => user?.area?.name === "Asesores de ventas")
    .map((user) => ({ value: user.name, label: user.name }));

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
      header: SortableHeader("Número"),
      accessorKey: "phone",
      cell: (props) => <EditableTextCell {...props} updateData={updateData} />,
    },
    {
      header: SortableHeader("Cliente"),
      accessorKey: "fullName",
      cell: (props) => <EditableTextCell {...props} updateData={updateData} />,
    },
    {
      header: SortableHeader("Interés"),
      accessorKey: "interest",
      cell: (props) => <EditableTextCell {...props} updateData={updateData} />,
    },
    {
      header: SortableHeader("Medio de Contacto"),
      accessorKey: "contactMethod",
      cell: (props) => (
        <BadgeSelectCell
          {...props}
          updateData={updateData}
          options={CONTACT_METHOD_OPTIONS}
        />
      ),
    },
    {
      header: SortableHeader("Asesor"),
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
      header: SortableHeader("Sucursal"),
      accessorKey: "branch",
      cell: (props) => (
        <BadgeSelectCell
          {...props}
          updateData={updateData}
          options={BRANCH_OPTIONS}
        />
      ),
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
      header: () => <span>Estado</span>,
      id: "estadoDerivado",
      filterFn: (row, columnId, filterValues) => {
        if (!filterValues.length) return true;
        return filterValues.includes(row.getValue(columnId));
      },
      cell: (props) => <EstadoBadge {...props} />,
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
  ];
}
