"use client";

import React from "react";
import type { Especie } from "@/lib/types";

type SpeciesPopupProps = {
  especie: Especie | null;
  onClose: () => void;
};

export default function SpeciesPopup({ especie, onClose }: SpeciesPopupProps) {
  if (!especie) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Ficha de ${especie.nombre}`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-hidden rounded-t-2xl sm:rounded-2xl bg-slate-800 shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3 border-b border-slate-700 shrink-0">
          <h3 className="text-lg font-semibold text-white">{especie.nombre}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="aspect-square w-full bg-slate-700">
            {especie.imagenUrl ? (
              <img
                src={especie.imagenUrl}
                alt={especie.nombre}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl text-slate-500">
                {especie.tipo === "árbol" ? "🌳" : especie.tipo === "animal" ? "🦌" : "🌿"}
              </div>
            )}
          </div>
          <div className="p-4">
            <p className="text-xs text-emerald-400/90 uppercase tracking-wide mb-2">{especie.tipo}</p>
            {especie.descripcion ? (
              <p className="text-slate-300 whitespace-pre-line leading-relaxed">{especie.descripcion}</p>
            ) : (
              <p className="text-slate-500 text-sm">Sin descripción.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
