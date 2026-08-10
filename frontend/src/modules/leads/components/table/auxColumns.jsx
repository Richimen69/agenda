import { ArrowUpDown } from "lucide-react";
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
  { value: "LLAMADA", label: "Llamada" },
  { value: "FACEBOOK_MESSENGER", label: "Messenger" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "FORMULARIO_WEB", label: "Formulario Web" },
];

const BRANCH_OPTIONS = [
  { value: "GUERRERO", label: "GUERRERO" },
  { value: "CHILPANCINGO", label: "CHILPANCINGO" },
  { value: "DIGITAL", label: "DIGITAL" },
];

const DEPARTMENT_OPTIONS = [
  { value: "NUEVOS", label: "Nuevos" },
  { value: "SEMINUEVOS", label: "Seminuevos" },
  { value: "SERVICIO", label: "Servicio" },
  { value: "OPERADOR", label: "Operador" },
  { value: "REFACCIONES", label: "Refacciones" },
  { value: "DIGITAL", label: "Digital" },
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

export function buildAuxColumns(updateData, onOpenTimeline, users, updateMultiple) {
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
      accessorKey: "agent",
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
      header: SortableHeader("Seguimiento"),
      accessorKey: "recoveryStatus",
      cell: (props) => (
        <RecoveryStatusCell {...props} updateData={updateData} />
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
      cell: (props) => <EstadoBadge {...props} />,
    },
    checkboxColumn("isReturning", "Reingreso", updateData),
    checkboxColumn("hasAppointment", "Cita", updateData, isVentaLocked),
    checkboxColumn("showedUp", "Show", updateData, isVentaLocked),
    {
      header: SortableHeader("Fase"),
      accessorKey: "contactState",
      cell: (props) => <EditableSelectCell {...props} updateData={updateData} options={PHASE_OPTIONS} />,
    },
    {
      header: SortableHeader("Venta"),
      accessorKey: "amount",
      cell: (props) => <VentaCell {...props} updateData={updateData} updateMultiple={updateMultiple} />,
    },
  ];
}
