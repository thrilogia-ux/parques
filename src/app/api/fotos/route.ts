import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { puntoId, parqueId, url, autor } = body as {
      puntoId?: string;
      parqueId: string;
      url: string;
      autor?: string;
    };
    if (!parqueId || !url) {
      return NextResponse.json(
        { error: "parqueId y url son requeridos" },
        { status: 400 }
      );
    }
    const parque = await prisma.parque.findUnique({ where: { id: parqueId } });
    if (!parque) {
      return NextResponse.json({ error: "Parque no encontrado" }, { status: 404 });
    }
    if (puntoId) {
      const punto = await prisma.punto.findFirst({
        where: { id: puntoId, parqueId },
      });
      if (!punto) {
        return NextResponse.json(
          { error: "Punto no encontrado en este parque" },
          { status: 404 }
        );
      }
    }
    const foto = await prisma.foto.create({
      data: {
        parqueId,
        puntoId: puntoId || null,
        url: url.slice(0, 2000),
        autor: typeof autor === "string" ? autor.slice(0, 100) : null,
        moderado: false,
      },
    });
    return NextResponse.json(foto);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error al subir foto" },
      { status: 500 }
    );
  }
}
