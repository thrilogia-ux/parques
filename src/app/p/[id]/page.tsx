import { notFound } from "next/navigation";
import { getParqueById } from "@/lib/parque";
import ParkMapClient from "./ParkMapClient";

export default async function ParkPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ punto?: string }>;
}) {
  const { id } = await params;
  const { punto: puntoId } = await searchParams;
  const parque = await getParqueById(id);
  if (!parque) notFound();
  return (
    <ParkMapClient
      parque={parque}
      initialPuntoId={puntoId ?? null}
    />
  );
}
