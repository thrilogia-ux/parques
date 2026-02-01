"use client";

import type { Punto, Especie } from "@/lib/types";

type PuntoConDistancia = Punto & { distanceKm: number };

type NearbySectionProps = {
  puntos: PuntoConDistancia[];
  especies: Especie[];
  loading: boolean;
  onSelectPoint: (p: Punto) => void;
  onClose: () => void;
};

export default function NearbySection({
  puntos,
  especies,
  loading,
  onSelectPoint,
  onClose,
}: NearbySectionProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 bg-slate-800 rounded-t-2xl shadow-lg max-h-[75vh] flex flex-col"
      role="dialog"
      aria-label="Qué estás viendo desde tu ubicación"
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white">
          Desde tu ubicación ves
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <p className="text-slate-400">Obteniendo ubicación...</p>
        ) : (
          <>
            {puntos.length > 0 && (
              <section className="mb-4">
                <h3 className="text-sm font-medium text-slate-400 mb-2">
                  Puntos cercanos
                </h3>
                <ul className="space-y-2">
                  {puntos.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => onSelectPoint(p)}
                        className="w-full text-left py-2 px-3 rounded-lg bg-slate-700 text-white hover:bg-slate-600"
                      >
                        <span className="font-medium">{p.nombre}</span>
                        <span className="text-slate-400 text-sm ml-2">
                          {(p.distanceKm * 1000).toFixed(0)} m
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {especies.length > 0 && (
              <section>
                <h3 className="text-sm font-medium text-slate-400 mb-2">
                  Especies en la zona
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {especies.map((e) => (
                    <li
                      key={e.id}
                      className="px-3 py-1.5 rounded-full bg-slate-700 text-white text-sm"
                    >
                      {e.nombre} ({e.tipo})
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {!loading && puntos.length === 0 && especies.length === 0 && (
              <p className="text-slate-500 text-sm">
                Activa la ubicación para ver puntos y especies cercanas.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
