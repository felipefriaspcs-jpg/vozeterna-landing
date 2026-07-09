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
        <h1>Contact</h1>
        <h2>Contacto</h2>
      </section>

      <section className="infoCard">
        <div>
          <p className="infoLang">English</p>
          <p>Have a question about VozEterna? Contact Felipe Frias at felipe.frias.pcs@gmail.com. Based in Guadalajara, Jalisco, Mexico.</p>
        </div>

        <div>
          <p className="infoLang">Espanol</p>
          <p>Tienes una pregunta sobre VozEterna? Contacta a Felipe Frias en felipe.frias.pcs@gmail.com. Ubicado en Guadalajara, Jalisco, Mexico.</p>
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
