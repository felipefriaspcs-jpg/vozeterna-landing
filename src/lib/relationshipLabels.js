export const relationshipOptions = [
  { value: "self", en: "Me", es: "Yo" },
  { value: "mother", en: "Mother", es: "Madre" },
  { value: "father", en: "Father", es: "Padre" },
  { value: "grandmother", en: "Grandmother", es: "Abuela" },
  { value: "grandfather", en: "Grandfather", es: "Abuelo" },
  { value: "brother", en: "Brother", es: "Hermano" },
  { value: "sister", en: "Sister", es: "Hermana" },
  { value: "spouse", en: "Spouse", es: "Esposo/a" },
  { value: "son", en: "Son", es: "Hijo" },
  { value: "daughter", en: "Daughter", es: "Hija" },
  { value: "uncle", en: "Uncle", es: "Tío" },
  { value: "aunt", en: "Aunt", es: "Tía" },
  { value: "cousin", en: "Cousin", es: "Primo/a" },
  { value: "friend", en: "Friend", es: "Amigo/a" },
  { value: "other", en: "Other", es: "Otro" },
];

const legacyRelationshipMap = {
  me: "self",
  myself: "self",
  self: "self",
  yo: "self",

  mom: "mother",
  mother: "mother",
  madre: "mother",
  mamá: "mother",
  mama: "mother",

  dad: "father",
  father: "father",
  padre: "father",
  papá: "father",
  papa: "father",

  grandmother: "grandmother",
  grandma: "grandmother",
  abuela: "grandmother",

  grandfather: "grandfather",
  grandpa: "grandfather",
  abuelo: "grandfather",

  brother: "brother",
  hermano: "brother",

  sister: "sister",
  hermana: "sister",

  spouse: "spouse",
  wife: "spouse",
  husband: "spouse",
  esposa: "spouse",
  esposo: "spouse",

  son: "son",
  hijo: "son",

  daughter: "daughter",
  hija: "daughter",

  uncle: "uncle",
  tío: "uncle",
  tio: "uncle",

  aunt: "aunt",
  tía: "aunt",
  tia: "aunt",

  cousin: "cousin",
  primo: "cousin",
  prima: "cousin",

  friend: "friend",
  amigo: "friend",
  amiga: "friend",
};

export function normalizeRelationship(value = "") {
  return value
    .toString()
    .trim()
    .toLowerCase();
}

export function getRelationshipOption(value) {
  return relationshipOptions.find((option) => option.value === value);
}

export function getRelationshipLabel(profile = {}, language = "en") {
  const lang = language === "es" ? "es" : "en";

  if (profile.relationship_custom) {
    return profile.relationship_custom;
  }

  if (profile.relationship_type) {
    const option = getRelationshipOption(profile.relationship_type);
    if (option) return option[lang];
  }

  if (profile.relationship) {
    const normalized = normalizeRelationship(profile.relationship);
    const mappedType = legacyRelationshipMap[normalized];

    if (mappedType) {
      const option = getRelationshipOption(mappedType);
      if (option) return option[lang];
    }

    return profile.relationship;
  }

  return "";
}

export function getRelationshipEnglishLabel(value) {
  const option = getRelationshipOption(value);
  return option?.en || "";
}