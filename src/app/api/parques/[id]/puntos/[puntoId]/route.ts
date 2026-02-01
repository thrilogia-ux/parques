import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; puntoId: string }> }
) {
  const { id: parqueId, puntoId } = await params;
  try {
    const punto = await prisma.punto.findFirst({
      where: { id: puntoId, parqueId },
      include: {
        especies: { include: { especie: true } },
        mensajes: {
          where: { moderado: true },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });
    if (!punto) {
      return NextResponse.json({ error: "Punto no encontrado" }, { status: 404 });
    }
    const out = {
      ...punto,
      especies: punto.especies.map((pe) => pe.especie),
    };
    return NextResponse.json(out);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error al obtener punto" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; puntoId: string }> }
) {
  const { id: parqueId, puntoId } = await params;
  try {
    const punto = await prisma.punto.findFirst({
      where: { id: puntoId, parqueId },
    });
    if (!punto) {
      return NextResponse.json({ error: "Punto no encontrado" }, { status: 404 });
    }
    const body = await req.json();
    const { nombre, tipo, lat, lng, descripcion, orden } = body;
    const updated = await prisma.punto.update({
      where: { id: puntoId },
      data: {
        ...(nombre != null && { nombre: String(nombre).trim() }),
        ...(tipo != null && { tipo: String(tipo).trim() }),
        ...(typeof lat === "number" && { lat }),
        ...(typeof lng === "number" && { lng }),
        ...(descripcion != null && { descripcion: String(descripcion).trim() || null }),
        ...(typeof orden === "number" && { orden }),
      },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error al actualizar punto" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; puntoId: string }> }
) {
  const { id: parqueId, puntoId } = await params;
  try {
    const punto = await prisma.punto.findFirst({
      where: { id: puntoId, parqueId },
    });
    if (!punto) {
      return NextResponse.json({ error: "Punto no encontrado" }, { status: 404 });
    }
    await prisma.punto.delete({ where: { id: puntoId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error al eliminar punto" },
      { status: 500 }
    );
  }
}
