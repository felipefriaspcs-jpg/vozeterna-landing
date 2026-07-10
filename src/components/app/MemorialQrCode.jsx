"use client";

import { QRCodeCanvas } from "qrcode.react";

export default function MemorialQrCode({ url, language = "en" }) {
  const copy = {
    en: {
      eyebrow: "QR Memorial",
      title: "Share this page",
      text: "Use this QR code on a funeral card, family keepsake, printed tribute, or future memorial marker.",
      copy: "Copy link",
      copied: "Copied",
      download: "Download QR",
    },
    es: {
      eyebrow: "QR memorial",
      title: "Comparte esta página",
      text: "Usa este código QR en una tarjeta, recuerdo familiar, tributo impreso o futuro marcador memorial.",
      copy: "Copiar enlace",
      copied: "Copiado",
      download: "Descargar QR",
    },
  };

  const t = copy[language] || copy.en;

  async function copyLink() {
    await navigator.clipboard.writeText(url);
  }

  function downloadQr() {
    const canvas = document.getElementById("memorial-qr-code");
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "vozeterna-memorial-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <article className="memorialQrCard">
      <div className="memorialQrText">
        <p className="appEyebrow">{t.eyebrow}</p>
        <h2>{t.title}</h2>
        <p>{t.text}</p>
      </div>

      <div className="memorialQrCodeBox">
        <QRCodeCanvas
          id="memorial-qr-code"
          value={url}
          size={180}
          bgColor="#ffffff"
          fgColor="#083f52"
          level="H"
          includeMargin
        />
      </div>

      <div className="memorialQrUrl">{url}</div>

      <div className="buttonRow memorialQrButtons">
        <button type="button" className="appButton" onClick={copyLink}>
          {t.copy}
        </button>

        <button type="button" className="appButton secondary" onClick={downloadQr}>
          {t.download}
        </button>
      </div>
    </article>
  );
}