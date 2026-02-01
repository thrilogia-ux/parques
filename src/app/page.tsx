import Link from "next/link";
import { getParquesList } from "@/lib/parque";

export default async function HomePage() {
  let parques: { id: string; nombre: string }[] = [];
  try {
    parques = await getParquesList();
  } catch {
    // DB no disponible o sin seed
  }
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900">
      <h1 className="text-2xl font-bold text-white mb-2">
        Parques Nacionales
      </h1>
      <p className="text-slate-400 text-center mb-8 max-w-sm">
        Escanea el QR en los totems del parque para ver el mapa, tu ubicación y
        qué estás viendo.
      </p>
      {parques.length > 0 ? (
        <ul className="space-y-3 w-full max-w-xs">
          {parques.map((p: { id: string; nombre: string }) => (
            <li key={p.id}>
              <Link
                href={`/p/${p.id}`}
                className="block w-full py-4 px-4 rounded-xl bg-slate-800 text-white font-medium text-center hover:bg-slate-700 active:bg-slate-600 transition"
              >
                {p.nombre}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <Link
          href="/p/parque-demo-1"
          className="py-4 px-8 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-500 active:bg-emerald-700 transition"
        >
          Ir al Parque Demo
        </Link>
      )}
      <Link
        href="/admin"
        className="mt-8 text-slate-500 hover:text-slate-400 text-sm"
      >
        Moderación
      </Link>
    </main>
  );
}
