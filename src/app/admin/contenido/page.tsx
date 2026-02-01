import Link from "next/link";
import { getContentForAdmin } from "@/lib/admin";
import ContenidoClient from "./ContenidoClient";

export default async function AdminContenidoPage() {
  let data: Awaited<ReturnType<typeof getContentForAdmin>>;
  try {
    data = await getContentForAdmin();
  } catch {
    data = { parques: [], puntos: [], especies: [], utilidades: [] };
  }
  return (
    <main className="min-h-screen bg-slate-900 text-white p-6">
      <header className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-slate-400 hover:text-white text-sm">
          ← Moderación
        </Link>
        <Link href="/" className="text-slate-400 hover:text-white text-sm">
          Inicio
        </Link>
        <h1 className="text-xl font-semibold">Contenido</h1>
      </header>
      <ContenidoClient
        initialParques={data.parques}
        initialPuntos={data.puntos}
        initialEspecies={data.especies}
        initialUtilidades={data.utilidades}
      />
    </main>
  );
}
