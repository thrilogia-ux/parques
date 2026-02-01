import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: parqueId } = await params;
  const puntoId = _req.nextUrl.searchParams.get("puntoId");
  try {
    const fotos = await prisma.foto.findMany({
      where: {
        parqueId,
        ...(puntoId ? { puntoId } : {}),
        moderado: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json(fotos);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error al listar fotos" },
      { status: 500 }
    );
  }
}
