"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  Edit3,
  MessageCircle,
  MoreVertical,
  Share2,
  Trash2,
  Eye,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const defaultLabels = {
  view: "View",
  edit: "Edit",
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
  const resolvedCommentsHref =
    commentsHref || (activityId ? `/mobile/comments/${activityId}` : "");

  async function shareMemory() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${memoryHref}`
        : "https://vozeterna-landing.vercel.app/mobile";

    const shareData = {
      title: memory.title || "VozEterna memory",
      text: memory.body || "A private VozEterna memory.",
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setOpen(false);
        return;
      }

      await navigator.clipboard.writeText(url);
      setShareStatus("copied");
      window.setTimeout(() => setShareStatus(""), 1600);
    } catch (error) {
      if (error?.name === "AbortError") return;

      try {
        await navigator.clipboard.writeText(url);
        setShareStatus("copied");
        window.setTimeout(() => setShareStatus(""), 1600);
      } catch {
        // no-op
      }
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
          <Link href={memoryHref} onClick={() => setOpen(false)}>
            <Eye size={15} />
            {t.view}
          </Link>

          <Link href={editHref} onClick={() => setOpen(false)}>
            <Edit3 size={15} />
            {t.edit}
          </Link>

          {resolvedCommentsHref && (
            <Link href={resolvedCommentsHref} onClick={() => setOpen(false)}>
              <MessageCircle size={15} />
              {t.comments}
            </Link>
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