import React, { useState, useEffect } from "react";
import { getBadgeColor } from "../../../utils/leadsHelpers";
import { ChevronDown } from "lucide-react";
import { VENTA_AUTO_LOCK_DEPARTMENTS } from "../../../utils/leadsHelpers";

export const EditableTextCell = ({
  getValue,
  row,
  column,
  updateData,
  type = "text",
  placeholder = "-",
}) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue ?? "");
  useEffect(() => {
    setValue(initialValue ?? "");
  }, [initialValue]);

  const onBlur = () => {
    let valueToSave = value;
    if (type === "number") {
      valueToSave = value === "" ? null : Number(value);
    }
    if (valueToSave !== initialValue) {
      updateData(row.index, column.id, valueToSave);
    }
  };

  return (
    <input
      type={type}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      onKeyDown={handleCellNavigation}
      placeholder={placeholder}
      className="w-full bg-transparent text-[13px] text-gray-700 py-1 px-1 border-b border-transparent focus:border-blue-500 focus:outline-none transition-colors"
    />
  );
};

const handleCellNavigation = (e) => {
  const { key, target } = e;

  if (
    !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter"].includes(key)
  ) {
    return;
  }

  // Si el usuario está escribiendo y presiona izquierda/derecha,
  // solo cambiamos de celda si el cursor está al inicio o al final del texto.
  if (key === "ArrowLeft" && target.selectionStart > 0) return;
  if (key === "ArrowRight" && target.selectionEnd < target.value.length) return;

  const td = target.closest("td");
  if (!td) return;

  const tr = td.closest("tr");
  const cellIndex = Array.from(tr.children).indexOf(td);

  let targetCell = null;

  if (key === "ArrowDown" || key === "Enter") {
    e.preventDefault(); // Evitamos que la pantalla haga scroll con las flechas
    const nextRow = tr.nextElementSibling;
    if (nextRow) targetCell = nextRow.children[cellIndex];
  } else if (key === "ArrowUp") {
    e.preventDefault();
    const prevRow = tr.previousElementSibling;
    if (prevRow) targetCell = prevRow.children[cellIndex];
  } else if (key === "ArrowRight") {
    e.preventDefault();
    targetCell = td.nextElementSibling;
  } else if (key === "ArrowLeft") {
    e.preventDefault();
    targetCell = td.previousElementSibling;
  }

  // Si encontramos una celda destino, buscamos su input/select y lo enfocamos
  if (targetCell) {
    const nextInput = targetCell.querySelector(
      "input:not([disabled]), select:not([disabled])",
    );
    if (nextInput) {
      nextInput.focus();
      // Si es un input de texto, seleccionamos todo el texto para escribir rápido
      if (nextInput.type === "text" || nextInput.type === "number") {
        nextInput.select();
      }
    }
  }
};

export const VentaCell = ({
  row,
  column,
  updateData,
  updateMultiple,
  getValue,
}) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue ?? "");

  useEffect(() => {
    setValue(initialValue ?? "");
  }, [initialValue]);

  const isVenta = !!initialValue && initialValue > 0;
  const department = row.original.department;
  const appliesAutoLock = VENTA_AUTO_LOCK_DEPARTMENTS.includes(department);

  const onBlur = () => {
    const valueToSave = value === "" ? null : Number(value);
    if (valueToSave === initialValue) return;

    const nowIsVenta = !!valueToSave && valueToSave > 0;

    if (appliesAutoLock) {
      if (nowIsVenta) {
        // Se registró un monto -> marca y bloquea Cita/Show
        updateMultiple(row.index, {
          amount: valueToSave,
          hasAppointment: true,
          showedUp: true,
        });
        return;
      }
      if (!nowIsVenta && isVenta) {
        // Se borró el monto -> desbloquea y regresa Cita/Show a false
        updateMultiple(row.index, {
          amount: valueToSave,
          hasAppointment: false,
          showedUp: false,
        });
        return;
      }
    }

    updateData(row.index, column.id, valueToSave);
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
          isVenta ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"
        }`}
      >
        {isVenta ? "Venta" : "-"}
      </span>
      <div className="flex items-center w-20">
        <span className="text-gray-400 text-xs mr-0.5">$</span>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={onBlur}
          onKeyDown={handleCellNavigation}
          placeholder="0.00"
          className="w-full bg-transparent text-[12px] text-gray-700 py-1 border-b border-transparent focus:border-blue-500 focus:outline-none"
        />
      </div>
    </div>
  );
};

export const EditableSelectCell = ({
  getValue,
  row,
  column,
  updateData,
  options,
}) => (
  <div className="relative w-full group flex items-center">
    <select
      value={getValue() || ""}
      onChange={(e) => updateData(row.index, column.id, e.target.value)}
      className="w-full bg-transparent text-[13px] text-gray-700 py-1 pl-1 pr-6 border-b border-transparent focus:border-brand focus:outline-none transition-colors cursor-pointer appearance-none z-10"
    >
      <option value="" disabled>
        Seleccione...
      </option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>

    {/* Icono de flecha personalizado */}
    <div className="absolute right-0 pointer-events-none flex items-center pr-1">
      <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-brand transition-colors" />
    </div>
  </div>
);

export const BadgeSelectCell = ({
  getValue,
  row,
  column,
  updateData,
  options,
}) => {
  const value = getValue() || "";
  return (
    <div
      className={`inline-flex cursor-pointer rounded-md px-2 py-1 ${getBadgeColor(value)}`}
    >
      <select
        value={value}
        onChange={(e) => updateData(row.index, column.id, e.target.value)}
        className="bg-transparent text-[12px] font-medium focus:outline-none cursor-pointer appearance-none outline-none"
      >
        <option value="" disabled>
          Seleccione...
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export const CheckboxCell = ({
  getValue,
  row,
  column,
  updateData,
  disabled = false,
}) => (
  <div className="flex justify-center">
    <input
      type="checkbox"
      checked={getValue() || false}
      disabled={disabled}
      onKeyDown={handleCellNavigation}
      onChange={(e) => updateData(row.index, column.id, e.target.checked)}
      title={
        disabled
          ? "Se bloqueó automáticamente al registrar el Monto de venta"
          : undefined
      }
      className={`w-4 h-4 rounded focus:ring-brand ${
        disabled
          ? "opacity-50 cursor-not-allowed bg-gray-200 border-gray-300"
          : "text-brand bg-gray-100 border-gray-300 cursor-pointer"
      }`}
    />
  </div>
);

export const EditableDateCell = ({
  getValue,
  row,
  column,
  updateData,
}) => {
  const initialValue = getValue();

  // Función para convertir la fecha del backend a YYYY-MM-DD para el input HTML
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    
    // Usamos métodos locales para evitar que la zona horaria cambie el día
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [value, setValue] = useState(formatDateForInput(initialValue));

  useEffect(() => {
    setValue(formatDateForInput(initialValue));
  }, [initialValue]);

  const onBlur = () => {
    if (value !== formatDateForInput(initialValue)) {
      // Le agregamos un mediodía (T12:00:00) falso para evitar desfases de zona horaria 
      // al guardarlo de vuelta en la base de datos
      const valueToSave = value ? new Date(`${value}T12:00:00`).toISOString() : null;
      updateData(row.index, column.id, valueToSave);
    }
  };

  return (
    <input
      type="date"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      // onKeyDown={handleCellNavigation} // 👈 Descomenta esto si ya implementaste la navegación con flechas
      className="w-full bg-transparent text-[13px] text-gray-700 py-1 px-1 border-b border-transparent focus:border-brand focus:outline-none transition-colors cursor-pointer"
    />
  );
};
