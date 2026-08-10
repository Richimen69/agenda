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
      placeholder={placeholder}
      className="w-full bg-transparent text-[13px] text-gray-700 py-1 px-1 border-b border-transparent focus:border-blue-500 focus:outline-none transition-colors"
    />
  );
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
