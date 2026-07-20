"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { getInitialMobileLanguage } from "../../../../components/mobile/mobileLanguage";

const copy = {
  en: {
    label: "Invite Update",
    title: "Use your vault invite link",
    subtitle:
      "VozEterna now creates account access and vault access from one private vault invite link.",
    message:
      "This account-only invite route is no longer used. Open the private vault invite link you received instead.",
    home: "Go to VozEterna",
  },
  es: {
    label: "Actualizacion de invitacion",
    title: "Usa tu enlace de invitacion al vault",
    subtitle:
      "VozEterna ahora crea acceso de cuenta y acceso al vault desde un solo enlace privado.",
    message:
      "Esta ruta de invitacion solo para cuenta ya no se usa. Abre el enlace privado del vault que recibiste.",
    home: "Ir a VozEterna",
  },
};

export default function MobileAccountInvitePage() {
  const [language, setLanguage] = useState("en");
  const t = copy[language] || copy.en;

  useEffect(() => {
    setLanguage(getInitialMobileLanguage());

    function handleLanguageChange(event) {
      if (event.detail === "en" || event.detail === "es") {
        setLanguage(event.detail);
      }
    }

    window.addEventListener("vozeterna-language-change", handleLanguageChange);
    return () => window.removeEventListener("vozeterna-language-change", handleLanguageChange);
  }, []);

  return (
    <section className="mobileScreenStack">
      <div className="mobileScreenHero">
        <p className="mobileCapsLabel">{t.label}</p>
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </div>

      <section className="mobileFormCard">
        <div className="mobileConsentNotice">
          <ShieldCheck size={20} />
          <p>{t.message}</p>
        </div>

        <Link href="/mobile" className="mobilePrimaryButton">
          {t.home}
        </Link>
      </section>
    </section>
  );
}
