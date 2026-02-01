import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: puntoId } = await params;
  try {
    const punto = await prisma.punto.findUnique({
      where: { id: puntoId },
      select: { parqueId: true, especies: { include: { especie: true } } },
    });
    if (!punto) {
      return NextResponse.json({ error: "Punto no encontrado" }, { status: 404 });
    }
    return NextResponse.json(punto.especies.map((pe) => pe.especie));
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error al listar especies del punto" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: puntoId } = await params;
  try {
    const body = await req.json();
    const { especieId } = body as { especieId: string };
    if (!especieId?.trim()) {
      return NextResponse.json(
        { error: "Falta especieId" },
        { status: 400 }
      );
    }
    const punto = await prisma.punto.findUnique({ where: { id: puntoId } });
    if (!punto) {
      return NextResponse.json({ error: "Punto no encontrado" }, { status: 404 });
    }
    const especie = await prisma.especie.findFirst({
      where: { id: especieId, parqueId: punto.parqueId },
    });
    if (!especie) {
      return NextResponse.json(
        { error: "Especie no encontrada o no pertenece al parque del punto" },
        { status: 404 }
      );
    }
    await prisma.puntoEspecie.create({
      data: { puntoId, especieId },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if ((e as { code?: string })?.code === "P2002") {
      return NextResponse.json({ error: "La especie ya está asociada" }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json(
      { error: "Error al asociar especie" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: puntoId } = await params;
  const especieId = req.nextUrl.searchParams.get("especieId");
  if (!especieId) {
    return NextResponse.json({ error: "Falta especieId" }, { status: 400 });
  }
  try {
    await prisma.puntoEspecie.delete({
      where: {
        puntoId_especieId: { puntoId, especieId },
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error al desasociar especie" },
      { status: 500 }
    );
  }
}
