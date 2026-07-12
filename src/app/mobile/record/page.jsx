"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getInitialMobileLanguage } from "../../../components/mobile/mobileLanguage";

const copy = {
  en: {
    label: "Record Memories",
    title: "Record voice and video",
    subtitle: "Capture blessings, stories, prayers, messages, and quiet family moments in your private legacy vault.",
    openRecorder: "Open recorder",
    openRecorderText: "Use the full recorder while the mobile-native recorder is being finished.",
    upload: "Upload a memory",
    uploadText: "Add photos, audio, video, keepsakes, and notes.",
    ideas: "Ideas",
    ideaTitle: "Record something meaningful",
    scriptTitle: "Memory script",
    scriptText: "Write what you want to say before recording. This can become a saved transcript later.",
    saveDraft: "Save draft locally",
    saved: "Draft saved on this phone.",
    prompts: [
      "Share a favorite story.",
      "Leave a blessing.",
      "Say what made someone special.",
      "Describe a favorite family moment.",
    ],
  },
  es: {
    label: "Grabar recuerdos",
    title: "Graba voz y video",
    subtitle: "Captura bendiciones, historias, oraciones, mensajes y momentos familiares en tu bóveda privada.",
    openRecorder: "Abrir grabadora",
    openRecorderText: "Usa la grabadora completa mientras terminamos la versión móvil.",
    upload: "Subir recuerdo",
    uploadText: "Agrega fotos, audio, video, recuerdos y notas.",
    ideas: "Ideas",
    ideaTitle: "Graba algo con significado",
    scriptTitle: "Guion del recuerdo",
    scriptText: "Escribe lo que quieres decir antes de grabar. Después podrá guardarse como transcripción.",
    saveDraft: "Guardar borrador local",
    saved: "Borrador guardado en este teléfono.",
    prompts: [
      "Comparte una historia favorita.",
      "Deja una bendición.",
      "Di qué hacía especial a esa persona.",
      "Describe un momento familiar favorito.",
    ],
  },
};

export default function MobileRecordPage() {
  const [language, setLanguage] = useState("en");
  const [script, setScript] = useState("");
  const [message, setMessage] = useState("");

  const t = copy[language] || copy.en;

  useEffect(() => {
    setLanguage(getInitialMobileLanguage());
    setScript(localStorage.getItem("vozeterna-memory-script") || "");

    function handleLanguageChange(event) {
      if (event.detail === "en" || event.detail === "es") {
        setLanguage(event.detail);
      }
    }

    window.addEventListener("vozeterna-language-change", handleLanguageChange);

    return () => {
      window.removeEventListener("vozeterna-language-change", handleLanguageChange);
    };
  }, []);

  function saveDraft() {
    localStorage.setItem("vozeterna-memory-script", script);
    setMessage(t.saved);
  }

  return (
    <section className="mobileScreenStack">
      <div className="mobileScreenHero">
        <p className="mobileCapsLabel">{t.label}</p>
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </div>

      <div className="mobileActionGrid">
        <Link href="/app/record" className="mobileActionCard primary">
          <span>◉</span>
          <strong>{t.openRecorder}</strong>
          <p>{t.openRecorderText}</p>
        </Link>

        <Link href="/mobile/upload" className="mobileActionCard">
          <span>▣</span>
          <strong>{t.upload}</strong>
          <p>{t.uploadText}</p>
        </Link>
      </div>

      <div className="mobilePromptCard">
        <p className="mobileCapsLabel">{t.ideas}</p>
        <h2>{t.ideaTitle}</h2>

        <ul>
          {t.prompts.map((prompt) => (
            <li key={prompt}>{prompt}</li>
          ))}
        </ul>
      </div>

      <div className="mobileFormCard">
        <p className="mobileCapsLabel">{t.scriptTitle}</p>
        <p className="mobileFormHelper">{t.scriptText}</p>

        <textarea
          value={script}
          onChange={(event) => setScript(event.target.value)}
          placeholder={language === "es" ? "Escribe aquí tu recuerdo..." : "Write your memory here..."}
        />

        {message && <p className="mobileFormMessage">{message}</p>}

        <button type="button" onClick={saveDraft}>
          {t.saveDraft}
        </button>
      </div>
    </section>
  );
}