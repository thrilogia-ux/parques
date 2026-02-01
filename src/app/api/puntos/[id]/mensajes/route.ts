import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: puntoId } = await params;
  try {
    const mensajes = await prisma.mensaje.findMany({
      where: { puntoId, moderado: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(mensajes);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error al listar mensajes" },
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
    const { texto, autor } = body as { texto?: string; autor?: string };
    if (!texto || typeof texto !== "string" || texto.trim().length === 0) {
      return NextResponse.json(
        { error: "El mensaje no puede estar vacío" },
        { status: 400 }
      );
    }
    const punto = await prisma.punto.findUnique({ where: { id: puntoId } });
    if (!punto) {
      return NextResponse.json({ error: "Punto no encontrado" }, { status: 404 });
    }
    const mensaje = await prisma.mensaje.create({
      data: {
        puntoId,
        texto: texto.trim().slice(0, 1000),
        autor: typeof autor === "string" ? autor.slice(0, 100) : null,
        moderado: false,
      },
    });
    return NextResponse.json(mensaje);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error al crear mensaje" },
      { status: 500 }
    );
  }
}
