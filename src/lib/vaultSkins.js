export const VAULT_SKINS = {
  steel: {
    label: { en: "Steel", es: "Acero" },
    image: "/vault-concepts/steel-reference.png",
  },
  titanium: {
    label: { en: "Titanium", es: "Titanio" },
    image: "/vault-concepts/titanium-reference.png",
  },
  gold: {
    label: { en: "Gold", es: "Oro" },
    image: "/vault-concepts/gold-reference.png",
  },
  rust: {
    label: { en: "Rust", es: "Oxidado" },
    image: "/vault-concepts/rust-reference.png",
  },
  wood: {
    label: { en: "Wood", es: "Madera" },
    image: "/vault-concepts/wood-reference.png",
  },
};

export const VAULT_SKIN_KEYS = Object.keys(VAULT_SKINS);

export function getVaultSkin(skin) {
  return VAULT_SKINS[skin] || VAULT_SKINS.steel;
}

export function normalizeVaultSkin(skin) {
  return VAULT_SKINS[skin] ? skin : "steel";
}
