import React from "react";

export const Select = ({ options, className = "", ...props }: any) => {
  return (
    <select
      className={`w-full bg-[var(--color-dark-glass)] border border-white/10 shadow-sm rounded-lg px-3 py-2 text-sm text-white font-bold backdrop-blur-md focus:outline-none focus:border-white/30 transition-colors ${className}`}
      {...props}
    >
      {options?.map((opt: any) => {
        const val = typeof opt === "string" ? opt : opt.value;
        const lbl = typeof opt === "string" ? (opt || "(Empty)") : opt.label;
        return (
          <option key={val} value={val} className="bg-black text-white font-bold">
            {lbl}
          </option>
        );
      })}
    </select>
  );
};
