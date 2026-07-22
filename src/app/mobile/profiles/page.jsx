"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockKeyhole, Plus, QrCode, UserRound } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import { getVaultAccess, loadAccessibleVaults } from "../../../lib/mobileVault";
import { getVaultSkinImage, normalizeVaultSkin } from "../../../lib/vaultSkins";
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
  },
};

export default function MobileProfilesPage() {
  const router = useRouter();
  const [language, setLanguage] = useState("en");
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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
    return () => window.removeEventListener("vozeterna-language-change", handleLanguageChange);
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

  function unlockVault(vaultId) {
    try {
      sessionStorage.setItem(`vozeterna-unlocked-vault-${vaultId}`, "true");
    } catch {
      // Supabase RLS remains the real access control; this is only the existing client hint.
    }

    router.push(`/mobile/profiles/${vaultId}`);
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

              <button type="button" className="mobileVaultUnlockButton" onClick={() => unlockVault(vault.id)}>
                <LockKeyhole size={16} />
                {t.unlockVault}
              </button>
            </article>
          );
        })}
      </section>
    </section>
  );
}
