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
        <h1>Help Center</h1>
        <h2>Centro de Ayuda</h2>
      </section>

      <section className="infoCard">
        <div>
          <p className="infoLang">English</p>
          <p>Need help starting a family legacy kit, recording a loved one, or understanding the Founder Beta? Contact us and we will guide you step by step.</p>
        </div>

        <div>
          <p className="infoLang">Espanol</p>
          <p>Necesitas ayuda para iniciar un kit de legado familiar, grabar a un ser querido o entender el Programa Fundador? Contactanos y te guiaremos paso a paso.</p>
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
