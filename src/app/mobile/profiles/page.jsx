"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockKeyhole, Plus, QrCode, UserRound, X } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import { getVaultAccess, loadAccessibleVaults } from "../../../lib/mobileVault";
import { getVaultSkinImage, getVaultSkinVideo, normalizeVaultSkin } from "../../../lib/vaultSkins";
import { getInitialMobileLanguage } from "../../../components/mobile/mobileLanguage";

const copy = {
  en: {
    heroLabel: "PRIVATE LEGACY VAULTS",
    title: "Memory Vaults",
    subtitle: "Create private spaces for loved ones, stories, voice recordings, photos, and family memories.",
    create: "Create vault",
    createText: "Start a private archive for one loved one or family story.",
    connect: "Connect family",
    connectText: "Create a private invite link or QR code.",
    loading: "Loading vaults...",
    error: "We could not load your vaults right now. Please try again.",
    emptyTitle: "No vaults yet",
    emptyText: "Create your first private memory vault to begin preserving stories, photos, recordings, and family legacy.",
    createFirst: "Create first vault",
    unlockVault: "Unlock Vault",
    cancel: "Cancel",
    delete: "Delete",
    clear: "Clear",
    enterCode: "Enter code",
    incorrectCode: "Incorrect code. Please try again.",
    openingVault: "Opening vault...",
    wrongCodeVideo: "Checking code...",
    playSound: "Tap to play sound",
  },
  es: {
    heroLabel: "BOVEDAS PRIVADAS DE LEGADO",
    title: "Bóvedas de memoria",
    subtitle: "Crea espacios privados para seres queridos, historias, grabaciones de voz, fotos y recuerdos familiares.",
    create: "Crear boveda",
    createText: "Inicia un archivo privado para un ser querido o una historia familiar.",
    connect: "Conectar familia",
    connectText: "Crea un enlace privado o codigo QR.",
    loading: "Cargando bovedas...",
    error: "No pudimos cargar tus bovedas ahora. Intentalo de nuevo.",
    emptyTitle: "Todavia no hay bovedas",
    emptyText: "Crea tu primera boveda privada para empezar a preservar historias, fotos, grabaciones y legado familiar.",
    createFirst: "Crear primera boveda",
    unlockVault: "Desbloquear bóveda",
    cancel: "Cancelar",
    delete: "Borrar",
    clear: "Limpiar",
    enterCode: "Ingresa el codigo",
    incorrectCode: "Código incorrecto. Inténtalo de nuevo.",
  },
};

copy.es.openingVault = "Abriendo boveda...";
copy.es.wrongCodeVideo = "Verificando codigo...";
copy.es.playSound = "Toca para reproducir sonido";

const MAX_PIN_LENGTH = 8;
const MIN_PIN_LENGTH = 4;
const DEMO_UNLOCK_CODE = "1234";
const KEYPAD_BUTTONS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "delete", "0", "clear"];

export default function MobileProfilesPage() {
  const router = useRouter();
  const [language, setLanguage] = useState("en");
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [unlockingVault, setUnlockingVault] = useState(null);
  const [enteredCode, setEnteredCode] = useState("");
  const [unlockError, setUnlockError] = useState("");
  const [unlockStage, setUnlockStage] = useState("keypad");
  const unlockVideoHandledRef = useRef(false);
  const unlockVideoRef = useRef(null);
  const [showSoundPrompt, setShowSoundPrompt] = useState(false);

  const t = copy[language] || copy.en;
  const canInviteFromAnyVault = vaults.some((vault) => vault.access?.canManage);
  const unlockSkinKey = unlockingVault ? normalizeVaultSkin(unlockingVault.vault_skin) : "steel";
  const unlockVideoSrc =
    unlockStage === "successVideo"
      ? getVaultSkinVideo(unlockSkinKey, "openSuccess")
      : unlockStage === "wrongVideo"
        ? getVaultSkinVideo(unlockSkinKey, "wrongCode")
        : "";
  const isVideoStage = unlockStage === "successVideo" || unlockStage === "wrongVideo";

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

  useEffect(() => {
    loadVaults();
  }, []);

  useEffect(() => {
    if (!unlockingVault) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (unlockStage !== "keypad") return;

      if (event.key === "Escape") {
        closeUnlockModal();
        return;
      }

      if (/^\d$/.test(event.key)) {
        appendDigit(event.key);
        return;
      }

      if (event.key === "Backspace") {
        removeLastDigit();
        return;
      }

      if (event.key === "Enter" && enteredCode.length >= MIN_PIN_LENGTH) {
        submitUnlockCode();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [unlockingVault, enteredCode, unlockStage]);

  useEffect(() => {
    if (!unlockingVault || unlockStage === "keypad") return undefined;

    unlockVideoHandledRef.current = false;
    setShowSoundPrompt(false);
    const fallbackDelay = unlockStage === "successVideo" ? 5200 : 3600;
    const fallbackTimer = window.setTimeout(() => {
      handleUnlockVideoEnded(unlockStage);
    }, fallbackDelay);

    return () => window.clearTimeout(fallbackTimer);
  }, [unlockingVault, unlockStage]);

  useEffect(() => {
    if (!unlockingVault || unlockStage === "keypad" || !unlockVideoSrc) return undefined;

    const playTimer = window.setTimeout(() => {
      attemptUnlockVideoPlay(true);
    }, 0);

    return () => window.clearTimeout(playTimer);
  }, [unlockingVault, unlockStage, unlockVideoSrc]);

  async function loadVaults() {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      setVaults([]);
      setLoading(false);
      return;
    }

    try {
      const accessibleVaults = await loadAccessibleVaults(
        supabase,
        user,
        "id, network_id, created_by, title, subject_name, relationship_label, vault_skin, created_at"
      );
      const vaultsWithAccess = await Promise.all(
        accessibleVaults.map(async (vault) => ({
          ...vault,
          access: await getVaultAccess(supabase, user, vault),
        }))
      );
      const uniqueVaults = [...new Map(vaultsWithAccess.map((vault) => [vault.id, vault])).values()];

      setVaults(uniqueVaults);
    } catch (error) {
      console.error("Mobile profiles error:", error.message);
      setVaults([]);
      setErrorMessage(t.error);
    }

    setLoading(false);
  }

  function openUnlockModal(vault) {
    setUnlockingVault(vault);
    setEnteredCode("");
    setUnlockError("");
    setUnlockStage("keypad");
    unlockVideoHandledRef.current = false;
    setShowSoundPrompt(false);
  }

  function closeUnlockModal() {
    setUnlockingVault(null);
    setEnteredCode("");
    setUnlockError("");
    setUnlockStage("keypad");
    unlockVideoHandledRef.current = false;
    setShowSoundPrompt(false);
  }

  function appendDigit(digit) {
    setUnlockError("");
    setEnteredCode((current) => {
      if (current.length >= MAX_PIN_LENGTH) return current;
      return `${current}${digit}`;
    });
  }

  function removeLastDigit() {
    setUnlockError("");
    setEnteredCode((current) => current.slice(0, -1));
  }

  function clearCode() {
    setUnlockError("");
    setEnteredCode("");
  }

  function submitUnlockCode() {
    if (!unlockingVault || enteredCode.length < MIN_PIN_LENGTH) return;

    // Demo convenience gate only: no PIN is stored or verified here.
    // Supabase Auth and RLS remain the real security boundary for vault data.
    const codeIsValid = /^\d{4,8}$/.test(enteredCode) && enteredCode === DEMO_UNLOCK_CODE;

    if (!codeIsValid) {
      setUnlockError("");
      setShowSoundPrompt(false);
      setUnlockStage("wrongVideo");
      return;
    }

    setUnlockError("");
    setShowSoundPrompt(false);
    setUnlockStage("successVideo");
  }

  async function attemptUnlockVideoPlay(showPromptOnBlock = true) {
    const video = unlockVideoRef.current;
    if (!video) return;

    try {
      video.muted = false;
      video.volume = 1;
      await video.play();
      setShowSoundPrompt(false);
    } catch (error) {
      console.warn("Vault unlock video playback with sound was blocked or unavailable.", error);
      if (showPromptOnBlock) {
        setShowSoundPrompt(true);
      }
    }
  }

  function finishSuccessfulUnlock() {
    if (!unlockingVault?.id) return;

    try {
      sessionStorage.setItem(`vozeterna-unlocked-vault-${unlockingVault.id}`, "true");
    } catch {
      // Supabase RLS remains the real access control; this is only the existing client hint.
    }

    router.push(`/mobile/profiles/${unlockingVault.id}`);
  }

  function handleUnlockVideoEnded(stage = unlockStage) {
    if (unlockVideoHandledRef.current) return;
    unlockVideoHandledRef.current = true;
    setShowSoundPrompt(false);

    if (stage === "successVideo") {
      finishSuccessfulUnlock();
      return;
    }

    if (stage === "wrongVideo") {
      setUnlockStage("keypad");
      setEnteredCode("");
      setUnlockError(t.incorrectCode);
    }
  }

  function handleUnlockVideoMetadata() {
    const video = unlockVideoRef.current;
    if (!video) return;

    const audioTracks = video.audioTracks;
    if (audioTracks && audioTracks.length === 0) {
      console.warn("Vault unlock video loaded without a detectable audio track.");
    }
  }

  function handleKeypadPress(value) {
    if (unlockStage !== "keypad") return;

    if (value === "delete") {
      removeLastDigit();
      return;
    }

    if (value === "clear") {
      clearCode();
      return;
    }

    appendDigit(value);
  }

  return (
    <section className="mobileScreenStack mobileVaultsPage">
      <div className="mobileVaultHero">
        <p className="mobileCapsLabel">{t.heroLabel}</p>
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </div>

      <Link href="/mobile/profiles/new" className="mobileVaultCreateCard">
        <span>
          <Plus size={20} />
        </span>
        <div>
          <strong>{t.create}</strong>
          <p>{t.createText}</p>
        </div>
      </Link>

      {canInviteFromAnyVault && (
        <section className="mobileActionGrid mobileVaultSecondaryActions">
          <Link href="/mobile/connect" className="mobileActionCard">
            <QrCode size={20} />
            <strong>{t.connect}</strong>
            <p>{t.connectText}</p>
          </Link>
        </section>
      )}

      <section className="mobileVaultGallery">
        {loading && <p className="mobileEmptyText">{t.loading}</p>}
        {!loading && errorMessage && <p className="mobileFormMessage">{errorMessage}</p>}

        {!loading && !errorMessage && vaults.length === 0 && (
          <div className="mobileVaultEmptyState">
            <UserRound size={24} />
            <h2>{t.emptyTitle}</h2>
            <p>{t.emptyText}</p>
            <Link href="/mobile/profiles/new" className="mobileRecorderPrimary">
              {t.createFirst}
            </Link>
          </div>
        )}

        {vaults.map((vault) => {
          const skinKey = normalizeVaultSkin(vault.vault_skin);
          const vaultName = vault.subject_name || vault.title || "Memory Vault";

          return (
            <article className="mobileVaultSimpleCard" key={vault.id}>
              <div className="mobileVaultImageWrap">
                <img src={getVaultSkinImage(skinKey)} alt="" />
                <span className="mobileVaultImageShade" />
                <strong className="mobileVaultEngravedName">{vaultName}</strong>
              </div>

              <button type="button" className="mobileVaultUnlockButton" onClick={() => openUnlockModal(vault)}>
                <LockKeyhole size={16} />
                {t.unlockVault}
              </button>
            </article>
          );
        })}
      </section>

      {unlockingVault && (
        <div className="mobileVaultUnlockModalBackdrop" role="presentation">
          <button
            type="button"
            className="mobileVaultUnlockBackdropButton"
            aria-label={t.cancel}
            onClick={unlockStage === "keypad" ? closeUnlockModal : undefined}
          />

          <section
            className="mobileVaultUnlockModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobileVaultUnlockTitle"
          >
            <header className="mobileVaultUnlockHeader">
              <div>
                <p className="mobileCapsLabel">{t.enterCode}</p>
                <h2 id="mobileVaultUnlockTitle">
                  {unlockingVault.subject_name || unlockingVault.title || "Memory Vault"}
                </h2>
              </div>

              <button type="button" aria-label={t.cancel} onClick={closeUnlockModal} disabled={isVideoStage}>
                <X size={18} />
              </button>
            </header>

            <div className="mobileVaultUnlockVisual">
              <img
                src={getVaultSkinImage(unlockSkinKey)}
                alt=""
                className="mobileVaultUnlockBackground"
              />
              <span className="mobileVaultUnlockShade" />

              {unlockStage === "keypad" && (
                <div className="mobileVaultUnlockGlassKeypad">
                  <div className="mobileVaultKeypadDisplay">
                    <div className="mobileVaultPinDots" aria-label={t.enterCode}>
                      {Array.from({ length: MAX_PIN_LENGTH }).map((_, index) => (
                        <span className={index < enteredCode.length ? "filled" : ""} key={index} />
                      ))}
                    </div>
                  </div>

                  <div className="mobileVaultDigitPad" aria-label={t.enterCode}>
                    {KEYPAD_BUTTONS.map((value, index) => (
                      <button
                        type="button"
                        className={value === "delete" || value === "clear" ? "mobileVaultDigitButton mobileVaultDigitButtonControl" : "mobileVaultDigitButton"}
                        key={value}
                        aria-label={value === "delete" ? t.delete : value === "clear" ? t.clear : value}
                        autoFocus={index === 0}
                        onClick={() => handleKeypadPress(value)}
                      >
                        {value === "delete" ? t.delete : value === "clear" ? t.clear : value}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isVideoStage && (
                <div className="mobileVaultUnlockVideoStage">
                  <video
                    ref={unlockVideoRef}
                    src={unlockVideoSrc}
                    className="mobileVaultUnlockVideo"
                    autoPlay
                    playsInline
                    controls={false}
                    onLoadedMetadata={handleUnlockVideoMetadata}
                    onEnded={() => handleUnlockVideoEnded(unlockStage)}
                  />
                  {showSoundPrompt && (
                    <button
                      type="button"
                      className="mobileVaultVideoSoundButton"
                      onClick={() => attemptUnlockVideoPlay(true)}
                    >
                      {t.playSound}
                    </button>
                  )}
                  <p className="mobileVaultUnlockVideoText">
                    {unlockStage === "successVideo" ? t.openingVault : t.wrongCodeVideo}
                  </p>
                </div>
              )}
            </div>

            {unlockStage === "keypad" && unlockError && <p className="mobileVaultUnlockError">{unlockError}</p>}

            {unlockStage === "keypad" && (
              <div className="mobileVaultUnlockActions">
                <button type="button" onClick={closeUnlockModal}>
                  {t.cancel}
                </button>
                <button
                  type="button"
                  className="primary"
                  disabled={enteredCode.length < MIN_PIN_LENGTH}
                  onClick={submitUnlockCode}
                >
                  <LockKeyhole size={16} />
                  {t.unlockVault}
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
