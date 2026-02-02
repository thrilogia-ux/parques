"use client";

import { useState } from "react";

type LayersControlProps = {
  showLayers: {
    puntos: boolean;
    sanitarios: boolean;
    emergencia: boolean;
    salidas: boolean;
    caminos: boolean;
  };
  onToggle: (key: keyof LayersControlProps["showLayers"]) => void;
};

export default function LayersControl({ showLayers, onToggle }: LayersControlProps) {
  const [open, setOpen] = useState(false);
  const layers = [
    { key: "puntos" as const, label: "Puntos", icon: "📍" },
    { key: "sanitarios" as const, label: "Sanitarios", icon: "🚻" },
    { key: "emergencia" as const, label: "Emergencia", icon: "🆘" },
    { key: "salidas" as const, label: "Salidas", icon: "🚪" },
    { key: "caminos" as const, label: "Caminos", icon: "🛤️" },
  ];
  return (
    <div className="absolute top-4 right-4 z-10">
      {open ? (
        <div className="flex flex-col gap-1 rounded-xl bg-slate-800/95 p-2 shadow-lg min-w-[140px]">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-xs text-slate-400">Capas</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded text-slate-400 hover:bg-slate-700 hover:text-white text-sm leading-none"
              aria-label="Cerrar capas"
            >
              ✕
            </button>
          </div>
          {layers.map(({ key, label, icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => onToggle(key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm w-full ${
                showLayers[key]
                  ? "bg-emerald-600/80 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
              aria-pressed={showLayers[key]}
            >
              <span aria-hidden="true">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/95 shadow-lg text-white text-sm hover:bg-slate-700"
          aria-label="Abrir capas"
          aria-expanded="false"
        >
          <span aria-hidden="true">📑</span>
          <span>Capas</span>
        </button>
      )}
    </div>
  );
}
