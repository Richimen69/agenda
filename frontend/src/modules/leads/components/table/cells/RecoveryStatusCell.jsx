import { BadgeSelectCell } from "./EditableCells";

const RECOVERY_OPTIONS = [
  { value: "EN_SEGUIMIENTO", label: "En seguimiento" },
  { value: "NO_CONTACTABLE", label: "No contactable" },
  { value: "RECUPERADO_Y_ASIGNADO", label: "Recuperado" },
  { value: "DESCARTADO", label: "Descartado" },
];

export const RecoveryStatusCell = (props) => (
  <BadgeSelectCell {...props} options={RECOVERY_OPTIONS} />
);