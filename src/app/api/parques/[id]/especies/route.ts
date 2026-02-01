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
    const { nombre, tipo, descripcion, imagenUrl } = body as {
      nombre: string;
      tipo: string;
      descripcion?: string;
      imagenUrl?: string;
    };
    if (!nombre?.trim() || !tipo?.trim()) {
      return NextResponse.json(
        { error: "Faltan nombre o tipo" },
        { status: 400 }
      );
    }
    const especie = await prisma.especie.create({
      data: {
        parqueId,
        nombre: nombre.trim(),
        tipo: tipo.trim(),
        descripcion: descripcion?.trim() || null,
        imagenUrl: imagenUrl?.trim() || null,
      },
    });
    return NextResponse.json(especie);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error al crear especie" },
      { status: 500 }
    );
  }
}
