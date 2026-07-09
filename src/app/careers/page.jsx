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
        <h1>Careers</h1>
        <h2>Carreras</h2>
      </section>

      <section className="infoCard">
        <div>
          <p className="infoLang">English</p>
          <p>VozEterna is currently in Founder Beta. We are not hiring full-time roles yet, but we are open to future collaborators in design, development, family support, funeral home partnerships, and storytelling.</p>
        </div>

        <div>
          <p className="infoLang">Espanol</p>
          <p>VozEterna se encuentra actualmente en Programa Fundador. Todavia no estamos contratando puestos de tiempo completo, pero estamos abiertos a futuros colaboradores en diseno, desarrollo, soporte familiar, alianzas con funerarias y narracion de historias.</p>
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
