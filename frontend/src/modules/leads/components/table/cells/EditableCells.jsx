import React, { useState, useEffect } from "react";
import { getBadgeColor } from "../../../utils/leadsHelpers";

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

export const EditableSelectCell = ({
  getValue,
  row,
  column,
  updateData,
  options,
}) => (
  <select
    value={getValue() || ""}
    onChange={(e) => updateData(row.index, column.id, e.target.value)}
    className="w-full bg-transparent text-[13px] text-gray-700 py-1 px-1 focus:outline-none cursor-pointer appearance-none"
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

export const CheckboxCell = ({ getValue, row, column, updateData }) => (
  <div className="flex justify-center">
    <input
      type="checkbox"
      checked={getValue() || false}
      onChange={(e) => updateData(row.index, column.id, e.target.checked)}
      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
    />
  </div>
);
