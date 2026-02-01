"use client";

import React, { useState, useEffect } from "react";
import type { Especie } from "@/lib/types";

type SpeciesPopupProps = {
  especie: Especie | null;
  onClose: () => void;
};

export default function SpeciesPopup({ especie, onClose }: SpeciesPopupProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  if (!especie) return null;

  const urls: string[] = especie.fotos?.length
    ? especie.fotos.map((f) => f.url)
    : especie.imagenUrl
      ? [especie.imagenUrl]
      : [];
  const hasSlider = urls.length > 1;
  const currentUrl = urls[slideIndex] ?? null;

  useEffect(() => setSlideIndex(0), [especie.id]);
  useEffect(() => {
    if (urls.length <= 1) return;
    const t = setInterval(() => setSlideIndex((i) => (i + 1) % urls.length), 4000);
    return () => clearInterval(t);
  }, [urls.length]);

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
          <div className="aspect-square w-full bg-slate-700 relative overflow-hidden">
            {currentUrl ? (
              <>
                <img
                  key={slideIndex}
                  src={currentUrl}
                  alt={`${especie.nombre} ${hasSlider ? `(${slideIndex + 1}/${urls.length})` : ""}`}
                  className="w-full h-full object-cover"
                />
                {hasSlider && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSlideIndex((i) => (i - 1 + urls.length) % urls.length); }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center text-xl"
                      aria-label="Anterior"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSlideIndex((i) => (i + 1) % urls.length); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center text-xl"
                      aria-label="Siguiente"
                    >
                      ›
                    </button>
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                      {urls.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSlideIndex(i); }}
                          className={`w-2 h-2 rounded-full transition-colors ${i === slideIndex ? "bg-white" : "bg-white/50"}`}
                          aria-label={`Foto ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
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
