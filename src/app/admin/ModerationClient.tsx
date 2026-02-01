"use client";

import { useState } from "react";

type MensajeRow = {
  id: string;
  texto: string;
  autor: string | null;
  createdAt: string;
  punto: { nombre: string; parque: { nombre: string } };
};

type FotoRow = {
  id: string;
  url: string;
  autor: string | null;
  createdAt: string;
  punto: { nombre: string } | null;
  parque: { nombre: string };
};

type ModerationClientProps = {
  initialMensajes: MensajeRow[];
  initialFotos: FotoRow[];
};

export default function ModerationClient({
  initialMensajes,
  initialFotos,
}: ModerationClientProps) {
  const [mensajes, setMensajes] = useState(initialMensajes);
  const [fotos, setFotos] = useState(initialFotos);
  const [approvingM, setApprovingM] = useState<string | null>(null);
  const [approvingF, setApprovingF] = useState<string | null>(null);

  const approveMensaje = async (id: string) => {
    setApprovingM(id);
    try {
      const res = await fetch(`/api/mensajes/${id}`, { method: "PATCH" });
      if (res.ok) setMensajes((prev) => prev.filter((m) => m.id !== id));
    } finally {
      setApprovingM(null);
    }
  };

  const approveFoto = async (id: string) => {
    setApprovingF(id);
    try {
      const res = await fetch(`/api/fotos/${id}`, { method: "PATCH" });
      if (res.ok) setFotos((prev) => prev.filter((f) => f.id !== id));
    } finally {
      setApprovingF(null);
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-medium text-slate-300 mb-4">
          Mensajes pendientes ({mensajes.length})
        </h2>
        {mensajes.length === 0 ? (
          <p className="text-slate-500 text-sm">No hay mensajes por moderar.</p>
        ) : (
          <ul className="space-y-3">
            {mensajes.map((m) => (
              <li
                key={m.id}
                className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-800"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-white">{m.texto}</p>
                  <p className="text-slate-500 text-sm mt-1">
                    {m.punto.parque.nombre} → {m.punto.nombre}
                    {m.autor && ` · ${m.autor}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => approveMensaje(m.id)}
                  disabled={approvingM === m.id}
                  className="shrink-0 py-2 px-4 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 disabled:opacity-50"
                >
                  {approvingM === m.id ? "..." : "Aprobar"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium text-slate-300 mb-4">
          Fotos pendientes ({fotos.length})
        </h2>
        {fotos.length === 0 ? (
          <p className="text-slate-500 text-sm">No hay fotos por moderar.</p>
        ) : (
          <ul className="space-y-3">
            {fotos.map((f) => (
              <li
                key={f.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-slate-800"
              >
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-slate-700"
                >
                  <img
                    src={f.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </a>
                <div className="min-w-0 flex-1">
                  <p className="text-slate-400 text-sm">
                    {f.parque.nombre}
                    {f.punto ? ` → ${f.punto.nombre}` : ""}
                    {f.autor ? ` · ${f.autor}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => approveFoto(f.id)}
                  disabled={approvingF === f.id}
                  className="shrink-0 py-2 px-4 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 disabled:opacity-50"
                >
                  {approvingF === f.id ? "..." : "Aprobar"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
