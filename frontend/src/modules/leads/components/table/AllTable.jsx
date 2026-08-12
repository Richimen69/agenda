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
  Search,
  Trash2,
  Download,
  Plus,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Upload as UploadIcon } from "lucide-react";

import { useLeadsTable } from "../../hooks/useLeadsTable";
import { buildLeadsColumns } from "./columns";
import {
  debounce,
  exportLeadsToCSV,
  globalLeadFilter,
} from "../../utils/leadsHelpers";
import { CreateLeadModal } from "../modals/CreateLeadModal";
import { ImportLeadsModal } from "../modals/ImportLeadsModal";
import { LeadTimelineModal } from "../modals/LeadTimelineModal";
import { MessageSquareText } from "lucide-react";

export const AllTable = ({ leads, onLeadsChange, user, users }) => {
  const {
    data,
    updateCell,
    updateMultipleCells,
    addLead,
    removeLead,
    reactivateLead,
    bulkImportLeads,
    importProgress,
    addComment,
    creating,
  } = useLeadsTable(leads, onLeadsChange);
  const [timelineLeadId, setTimelineLeadId] = useState(null);
  const timelineLead = data.find((l) => l.id === timelineLeadId) || null;
  const [globalFilter, setGlobalFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const debouncedSetFilter = useMemo(() => debounce(setGlobalFilter, 250), []);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const columns = useMemo(
    () => [
      ...buildLeadsColumns(updateCell, users, updateMultipleCells),
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
    [updateCell, removeLead, updateMultipleCells],
  );

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: globalLeadFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  });
  const handleCreate = async (formData) => {
    const ok = await addLead(formData);
    if (ok) setModalOpen(false);
  };

  const filteredCount = table.getFilteredRowModel().rows.length;

  return (
    <div className="min-h-screen p-4 lg:p-8 font-sans">
      {/* HEADER SUPERIOR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 m-0 tracking-tight">
          Leads Registrados
        </h2>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <button
            className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
            onClick={() => exportLeadsToCSV(data, `leads_${Date.now()}.csv`)}
          >
            <Download className="w-4 h-4" />
            Exportar Datos
          </button>
          <button
            className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
            onClick={() => setImportModalOpen(true)}
          >
            <UploadIcon className="w-4 h-4" />
            Importar
          </button>
          <button
            disabled={creating}
            className="flex items-center gap-2 px-5 py-2 bg-brand text-white rounded-full text-sm font-medium hover:bg-[#e8543b] transition-colors shadow-sm disabled:opacity-50"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            {creating ? "Creando..." : "Nuevo Lead"}
          </button>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 overflow-hidden">
        {/* BARRA DE HERRAMIENTAS */}
        <div className="flex flex-col lg:flex-row justify-between items-center p-4 border-b border-gray-100 gap-4">
          <div className="flex items-center gap-2 text-gray-400 w-full lg:w-auto px-1">
            <Search className="w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono, origen o responsable..."
              onChange={(e) => debouncedSetFilter(e.target.value)}
              className="text-sm outline-none w-full lg:w-96 text-gray-700 bg-transparent placeholder-gray-400"
            />
          </div>
        </div>

        {/* TABLA */}
        <div className="overflow-x-auto">
          <table className="min-w-max w-full text-left whitespace-nowrap">
            <thead className="bg-white border-b border-gray-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
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
              className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
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
              className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
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
      <CreateLeadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={addLead}
        onReactivate={reactivateLead}
        creating={creating}
      />
      <ImportLeadsModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={bulkImportLeads}
        importProgress={importProgress}
      />
      <LeadTimelineModal
        lead={timelineLead}
        user={user}
        isOpen={!!timelineLeadId}
        onClose={() => setTimelineLeadId(null)}
        onAddComment={addComment}
      />
    </div>
  );
};
