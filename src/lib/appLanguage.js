export const APP_LANGUAGE_KEY = "vozeterna_app_language";

export function getStoredAppLanguage() {
  if (typeof window === "undefined") return "en";

  const stored = window.localStorage.getItem(APP_LANGUAGE_KEY);

  if (stored === "es" || stored === "en") {
    return stored;
  }

  return "en";
}

export function saveStoredAppLanguage(language) {
  if (typeof window === "undefined") return;

  if (language === "es" || language === "en") {
    window.localStorage.setItem(APP_LANGUAGE_KEY, language);
    window.dispatchEvent(
      new CustomEvent("vozeterna-language-change", {
        detail: { language },
      })
    );
  }
}