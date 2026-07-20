"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Mail, ShieldCheck, UsersRound } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import { getInitialMobileLanguage } from "../../../../components/mobile/mobileLanguage";

const copy = {
  en: {
    label: "Private Invite",
    signedOutTitle: "Create your VozEterna account",
    signedOutSubtitle:
      "This private invite is tied to this link. Enter your email and we'll send you a secure sign-in link. After signing in, you'll come back here to accept the invite.",
    signedOutButton: "Send secure sign-in link",
    signedOutSuccess: "Secure link sent. Check your inbox, then return to this invite.",
    signedInTitle: "Accept private vault invite",
    signedInSubtitle: "You're signed in. Confirm consent to join this private VozEterna vault.",
    consent:
      "I understand this is a private family/friend memory vault and I agree to participate respectfully.",
    accept: "Accept invite",
    accepting: "Accepting invite...",
    sending: "Sending secure link...",
    missingEmail: "Please enter your email.",
    invalid: "Invite link is invalid.",
    inviteProblem: "This invite may be expired or no longer valid. Please ask for a new invite.",
    consentError: "Please confirm consent before accepting.",
    success: "Invite accepted.",
    explanation: "This invite creates your account access and vault access in one flow.",
    invitedVault: "Invited vault",
    network: "Network",
    role: "Role",
    loading: "Loading invite...",
    feed: "Open feed",
    home: "VozEterna",
  },
  es: {
    label: "Invitacion privada",
    signedOutTitle: "Crea tu cuenta de VozEterna",
    signedOutSubtitle:
      "Esta invitacion privada esta conectada a este enlace. Ingresa tu correo y te enviaremos un enlace seguro. Despues de iniciar sesion, regresaras aqui para aceptar la invitacion.",
    signedOutButton: "Enviar enlace seguro",
    signedOutSuccess: "Enlace seguro enviado. Revisa tu correo y vuelve a esta invitacion.",
    signedInTitle: "Aceptar invitacion privada",
    signedInSubtitle:
      "Ya iniciaste sesion. Confirma tu consentimiento para unirte a este vault privado de VozEterna.",
    consent:
      "Entiendo que este es un vault privado de recuerdos familiares/de amigos y acepto participar con respeto.",
    accept: "Aceptar invitacion",
    accepting: "Aceptando invitacion...",
    sending: "Enviando enlace seguro...",
    missingEmail: "Ingresa tu correo.",
    invalid: "El enlace de invitacion no es valido.",
    inviteProblem: "Esta invitacion puede estar vencida o ya no ser valida. Pide una invitacion nueva.",
    consentError: "Confirma tu consentimiento antes de aceptar.",
    success: "Invitacion aceptada.",
    explanation: "Esta invitacion crea tu acceso de cuenta y acceso al vault en un solo flujo.",
    invitedVault: "Vault invitado",
    network: "Red",
    role: "Rol",
    loading: "Cargando invitacion...",
    feed: "Abrir feed",
    home: "VozEterna",
  },
};

function getFirstRow(value) {
  return Array.isArray(value) ? value[0] : value;
}

function getInviteRole(value) {
  const role = String(value?.invite_role || value?.role || "").toLowerCase();
  return ["admin", "manager", "contributor", "viewer"].includes(role) ? role : "";
}

function getReturnPath(token) {
  return `/mobile/invite/${encodeURIComponent(token || "")}`;
}

function getRedirectPath(result) {
  const row = getFirstRow(result);
  const vaultId = row?.vault_id || row?.target_vault_id || row?.vault?.id;

  if (vaultId) {
    return `/mobile/profiles/${vaultId}`;
  }

  return "/mobile/feed";
}

export default function MobileInvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = typeof params?.token === "string" ? params.token : "";

  const [language, setLanguage] = useState("en");
  const [user, setUser] = useState(null);
  const [inviteDetails, setInviteDetails] = useState(null);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  const t = copy[language] || copy.en;
  const signedIn = Boolean(user?.id);

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
        setStatus((current) => (current === "auth-success" ? "ready" : current));
        setMessage("");
      }
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadInvite() {
      if (!token) {
        setStatus("error");
        setMessage(t.invalid);
        return;
      }

      setStatus("loading");
      setMessage("");

      const { data, error } = await supabase.rpc("get_vault_invite_by_token", {
        invite_token: token,
      });

      if (!mounted) return;

      const link = getFirstRow(data);
      const role = getInviteRole(link);

      if (error || !link?.token || !link?.network_id || !link?.vault_id || !role) {
        setInviteDetails(null);
        setStatus("error");
        setMessage(t.inviteProblem);
        return;
      }

      setInviteDetails({
        link,
        role,
        vaultTitle: link.vault_title || t.invitedVault,
        networkName: link.network_name || "",
      });
      setStatus("ready");
    }

    loadInvite();
    return () => {
      mounted = false;
    };
  }, [token, language]);

  async function sendMagicLink(event) {
    event.preventDefault();

    if (!token) {
      setStatus("error");
      setMessage(t.invalid);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setMessage(t.missingEmail);
      return;
    }

    setStatus("sending");
    setMessage("");

    const emailRedirectTo = `${window.location.origin}${getReturnPath(token)}`;
    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: { emailRedirectTo },
    });

    if (error) {
      setStatus("ready");
      setMessage(error.message);
      return;
    }

    setStatus("auth-success");
    setMessage(t.signedOutSuccess);
  }

  async function acceptInvite() {
    if (!consent) {
      setMessage(t.consentError);
      return;
    }

    if (!token) {
      setStatus("error");
      setMessage(t.invalid);
      return;
    }

    setStatus("accepting");
    setMessage("");

    const { data, error } = await supabase.rpc("accept_sharable_link", {
      invite_token: token,
    });

    if (error) {
      setStatus("ready");
      setMessage(t.inviteProblem);
      return;
    }

    setStatus("success");
    setMessage(t.success);
    router.push(getRedirectPath(data));
  }

  const title = signedIn ? t.signedInTitle : t.signedOutTitle;
  const subtitle = signedIn ? t.signedInSubtitle : t.signedOutSubtitle;
  const showLoading = status === "loading";
  const showError = status === "error";

  return (
    <section className="mobileScreenStack">
      <div className="mobileScreenHero">
        <p className="mobileCapsLabel">{t.label}</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <section className={signedIn ? "mobileFormCard" : "mobileInviteAuthCard mobileFormCard"}>
        <div className={status === "success" ? "mobileInviteIcon success" : "mobileInviteIcon"}>
          {status === "success" ? <CheckCircle2 size={34} /> : signedIn ? <UsersRound size={34} /> : <Mail size={34} />}
        </div>

        <p className="mobileFormMessage">{t.explanation}</p>

        {showLoading && <p className="mobileFormMessage">{t.loading}</p>}

        {showError && (
          <>
            <p className="mobileFormMessage">{message || t.invalid}</p>
            <Link href="/mobile" className="mobilePrimaryButton">
              {t.home}
            </Link>
          </>
        )}

        {!showLoading && !showError && inviteDetails && (
          <div className="mobileInviteText">
            <UsersRound size={18} />
            <p>
              <span className="mobileCapsLabel">{t.invitedVault}</span>
              <strong>{inviteDetails.vaultTitle}</strong>
              {inviteDetails.networkName && (
                <>
                  <br />
                  {t.network}: {inviteDetails.networkName}
                </>
              )}
              <br />
              {t.role}: {inviteDetails.role}
            </p>
          </div>
        )}

        {!showLoading && !showError && status !== "success" && !signedIn && (
          <form className="mobileInviteAuthForm" onSubmit={sendMagicLink}>
            <label>
              <span className="mobileCapsLabel">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
              />
            </label>

            <button type="submit" className="mobilePrimaryButton" disabled={status === "sending"}>
              {status === "sending" ? t.sending : t.signedOutButton}
            </button>
          </form>
        )}

        {!showLoading && !showError && status !== "success" && signedIn && (
          <>
            <label className="mobileConsentCheck">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
              />
              <span>{t.consent}</span>
            </label>

            <button
              type="button"
              onClick={acceptInvite}
              className="mobilePrimaryButton"
              disabled={status === "accepting"}
            >
              {status === "accepting" ? t.accepting : t.accept}
            </button>
          </>
        )}

        {status === "success" && (
          <Link href="/mobile/feed" className="mobilePrimaryButton">
            {t.feed}
          </Link>
        )}

        {message && !showError && (
          <p className="mobileFormMessage">
            <ShieldCheck size={16} />
            <span>{message}</span>
          </p>
        )}
      </section>
    </section>
  );
}
