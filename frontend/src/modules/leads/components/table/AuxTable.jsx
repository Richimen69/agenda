import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  MessageSquareText,
  Trash2,
  Plus,
} from "lucide-react"; // Se quitaron Search y Calendar
import { useLeadsTable } from "../../hooks/useLeadsTable";
import { buildAuxColumns } from "./auxColumns";
import { LeadTimelineModal } from "../modals/LeadTimelineModal";
import { debounce, globalLeadFilter } from "../../utils/leadsHelpers";
import { CreateLeadModal } from "../modals/CreateLeadModal";

// 1. IMPORTAMOS EL TOOLBAR Y LA CONFIGURACIÓN DE FILTROS
import { TableToolbar } from "./TableToolbar";
import { getAuxTableFilters } from "../../utils/filterConfigs";

export const AuxTable = ({
  leads,
  onLeadsChange,
  user,
  users,
  selectedMonth,
  onMonthChange,
  onSearch,
}) => {
  const {
    data,
    updateCell,
    updateMultipleCells,
    addComment,
    removeLead,
    addLead,
    reactivateLead,
    creating,
  } = useLeadsTable(leads, onLeadsChange);

  const agents = useMemo(() => {
    return (users || []).filter(
      (user) =>
        user?.moduleRoles?.includes("LEADS_RESPONSABLE") ||
        user?.moduleRoles?.includes("LEADS_ADMIN"),
    );
  }, [users]);

  const [globalFilter, setGlobalFilter] = useState("");
  const [timelineLeadId, setTimelineLeadId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // 2. NUEVO ESTADO PARA LOS FILTROS DE COLUMNAS
  const [columnFilters, setColumnFilters] = useState([]);

  // 3. OBTENEMOS LA CONFIGURACIÓN DE FILTROS PARA AUXTABLE
  const FILTER_CONFIG_AUX = useMemo(() => getAuxTableFilters(users), [users]);

  const debouncedSetFilter = useMemo(() => debounce(setGlobalFilter, 250), []);
  const debouncedBackendSearch = useMemo(
    () => debounce((value) => onSearch(selectedMonth, value), 500),
    [selectedMonth, onSearch],
  );

  const columns = useMemo(
    () => [
      ...buildAuxColumns(updateCell, agents, users, updateMultipleCells),
      {
        id: "timeline",
        header: () => <span></span>,
        cell: ({ row }) => (
          <button
            className="flex items-center justify-center px-2"
            onClick={() => setTimelineLeadId(row.original.id)}
            title="Ver bitácora"
          >
            <MessageSquareText className="w-4 h-4 text-gray-400 hover:text-brand cursor-pointer" />
          </button>
        ),
      },
      {
        id: "actions",
        header: () => <span className="flex justify-end"></span>,
        cell: ({ row }) => (
          <button
            className="flex justify-end gap-3 items-center px-2"
            onClick={() => removeLead(row.original.id)}
            title="Eliminar lead"
          >
            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500 cursor-pointer" />
          </button>
        ),
      },
    ],
    [updateCell, agents, removeLead, updateMultipleCells],
  );

  const table = useReactTable({
    data,
    columns,
    // 4. AGREGAMOS COLUMNFILTERS AL ESTADO DE TANSTACK
    state: { globalFilter, columnFilters }, 
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters, 
    globalFilterFn: globalLeadFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  });

  const timelineLead = data.find((l) => l.id === timelineLeadId) || null;
  const filteredCount = table.getFilteredRowModel().rows.length;

  return (
    <div className="min-h-screen p-4 lg:p-8 font-sans">
      {/* HEADER SUPERIOR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 m-0 tracking-tight">
          Leads CRM
        </h2>
        <button
          disabled={creating}
          className="mt-4 sm:mt-0 flex items-center gap-2 px-5 py-2 bg-brand text-white rounded-full text-sm font-medium hover:bg-[#e8543b] transition-colors shadow-sm disabled:opacity-50"
          onClick={() => setModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          {creating ? "Creando..." : "Nuevo Lead"}
        </button>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 overflow-hidden">
        
        {/* 5. NUESTRO NUEVO COMPONENTE DE BARRA DE HERRAMIENTAS */}
        <TableToolbar
          searchPlaceholder="Buscar por cliente, teléfono, interés u origen..."
          onSearch={(e) => debouncedBackendSearch(e.target.value)}
          selectedMonth={selectedMonth}
          onMonthChange={onMonthChange}
          filterConfig={FILTER_CONFIG_AUX}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
        />

        {/* TABLA */}
        <div className="overflow-x-auto">
          <table className="min-w-max w-full text-left whitespace-nowrap">
            <thead className="bg-white border-b border-gray-100">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-50">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-10 text-gray-400 text-sm"
                  >
                    No se encontraron leads.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50/80 transition-colors duration-150 ease-in-out group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-2.5">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER Y PAGINACIÓN */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-[13px] text-gray-500 gap-4">
          <div>
            Mostrando{" "}
            <span className="font-medium text-brand">
              {table.getRowModel().rows.length}
            </span>{" "}
            de <span className="font-medium">{filteredCount}</span> registros
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2">
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount() || 1}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            Ir a pág.
            <input
              type="number"
              min={1}
              max={table.getPageCount() || 1}
              defaultValue={table.getState().pagination.pageIndex + 1}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const page = Number(e.target.value) - 1;
                  table.setPageIndex(
                    Math.max(0, Math.min(page, table.getPageCount() - 1)),
                  );
                }
              }}
              className="w-14 h-8 border border-gray-200 rounded text-center outline-none focus:border-brand text-gray-700"
            />
          </div>
        </div>
      </div>

      <LeadTimelineModal
        lead={timelineLead}
        isOpen={!!timelineLeadId}
        onClose={() => setTimelineLeadId(null)}
        onAddComment={addComment}
        user={user}
      />
      <CreateLeadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={addLead}
        onReactivate={reactivateLead}
        creating={creating}
      />
    </div>
  );
};