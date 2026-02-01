"use client";

import React from "react";
import type { Punto, Especie } from "@/lib/types";
import SpeciesPopup from "./SpeciesPopup";

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
  const [selectedEspecie, setSelectedEspecie] = React.useState<Especie | null>(null);

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
      <div className="flex-1 overflow-y-auto p-4 pb-28">
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
                <h3 className="text-sm font-medium text-slate-400 mb-3">
                  Especies en la zona
                </h3>
                <ul className="space-y-4">
                  {especies.map((e) => (
                    <li key={e.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedEspecie(e)}
                        className="w-full text-left rounded-xl bg-slate-700/80 overflow-hidden border border-slate-600 hover:border-slate-500 hover:bg-slate-700 transition-colors"
                      >
                        <div className="flex gap-3 p-3">
                          <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-slate-600">
                            {e.imagenUrl ? (
                              <img
                                src={e.imagenUrl}
                                alt={e.nombre}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-3xl text-slate-500" aria-hidden="true">
                                {e.tipo === "árbol" ? "🌳" : e.tipo === "animal" ? "🦌" : "🌿"}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-white">{e.nombre}</p>
                            <p className="text-xs text-emerald-400/90 uppercase tracking-wide mt-0.5">{e.tipo}</p>
                            {e.descripcion && (
                              <p className="text-sm text-slate-300 mt-2 line-clamp-4 whitespace-pre-line">{e.descripcion}</p>
                            )}
                            <p className="text-xs text-slate-500 mt-2">Tocá para ver ficha completa</p>
                          </div>
                        </div>
                      </button>
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
      {selectedEspecie && (
        <SpeciesPopup especie={selectedEspecie} onClose={() => setSelectedEspecie(null)} />
      )}
    </div>
  );
}
