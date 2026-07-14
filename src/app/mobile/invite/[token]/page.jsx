"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, UsersRound } from "lucide-react";
import { useParams } from "next/navigation";
import AuthModal from "../../../../components/auth/AuthModal";
import { supabase } from "../../../../lib/supabaseClient";
import { getInitialMobileLanguage } from "../../../../components/mobile/mobileLanguage";

const copy = {
  en: {
    label: "Private Invite",
    title: "Join private network",
    subtitle: "Someone invited you to connect inside VozEterna.",
    question: "Choose how you are joining, then accept this private invite.",
    relationship: "Relationship",
    family: "Family",
    friend: "Friend",
    other: "Other",
    accept: "Accept invite",
    accepting: "Connecting...",
    success: "You joined the private network.",
    error: "This invite could not be accepted.",
    signIn: "Please log in or create an account before accepting this invite.",
    login: "Log in / Create account",
    goFeed: "Go to feed",
    home: "VozEterna",
    privacy: "Invite-only access. This does not make the vault public.",
  },
  es: {
    label: "Invitacion privada",
    title: "Unirse a red privada",
    subtitle: "Alguien te invito a conectarte dentro de VozEterna.",
    question: "Elige como te unes y acepta esta invitacion privada.",
    relationship: "Relacion",
    family: "Familia",
    friend: "Amigo",
    other: "Otra",
    accept: "Aceptar invitacion",
    accepting: "Conectando...",
    success: "Te uniste a la red privada.",
    error: "No se pudo aceptar esta invitacion.",
    signIn: "Inicia sesion o crea una cuenta antes de aceptar esta invitacion.",
    login: "Iniciar sesion / Crear cuenta",
    goFeed: "Ir al feed",
    home: "VozEterna",
    privacy: "Acceso solo por invitacion. Esto no hace publica la boveda.",
  },
};

function extractNetworkId(value) {
  if (!value) return "";

  const row = Array.isArray(value) ? value[0] : value;

  return (
    row?.network_id ||
    row?.target_network_id ||
    row?.network?.id ||
    ""
  );
}

export default function MobileInvitePage() {
  const params = useParams();
  const token = params?.token;

  const [language, setLanguage] = useState("en");
  const [status, setStatus] = useState("ready");
  const [message, setMessage] = useState("");
  const [relationshipType, setRelationshipType] = useState("family");
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState(null);

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
    let mounted = true;

    async function loadUser() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (mounted) {
        setUser(currentUser || null);
      }
    }

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        setAuthOpen(false);
        setStatus("ready");
        setMessage("");
      }
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  async function loadInviteNetworkId(rpcData) {
    const rpcNetworkId = extractNetworkId(rpcData);
    if (rpcNetworkId) return rpcNetworkId;

    const { data } = await supabase
      .from("sharable_links")
      .select("network_id, target_network_id")
      .eq("token", token)
      .maybeSingle();

    return extractNetworkId(data);
  }

  async function saveRelationshipMetadata(networkId, currentUser) {
    if (!networkId || !currentUser?.id) return;

    await supabase
      .from("network_members")
      .update({ relationship_type: relationshipType })
      .eq("network_id", networkId)
      .eq("user_id", currentUser.id);

    await supabase.from("network_activity").insert({
      network_id: networkId,
      actor_id: currentUser.id,
      activity_type: "member_joined",
      title: `${currentUser.email || "A member"} joined the network`,
      feed_visibility: "network",
      is_commentable: false,
      metadata: {
        source: "mobile_invite",
        relationship_type: relationshipType,
      },
    });
  }

  async function acceptInvite() {
    setStatus("accepting");
    setMessage("");

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      setStatus("signin");
      setMessage(t.signIn);
      setAuthOpen(true);
      return;
    }

    if (!token) {
      setStatus("error");
      setMessage(t.error);
      return;
    }

    const { data, error } = await supabase.rpc("accept_sharable_link", {
      invite_token: token,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message || t.error);
      return;
    }

    const networkId = await loadInviteNetworkId(data);

    try {
      await saveRelationshipMetadata(networkId, currentUser);
    } catch {
      // Older schemas may not expose relationship_type or activity writes here.
      // Acceptance still succeeds through the existing RPC.
    }

    setUser(currentUser);
    setStatus("success");
    setMessage(t.success);
  }

  const feedHref = relationshipType === "friend" ? "/mobile/feed?type=friend" : "/mobile/feed?type=family";

  return (
    <section className="mobileScreenStack">
      <div className="mobileScreenHero">
        <p className="mobileCapsLabel">{t.label}</p>
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </div>

      <section className="mobileInviteAcceptCard">
        <div className={status === "success" ? "mobileInviteIcon success" : "mobileInviteIcon"}>
          {status === "success" ? <CheckCircle2 size={34} /> : <UsersRound size={34} />}
        </div>

        <h2>
          {status === "success"
            ? t.success
            : status === "signin" || status === "error"
              ? message
              : t.question}
        </h2>

        {status !== "success" && (
          <div className="mobileInviteRelationship">
            <p className="mobileCapsLabel">{t.relationship}</p>
            <div className="mobileRoleSwitch">
              <button
                type="button"
                className={relationshipType === "family" ? "active" : ""}
                onClick={() => setRelationshipType("family")}
              >
                {t.family}
              </button>
              <button
                type="button"
                className={relationshipType === "friend" ? "active" : ""}
                onClick={() => setRelationshipType("friend")}
              >
                {t.friend}
              </button>
              <button
                type="button"
                className={relationshipType === "other" ? "active" : ""}
                onClick={() => setRelationshipType("other")}
              >
                {t.other}
              </button>
            </div>
          </div>
        )}

        <div className="mobileConsentNotice">
          <ShieldCheck size={20} />
          <p>{t.privacy}</p>
        </div>

        {(status === "ready" || status === "signin") && user && (
          <button type="button" onClick={acceptInvite} className="mobileRecorderPrimary">
            {t.accept}
          </button>
        )}

        {(status === "ready" || status === "signin") && !user && (
          <button type="button" onClick={() => setAuthOpen(true)} className="mobileRecorderPrimary">
            {t.login}
          </button>
        )}

        {status === "accepting" && (
          <button type="button" disabled className="mobileRecorderPrimary">
            {t.accepting}
          </button>
        )}

        {status === "success" && (
          <Link href={feedHref} className="mobileRecorderPrimary">
            {t.goFeed}
          </Link>
        )}

        {status === "error" && (
          <Link href="/mobile" className="mobileRecorderSecondary">
            {t.home}
          </Link>
        )}
      </section>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </section>
  );
}
