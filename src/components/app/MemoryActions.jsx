"use client";

import { useEffect, useRef, useState } from "react";

export default function MemoryActions({
  url,
  memoryName,
  isPublic = false,
  onTogglePublic,
  onDelete,
  language = "en",
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const labels =
    language === "es"
      ? {
          publicBadge: "Público en memorial",
          open: "Abrir",
          share: "Compartir",
          makePublic: "Hacer público",
          makePrivate: "Hacer privado",
          delete: "Eliminar",
          shareText: "Recuerdo de VozEterna",
          actionLabel: "Acciones del recuerdo",
        }
      : {
          publicBadge: "Public on memorial",
          open: "Open",
          share: "Share",
          makePublic: "Make public",
          makePrivate: "Make private",
          delete: "Delete",
          shareText: "VozEterna memory",
          actionLabel: "Memory actions",
        };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleShare() {
    if (!url) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: memoryName || labels.shareText,
          text: labels.shareText,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // User cancelled sharing or browser blocked it.
    }

    setOpen(false);
  }

  function handleTogglePublic() {
    setOpen(false);
    onTogglePublic?.();
  }

  function handleDelete() {
    setOpen(false);
    onDelete?.();
  }

  return (
    <div className="memoryActionsMenu" ref={menuRef}>
      {isPublic && <span className="publicMemoryBadge">{labels.publicBadge}</span>}

      <button
        type="button"
        className="memoryDotsButton"
        onClick={() => setOpen((value) => !value)}
        aria-label={labels.actionLabel}
        title={labels.actionLabel}
      >
        ⋮
      </button>

      {open && (
        <div className="memoryActionsPanel">
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer">
              {labels.open}
            </a>
          )}

          {url && (
            <button type="button" onClick={handleShare}>
              {labels.share}
            </button>
          )}

          {onTogglePublic && (
            <button type="button" onClick={handleTogglePublic}>
              {isPublic ? labels.makePrivate : labels.makePublic}
            </button>
          )}

          <button type="button" className="dangerAction" onClick={handleDelete}>
            {labels.delete}
          </button>
        </div>
      )}
    </div>
  );
}