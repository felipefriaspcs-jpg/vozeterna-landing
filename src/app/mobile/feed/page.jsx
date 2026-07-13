"use client";

import { useEffect, useState } from "react";
import FamilyActivityFeed from "../../../components/social/FamilyActivityFeed";
import { getInitialMobileLanguage } from "../../../components/mobile/mobileLanguage";

const copy = {
  en: {
    label: "Network Feed",
    title: "Family & Friend Feeds",
    subtitle: "Switch between private family memories and private friend memories.",
    family: "Family Feed",
    friends: "Friend Feed",
  },
  es: {
    label: "Feed de red",
    title: "Feeds de familia y amigos",
    subtitle: "Cambia entre recuerdos familiares privados y recuerdos privados de amigos.",
    family: "Feed familiar",
    friends: "Feed de amigos",
  },
};

export default function MobileFeedPage() {
  const [language, setLanguage] = useState("en");
  const [feedType, setFeedType] = useState("family");

  const t = copy[language] || copy.en;

  useEffect(() => {
    setLanguage(getInitialMobileLanguage());

    const params = new URLSearchParams(window.location.search);
    const queryType = params.get("type");

    if (queryType === "friend" || queryType === "family") {
      setFeedType(queryType);
    }

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

  return (
    <section className="mobileScreenStack">
      <div className="mobileScreenHero">
        <p className="mobileCapsLabel">{t.label}</p>
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </div>

      <div className="mobileFeedSwitch">
        <button
          type="button"
          className={feedType === "family" ? "active" : ""}
          onClick={() => setFeedType("family")}
        >
          {t.family}
        </button>

        <button
          type="button"
          className={feedType === "friend" ? "active" : ""}
          onClick={() => setFeedType("friend")}
        >
          {t.friends}
        </button>
      </div>

      <FamilyActivityFeed feedType={feedType} />
    </section>
  );
}