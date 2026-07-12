"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Camera,
  FileText,
  Image as ImageIcon,
  Mic2,
  QrCode,
  UploadCloud,
  Video,
} from "lucide-react";
import { supabase } from "../../../../lib/supabaseClient";
import { getInitialMobileLanguage } from "../../../../components/mobile/mobileLanguage";
import ShareMemoryButton from "../../../../components/social/ShareMemoryButton";

const copy = {
  en: {
    label: "Profile",
    loading: "Loading profile...",
    notFound: "Profile not found.",
    notFoundText: "We could not find this vault, or you may not have access to it.",
    backProfiles: "Back to profiles",
    memories: "Memories",
    empty: "No memories connected yet.",
    upload: "Add memory",
    invite: "QR invite",
    updatePhoto: "Update photo",
    savingPhoto: "Saving photo...",
    photoSaved: "Profile photo updated.",
    privateArchive: "Private family archive.",
    familyVault: "Family vault",
    share: {
      share: "Share",
      shared: "Shared",
      copied: "Copied",
      copyManually: "Copy manually",
      textPrefix: "A private VozEterna memory:",
    },
  },
  es: {
    label: "Perfil",
    loading: "Cargando perfil...",
    notFound: "Perfil no encontrado.",
    notFoundText: "No pudimos encontrar esta bóveda, o quizá no tienes acceso.",
    backProfiles: "Volver a perfiles",
    memories: "Recuerdos",
    empty: "Todavía no hay recuerdos conectados.",
    upload: "Agregar recuerdo",
    invite: "Invitar QR",
    updatePhoto: "Actualizar foto",
    savingPhoto: "Guardando foto...",
    photoSaved: "Foto del perfil actualizada.",
    privateArchive: "Archivo familiar privado.",
    familyVault: "Bóveda familiar",
    share: {
      share: "Compartir",
      shared: "Compartido",
      copied: "Copiado",
      copyManually: "Copiar manualmente",
      textPrefix: "Un recuerdo privado de VozEterna:",
    },
  },
};

function getMemoryIcon(type) {
  if (type === "photo") return ImageIcon;
  if (type === "audio") return Mic2;
  if (type === "video") return Video;
  return FileText;
}

export default function MobileProfileDetailPage() {
  const params = useParams();
  const vaultId = params?.id;
  const photoInputRef = useRef(null);

  const [language, setLanguage] = useState("en");
  const [vault, setVault] = useState(null);
  const [coverUrl, setCoverUrl] = useState("");
  const [memories, setMemories] = useState([]);
  const [signedUrls, setSignedUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [photoMessage, setPhotoMessage] = useState("");

  const t = copy[language] || copy.en;

  useEffect(() => {
    setLanguage(getInitialMobileLanguage());

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

  useEffect(() => {
    if (vaultId) {
      loadProfile(vaultId);
    }
  }, [vaultId]);

  async function loadProfile(id) {
    setLoading(true);

    const { data: vaultData, error: vaultError } = await supabase
      .from("vaults")
      .select("id, network_id, title, subject_name, relationship_label, description, cover_image_path, created_at")
      .eq("id", id)
      .maybeSingle();

    if (vaultError || !vaultData) {
      if (vaultError) console.error("Mobile profile detail error:", vaultError.message);
      setVault(null);
      setMemories([]);
      setLoading(false);
      return;
    }

    let nextCoverUrl = "";

    if (vaultData.cover_image_path) {
      const { data: signedCover } = await supabase.storage
        .from("family-media")
        .createSignedUrl(vaultData.cover_image_path, 3600);

      nextCoverUrl = signedCover?.signedUrl || "";
    }

    const { data: memoryData, error: memoryError } = await supabase
      .from("memories")
      .select("id, title, body, type, media_path, media_mime_type, created_at")
      .eq("vault_id", id)
      .order("created_at", { ascending: false });

    if (memoryError) {
      console.error("Mobile profile memories error:", memoryError.message);
    }

    const rows = memoryData || [];
    const urls = {};

    await Promise.all(
      rows.map(async (memory) => {
        if (!memory.media_path) return;

        const { data: signed } = await supabase.storage
          .from("family-media")
          .createSignedUrl(memory.media_path, 3600);

        if (signed?.signedUrl) {
          urls[memory.id] = signed.signedUrl;
        }
      })
    );

    setVault(vaultData);
    setCoverUrl(nextCoverUrl);
    setMemories(rows);
    setSignedUrls(urls);
    setLoading(false);
  }

  async function updateProfilePhoto(event) {
    const file = event.target.files?.[0];
    if (!file || !vault) return;

    setPhotoSaving(true);
    setPhotoMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Please sign in first.");
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
      const filePath = `${user.id}/profile-covers/${vault.id}-${Date.now()}-${safeName}`;

      const uploadResult = await supabase.storage
        .from("family-media")
        .upload(filePath, file, {
          contentType: file.type || "image/jpeg",
          upsert: false,
        });

      if (uploadResult.error) {
        throw new Error(uploadResult.error.message);
      }

      const updateResult = await supabase
        .from("vaults")
        .update({
          cover_image_path: filePath,
          updated_at: new Date().toISOString(),
        })
        .eq("id", vault.id);

      if (updateResult.error) {
        throw new Error(updateResult.error.message);
      }

      setPhotoMessage(t.photoSaved);
      loadProfile(vault.id);
    } catch (error) {
      setPhotoMessage(error.message || "Could not update profile photo.");
    } finally {
      setPhotoSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="mobileScreenStack">
        <div className="mobileScreenHero">
          <p className="mobileCapsLabel">{t.label}</p>
          <h1>{t.loading}</h1>
        </div>
      </section>
    );
  }

  if (!vault) {
    return (
      <section className="mobileScreenStack">
        <div className="mobileScreenHero">
          <p className="mobileCapsLabel">{t.label}</p>
          <h1>{t.notFound}</h1>
          <p>{t.notFoundText}</p>
          <Link href="/mobile/profiles" className="mobilePrimaryButton">
            {t.backProfiles}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mobileScreenStack">
      <div className="mobileScreenHero mobileProfileHero">
        {coverUrl ? (
          <img src={coverUrl} alt={vault.subject_name || vault.title} className="mobileProfileCover" />
        ) : (
          <div className="mobileProfileCoverPlaceholder">
            <Camera size={30} />
          </div>
        )}

        <p className="mobileCapsLabel">{t.label}</p>
        <h1>{vault.subject_name || vault.title}</h1>
        <p>{vault.description || t.privateArchive}</p>

        <button
          type="button"
          className="mobilePhotoButton"
          onClick={() => photoInputRef.current?.click()}
          disabled={photoSaving}
        >
          <Camera size={16} />
          {photoSaving ? t.savingPhoto : t.updatePhoto}
        </button>

        <input
          ref={photoInputRef}
          type="file"
          hidden
          accept="image/*"
          onChange={updateProfilePhoto}
        />

        {photoMessage && <p className="mobileFormMessage">{photoMessage}</p>}
      </div>

      <section className="mobileActionGrid">
        <Link href={`/mobile/upload?vaultId=${vault.id}`} className="mobileActionCard primary">
          <UploadCloud size={20} />
          <strong>{t.upload}</strong>
        </Link>

        <Link
          href={`/mobile/connect?networkId=${vault.network_id}&vaultId=${vault.id}`}
          className="mobileActionCard"
        >
          <QrCode size={20} />
          <strong>{t.invite}</strong>
        </Link>
      </section>

      <section className="mobileCardList">
        <p className="mobileCapsLabel">{t.memories}</p>

        {memories.length === 0 ? (
          <div className="mobileEmptyCard">
            <p>{t.empty}</p>
            <Link href={`/mobile/upload?vaultId=${vault.id}`} className="mobileRecorderPrimary">
              {t.upload}
            </Link>
          </div>
        ) : (
          memories.map((memory) => {
            const Icon = getMemoryIcon(memory.type);
            const url = signedUrls[memory.id];

            return (
              <article className="mobileMemoryCard" key={memory.id}>
                {memory.type === "photo" && url && (
                  <img src={url} alt={memory.title || "Memory"} />
                )}

                {memory.type === "audio" && url && (
                  <audio src={url} controls />
                )}

                {memory.type === "video" && url && (
                  <video src={url} controls playsInline />
                )}

                {!url && (
                  <div className="mobileMemoryIconOnly">
                    <Icon size={24} />
                  </div>
                )}

                <div>
                  <span>{vault.relationship_label || t.familyVault}</span>
                  <strong>{memory.title || "Memory"}</strong>
                  {memory.body && <p>{memory.body}</p>}

                  <ShareMemoryButton
                    className="familyFeedShare"
                    title={memory.title || "VozEterna memory"}
                    text={`${t.share.textPrefix} ${memory.title || "Memory"}`}
                    url={
                      typeof window !== "undefined"
                        ? `${window.location.origin}/mobile/profiles/${vault.id}`
                        : ""
                    }
                    labels={t.share}
                  />
                </div>
              </article>
            );
          })
        )}
      </section>
    </section>
  );
}