"use client";

import Image from "next/image";

export default function InfoPage() {
  return (
    <main className="infoPage">
      <header className="infoHeader">
        <a className="brand" href="/">
          <Image src="/brand/logo-primary.png" alt="VozEterna logo" width={170} height={48} priority />
        </a>
        <a className="backHome" href="/">Back to Home / Volver al Inicio</a>
      </header>

      <section className="infoHero">
        <p className="eyebrow">VOZETERNA</p>
        <h1>Press</h1>
        <h2>Prensa</h2>
      </section>

      <section className="infoCard">
        <div>
          <p className="infoLang">English</p>
          <p>For media, interviews, or partnership inquiries, please contact the VozEterna founder directly.</p>
        </div>

        <div>
          <p className="infoLang">Espanol</p>
          <p>Para medios, entrevistas o consultas de colaboracion, por favor contacta directamente al fundador de VozEterna.</p>
        </div>
      </section>

      <section className="infoContact">
        <strong>Contact / Contacto</strong>
        <a href="mailto:felipe.frias.pcs@gmail.com">felipe.frias.pcs@gmail.com</a>
        <span>Guadalajara, Jalisco, Mexico</span>
      </section>
    </main>
  );
}
