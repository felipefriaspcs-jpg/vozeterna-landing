"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Image as ImageIcon,
  LockKeyhole,
  Plus,
  QrCode,
  ShieldCheck,
  UserRound,
  Volume2,
  VolumeX,
} from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import { getVaultAccess, loadAccessibleVaults } from "../../../lib/mobileVault";
import { getVaultSkin, getVaultSkinImage, getVaultSkinVideo, normalizeVaultSkin } from "../../../lib/vaultSkins";
import { getInitialMobileLanguage } from "../../../components/mobile/mobileLanguage";

const copy = {
  en: {
    label: "Vaults",
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
    familyVault: "Family vault",
    privateArchive: "Private family archive.",
    private: "Private",
    memories: "memories",
    oneMemory: "memory",
    role: "Role",
    owner: "Owner",
    qr: "QR invite",
    skin: "Vault style",
    openVault: "Open Vault",
    unlockVault: "Unlock Vault",
    enterPasscode: "Enter passcode",
    incorrectPasscode: "Incorrect passcode. Please try again.",
    lockedOut: "Too many unlock attempts. Please verify your identity to continue.",
    verifyEmail: "Verify by email",
    tryLater: "Try again later",
    soundOn: "Sound on",
    soundOff: "Sound off",
  },
  es: {
    label: "Bovedas",
    heroLabel: "BOVEDAS PRIVADAS DE LEGADO",
    title: "Bovedas de memoria",
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
    familyVault: "Boveda familiar",
    privateArchive: "Archivo familiar privado.",
    private: "Privada",
    memories: "recuerdos",
    oneMemory: "recuerdo",
    role: "Rol",
    owner: "Dueno",
    qr: "Invitar QR",
    skin: "Estilo de boveda",
    openVault: "Abrir boveda",
    unlockVault: "Desbloquear boveda",
    enterPasscode: "Ingresa el codigo",
    incorrectPasscode: "Codigo incorrecto. Intentalo de nuevo.",
    lockedOut: "Demasiados intentos de desbloqueo. Verifica tu identidad para continuar.",
    verifyEmail: "Verificar por correo",
    tryLater: "Intentar mas tarde",
    soundOn: "Sonido activado",
    soundOff: "Sonido desactivado",
  },
};

export default function MobileProfilesPage() {
  const router = useRouter();
  const videoRefs = useRef({});
  const [language, setLanguage] = useState("en");
  const [vaults, setVaults] = useState([]);
  const [coverUrls, setCoverUrls] = useState({});
  const [memoryCounts, setMemoryCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [vaultUnlockStates, setVaultUnlockStates] = useState({});
  const [soundMuted, setSoundMuted] = useState(false);

  const t = copy[language] || copy.en;
  const canInviteFromAnyVault = vaults.some((vault) => vault.access?.canManage);

  useEffect(() => {
    setLanguage(getInitialMobileLanguage());

    function handleLanguageChange(event) {
      if (event.detail === "en" || event.detail === "es") {
        setLanguage(event.detail);
      }
    }

    window.addEventListener("vozeterna-language-change", handleLanguageChange);

    try {
      setSoundMuted(localStorage.getItem("vozeterna-vault-sound-muted") === "true");
    } catch {
      setSoundMuted(false);
    }

    return () => {
      window.removeEventListener("vozeterna-language-change", handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    loadVaults();
  }, []);

  async function loadVaults() {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      setVaults([]);
      setCoverUrls({});
      setMemoryCounts({});
      setLoading(false);
      return;
    }

    try {
      const accessibleVaults = await loadAccessibleVaults(
        supabase,
        user,
        "id, network_id, created_by, title, subject_name, relationship_label, description, cover_image_path, vault_skin, visibility, created_at"
      );
      const vaultsWithAccess = await Promise.all(
        accessibleVaults.map(async (vault) => ({
          ...vault,
          access: await getVaultAccess(supabase, user, vault),
        }))
      );
      const uniqueVaults = [...new Map(vaultsWithAccess.map((vault) => [vault.id, vault])).values()];

      setVaults(uniqueVaults);

      const nextCoverUrls = {};
      await Promise.all(
        uniqueVaults.map(async (vault) => {
          if (!vault.cover_image_path) return;

          const { data, error } = await supabase.storage
            .from("family-media")
            .createSignedUrl(vault.cover_image_path, 3600);

          if (!error && data?.signedUrl) {
            nextCoverUrls[vault.id] = data.signedUrl;
          }
        })
      );
      setCoverUrls(nextCoverUrls);

      if (uniqueVaults.length > 0) {
        const { data: memoryRows, error: memoryError } = await supabase
          .from("memories")
          .select("id, vault_id")
          .in("vault_id", uniqueVaults.map((vault) => vault.id));

        if (!memoryError) {
          const nextCounts = {};
          (memoryRows || []).forEach((memory) => {
            if (!memory.vault_id) return;
            nextCounts[memory.vault_id] = (nextCounts[memory.vault_id] || 0) + 1;
          });
          setMemoryCounts(nextCounts);
        }
      } else {
        setMemoryCounts({});
      }
    } catch (error) {
      console.error("Mobile profiles error:", error.message);
      setVaults([]);
      setCoverUrls({});
      setMemoryCounts({});
      setErrorMessage(t.error);
    }

    setLoading(false);
  }

  function getUnlockState(vaultId) {
    return vaultUnlockStates[vaultId] || {
      state: "idle",
      passcode: "",
      failedAttempts: 0,
      message: "",
      forceMuted: false,
    };
  }

  function updateUnlockState(vaultId, updater) {
    setVaultUnlockStates((current) => {
      const previous = current[vaultId] || getUnlockState(vaultId);
      return {
        ...current,
        [vaultId]: typeof updater === "function" ? updater(previous) : { ...previous, ...updater },
      };
    });
  }

  function verifyVaultPasscode(_vault, candidatePasscode) {
    // TODO: Replace this MVP-only demo check with server-side hashed vault passcode verification.
    // Production must not store plaintext passcodes or rely on frontend-only checks for security.
    return candidatePasscode === "1234";
  }

  function toggleVaultSound() {
    setSoundMuted((current) => {
      const nextValue = !current;
      try {
        localStorage.setItem("vozeterna-vault-sound-muted", String(nextValue));
      } catch {
        // Playback still falls back to the in-memory preference.
      }
      return nextValue;
    });
  }

  function playVaultVideo(vaultId) {
    const video = videoRefs.current[vaultId];
    if (!video) return;

    video.muted = soundMuted || getUnlockState(vaultId).forceMuted;
    const playPromise = video.play();

    if (playPromise?.catch) {
      playPromise.catch(() => {
        updateUnlockState(vaultId, (current) => ({ ...current, forceMuted: true }));
        video.muted = true;
        video.play()?.catch?.(() => {});
      });
    }
  }

  function handlePasscodeChange(vaultId, value) {
    updateUnlockState(vaultId, (current) => ({ ...current, passcode: value }));
  }

  function handleUnlockSubmit(event, vault) {
    event.preventDefault();

    const currentState = getUnlockState(vault.id);
    if (currentState.state === "opening" || currentState.state === "wrongCode" || currentState.state === "lockedOut") return;

    if (verifyVaultPasscode(vault, currentState.passcode.trim())) {
      const openVideo = getVaultSkinVideo(vault.vault_skin, "opening");
      updateUnlockState(vault.id, (current) => ({ ...current, state: "opening", message: "" }));

      if (!openVideo) {
        finishVaultUnlock(vault.id);
        return;
      }

      window.setTimeout(() => playVaultVideo(vault.id), 0);
      return;
    }

    const failedAttempts = currentState.failedAttempts + 1;
    const nextState = failedAttempts >= 3 ? "lockedOut" : "wrongCode";
    const wrongVideo = getVaultSkinVideo(vault.vault_skin, nextState);

    updateUnlockState(vault.id, (current) => ({
      ...current,
      state: nextState,
      failedAttempts,
      message: nextState === "lockedOut" ? t.lockedOut : t.incorrectPasscode,
    }));

    if (wrongVideo) {
      window.setTimeout(() => playVaultVideo(vault.id), 0);
      return;
    }

    if (nextState !== "lockedOut") {
      updateUnlockState(vault.id, (current) => ({ ...current, state: "idle" }));
    }
  }

  function finishVaultUnlock(vaultId) {
    try {
      sessionStorage.setItem(`vozeterna-unlocked-vault-${vaultId}`, "true");
    } catch {
      // RLS remains the real access control; this flag is only an MVP client hint.
    }

    router.push(`/mobile/profiles/${vaultId}`);
  }

  function handleVaultVideoEnded(vaultId) {
    const currentState = getUnlockState(vaultId);

    if (currentState.state === "opening") {
      finishVaultUnlock(vaultId);
      return;
    }

    if (currentState.state === "wrongCode") {
      updateUnlockState(vaultId, (current) => ({ ...current, state: "idle" }));
    }
  }

  function handleVaultVideoError(vaultId) {
    const currentState = getUnlockState(vaultId);

    if (currentState.state === "opening") {
      finishVaultUnlock(vaultId);
      return;
    }

    updateUnlockState(vaultId, (current) => ({
      ...current,
      state: current.state === "lockedOut" ? "lockedOut" : "idle",
    }));
  }

  function clearSoftLockout(vaultId) {
    updateUnlockState(vaultId, () => ({
      state: "idle",
      passcode: "",
      failedAttempts: 0,
      message: "",
      forceMuted: false,
    }));
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

      <section className="vaultEntryGrid mobileVaultGrid">
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
          const skin = getVaultSkin(skinKey);
          const unlock = getUnlockState(vault.id);
          const videoSrc =
            unlock.state === "opening"
              ? getVaultSkinVideo(skinKey, "opening")
              : unlock.state === "wrongCode" || unlock.state === "lockedOut"
                ? getVaultSkinVideo(skinKey, unlock.state)
                : "";
          const videoIsActive = Boolean(videoSrc) && unlock.state !== "idle";
          const inputDisabled = unlock.state === "opening" || unlock.state === "wrongCode" || unlock.state === "lockedOut";
          const memoryCount = memoryCounts[vault.id] || 0;
          const roleLabel = vault.access?.role || (vault.created_by ? t.owner : "");
          const coverUrl = coverUrls[vault.id];

          return (
            <article className={`vaultEntryCard mobileVaultCard skin-${skinKey} state-${unlock.state}`} key={vault.id}>
              <div className="vaultEntryMediaFrame">
                {videoIsActive ? (
                  <video
                    ref={(element) => {
                      if (element) videoRefs.current[vault.id] = element;
                    }}
                    key={`${vault.id}-${unlock.state}`}
                    src={videoSrc}
                    className="vaultEntryMedia vaultEntryVideo"
                    playsInline
                    autoPlay
                    controls={false}
                    preload="metadata"
                    muted={soundMuted || unlock.forceMuted}
                    onCanPlay={() => playVaultVideo(vault.id)}
                    onEnded={() => handleVaultVideoEnded(vault.id)}
                    onError={() => handleVaultVideoError(vault.id)}
                  />
                ) : coverUrl ? (
                  <img src={coverUrl} alt="" className="vaultEntryMedia mobileVaultCoverPhoto" />
                ) : (
                  <img src={getVaultSkinImage(skinKey)} alt="" className="vaultEntryMedia" />
                )}
                <span className="mobileVaultSkinShade" />
                <strong className="vaultEntryTitle">{vault.subject_name || vault.title}</strong>
              </div>

              <div className="mobileVaultBadgeRow">
                <span className="mobileVaultPill">
                  <ShieldCheck size={13} />
                  {vault.visibility || t.private}
                </span>
                {roleLabel && <span className="mobileVaultPill">{t.role}: {roleLabel}</span>}
                <span className="mobileVaultPill">
                  <ImageIcon size={13} />
                  {memoryCount} {memoryCount === 1 ? t.oneMemory : t.memories}
                </span>
              </div>

              <span>{vault.relationship_label || t.familyVault}</span>
              <p>{vault.description || t.privateArchive}</p>
              <span className="mobileVaultSkinBadge">
                {t.skin}: {skin.label[language]}
              </span>
              <p className="vaultEntryInstruction">{t.unlockVault}</p>

              <form className="vaultEntryForm" onSubmit={(event) => handleUnlockSubmit(event, vault)}>
                <input
                  className="vaultEntryInput"
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder={t.enterPasscode}
                  value={unlock.passcode}
                  disabled={inputDisabled}
                  onChange={(event) => handlePasscodeChange(vault.id, event.target.value)}
                />
                <button type="submit" className="vaultEntryButton" disabled={inputDisabled}>
                  <LockKeyhole size={15} />
                  {t.openVault}
                </button>
              </form>

              {unlock.message && <p className="vaultEntryMessage">{unlock.message}</p>}

              {unlock.state === "lockedOut" && (
                <div className="vaultEntryActions">
                  <button type="button" onClick={() => clearSoftLockout(vault.id)}>
                    {t.verifyEmail}
                  </button>
                  <button type="button" onClick={() => clearSoftLockout(vault.id)}>
                    {t.tryLater}
                  </button>
                </div>
              )}

              <div className="vaultEntryActions">
                <button type="button" onClick={toggleVaultSound}>
                  {soundMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  {soundMuted ? t.soundOff : t.soundOn}
                </button>
              </div>

              {vault.access?.canManage && (
                <button
                  type="button"
                  className="vaultEntryQrButton"
                  onClick={(event) => {
                    event.stopPropagation();
                    window.location.href = `/mobile/connect?networkId=${vault.network_id}&vaultId=${vault.id}`;
                  }}
                >
                  <QrCode size={15} />
                  {t.qr}
                </button>
              )}
            </article>
          );
        })}
      </section>
    </section>
  );
}
