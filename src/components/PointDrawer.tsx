"use client";

import React from "react";
import type { Punto, Especie, Mensaje, Foto } from "@/lib/types";
import SpeciesPopup from "./SpeciesPopup";

type PointDrawerProps = {
  punto: Punto | null;
  parqueNombre: string;
  parqueId: string;
  onClose: () => void;
  onShare: (punto: Punto) => void;
  onLeaveMessage: (punto: Punto) => void;
  mensajes: Mensaje[];
  loadingMensajes: boolean;
  onSendMessage: (texto: string, autor?: string) => void;
  sendingMessage: boolean;
  fotos: Foto[];
  loadingFotos: boolean;
  onUploadPhoto: (file: File, autor?: string) => void;
  uploadingPhoto: boolean;
};

export default function PointDrawer({
  punto,
  parqueNombre,
  onClose,
  onShare,
  onLeaveMessage,
  mensajes,
  loadingMensajes,
  onSendMessage,
  sendingMessage,
  fotos,
  loadingFotos,
  onUploadPhoto,
  uploadingPhoto,
}: PointDrawerProps) {
  const [messageText, setMessageText] = React.useState("");
  const [messageAuthor, setMessageAuthor] = React.useState("");
  const [selectedEspecie, setSelectedEspecie] = React.useState<Especie | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!punto) return null;

  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    onSendMessage(messageText.trim(), messageAuthor.trim() || undefined);
    setMessageText("");
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 bg-slate-800 rounded-t-2xl shadow-lg max-h-[85vh] flex flex-col"
      role="dialog"
      aria-label={`Ficha de ${punto.nombre}`}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white">{punto.nombre}</h2>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <p className="text-slate-300 text-sm">{parqueNombre}</p>
        {punto.descripcion && (
          <p className="text-white">{punto.descripcion}</p>
        )}
        {(punto.especies?.length ?? 0) > 0 && (
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-3">Especies en este punto</h3>
            <ul className="space-y-4">
              {(punto.especies || []).map((e: Especie) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedEspecie(e)}
                    className="w-full text-left rounded-xl bg-slate-700/80 overflow-hidden border border-slate-600 hover:border-slate-500 hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex gap-3 p-3">
                      <div className="shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-slate-600">
                        {e.imagenUrl ? (
                          <img
                            src={e.imagenUrl}
                            alt={e.nombre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl text-slate-500" aria-hidden="true">
                            {e.tipo === "árbol" ? "🌳" : e.tipo === "animal" ? "🦌" : "🌿"}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white">{e.nombre}</p>
                        <p className="text-xs text-emerald-400/90 uppercase tracking-wide mt-0.5">{e.tipo}</p>
                        {e.descripcion && (
                          <p className="text-sm text-slate-300 mt-1 line-clamp-2 whitespace-pre-line">{e.descripcion}</p>
                        )}
                        <p className="text-xs text-slate-500 mt-2">Tocá para ver ficha completa</p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {selectedEspecie && (
          <SpeciesPopup especie={selectedEspecie} onClose={() => setSelectedEspecie(null)} />
        )}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => onShare(punto)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-700 text-white font-medium hover:bg-slate-600"
          >
            Compartir
          </button>
          <button
            type="button"
            onClick={() => onLeaveMessage(punto)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-700 text-white font-medium hover:bg-slate-600"
          >
            Dejar mensaje
          </button>
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-2">Fotos en este punto</h3>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUploadPhoto(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="py-2.5 px-4 rounded-xl bg-slate-700 text-white font-medium hover:bg-slate-600 disabled:opacity-50"
          >
            {uploadingPhoto ? "Subiendo..." : "📷 Tomar / Subir foto"}
          </button>
          {loadingFotos ? (
            <p className="text-slate-500 text-sm mt-2">Cargando fotos...</p>
          ) : fotos.length > 0 ? (
            <ul className="grid grid-cols-3 gap-2 mt-2">
              {fotos.map((f) => (
                <li key={f.id}>
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="block aspect-square rounded-lg overflow-hidden bg-slate-700">
                    <img src={f.url} alt="" className="w-full h-full object-cover" />
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm mt-2">Aún no hay fotos.</p>
          )}
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-2">Mensajes a futuros visitantes</h3>
          {loadingMensajes ? (
            <p className="text-slate-500 text-sm">Cargando...</p>
          ) : mensajes.length === 0 ? (
            <p className="text-slate-500 text-sm">Aún no hay mensajes.</p>
          ) : (
            <ul className="space-y-2">
              {mensajes.map((m) => (
                <li key={m.id} className="text-sm text-slate-300 border-l-2 border-slate-600 pl-2">
                  {m.texto}
                  {m.autor && <span className="text-slate-500"> — {m.autor}</span>}
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={handleSubmitMessage} className="mt-3 flex gap-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 rounded-lg bg-slate-700 px-3 py-2 text-white placeholder-slate-500 text-sm"
              maxLength={500}
            />
            <input
              type="text"
              value={messageAuthor}
              onChange={(e) => setMessageAuthor(e.target.value)}
              placeholder="Tu nombre (opcional)"
              className="w-24 rounded-lg bg-slate-700 px-2 py-2 text-white placeholder-slate-500 text-sm"
              maxLength={50}
            />
            <button
              type="submit"
              disabled={sendingMessage || !messageText.trim()}
              className="py-2 px-4 rounded-lg bg-emerald-600 text-white text-sm font-medium disabled:opacity-50"
            >
              Enviar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
