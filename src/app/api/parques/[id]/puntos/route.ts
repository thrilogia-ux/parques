import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: parqueId } = await params;
  try {
    const parque = await prisma.parque.findUnique({ where: { id: parqueId } });
    if (!parque) {
      return NextResponse.json({ error: "Parque no encontrado" }, { status: 404 });
    }
    const body = await req.json();
    const { nombre, tipo, lat, lng, descripcion, orden } = body as {
      nombre: string;
      tipo: string;
      lat: number;
      lng: number;
      descripcion?: string;
      orden?: number;
    };
    if (!nombre?.trim() || !tipo?.trim() || typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json(
        { error: "Faltan nombre, tipo, lat o lng" },
        { status: 400 }
      );
    }
    const punto = await prisma.punto.create({
      data: {
        parqueId,
        nombre: nombre.trim(),
        tipo: tipo.trim(),
        lat,
        lng,
        descripcion: descripcion?.trim() || null,
        orden: typeof orden === "number" ? orden : 0,
      },
    });
    return NextResponse.json(punto);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error al crear punto" },
      { status: 500 }
    );
  }
}
