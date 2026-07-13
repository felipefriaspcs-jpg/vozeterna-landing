"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Edit3, MessageCircle, ShieldCheck, Trash2, Volume2 } from "lucide-react";
import { supabase } from "../../../../lib/supabaseClient";

export default function MobileMemoryViewPage() {
  const params = useParams();
  const router = useRouter();
  const memoryId = params?.id;

  const [memory, setMemory] = useState(null);
  const [activity, setActivity] = useState(null);
  const [mediaUrl, setMediaUrl] = useState("");
  const [narrationUrl, setNarrationUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (memoryId) loadMemory(memoryId);
  }, [memoryId]);

  async function loadMemory(id) {
    setLoading(true);

    const { data, error } = await supabase
      .from("memories")
      .select(
        "id, title, body, type, media_path, feed_visibility, show_on_public_page, vault_id, network_id, narration_audio_path"
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (!data) {
      setMemory(null);
      setLoading(false);
      return;
    }

    if (data.media_path) {
      const { data: signed } = await supabase.storage
        .from("family-media")
        .createSignedUrl(data.media_path, 3600);

      setMediaUrl(signed?.signedUrl || "");
    }

    if (data.narration_audio_path) {
      const { data: signedNarration } = await supabase.storage
        .from("family-media")
        .createSignedUrl(data.narration_audio_path, 3600);

      setNarrationUrl(signedNarration?.signedUrl || "");
    }

    const { data: activityData } = await supabase
      .from("network_activity")
      .select("id, is_commentable, feed_visibility")
      .eq("memory_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setActivity(activityData || null);
    setMemory(data);
    setLoading(false);
  }

  async function deleteMemory() {
    if (!memory) return;

    const confirmed = window.confirm("Delete this memory? This cannot be undone.");
    if (!confirmed) return;

    if (memory.media_path) {
      await supabase.storage.from("family-media").remove([memory.media_path]);
    }

    const { error } = await supabase.from("memories").delete().eq("id", memory.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/mobile/library");
  }

  if (loading) {
    return (
      <section className="mobileScreenStack">
        <div className="mobileScreenHero">
          <p className="mobileCapsLabel">Memory</p>
          <h1>Loading memory...</h1>
        </div>
      </section>
    );
  }

  if (!memory) {
    return (
      <section className="mobileScreenStack">
        <div className="mobileScreenHero">
          <p className="mobileCapsLabel">Memory</p>
          <h1>Memory not found.</h1>
          {message && <p>{message}</p>}
          <Link href="/mobile/library" className="mobilePrimaryButton">
            Back to library
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mobileScreenStack">
      <div className="mobileScreenHero">
        <p className="mobileCapsLabel">Memory</p>
        <h1>{memory.title || "Memory"}</h1>

        <div className="mobileSecurityPills">
          <span>{memory.feed_visibility === "network" ? "Network feed" : "Private"}</span>
          {memory.show_on_public_page && <span>Public page</span>}
        </div>
      </div>

      <section className="mobileMemoryDetailCard">
        {memory.type === "photo" && mediaUrl && (
          <img src={mediaUrl} alt={memory.title || "Memory"} className="mobileMemoryDetailMedia" />
        )}

        {memory.type === "video" && mediaUrl && (
          <video src={mediaUrl} controls playsInline className="mobileMemoryDetailMedia" />
        )}

        {memory.type === "audio" && mediaUrl && (
          <audio src={mediaUrl} controls className="mobileMemoryDetailAudio" />
        )}

        <p>{memory.body || "No description yet."}</p>

        <div className="mobileNarrationBox">
          <p className="mobileCapsLabel">
            <Volume2 size={15} />
            AI voice narration
          </p>

          {narrationUrl ? (
            <audio src={narrationUrl} controls className="mobileMemoryDetailAudio" />
          ) : (
            <p className="mobileFormHelper">No narration generated yet.</p>
          )}
        </div>

        <div className="familyFeedActions">
          <Link href={`/mobile/memories/${memory.id}/edit`} className="familyFeedCommentButton">
            <Edit3 size={16} />
            Edit
          </Link>

          <Link href={`/mobile/security?vaultId=${memory.vault_id}&memoryId=${memory.id}`} className="familyFeedCommentButton">
            <ShieldCheck size={16} />
            Security
          </Link>

          {activity?.id && (
            <Link href={`/mobile/comments/${activity.id}`} className="familyFeedCommentButton">
              <MessageCircle size={16} />
              Comments
            </Link>
          )}

          <button type="button" className="mobileDeleteButton" onClick={deleteMemory}>
            <Trash2 size={15} />
            Delete
          </button>
        </div>

        {message && <p className="mobileFormMessage">{message}</p>}
      </section>
    </section>
  );
}