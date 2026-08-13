export const CardAmount = ({ title, amount, loading, type }) => {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-7">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : (
        <p className="text-2xl font-semibold text-gray-900">
          {type === "count"
            ? (amount?.totalLeads ?? 0)
            : amount?.totalAmount != null
              ? `$${amount.totalAmount.toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "N/A"}
        </p>
      )}
    </div>
  );
};
