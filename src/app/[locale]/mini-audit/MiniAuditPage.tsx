"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type Status = "idle" | "loading" | "success" | "error";
type Consent = "granted" | "denied" | null;

const CONSENT_KEY = "nosy-consent";
const PLATFORMS = ["woocommerce", "shopify", "prestashop", "magento", "autre"] as const;
const CONCERNS = ["lenteur", "ventes", "referencement", "bugs", "autre"] as const;

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  push: unknown;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: Fbq;
  }
}

// Pixel Meta chargé uniquement après accord du visiteur (RGPD) : tant que
// le bandeau n'a pas été accepté, aucun script Meta n'est téléchargé.
// Reprend le code d'amorçage officiel de Meta : les appels sont mis en file
// d'attente jusqu'à ce que fbevents.js soit chargé et prenne le relais.
function loadPixel(pixelId: string) {
  if (window.fbq) return;
  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  } as Fbq;
  fbq.queue = [];
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  window.fbq = fbq;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);
  window.fbq("init", pixelId);
  window.fbq("track", "PageView");
}

function readConsent(): Consent {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

// Source de la visite pour mesurer chaque campagne : ?utm_source=facebook&utm_campaign=…
function trafficSource(): string {
  const p = new URLSearchParams(window.location.search);
  return [p.get("utm_source"), p.get("utm_campaign")].filter(Boolean).join(" / ") || "direct";
}

export default function MiniAuditPage({ pixelId }: { pixelId: string | null }) {
  const t = useTranslations("audit");
  const locale = useLocale();
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [consent, setConsent] = useState<Consent>("denied");

  useEffect(() => {
    const c = readConsent();
    setConsent(c);
    if (c === "granted" && pixelId) loadPixel(pixelId);
  }, [pixelId]);

  function decide(value: "granted" | "denied") {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // stockage indisponible (navigation privée) : le choix vaut pour la page
    }
    setConsent(value);
    if (value === "granted" && pixelId) loadPixel(pixelId);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = formRef.current;
    if (!form?.checkValidity()) {
      form?.reportValidity();
      return;
    }
    const data = new FormData(form);
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/mini-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          url: data.get("url"),
          platform: data.get("platform"),
          concern: data.get("concern"),
          message: data.get("message"),
          consent: data.get("consent") === "on",
          website2: data.get("website2"),
          locale,
          source: trafficSource(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.error) {
        setError(t(`form.errors.${json.error === "rate" || json.error === "email" ? json.error : "generic"}`));
        setStatus("error");
        return;
      }
      setStatus("success");
      if (consent === "granted") window.fbq?.("track", "Lead");
    } catch {
      setError(t("form.errors.generic"));
      setStatus("error");
    }
  }

  return (
    <>
      <div className="gridfield" />
      <div className="wrap audit">
        <header className="audit-top">
          <Link className="brand" href="/">
            <Image className="brand-icon" src="/logo-icon.png" alt="" width={28} height={28} />
            <span className="wordmark">
              <span className="wm-nosy">nosy</span>
              <span className="wm-soa">soa</span>
              <span className="wm-tech">tech</span>
            </span>
          </Link>
          <Link className="audit-back" href="/">{t("back")}</Link>
        </header>

        <div className="audit-grid">
          <div className="audit-pitch">
            <div className="eyebrow">{t("eyebrow")}</div>
            <h1 className="hero-sub audit-title">{t("title")}</h1>
            <p className="audit-lead">{t("lead")}</p>

            <h2 className="audit-h2">{t("checks.title")}</h2>
            <ul className="audit-checks">
              {(["speed", "mobile", "seo", "checkout", "security"] as const).map((k) => (
                <li key={k}>
                  <b>{t(`checks.${k}.title`)}</b>
                  <span>{t(`checks.${k}.desc`)}</span>
                </li>
              ))}
            </ul>

            <ol className="audit-steps">
              {(["one", "two", "three"] as const).map((k, i) => (
                <li key={k}>
                  <span className="pnum">0{i + 1}</span>
                  <span>{t(`steps.${k}`)}</span>
                </li>
              ))}
            </ol>

            <div className="audit-who">
              <Image className="avatar" src="/avatar.jpg" alt="" width={52} height={52} />
              <p>{t("who")}</p>
            </div>
          </div>

          <div className="audit-card">
            {status === "success" ? (
              <div className="cm-success">
                <div className="cm-success-icon" aria-hidden="true">&#10003;</div>
                <p>
                  <b>{t("form.successTitle")}</b>
                  <br />
                  {t("form.successDesc")}
                </p>
                <Link className="btn ghost" href="/#ecommerce">{t("form.successLink")}</Link>
              </div>
            ) : (
              <form ref={formRef} onSubmit={submit} noValidate>
                <h2 className="audit-h2">{t("form.title")}</h2>
                <p className="audit-free">{t("form.free")}</p>
                <label className="field">
                  <span>{t("form.url")}</span>
                  <input name="url" type="text" inputMode="url" placeholder="www.ma-boutique.fr" required />
                </label>
                <div className="audit-row">
                  <label className="field">
                    <span>{t("form.platform")}</span>
                    <select name="platform" defaultValue="woocommerce">
                      {PLATFORMS.map((p) => (
                        <option key={p} value={p}>{t(`form.platforms.${p}`)}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span>{t("form.concern")}</span>
                    <select name="concern" defaultValue="lenteur">
                      {CONCERNS.map((c) => (
                        <option key={c} value={c}>{t(`form.concerns.${c}`)}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="field">
                  <span>{t("form.name")}</span>
                  <input name="name" type="text" autoComplete="name" required />
                </label>
                <label className="field">
                  <span>{t("form.email")}</span>
                  <input name="email" type="email" autoComplete="email" required />
                </label>
                <label className="field">
                  <span>{t("form.message")}</span>
                  <textarea name="message" rows={3} />
                </label>
                <input className="audit-trap" name="website2" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                <label className="audit-consent">
                  <input name="consent" type="checkbox" required />
                  <span>{t("form.consent")}</span>
                </label>
                <button
                  type="submit"
                  className="btn primary cm-submit"
                  data-loading={status === "loading"}
                  disabled={status === "loading"}
                >
                  <span className="cm-submit-label">{t("form.submit")}</span>
                  <span className="cm-spinner" aria-hidden="true" />
                </button>
                {status === "error" && <p className="cm-error">{error}</p>}
                <p className="audit-note">{t("form.note")}</p>
              </form>
            )}
          </div>
        </div>
      </div>

      {pixelId && consent === null && (
        <div className="consent-bar" role="dialog" aria-label={t("consent.label")}>
          <p>{t("consent.text")}</p>
          <div>
            <button type="button" className="btn ghost" onClick={() => decide("denied")}>{t("consent.deny")}</button>
            <button type="button" className="btn primary" onClick={() => decide("granted")}>{t("consent.accept")}</button>
          </div>
        </div>
      )}
    </>
  );
}
