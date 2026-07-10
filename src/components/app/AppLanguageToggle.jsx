"use client";

import { saveStoredAppLanguage } from "../../lib/appLanguage";

export default function AppLanguageToggle({ language = "en", setLanguage }) {
  function changeLanguage(nextLanguage) {
    if (setLanguage) {
      setLanguage(nextLanguage);
    }

    saveStoredAppLanguage(nextLanguage);
  }

  return (
    <div className="appLanguageToggle">
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
  );
}