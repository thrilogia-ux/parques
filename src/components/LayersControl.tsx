"use client";

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
  const layers = [
    { key: "puntos" as const, label: "Puntos", icon: "📍" },
    { key: "sanitarios" as const, label: "Sanitarios", icon: "🚻" },
    { key: "emergencia" as const, label: "Emergencia", icon: "🆘" },
    { key: "salidas" as const, label: "Salidas", icon: "🚪" },
    { key: "caminos" as const, label: "Caminos", icon: "🛤️" },
  ];
  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 rounded-xl bg-slate-800/95 p-2 shadow-lg">
      <span className="text-xs text-slate-400 px-2 py-1">Capas</span>
      {layers.map(({ key, label, icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onToggle(key)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
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
  );
}
