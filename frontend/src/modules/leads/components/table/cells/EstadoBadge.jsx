export const EstadoBadge = ({ row }) => {
  const asignado = !!row.original.assignment;
  return (
    <span
      className={`inline-flex text-[11px] font-medium px-2 py-1 rounded-md ${
        asignado ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
      }`}
    >
      {asignado ? "Asignado" : "No asignado"}
    </span>
  );
};