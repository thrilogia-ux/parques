import Link from "next/link";
import { getUnmoderated } from "@/lib/admin";
import ModerationClient from "./ModerationClient";

export default async function AdminPage() {
  let data: Awaited<ReturnType<typeof getUnmoderated>>;
  try {
    data = await getUnmoderated();
  } catch {
    data = { mensajes: [], fotos: [] };
  }
  return (
    <main className="min-h-screen bg-slate-900 text-white p-6">
      <header className="flex items-center gap-4 mb-8 flex-wrap">
        <Link href="/" className="text-slate-400 hover:text-white text-sm">
          ← Inicio
        </Link>
        <Link href="/admin/contenido" className="text-slate-400 hover:text-white text-sm">
          Contenido
        </Link>
        <h1 className="text-xl font-semibold">Moderación</h1>
        <form action="/api/admin/logout" method="POST" className="ml-auto">
          <button type="submit" className="text-slate-500 hover:text-white text-sm">
            Salir
          </button>
        </form>
      </header>
      <ModerationClient
        initialMensajes={JSON.parse(JSON.stringify(data.mensajes))}
        initialFotos={JSON.parse(JSON.stringify(data.fotos))}
      />
    </main>
  );
}
