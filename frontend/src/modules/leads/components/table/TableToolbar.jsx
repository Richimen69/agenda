import React, { useState, useRef, useEffect } from "react";
import { Search, Calendar, Filter, ChevronDown, Check, X } from "lucide-react";

export const TableToolbar = ({
  searchPlaceholder = "Buscar en historial...",
  onSearch,
  selectedMonth,
  onMonthChange,
  filterConfig = [],
  columnFilters,
  setColumnFilters,
}) => {
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef(null);
  const [expandedGroups, setExpandedGroups] = useState([]); // Inician colapsados por defecto

  // Cerrar al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target)
      ) {
        setIsFilterMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lógica de checks
  const toggleFilter = (columnId, value) => {
    setColumnFilters((prev) => {
      const existingFilter = prev.find((f) => f.id === columnId);
      let newValues = existingFilter ? [...existingFilter.value] : [];

      if (newValues.includes(value)) {
        newValues = newValues.filter((v) => v !== value);
      } else {
        newValues.push(value);
      }

      if (newValues.length === 0) {
        return prev.filter((f) => f.id !== columnId);
      }

      return [
        ...prev.filter((f) => f.id !== columnId),
        { id: columnId, value: newValues },
      ];
    });
  };

  const removeFilterValue = (columnId, valueToRemove) =>
    toggleFilter(columnId, valueToRemove);

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    );
  };

  const activeFiltersCount = columnFilters.reduce(
    (acc, curr) => acc + curr.value.length,
    0,
  );

  return (
    <div className="flex flex-col p-4 border-b border-gray-100 gap-4">
      {/* FILA PRINCIPAL */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 relative">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          {/* BOTÓN Y MENÚ DE FILTROS */}
          <div className="relative" ref={filterMenuRef}>
            <button
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer text-sm font-medium transition-colors ${
                activeFiltersCount > 0
                  ? "bg-brand border-brand text-white"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 bg-white text-brand rounded-full text-xs font-bold ml-1">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Menú Popover (Dropdown) */}
            {isFilterMenuOpen && (
              <>
                {/* 1. Capa transparente invisible para cerrar al hacer clic afuera (reemplaza o complementa tu useEffect) */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsFilterMenuOpen(false)}
                />

                {/* 2. Menú con posicionamiento fixed para que flote sobre toda la pantalla sin importar si la tabla se encoge */}
                <div
                  className="fixed z-50 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden mt-1"
                  style={{
                    // Opcional: si quieres que aparezca justo debajo del botón de Filtros automáticamente
                    top: filterMenuRef.current
                      ? filterMenuRef.current.getBoundingClientRect().bottom + 8
                      : 0,
                    left: filterMenuRef.current
                      ? filterMenuRef.current.getBoundingClientRect().left
                      : 0,
                  }}
                >
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <span className="font-semibold text-gray-700 text-sm">
                      Filtros Avanzados
                    </span>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={() => setColumnFilters([])}
                        className="text-xs text-brand hover:underline cursor-pointer"
                      >
                        Limpiar todo
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto p-2">
                    {filterConfig.map((group) => {
                      const currentGroupFilter = columnFilters.find(
                        (f) => f.id === group.id,
                      );
                      const selectedValues = currentGroupFilter
                        ? currentGroupFilter.value
                        : [];
                      const isExpanded = expandedGroups.includes(group.id);

                      return (
                        <div
                          key={group.id}
                          className="mb-2 last:mb-0 border-b border-gray-50 last:border-0 pb-2 last:pb-0"
                        >
                          <button
                            onClick={() => toggleGroup(group.id)}
                            className="w-full flex justify-between items-center px-2 py-1.5 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                              {group.label}
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                            />
                          </button>
                          {isExpanded && (
                            <div className="mt-1 flex flex-col gap-1">
                              {group.options.map((opt) => {
                                const optionLabel =
                                  typeof opt === "object" ? opt.label : opt;
                                const optionValue =
                                  typeof opt === "object" ? opt.value : opt;
                                const isSelected =
                                  selectedValues.includes(optionValue);
                                return (
                                  <div
                                    key={String(optionValue)}
                                    onClick={() =>
                                      toggleFilter(group.id, optionValue)
                                    }
                                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors select-none ml-2"
                                  >
                                    <div
                                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? "bg-brand border-brand text-white" : "border-gray-300 bg-white"}`}
                                    >
                                      {isSelected && (
                                        <Check className="w-3 h-3" />
                                      )}
                                    </div>
                                    <span className="text-sm text-gray-700">
                                      {optionLabel}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* BUSCADOR */}
          <div className="flex items-center gap-2 text-gray-400 w-full lg:w-72 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus-within:border-brand focus-within:ring-1 focus-within:ring-brand">
            <Search className="w-4 h-4" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              onChange={onSearch}
              className="text-sm outline-none w-full bg-transparent text-gray-700"
            />
          </div>
        </div>

        {/* SELECTOR DE MES */}
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
          <Calendar className="w-4 h-4 text-gray-500" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="text-sm bg-transparent outline-none text-gray-700 font-medium cursor-pointer"
          />
        </div>
      </div>

      {/* ETIQUETAS (PILLS) */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center mt-2 sticky top-0">
          <span className="text-xs text-gray-500 font-medium mr-1">
            Filtros activos:
          </span>
          {columnFilters.map((filter) =>
            filter.value.map((val) => {
              const groupConfig = filterConfig.find((g) => g.id === filter.id);
              const groupLabel = groupConfig?.label;
              const optionLabel =
                groupConfig?.options.find((o) => o.value === val)?.label || val;

              return (
                <span
                  key={`${filter.id}-${val}`}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-medium"
                >
                  <span className="opacity-70">{groupLabel}:</span>{" "}
                  {optionLabel}
                  <button
                    onClick={() => removeFilterValue(filter.id, val)}
                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            }),
          )}
        </div>
      )}
    </div>
  );
};
