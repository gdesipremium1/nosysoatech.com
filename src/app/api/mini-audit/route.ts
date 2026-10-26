import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Demande de mini-audit (page /mini-audit, visée par les campagnes
// publicitaires). Trois effets, dans cet ordre :
//  1) le prospect est créé dans le board (stratégie « client direct ») avec
//     un événement « réponse reçue », pour qu'il remonte en notification ;
//  2) notification par email à infos@nosysoatech.com ;
//  3) accusé de réception au visiteur.
// Le board et l'email sont indépendants : si l'un échoue, l'autre part quand
// même, et la demande n'est perdue que si les deux échouent.

const FROM = process.env.CONTACT_FROM_EMAIL ?? "infos@nosysoatech.com";
const TO = process.env.CONTACT_TO_EMAIL ?? "infos@nosysoatech.com";
const BOARD_URL = (process.env.BOARD_API_URL ?? "https://board.nosysoatech.com").replace(/\/$/, "");
const BOARD_KEY = process.env.BOARD_API_KEY;

const PLATFORMS = ["woocommerce", "shopify", "prestashop", "magento", "autre"] as const;
const CONCERNS = ["lenteur", "ventes", "referencement", "bugs", "autre"] as const;

const CONCERN_LABELS: Record<(typeof CONCERNS)[number], string> = {
  lenteur: "Site lent",
  ventes: "Peu de ventes / paniers abandonnés",
  referencement: "Référencement Google",
  bugs: "Bugs ou erreurs",
  autre: "Autre",
};

// Anti-abus minimal : 5 demandes par heure et par adresse IP (mémoire du
// processus, suffisant pour un seul serveur).
const hits = new Map<string, number[]>();
function tooMany(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeUrl(raw: string): URL | null {
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return url.hostname.includes(".") ? url : null;
  } catch {
    return null;
  }
}

type Lead = {
  name: string;
  email: string;
  url: URL;
  platform: string;
  concern: (typeof CONCERNS)[number];
  message: string;
  locale: string;
  source: string;
};

async function boardFetch(path: string, init?: RequestInit) {
  return fetch(`${BOARD_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${BOARD_KEY}`,
      "X-Actor": "site nosysoatech.com",
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
}

async function recordInBoard(lead: Lead): Promise<boolean> {
  if (!BOARD_KEY) {
    console.error("BOARD_API_KEY manquante : demande non enregistrée dans le board.");
    return false;
  }
  const shop = lead.url.hostname.replace(/^www\./, "");
  const create = await boardFetch("/api/prospection/prospects", {
    method: "POST",
    body: JSON.stringify({
      prospect: {
        name: shop,
        website: lead.url.origin,
        emails: [lead.email],
        decisionMaker: lead.name,
        strategy: "client_direct",
        source: `Formulaire mini-audit nosysoatech.com (${lead.source})`,
        tags: ["Client direct", "Mini-audit demandé", lead.platform],
        nextAction: "Faire le mini-audit et l'envoyer sous 48 h",
        custom: { Plateforme: lead.platform, Souci: CONCERN_LABELS[lead.concern] },
      },
    }),
  });
  if (!create.ok) return false;
  const created = (await create.json()) as { created?: { id: string }[] };
  let id = created.created?.[0]?.id;
  if (!id) {
    // Déjà dans le board (même nom) : on retrouve la fiche pour y ajouter la demande.
    const list = await boardFetch("/api/prospection/prospects");
    if (!list.ok) return false;
    const json = (await list.json()) as { prospects: { id: string; name: string }[] };
    id = json.prospects.find((p) => p.name.toLowerCase() === shop.toLowerCase())?.id;
  }
  if (!id) return false;
  const event = await boardFetch(`/api/prospection/prospects/${id}/events`, {
    method: "POST",
    body: JSON.stringify({
      type: "reply_received",
      channel: "formulaire",
      sentiment: "positive",
      subject: "Demande de mini-audit",
      note: [
        `${lead.name} <${lead.email}> demande un mini-audit de ${lead.url.origin}.`,
        `Plateforme : ${lead.platform}. Souci principal : ${CONCERN_LABELS[lead.concern]}.`,
        lead.message ? `Message : ${lead.message}` : "",
        `Langue : ${lead.locale}. Source : ${lead.source}.`,
      ]
        .filter(Boolean)
        .join("\n"),
    }),
  });
  return event.ok;
}

async function sendEmails(lead: Lead): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY manquante dans l'environnement.");
    return false;
  }
  const resend = new Resend(apiKey);
  const site = lead.url.origin;
  const lines = [
    `De : ${lead.name} <${lead.email}>`,
    `Boutique : ${site}`,
    `Plateforme : ${lead.platform}`,
    `Souci principal : ${CONCERN_LABELS[lead.concern]}`,
    `Source : ${lead.source}`,
    lead.message ? `\n${lead.message}` : "",
  ];
  const notify = await resend.emails.send({
    from: `Mini-audit nosysoatech.com <${FROM}>`,
    to: TO,
    replyTo: lead.email,
    subject: `Demande de mini-audit : ${lead.url.hostname}`,
    text: lines.join("\n"),
    html: lines.map((l) => `<p>${escapeHtml(l).replace(/\n/g, "<br>")}</p>`).join(""),
  });
  if (notify.error) {
    console.error("Resend notify error:", notify.error);
    return false;
  }

  const en = lead.locale === "en";
  const thanks = await resend.emails.send({
    from: `Fetraniaina Désiré Rabemanantsoa <${FROM}>`,
    to: lead.email,
    subject: en ? "Your mini-audit request — nosysoatech" : "Votre demande de mini-audit — nosysoatech",
    text: en
      ? `Hello ${lead.name},\n\nThank you, I have received your request for ${site}. You will get your mini-audit (speed, mobile, SEO, checkout) within 48 hours.\n\nBest regards,\nFetraniaina Désiré Rabemanantsoa`
      : `Bonjour ${lead.name},\n\nMerci, j'ai bien reçu votre demande pour ${site}. Vous recevrez votre mini-audit (vitesse, mobile, référencement, tunnel de commande) sous 48 heures.\n\nBien cordialement,\nFetraniaina Désiré Rabemanantsoa`,
  });
  if (thanks.error) console.error("Resend thanks error:", thanks.error);
  return true;
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // Champ piège invisible : rempli uniquement par les robots.
  if (typeof body.website2 === "string" && body.website2.trim()) {
    return NextResponse.json({ ok: true });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (tooMany(ip)) {
    return NextResponse.json({ error: "rate" }, { status: 429 });
  }

  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const name = str(body.name, 120);
  const email = str(body.email, 200);
  const url = normalizeUrl(str(body.url, 300));
  const platform = PLATFORMS.find((p) => p === body.platform) ?? "autre";
  const concern = CONCERNS.find((c) => c === body.concern) ?? "autre";
  const message = str(body.message, 2000);
  const locale = ["fr", "en", "mg"].includes(str(body.locale, 2)) ? str(body.locale, 2) : "fr";
  const source = str(body.source, 120) || "direct";

  if (!name || !email || !url || body.consent !== true) {
    return NextResponse.json({ error: "missing" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "email" }, { status: 400 });
  }

  const lead: Lead = { name, email, url, platform, concern, message, locale, source };
  const [inBoard, mailed] = await Promise.all([
    recordInBoard(lead).catch((err) => {
      console.error("Board error:", err);
      return false;
    }),
    sendEmails(lead).catch((err) => {
      console.error("Mail error:", err);
      return false;
    }),
  ]);

  if (!inBoard && !mailed) {
    return NextResponse.json({ error: "server" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
