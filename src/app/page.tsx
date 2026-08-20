"use client";

import Image from "next/image";
import { useState } from "react";

const LANGS = [
  { code: "mg", label: "MG" },
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
] as const;

export default function Home() {
  const [lang, setLang] = useState<"mg" | "fr" | "en">("fr");

  return (
    <>
      <div className="gridfield" />

      <div className="wrap">
        <nav>
          <div className="wordmark">
            <span className="wm-nosy">nosy</span>
            <span className="wm-soa">soa</span>
            <span className="wm-tech">tech</span>
          </div>
          <div className="navright">
            <div className="navlinks">
              <a href="#specialites">Spécialités</a>
              <a href="#projets">Projets</a>
              <a href="#contact">Contact</a>
            </div>
            <div className="navlangs">
              <span className="lang-label">Langue</span>
              <div className="langswitch" role="group" aria-label="Langue du site">
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    className="lang-btn"
                    data-active={lang === l.code}
                    onClick={() => setLang(l.code)}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <header className="hero">
          <div className="hero-inner">
            <div className="idrow">
              <Image
                className="avatar"
                src="/avatar.png"
                alt="Fetraniaina Désiré Rabemanantsoa"
                width={52}
                height={52}
              />
              <div className="eyebrow" style={{ marginBottom: 0 }}>
                Fetraniaina Désiré Rabemanantsoa
              </div>
            </div>
            <h1>Je construis des produits à partir de données structurées.</h1>
            <p className="hero-sub">
              Développeur <b>Full Stack — Python/Django &amp; Data</b>. 13 ans à
              transformer des catalogues, des fichiers et des bases complexes
              en applications qui tiennent en production.
            </p>
            <div className="chiprow">
              <span className="chip">
                <b>13 ans</b> d&apos;expérience
              </span>
              <span className="chip">
                <b>3</b> secteurs — e-commerce, immobilier &amp; application sur
                mesure
              </span>
              <span className="chip">
                Remote, <b>FR / EN</b>
              </span>
            </div>
            <div className="cta-row">
              <a className="btn primary" href="#projets">
                Voir les projets
              </a>
              <a className="btn ghost" href="#contact">
                Me contacter
              </a>
            </div>
          </div>
        </header>

        <section id="specialites">
          <div className="sec-head">
            <span className="kicker">Spécialités</span>
            <h2>Ce que je fais</h2>
          </div>
          <div className="pillars">
            <div className="pillar">
              <span className="pnum">01</span>
              <h3>Full Stack</h3>
              <p>
                Conception de bout en bout — architecture base de données,
                API, interface. Un seul interlocuteur du besoin à la mise en
                production.
              </p>
              <div className="stack">
                <span>TypeScript</span>
                <span>React / Next.js</span>
                <span>PostgreSQL</span>
              </div>
            </div>
            <div className="pillar">
              <span className="pnum">02</span>
              <h3>Python &amp; Django</h3>
              <p>
                Backends robustes et modélisation de données pour des
                applications qui doivent durer, pas juste démarrer.
              </p>
              <div className="stack">
                <span>Python</span>
                <span>Django</span>
                <span>REST API</span>
              </div>
            </div>
            <div className="pillar">
              <span className="pnum">03</span>
              <h3>Data</h3>
              <p>
                Catalogues, imports/exports, migrations et structuration de
                données à grande échelle — mon terrain depuis 13 ans.
              </p>
              <div className="stack">
                <span>ETL / Import</span>
                <span>Migration BDD</span>
                <span>Modélisation</span>
              </div>
            </div>
            <div className="pillar">
              <span className="pnum">04</span>
              <h3>PHP</h3>
              <p>
                Le socle de mes projets e-commerce les plus aboutis —
                gimoexpert tourne sur Symfony, avec 13 ans de Magento et
                PrestaShop derrière.
              </p>
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
            <span className="kicker">Preuves</span>
            <h2>Projets</h2>
          </div>
          <div className="projects">
            <div className="proj">
              <div className="pname">gimoexpert</div>
              <div className="pdesc">
                <b>Catalogue e-commerce généré depuis Excel</b> — détection
                automatique du type de produit, import/export, panier et
                devis. Le cas d&apos;usage le plus complet de la compétence
                Data.
              </div>
              <span className="status live">En production</span>
            </div>
            <div className="proj">
              <div className="pname">mag1to2_migration</div>
              <div className="pdesc">
                <b>Outil de migration Magento 1 → 2</b> avec autofiltre
                catégories et produits. Publié en licence MIT.
              </div>
              <span className="status live">Outil publié</span>
            </div>
            <div className="proj">
              <div className="pname">e-toerana.com</div>
              <div className="pdesc">
                <b>Plateforme immobilière</b> — catalogue de biens structuré,
                développée en Python/Django. Même logique que gimoexpert,
                appliquée à l&apos;immobilier.
              </div>
              <span className="status wip">En développement</span>
            </div>
          </div>
        </section>

        <section id="stack">
          <div className="sec-head">
            <span className="kicker">Aussi maîtrisé</span>
            <h2>Stack complémentaire</h2>
          </div>
          <div className="stackstrip">
            <span>
              <span className="lbl">CMS —</span> <b>WordPress</b>, Joomla
            </span>
            <span>
              <span className="lbl">Données —</span> <b>MySQL</b>, PostgreSQL
            </span>
            <span>
              <span className="lbl">Déploiement —</span> <b>Git</b>, CI/CD,
              SSH
            </span>
          </div>
        </section>

        <footer id="contact">
          <div>
            <h2>Travaillons ensemble</h2>
            <p>
              Migration, catalogue de données ou application sur mesure —
              écris-moi un mot sur le besoin, je réponds avec un plan
              concret.
            </p>
          </div>
          <div className="foot-links">
            <a href="mailto:fetraniainadesirerabemanantsoa@gmail.com">
              Email
            </a>
            <a
              href="https://github.com/gdesipremium1/"
              target="_blank"
              rel="noopener"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/fetraniaina-desire-rabemanantsoa-80bb4351/"
              target="_blank"
              rel="noopener"
            >
              LinkedIn
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}
