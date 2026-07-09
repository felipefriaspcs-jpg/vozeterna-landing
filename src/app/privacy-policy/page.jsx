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
        <h1>Privacy Policy</h1>
        <h2>Politica de Privacidad</h2>
      </section>

      <section className="infoCard">
        <div>
          <p className="infoLang">English</p>
          <p>VozEterna respects family privacy. Information submitted through our forms may be used to contact you about your request, provide Founder Beta support, and improve the service. We do not sell personal information.</p>
        </div>

        <div>
          <p className="infoLang">Espanol</p>
          <p>VozEterna respeta la privacidad familiar. La informacion enviada por nuestros formularios puede usarse para contactarte sobre tu solicitud, brindar soporte del Programa Fundador y mejorar el servicio. No vendemos informacion personal.</p>
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
