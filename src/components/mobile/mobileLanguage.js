export const MOBILE_LANGUAGE_KEY = "vozeterna-mobile-language";

export function getInitialMobileLanguage() {
  if (typeof window === "undefined") return "en";

  const saved = localStorage.getItem(MOBILE_LANGUAGE_KEY);
  return saved === "es" || saved === "en" ? saved : "en";
}

export function setStoredMobileLanguage(language) {
  if (typeof window === "undefined") return;

  localStorage.setItem(MOBILE_LANGUAGE_KEY, language);
  window.dispatchEvent(new CustomEvent("vozeterna-language-change", { detail: language }));
}