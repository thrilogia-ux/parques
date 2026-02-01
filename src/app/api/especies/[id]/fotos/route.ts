import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: especieId } = await params;
  try {
    const fotos = await prisma.especieFoto.findMany({
      where: { especieId },
      orderBy: { orden: "asc" },
    });
    return NextResponse.json(fotos);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al listar fotos" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: especieId } = await params;
  try {
    const body = await req.json();
    const { url } = body as { url: string };
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "url es requerida" }, { status: 400 });
    }
    const count = await prisma.especieFoto.count({ where: { especieId } });
    const foto = await prisma.especieFoto.create({
      data: { especieId, url: url.slice(0, 2000), orden: count },
    });
    return NextResponse.json(foto);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al agregar foto" }, { status: 500 });
  }
}
