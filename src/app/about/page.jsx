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
        <h1>About VozEterna</h1>
        <h2>Acerca de VozEterna</h2>
      </section>

      <section className="infoCard">
        <div>
          <p className="infoLang">English</p>
          <p>VozEterna is a bilingual family legacy and memorial platform created to help families preserve a loved one's voice, stories, photos, videos, final messages, and digital memories.</p>
        </div>

        <div>
          <p className="infoLang">Espanol</p>
          <p>VozEterna es una plataforma bilingue de legado familiar y memorial creada para ayudar a las familias a preservar la voz, historias, fotos, videos, mensajes finales y recuerdos digitales de un ser querido.</p>
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
