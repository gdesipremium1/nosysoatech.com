import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import MiniAuditPage from "./MiniAuditPage";

// Rendu à chaque requête : sinon la page est générée au build et
// META_PIXEL_ID, lu à l'exécution, serait ignoré.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "audit.meta" });
  return { title: t("title"), description: t("description") };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Lu à l'exécution (et non au build) : l'identifiant du pixel Meta peut être
  // ajouté sur le serveur sans reconstruire l'image. Vide = pas de pixel.
  const pixelId = process.env.META_PIXEL_ID?.trim() || null;
  return <MiniAuditPage pixelId={pixelId} />;
}
