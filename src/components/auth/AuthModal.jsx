"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const MAGIC_LINK_COOLDOWN_SECONDS = 60;

function getFriendlyAuthError(error) {
  const message = String(error?.message || "").toLowerCase();

  if (message.includes("rate limit") || message.includes("too many")) {
    return "Too many login links requested. Please wait and try again.";
  }

  if (message.includes("invalid login credentials")) {
    return "Invalid login credentials.";
  }

  if (
    message.includes("already registered") ||
    message.includes("already exists") ||
    message.includes("user already")
  ) {
    return "Email already registered.";
  }

  if (
    message.includes("password") &&
    (message.includes("6") || message.includes("six") || message.includes("short"))
  ) {
    return "Password should be at least 6 characters.";
  }

  return error?.message || "Something went wrong. Please try again.";
}

export default function AuthModal({ onClose }) {
  const [authMode, setAuthMode] = useState("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;

    const timer = window.setInterval(() => {
      setCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  async function handleMagicLinkSubmit(event) {
    event.preventDefault();

    if (cooldown > 0) return;

    setLoading(true);
    setStatusMsg("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setStatusMsg("Please enter your email.");
      setLoading(false);
      return;
    }

    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://vozeterna-landing.vercel.app";

    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        emailRedirectTo: `${origin}/mobile`,
      },
    });

    if (error) {
      setStatusMsg(getFriendlyAuthError(error));
    } else {
      setCooldown(MAGIC_LINK_COOLDOWN_SECONDS);
      setStatusMsg("Magic link sent. Check your inbox.");
    }

    setLoading(false);
  }

  async function handlePasswordLogin() {
    setLoading(true);
    setStatusMsg("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setStatusMsg("Please enter your email.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setStatusMsg("Password should be at least 6 characters.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      setStatusMsg(getFriendlyAuthError(error));
    } else {
      setLoading(false);
      onClose?.();
      return;
    }

    setLoading(false);
  }

  async function handlePasswordSignup() {
    setLoading(true);
    setStatusMsg("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setStatusMsg("Please enter your email.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setStatusMsg("Password should be at least 6 characters.");
      setLoading(false);
      return;
    }

    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://vozeterna-landing.vercel.app";

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        emailRedirectTo: `${origin}/mobile`,
      },
    });

    if (error) {
      setStatusMsg(getFriendlyAuthError(error));
    } else if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      setStatusMsg("Email already registered.");
    } else {
      setStatusMsg("Account created. Check your email if confirmation is required.");
    }

    setLoading(false);
  }

  function handlePasswordSubmit(event) {
    event.preventDefault();
    handlePasswordLogin();
  }

  const magicLinkDisabled = loading || cooldown > 0;

  return (
    <div className="vozAuthOverlay">
      <div className="vozAuthModal">
        <button type="button" className="vozAuthClose" onClick={onClose} aria-label="Close sign in">
          x
        </button>

        <p className="mobileCapsLabel">VozEterna</p>
        <h3>Sign in to VozEterna</h3>
        <p>Use a magic link, or sign in with a password for faster family testing.</p>

        <div className="vozAuthTabs" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            role="tab"
            aria-selected={authMode === "magic"}
            className={authMode === "magic" ? "active" : ""}
            onClick={() => {
              setAuthMode("magic");
              setStatusMsg("");
            }}
          >
            Magic Link
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={authMode === "password"}
            className={authMode === "password" ? "active" : ""}
            onClick={() => {
              setAuthMode("password");
              setStatusMsg("");
            }}
          >
            Password
          </button>
        </div>

        <form
          onSubmit={authMode === "magic" ? handleMagicLinkSubmit : handlePasswordSubmit}
          className="vozAuthForm"
        >
          <input
            type="email"
            required
            placeholder="name@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          {authMode === "password" && (
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          )}

          {authMode === "magic" && cooldown > 0 && (
            <p className="vozAuthCooldown">Send link available in {cooldown}s.</p>
          )}

          <div className="vozAuthActions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" disabled={authMode === "magic" ? magicLinkDisabled : loading}>
              {authMode === "magic"
                ? loading
                  ? "Sending..."
                  : cooldown > 0
                    ? `Wait ${cooldown}s`
                    : "Send link"
                : loading
                  ? "Signing in..."
                  : "Log in"}
            </button>
          </div>

          {authMode === "password" && (
            <button
              type="button"
              className="vozAuthCreateButton"
              onClick={handlePasswordSignup}
              disabled={loading}
            >
              {loading ? "Working..." : "Create account"}
            </button>
          )}
        </form>

        {statusMsg && <p className="vozAuthMessage">{statusMsg}</p>}
      </div>
    </div>
  );
}
