import { redirect } from "next/navigation";

export default async function PuntoRedirectPage({
  params,
}: {
  params: Promise<{ id: string; puntoId: string }>;
}) {
  const { id, puntoId } = await params;
  redirect(`/p/${id}?punto=${puntoId}`);
}
