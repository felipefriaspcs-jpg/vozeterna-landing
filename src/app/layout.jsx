import "./globals.css";





export const metadata = {
  title: "VozEterna | Preserve Their Voice, Story, and Legacy",
  description: "VozEterna is a bilingual family legacy and memorial platform that helps families preserve voices, stories, photos, videos, final messages, and QR memorial pages.",
  keywords: [
    "VozEterna",
    "family legacy",
    "digital memorial",
    "QR memorial pages",
    "preserve family stories",
    "record loved ones",
    "memorial platform",
    "bilingual memorial platform",
    "legacy vault",
    "funeral home digital tribute"
  ],
  authors: [{ name: "Felipe Frias" }],
  creator: "VozEterna",
  publisher: "VozEterna",
  openGraph: {
    title: "VozEterna | Preserve Their Voice, Story, and Legacy",
    description: "Record their voice. Preserve their story. VozEterna helps families capture life stories, final messages, photos, videos, and digital memories in a private bilingual legacy experience.",
    url: "https://vozeterna-landing-gfoq.vercel.app",
    siteName: "VozEterna",
    images: [
      {
        url: "/images/hero-family.png",
        width: 1200,
        height: 630,
        alt: "Family preserving memories with VozEterna"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "VozEterna | Preserve Their Voice, Story, and Legacy",
    description: "A bilingual family legacy and memorial platform for preserving voices, stories, photos, videos, final messages, and QR memorial pages.",
    images: ["/images/hero-family.png"]
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
