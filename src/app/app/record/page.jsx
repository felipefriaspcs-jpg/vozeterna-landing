"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AudioRecorder from "../../../components/app/AudioRecorder";
import CameraRecorder from "../../../components/app/CameraRecorder";
import { supabase } from "../../../lib/supabaseClient";
import { useAppLanguage } from "../../../lib/useAppLanguage";

const copy = {
  en: {
    step: "Record Memories",
    title: "Record Voice & Video Memories",
    subtitle:
      "Capture and preserve voice, video, stories, and messages for your family to treasure forever.",
    back: "Back to dashboard",
    signInTitle: "Please sign in",
    signInText: "You need to sign in before recording private family memories.",
    signIn: "Sign in",
    noConsentTitle: "Consent required",
    noConsentText:
      "Before recording voice or video memories, please complete the consent and signature agreement.",
    completeConsent: "Complete consent",
    noProfilesTitle: "Create a loved one profile first",
    noProfilesText:
      "Before recording memories, create a profile for the person these memories belong to.",
    createProfile: "Create profile",
    consentSigned: "Consent signed",
    vaultSecured: "Vault secured",
    recordVoice: "Record Voice Memory",
    recordVideo: "Record Video Memory",
    prepareTitle: "Prepare the memory",
    prepareText:
      "Choose the loved one, type of memory, and an optional note before you record.",
    who: "Who is this memory for?",
    kind: "What kind of memory is this?",
    note: "Optional memory note",
    notePlaceholder:
      "Example: Mom's blessing, Dad's advice, Grandma's prayer, or a special family message.",
    ideasEyebrow: "Need ideas?",
    ideasTitle: "Record something meaningful",
    ideasText:
      "You do not need a perfect speech. A simple message, memory, prayer, or blessing can become priceless to your family later.",
    privateTitle: "Private by default",
    privateText:
      "Recordings stay in your private vault unless you choose to share them on a public memorial page.",
    calmTitle: "Breathe. Speak slowly.",
    calmText:
      "The most valuable recordings usually feel natural. Say it like you would say it to family.",
    voiceCardTitle: "Voice Memory",
    voiceCardText: "Record an audio message for your private vault.",
    videoCardTitle: "Video Memory",
    videoCardText: "Capture a video memory with your camera.",
    nextTitle: "Next steps after recording",
    nextSteps: [
      "Review new recordings",
      "Tag loved ones",
      "Save memory",
      "Approve for public page",
    ],
    tagRule:
      "Tagging loved ones should happen after they already have their own profile in the vault.",
    prompts: [
      "Share a favorite story",
      "Leave a blessing",
      "Record a prayer",
      "Say what made them special",
      "Tell your family what you want remembered",
      "Describe a favorite moment",
    ],
    types: {
      photo_of_person: "Photo of this person",
      photo_from_person: "Photo from this person",
      story_about_person: "Story about this person",
      message_from_person: "Message from this person",
      voice_of_person: "Voice of this person",
      family_memory: "Family memory connected to this person",
      document_or_keepsake: "Document or keepsake",
    },
  },
  es: {
    step: "Grabar recuerdos",
    title: "Grabar recuerdos de voz y video",
    subtitle:
      "Captura y preserva voz, video, historias y mensajes para que tu familia los atesore para siempre.",
    back: "Volver al inicio",
    signInTitle: "Por favor inicia sesión",
    signInText: "Necesitas iniciar sesión antes de grabar recuerdos familiares privados.",
    signIn: "Iniciar sesión",
    noConsentTitle: "Consentimiento requerido",
    noConsentText:
      "Antes de grabar recuerdos de voz o video, completa el consentimiento y la firma.",
    completeConsent: "Completar consentimiento",
    noProfilesTitle: "Primero crea un perfil de ser querido",
    noProfilesText:
      "Antes de grabar recuerdos, crea un perfil para la persona a la que pertenecen estos recuerdos.",
    createProfile: "Crear perfil",
    consentSigned: "Consentimiento firmado",
    vaultSecured: "Bóveda protegida",
    recordVoice: "Grabar recuerdo de voz",
    recordVideo: "Grabar recuerdo en video",
    prepareTitle: "Prepara el recuerdo",
    prepareText:
      "Elige el ser querido, el tipo de recuerdo y una nota opcional antes de grabar.",
    who: "¿Para quién es este recuerdo?",
    kind: "¿Qué tipo de recuerdo es?",
    note: "Nota opcional del recuerdo",
    notePlaceholder:
      "Ejemplo: La bendición de mamá, el consejo de papá, la oración de abuela o un mensaje familiar especial.",
    ideasEyebrow: "¿Necesitas ideas?",
    ideasTitle: "Graba algo con significado",
    ideasText:
      "No necesitas un discurso perfecto. Un mensaje sencillo, recuerdo, oración o bendición puede volverse invaluable para tu familia después.",
    privateTitle: "Privado por defecto",
    privateText:
      "Las grabaciones permanecen en tu bóveda privada a menos que decidas compartirlas en una página memorial pública.",
    calmTitle: "Respira. Habla con calma.",
    calmText:
      "Las grabaciones más valiosas suelen sentirse naturales. Dilo como se lo dirías a tu familia.",
    voiceCardTitle: "Recuerdo de voz",
    voiceCardText: "Graba un mensaje de audio para tu bóveda privada.",
    videoCardTitle: "Recuerdo en video",
    videoCardText: "Captura un recuerdo en video con tu cámara.",
    nextTitle: "Siguientes pasos después de grabar",
    nextSteps: [
      "Revisar nuevas grabaciones",
      "Etiquetar seres queridos",
      "Guardar recuerdo",
      "Aprobar para página pública",
    ],
    tagRule:
      "Etiquetar seres queridos debe hacerse después de que ya tengan su propio perfil en la bóveda.",
    prompts: [
      "Comparte una historia favorita",
      "Deja una bendición",
      "Graba una oración",
      "Di qué hacía especial a esa persona",
      "Cuenta lo que quieres que tu familia recuerde",
      "Describe un momento favorito",
    ],
    types: {
      photo_of_person: "Foto de esta persona",
      photo_from_person: "Foto de esta persona o guardada por ella",
      story_about_person: "Historia sobre esta persona",
      message_from_person: "Mensaje de esta persona",
      voice_of_person: "Voz de esta persona",
      family_memory: "Recuerdo familiar conectado a esta persona",
      document_or_keepsake: "Documento o recuerdo especial",
    },
  },
};

function GateCard({ eyebrow, title, text, primaryHref, primaryLabel, secondaryHref, secondaryLabel }) {
  return (
    <main className="appShell recordPageClean">
      <section className="recordGateCard">
        <p className="appEyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{text}</p>

        <div className="buttonRow">
          <Link href={primaryHref} className="appButton">
            {primaryLabel}
          </Link>

          <Link href={secondaryHref} className="appButton secondary">
            {secondaryLabel}
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function RecordPage() {
  const language = useAppLanguage();
  const t = copy[language] || copy.en;

  const [user, setUser] = useState(null);
  const [hasConsent, setHasConsent] = useState(false);
  const [lovedOnes, setLovedOnes] = useState([]);
  const [selectedLovedOneId, setSelectedLovedOneId] = useState("");
  const [memoryType, setMemoryType] = useState("voice_of_person");
  const [memoryNote, setMemoryNote] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecordSetup() {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const currentUser = userData?.user || null;
        setUser(currentUser);

        if (!currentUser) {
          setLoading(false);
          return;
        }

        const { data: consentData } = await supabase
          .from("consent_records")
          .select("id")
          .eq("user_id", currentUser.id)
          .eq("accepted", true)
          .order("accepted_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        setHasConsent(Boolean(consentData?.id));

        const { data: profilesData, error: profilesError } = await supabase
          .from("loved_ones")
          .select("id, full_name, relationship")
          .order("created_at", { ascending: false });

        if (profilesError) {
          console.error("Failed to load loved ones:", profilesError.message);
          setLovedOnes([]);
          setLoading(false);
          return;
        }

        const profiles = profilesData || [];
        setLovedOnes(profiles);

        if (profiles.length) {
          const params = new URLSearchParams(window.location.search);
          const requestedLovedOneId = params.get("lovedOneId");
          const exists = profiles.some((profile) => profile.id === requestedLovedOneId);

          setSelectedLovedOneId(exists ? requestedLovedOneId : profiles[0].id);
        }
      } catch (error) {
        console.error("Failed to load record page:", error);
      } finally {
        setLoading(false);
      }
    }

    loadRecordSetup();
  }, []);

  const typeOptions = useMemo(() => Object.entries(t.types), [t.types]);

  if (loading) {
    return (
      <main className="appShell recordPageClean">
        <section className="recordGateCard">
          <p className="appEyebrow">{t.step}</p>
          <h1>{language === "es" ? "Cargando..." : "Loading..."}</h1>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <GateCard
        eyebrow={t.step}
        title={t.signInTitle}
        text={t.signInText}
        primaryHref="/app/login"
        primaryLabel={t.signIn}
        secondaryHref="/app"
        secondaryLabel={t.back}
      />
    );
  }

  if (!hasConsent) {
    return (
      <GateCard
        eyebrow={t.step}
        title={t.noConsentTitle}
        text={t.noConsentText}
        primaryHref="/app/consent"
        primaryLabel={t.completeConsent}
        secondaryHref="/app"
        secondaryLabel={t.back}
      />
    );
  }

  if (!lovedOnes.length) {
    return (
      <GateCard
        eyebrow={t.step}
        title={t.noProfilesTitle}
        text={t.noProfilesText}
        primaryHref="/app/loved-ones/new"
        primaryLabel={t.createProfile}
        secondaryHref="/app"
        secondaryLabel={t.back}
      />
    );
  }

  return (
    <main className="appShell recordPageClean">
      <section className="recordHeroGrid">
        <div className="recordHeroCard">
          <p className="appEyebrow">{t.step}</p>
          <h1>{t.title}</h1>
          <p className="recordHeroText">{t.subtitle}</p>

          <div className="recordPillRow">
            <span className="recordInfoPill">
              <span className="recordPillIcon">✓</span>
              {t.consentSigned}
            </span>

            <span className="recordInfoPill">
              <span className="recordPillIcon">🛡</span>
              {t.vaultSecured}
            </span>
          </div>

          <div className="recordActionRow">
            <a href="#voice-recorder" className="appButton recordPrimaryCta">
              {t.recordVoice}
            </a>

            <a href="#video-recorder" className="appButton secondary recordSecondaryCta">
              {t.recordVideo}
            </a>
          </div>
        </div>

        <aside className="recordIdeasCard">
          <p className="appEyebrow">{t.ideasEyebrow}</p>
          <h2>{t.ideasTitle}</h2>
          <p>{t.ideasText}</p>

          <div className="recordPromptGrid">
            {t.prompts.map((prompt) => (
              <span key={prompt} className="recordPromptChip">
                {prompt}
              </span>
            ))}
          </div>

          <div className="recordPrivacyBox">
            <strong>{t.privateTitle}</strong>
            <p>{t.privateText}</p>
          </div>
        </aside>
      </section>

      <section className="recordPrepareGrid">
        <div className="recordFormCard">
          <div className="recordSectionHead">
            <p className="appEyebrow">{t.prepareTitle}</p>
            <h2>{t.prepareTitle}</h2>
            <p>{t.prepareText}</p>
          </div>

          <div className="recordFieldStack">
            <label className="recordField">
              <span>{t.who}</span>
              <select
                className="recordSelect"
                value={selectedLovedOneId}
                onChange={(event) => setSelectedLovedOneId(event.target.value)}
              >
                {lovedOnes.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.full_name}
                    {profile.relationship ? ` — ${profile.relationship}` : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="recordField">
              <span>{t.kind}</span>
              <select
                className="recordSelect"
                value={memoryType}
                onChange={(event) => setMemoryType(event.target.value)}
              >
                {typeOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="recordField">
              <span>{t.note}</span>
              <textarea
                className="recordTextarea"
                rows={4}
                value={memoryNote}
                onChange={(event) => setMemoryNote(event.target.value)}
                placeholder={t.notePlaceholder}
              />
            </label>
          </div>
        </div>

        <aside className="recordWarmCard">
          <div className="recordWarmBadge">VE</div>
          <h2>{t.calmTitle}</h2>
          <p>{t.calmText}</p>
        </aside>
      </section>

      <section className="recordStudiosGrid">
        <article id="voice-recorder" className="recordStudioCard">
          <div className="recordSectionHead compact">
            <p className="appEyebrow">{t.voiceCardTitle}</p>
            <h2>{t.voiceCardTitle}</h2>
            <p>{t.voiceCardText}</p>
          </div>

          <div className="recordRecorderWrap">
            <AudioRecorder
              language={language}
              user={user}
              lovedOneId={selectedLovedOneId}
              memoryType={memoryType}
              memoryNote={memoryNote}
            />
          </div>
        </article>

        <article id="video-recorder" className="recordStudioCard">
          <div className="recordSectionHead compact">
            <p className="appEyebrow">{t.videoCardTitle}</p>
            <h2>{t.videoCardTitle}</h2>
            <p>{t.videoCardText}</p>
          </div>

          <div className="recordRecorderWrap">
            <CameraRecorder
              language={language}
              user={user}
              lovedOneId={selectedLovedOneId}
              memoryType={memoryType}
              memoryNote={memoryNote}
            />
          </div>
        </article>
      </section>

      <section className="recordNextCard">
        <div className="recordSectionHead compact">
          <h2>{t.nextTitle}</h2>
        </div>

        <ul className="recordNextList">
          {t.nextSteps.map((item, index) => (
            <li key={item}>
              <span className="recordNextIcon">{index === 3 ? "✓" : "•"}</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <p className="recordNextNote">{t.tagRule}</p>
      </section>
    </main>
  );
}