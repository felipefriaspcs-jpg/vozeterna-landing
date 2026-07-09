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
        <h1>Terms</h1>
        <h2>Terminos</h2>
      </section>

      <section className="infoCard">
        <div>
          <p className="infoLang">English</p>
          <p>VozEterna is currently offered as a Founder Beta service. Some services may be delivered manually while the full platform is being built. VozEterna does not provide legal, tax, estate-planning, or funeral-director services.</p>
        </div>

        <div>
          <p className="infoLang">Espanol</p>
          <p>VozEterna se ofrece actualmente como un servicio de Programa Fundador. Algunos servicios pueden entregarse manualmente mientras se construye la plataforma completa. VozEterna no proporciona servicios legales, fiscales, de planificacion patrimonial ni servicios de director funerario.</p>
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
