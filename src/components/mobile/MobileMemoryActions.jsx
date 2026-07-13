"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Edit3,
  Eye,
  MessageCircle,
  MoreVertical,
  Share2,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const defaultLabels = {
  view: "View",
  edit: "Edit",
  security: "Security",
  delete: "Delete",
  share: "Share",
  copied: "Copied",
  comments: "Comments",
  confirmDelete: "Delete this memory? This cannot be undone.",
  deleteFailed: "Could not delete memory.",
};

export default function MobileMemoryActions({
  memory,
  activityId,
  commentsHref,
  onDeleted,
  labels = defaultLabels,
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const menuRef = useRef(null);

  const t = { ...defaultLabels, ...labels };

  useEffect(() => {
    function handleClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, []);

  if (!memory?.id) return null;

  const memoryHref = `/mobile/memories/${memory.id}`;
  const editHref = `/mobile/memories/${memory.id}/edit`;
  const securityHref = memory.vault_id
    ? `/mobile/security?vaultId=${memory.vault_id}&memoryId=${memory.id}`
    : `/mobile/security?memoryId=${memory.id}`;
  const resolvedCommentsHref =
    commentsHref || (activityId ? `/mobile/comments/${activityId}` : "");

  function goTo(path) {
    setOpen(false);
    router.push(path);
  }

  async function shareMemory() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${memoryHref}`
        : "https://vozeterna-landing.vercel.app/mobile";

    try {
      if (navigator.share) {
        await navigator.share({
          title: memory.title || "VozEterna memory",
          text: memory.body || "A private VozEterna memory.",
          url,
        });

        setOpen(false);
        return;
      }

      await navigator.clipboard.writeText(url);
      setShareStatus("copied");
      window.setTimeout(() => setShareStatus(""), 1600);
    } catch {
      // no-op
    }
  }

  async function deleteMemory() {
    const confirmed = window.confirm(t.confirmDelete);
    if (!confirmed) return;

    try {
      if (memory.media_path) {
        await supabase.storage.from("family-media").remove([memory.media_path]);
      }

      const { error } = await supabase.from("memories").delete().eq("id", memory.id);

      if (error) {
        throw new Error(error.message);
      }

      setOpen(false);

      if (typeof onDeleted === "function") {
        onDeleted(memory.id);
      }
    } catch (error) {
      alert(error.message || t.deleteFailed);
    }
  }

  return (
    <div className="mobileMemoryActionWrap" ref={menuRef}>
      <button
        type="button"
        className="mobileMemoryDots"
        aria-label="Memory actions"
        onClick={() => setOpen((current) => !current)}
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div className="mobileMemoryMenu">
          <button type="button" onClick={() => goTo(memoryHref)}>
            <Eye size={15} />
            {t.view}
          </button>

          <button type="button" onClick={() => goTo(editHref)}>
            <Edit3 size={15} />
            {t.edit}
          </button>

          <button type="button" onClick={() => goTo(securityHref)}>
            <ShieldCheck size={15} />
            {t.security}
          </button>

          {resolvedCommentsHref && (
            <button type="button" onClick={() => goTo(resolvedCommentsHref)}>
              <MessageCircle size={15} />
              {t.comments}
            </button>
          )}

          <button type="button" onClick={shareMemory}>
            {shareStatus === "copied" ? <Check size={15} /> : <Share2 size={15} />}
            {shareStatus === "copied" ? t.copied : t.share}
          </button>

          <button type="button" className="danger" onClick={deleteMemory}>
            <Trash2 size={15} />
            {t.delete}
          </button>
        </div>
      )}
    </div>
  );
}