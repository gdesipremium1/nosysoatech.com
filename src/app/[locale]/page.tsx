"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LANG_LABELS: Record<string, string> = { mg: "MG", fr: "FR", en: "EN" };

type FormStatus = "idle" | "loading" | "success" | "error";

function Bold(chunks: React.ReactNode) {
  return <b>{chunks}</b>;
}

export default function Home() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openContact = () => dialogRef.current?.showModal();
  const closeContact = () => dialogRef.current?.close();

  const switchLocale = (nextLocale: string) => {
    router.replace(pathname, { locale: nextLocale });
  };

  const handleDialogClose = () => {
    setTimeout(() => {
      formRef.current?.reset();
      setStatus("idle");
      setErrorMsg("");
    }, 200);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const r = dialog.getBoundingClientRect();
    const inside =
      e.clientX >= r.left &&
      e.clientX <= r.right &&
      e.clientY >= r.top &&
      e.clientY <= r.bottom;
    if (!inside) dialog.close();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form?.checkValidity()) {
      form?.reportValidity();
      return;
    }
    setStatus("loading");
    setErrorMsg("");

    const data = new FormData(form);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || t("contact.errorFallback"));
      }
      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("contact.errorFallback"));
      setStatus("error");
    }
  };

  return (
    <>
      <div className="gridfield" />

      <div className="wrap">
        <div className={scrolled ? "nav-bar nav-scrolled" : "nav-bar"}>
          <nav>
            <div className="wordmark">
              <span className="wm-nosy">nosy</span>
              <span className="wm-soa">soa</span>
              <span className="wm-tech">tech</span>
            </div>
            <div className="navright">
              <div className="navlinks">
                <a href="#specialites">{t("nav.specialites")}</a>
                <a href="#projets">{t("nav.projets")}</a>
                <a href="#contact">{t("nav.contact")}</a>
              </div>
              <div className="navlangs">
                <span className="lang-label">{t("nav.langue")}</span>
                <div className="langswitch" role="group" aria-label={t("nav.langue")}>
                  {routing.locales.map((l) => (
                    <button
                      key={l}
                      type="button"
                      className="lang-btn"
                      data-active={locale === l}
                      onClick={() => switchLocale(l)}
                    >
                      {LANG_LABELS[l]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </nav>
        </div>
        <div className="nav-spacer" />

        <header className="hero">
          <div className="hero-inner">
            <div className="idrow">
              <Image
                className="avatar"
                src="/avatar.png"
                alt={t("hero.eyebrow")}
                width={52}
                height={52}
              />
              <div className="eyebrow" style={{ marginBottom: 0 }}>
                {t("hero.eyebrow")}
              </div>
            </div>
            <p className="hero-sub">{t("hero.headline")}</p>
            <h1>{t.rich("hero.description", { b: Bold })}</h1>
            <div className="chiprow">
              <span className="chip">{t.rich("hero.chipExperience", { b: Bold })}</span>
              <span className="chip">{t.rich("hero.chipSectors", { b: Bold })}</span>
              <span className="chip">{t.rich("hero.chipRemote", { b: Bold })}</span>
            </div>
            <div className="cta-row">
              <a className="btn primary" href="#projets">
                {t("hero.ctaProjects")}
              </a>
              <button type="button" className="btn ghost" onClick={openContact}>
                {t("hero.ctaContact")}
              </button>
            </div>
          </div>
        </header>

        <section id="specialites">
          <div className="sec-head">
            <span className="kicker">{t("specialites.kicker")}</span>
            <h2>{t("specialites.title")}</h2>
          </div>
          <div className="pillars">
            <div className="pillar">
              <span className="pnum">01</span>
              <h3>{t("specialites.fullstack.title")}</h3>
              <p>{t("specialites.fullstack.desc")}</p>
              <div className="stack">
                <span>TypeScript</span>
                <span>React / Next.js</span>
                <span>PostgreSQL</span>
              </div>
            </div>
            <div className="pillar">
              <span className="pnum">02</span>
              <h3>{t("specialites.pythonDjango.title")}</h3>
              <p>{t("specialites.pythonDjango.desc")}</p>
              <div className="stack">
                <span>Python</span>
                <span>Django</span>
                <span>REST API</span>
              </div>
            </div>
            <div className="pillar">
              <span className="pnum">03</span>
              <h3>{t("specialites.data.title")}</h3>
              <p>{t("specialites.data.desc")}</p>
              <div className="stack">
                <span>ETL / Import</span>
                <span>Migration BDD</span>
                <span>Modélisation</span>
              </div>
            </div>
            <div className="pillar">
              <span className="pnum">04</span>
              <h3>{t("specialites.php.title")}</h3>
              <p>{t("specialites.php.desc")}</p>
              <div className="stack">
                <span>Symfony</span>
                <span>Magento</span>
                <span>PrestaShop</span>
              </div>
            </div>
          </div>
        </section>

        <section id="projets">
          <div className="sec-head">
            <span className="kicker">{t("projets.kicker")}</span>
            <h2>{t("projets.title")}</h2>
          </div>
          <div className="projects">
            <div className="proj">
              <div className="pname">{t("projets.gimoexpert.name")}</div>
              <div className="pdesc">{t.rich("projets.gimoexpert.desc", { b: Bold })}</div>
              <span className="status live">{t("projets.gimoexpert.status")}</span>
            </div>
            <div className="proj">
              <div className="pname">{t("projets.mag1to2.name")}</div>
              <div className="pdesc">{t.rich("projets.mag1to2.desc", { b: Bold })}</div>
              <span className="status live">{t("projets.mag1to2.status")}</span>
            </div>
            <div className="proj">
              <div className="pname">{t("projets.etoerana.name")}</div>
              <div className="pdesc">{t.rich("projets.etoerana.desc", { b: Bold })}</div>
              <span className="status wip">{t("projets.etoerana.status")}</span>
            </div>
          </div>
        </section>

        <section id="stack">
          <div className="sec-head">
            <span className="kicker">{t("stack.kicker")}</span>
            <h2>{t("stack.title")}</h2>
          </div>
          <div className="stackstrip">
            <span>
              <span className="lbl">{t("stack.cms")}</span> <b>{t("stack.cmsValue")}</b>
            </span>
            <span>
              <span className="lbl">{t("stack.data")}</span> <b>{t("stack.dataValue")}</b>
            </span>
            <span>
              <span className="lbl">{t("stack.deploy")}</span> <b>{t("stack.deployValue")}</b>
            </span>
          </div>
        </section>

        <footer id="contact">
          <div>
            <h2>{t("footer.title")}</h2>
            <p>{t("footer.desc")}</p>
          </div>
          <div className="foot-links">
            <div className="foot-info">
              <a href="mailto:infos@nosysoatech.com">infos@nosysoatech.com</a>
              <span className="foot-sep">·</span>
              <a href="tel:+261347104338">+261 34 71 043 38</a>
            </div>
            <div className="foot-actions">
              <button type="button" className="foot-link-btn" onClick={openContact}>
                {t("footer.writeMessage")}
              </button>
              <a href="https://wa.me/261347104338" target="_blank" rel="noopener">
                {t("footer.whatsapp")}
              </a>
              <a
                href="https://github.com/gdesipremium1/"
                target="_blank"
                rel="noopener"
              >
                {t("footer.github")}
              </a>
              <a
                href="https://www.linkedin.com/in/fetraniaina-desire-rabemanantsoa-80bb4351/"
                target="_blank"
                rel="noopener"
              >
                {t("footer.linkedin")}
              </a>
            </div>
          </div>
        </footer>
      </div>

      <div className="float-stack">
        <button
          type="button"
          className="float-btn"
          data-tip={t("float.mail")}
          aria-label={t("float.mail")}
          onClick={openContact}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M3.5 6.5 12 13l8.5-6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <a
          className="float-btn"
          href="tel:+261347104338"
          data-tip={t("float.call")}
          aria-label={t("float.call")}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1v3.4c0 .6-.4 1-1 1C10.4 21 3 13.6 3 4.6c0-.6.4-1 1-1H7.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </a>
        <a
          className="float-btn wa"
          href="https://wa.me/261347104338"
          target="_blank"
          rel="noopener"
          data-tip={t("float.whatsapp")}
          aria-label={`${t("float.whatsapp")} — +261 34 71 043 38`}
        >
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path
              d="M16.02 4C9.4 4 4 9.37 4 15.98c0 2.11.56 4.09 1.53 5.8L4 28l6.4-1.68a12 12 0 0 0 5.62 1.4h.01c6.62 0 12-5.37 12-11.98C28.03 9.37 22.65 4 16.02 4Zm0 21.85h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.8 1 1.01-3.7-.24-.38a9.87 9.87 0 0 1-1.52-5.2c0-5.46 4.45-9.9 9.94-9.9 2.65 0 5.14 1.03 7.02 2.91a9.85 9.85 0 0 1 2.9 6.99c0 5.47-4.45 9.9-9.9 9.9Zm5.44-7.42c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.24-.46-2.37-1.47-.87-.78-1.46-1.74-1.63-2.04-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.91-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35Z"
              fill="#fff"
            />
          </svg>
        </a>
      </div>

      <dialog
        ref={dialogRef}
        className="contact-modal"
        onClose={handleDialogClose}
        onClick={handleBackdropClick}
      >
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="cm-head">
            <div>
              <span className="kicker" style={{ marginBottom: 6 }}>
                {t("contact.kicker")}
              </span>
              <h2>{t("contact.title")}</h2>
            </div>
            <button type="button" className="cm-close" aria-label={t("contact.close")} onClick={closeContact}>
              &times;
            </button>
          </div>
          <p className="cm-sub">
            {t.rich("contact.subtitle", {
              mono: (chunks) => <span className="mono">{chunks}</span>,
            })}
          </p>

          {status !== "success" ? (
            <div className="cm-body">
              <label className="field">
                <span>{t("contact.name")}</span>
                <input type="text" name="name" required autoComplete="name" />
              </label>
              <label className="field">
                <span>{t("contact.email")}</span>
                <input type="email" name="email" required autoComplete="email" />
              </label>
              <label className="field">
                <span>{t("contact.message")}</span>
                <textarea name="message" rows={4} required />
              </label>
              <button
                type="submit"
                className="btn primary cm-submit"
                data-loading={status === "loading"}
                disabled={status === "loading"}
              >
                <span className="cm-submit-label">{t("contact.send")}</span>
                <span className="cm-spinner" aria-hidden="true" />
              </button>

              {status === "error" && <p className="cm-error">{errorMsg}</p>}

              <div className="cm-alt">
                <span className="cm-alt-line" />
                <span>{t("contact.or")}</span>
                <span className="cm-alt-line" />
              </div>
              <a
                className="cm-mailto"
                href="mailto:infos@nosysoatech.com?subject=Contact%20depuis%20le%20portfolio"
              >
                {t("contact.mailtoLink")}
              </a>
            </div>
          ) : (
            <div className="cm-success">
              <div className="cm-success-icon" aria-hidden="true">
                &#10003;
              </div>
              <p>
                <b>{t("contact.successTitle")}</b>
                <br />
                {t("contact.successDesc")}
              </p>
              <button type="button" className="btn ghost" onClick={closeContact}>
                {t("contact.close")}
              </button>
            </div>
          )}
        </form>
      </dialog>
    </>
  );
}
