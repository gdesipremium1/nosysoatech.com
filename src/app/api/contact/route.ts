import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const FROM = process.env.CONTACT_FROM_EMAIL ?? "infos@nosysoatech.com";
const TO = process.env.CONTACT_TO_EMAIL ?? "infos@nosysoatech.com";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY manquante dans l'environnement.");
    return NextResponse.json(
      { error: "Configuration serveur incomplete." },
      { status: 500 }
    );
  }

  let body: { name?: string; email?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const message = (body.message ?? "").trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Nom, email et message sont requis." },
      { status: 400 }
    );
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  }

  const resend = new Resend(apiKey);
  const safeName = escapeHtml(name);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

  try {
    // 1) Notification vers infos@nosysoatech.com, reply-to = le visiteur
    const notify = await resend.emails.send({
      from: `Portfolio nosysoatech.com <${FROM}>`,
      to: TO,
      replyTo: email,
      subject: `Nouveau message de ${name}`,
      text: `De : ${name} <${email}>\n\n${message}`,
      html: `<p><b>De :</b> ${safeName} &lt;${escapeHtml(email)}&gt;</p><p>${safeMessage}</p>`,
    });

    if (notify.error) {
      console.error("Resend notify error:", notify.error);
      return NextResponse.json(
        { error: "Echec de l'envoi. Reessaie ou ecris a infos@nosysoatech.com." },
        { status: 502 }
      );
    }

    // 2) Accuse de reception vers le visiteur, depuis infos@nosysoatech.com
    const thanks = await resend.emails.send({
      from: `Fetraniaina Désiré Rabemanantsoa <${FROM}>`,
      to: email,
      subject: "Message bien reçu — nosysoatech.com",
      text: `Bonjour ${name},\n\nVotre message a bien ete recu, je reponds sous 24-48h.\n\nA bientot,\nFetraniaina Désiré Rabemanantsoa`,
      html: `<p>Bonjour ${safeName},</p><p>Votre message a bien été reçu, je réponds sous 24–48h.</p><p>À bientôt,<br>Fetraniaina Désiré Rabemanantsoa</p>`,
    });

    if (thanks.error) {
      // La notification est deja partie : on ne fait pas echouer toute la requete
      // pour un accuse de reception qui rate, on log juste pour investigation.
      console.error("Resend thanks error:", thanks.error);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact route error:", err);
    return NextResponse.json(
      { error: "Echec de l'envoi. Reessaie ou ecris a infos@nosysoatech.com." },
      { status: 502 }
    );
  }
}
