"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getInitialMobileLanguage,
  setStoredMobileLanguage,
} from "./mobileLanguage";

const copy = {
  en: {
    themeDark: "Dark",
    themeLight: "Light",
    menu: "Menu",
    close: "Close",
    dashboard: "Dashboard",
    profile: "Profile",
    library: "Library",
    collections: "Collections",
    record: "Record",
    upload: "Upload",
    consent: "Consent",
    account: "Account",
    website: "Website",
    menuTitle: "VozEterna",
    menuText: "Preserve family memories in one private vault.",
    simpleView: "Simple view",
    fullView: "Full view",
    online: "Online",
    offline: "Offline",
  },
  es: {
    themeDark: "Oscuro",
    themeLight: "Claro",
    menu: "Menú",
    close: "Cerrar",
    dashboard: "Inicio",
    profile: "Perfiles",
    library: "Biblioteca",
    collections: "Álbumes",
    record: "Grabar",
    upload: "Subir",
    consent: "Consentimiento",
    account: "Cuenta",
    website: "Sitio web",
    menuTitle: "VozEterna",
    menuText: "Preserva recuerdos familiares en una bóveda privada.",
    simpleView: "Vista simple",
    fullView: "Vista completa",
    online: "En línea",
    offline: "Sin conexión",
  },
};

function getNavItems(t) {
  return [
    { href: "/mobile", label: t.dashboard, icon: "▤" },
    { href: "/mobile/profiles", label: t.profile, icon: "●" },
    { href: "/mobile/library", label: t.library, icon: "▰" },
    { href: "/mobile/collections", label: t.collections, icon: "⌂" },
    { href: "/mobile/record", label: t.record, icon: "◔" },
  ];
}

function getMenuItems(t) {
  return [
    { href: "/mobile", label: t.dashboard },
    { href: "/mobile/profiles", label: t.profile },
    { href: "/mobile/library", label: t.library },
    { href: "/mobile/collections", label: t.collections },
    { href: "/mobile/record", label: t.record },
    { href: "/mobile/upload", label: t.upload },
    { href: "/mobile/consent", label: t.consent },
    { href: "/mobile/account", label: t.account },
    { href: "/", label: t.website },
  ];
}

export default function MobileAppShell({ children }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");
  const [menuOpen, setMenuOpen] = useState(false);
  const [simpleView, setSimpleView] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const t = copy[language] || copy.en;
  const navItems = getNavItems(t);
  const menuItems = getMenuItems(t);

  useEffect(() => {
    const savedTheme = localStorage.getItem("vozeterna-mobile-theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    }

    const savedSimple = localStorage.getItem("vozeterna-simple-view");
    setSimpleView(savedSimple === "true");

    setLanguage(getInitialMobileLanguage());
    setIsOnline(navigator.onLine);

    function handleLanguageChange(event) {
      if (event.detail === "en" || event.detail === "es") {
        setLanguage(event.detail);
      }
    }

    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("vozeterna-language-change", handleLanguageChange);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("vozeterna-language-change", handleLanguageChange);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("vozeterna-mobile-theme", nextTheme);
  }

  function changeLanguage(nextLanguage) {
    setLanguage(nextLanguage);
    setStoredMobileLanguage(nextLanguage);
  }

  function toggleSimpleView() {
    const nextValue = !simpleView;
    setSimpleView(nextValue);
    localStorage.setItem("vozeterna-simple-view", String(nextValue));
  }

  return (
    <div
      className={simpleView ? "mobileAppExperience simpleView" : "mobileAppExperience"}
      data-mobile-theme={theme}
      data-mobile-language={language}
    >
      <header className="mobileNativeHeader">
        <Link href="/mobile" className="mobileNativeBrand" onClick={() => setMenuOpen(false)}>
          <img src="/brand/logo-emblem.png" alt="VozEterna" />
          <span>VozEterna</span>
        </Link>

        <div className="mobileHeaderActions">
          <button type="button" onClick={toggleTheme} className="mobileThemeButton">
            {theme === "dark" ? t.themeLight : t.themeDark}
          </button>

          <button
            type="button"
            className="mobileMenuButton"
            aria-label={menuOpen ? t.close : t.menu}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </div>
      </header>

      <div className={isOnline ? "mobileConnectionBar online" : "mobileConnectionBar offline"}>
        <span />
        <strong>{isOnline ? t.online : t.offline}</strong>
        <p>{isOnline ? "Ready to save memories" : "You can draft memories and sync later"}</p>
      </div>

      {menuOpen && (
        <div className="mobileMenuOverlay" role="dialog" aria-modal="true">
          <button className="mobileMenuBackdrop" type="button" onClick={() => setMenuOpen(false)} />

          <aside className="mobileMenuDrawer">
            <div className="mobileMenuDrawerHeader">
              <div>
                <strong>{t.menuTitle}</strong>
                <p>{t.menuText}</p>
              </div>

              <button type="button" onClick={() => setMenuOpen(false)} aria-label={t.close}>
                ×
              </button>
            </div>

            <div className="mobileDrawerLanguage">
              <button
                type="button"
                className={language === "en" ? "active" : ""}
                onClick={() => changeLanguage("en")}
              >
                EN
              </button>

              <button
                type="button"
                className={language === "es" ? "active" : ""}
                onClick={() => changeLanguage("es")}
              >
                ES
              </button>
            </div>

            <button type="button" className="mobileSimpleToggle" onClick={toggleSimpleView}>
              {simpleView ? t.fullView : t.simpleView}
            </button>

            <nav className="mobileDrawerLinks">
              {menuItems.map((item) => (
                <Link href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      <div className="mobileNativeContent">
        {children}
      </div>

      <nav className="mobileNativeBottomNav" aria-label="Mobile app navigation">
        {navItems.map((item) => {
          const active =
            item.href === "/mobile"
              ? pathname === "/mobile"
              : pathname.startsWith(item.href);

          return (
            <Link href={item.href} className={active ? "active" : ""} key={item.href}>
              <span>{item.icon}</span>
              <strong>{item.label}</strong>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}