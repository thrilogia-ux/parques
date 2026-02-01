import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [mensajes, fotos] = await Promise.all([
      prisma.mensaje.findMany({
        where: { moderado: false },
        orderBy: { createdAt: "desc" },
        include: { punto: { select: { nombre: true, parque: { select: { nombre: true } } } } },
      }),
      prisma.foto.findMany({
        where: { moderado: false },
        orderBy: { createdAt: "desc" },
        include: {
          punto: { select: { nombre: true } },
          parque: { select: { nombre: true } },
        },
      }),
    ]);
    return NextResponse.json({ mensajes, fotos });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error al listar contenido pendiente" },
      { status: 500 }
    );
  }
}
