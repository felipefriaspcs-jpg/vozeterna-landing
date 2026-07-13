"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save, ShieldCheck } from "lucide-react";
import { supabase } from "../../../../../lib/supabaseClient";

export default function MobileMemoryEditPage() {
  const params = useParams();
  const router = useRouter();
  const memoryId = params?.id;

  const [memory, setMemory] = useState(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [feedVisibility, setFeedVisibility] = useState("private");
  const [showOnPublicPage, setShowOnPublicPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (memoryId) {
      loadMemory(memoryId);
    }
  }, [memoryId]);

  async function loadMemory(id) {
    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase
        .from("memories")
        .select("id, title, body, feed_visibility, show_on_public_page, vault_id, network_id")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setMemory(null);
        setMessage("Memory not found.");
        setLoading(false);
        return;
      }

      setMemory(data);
      setTitle(data.title || "");
      setBody(data.body || "");
      setFeedVisibility(data.feed_visibility || "private");
      setShowOnPublicPage(Boolean(data.show_on_public_page));
      setLoading(false);
    } catch (error) {
      setMessage(error.message || "Could not load memory.");
      setLoading(false);
    }
  }

  async function saveMemory(event) {
    event.preventDefault();

    if (!memory?.id || saving) return;

    setSaving(true);
    setMessage("");

    const cleanTitle = title.trim() || "Memory";
    const cleanBody = body.trim() || null;
    const visibility = feedVisibility === "network" ? "network" : "private";

    try {
      const { error: memoryError } = await supabase
        .from("memories")
        .update({
          title: cleanTitle,
          body: cleanBody,
          feed_visibility: visibility,
          show_on_public_page: showOnPublicPage,
        })
        .eq("id", memory.id);

      if (memoryError) {
        setMessage(memoryError.message);
        setSaving(false);
        return;
      }

      await supabase
        .from("network_activity")
        .update({
          title: cleanTitle,
          feed_visibility: visibility,
          is_commentable: visibility === "network",
        })
        .eq("memory_id", memory.id);

      setMessage("Saved.");
      setSaving(false);
      router.push(`/mobile/memories/${memory.id}`);
    } catch (error) {
      setMessage(error.message || "Could not save memory.");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="mobileScreenStack">
        <div className="mobileScreenHero">
          <p className="mobileCapsLabel">Edit</p>
          <h1>Loading memory...</h1>
        </div>
      </section>
    );
  }

  if (!memory) {
    return (
      <section className="mobileScreenStack">
        <div className="mobileScreenHero">
          <p className="mobileCapsLabel">Edit</p>
          <h1>Memory not found</h1>
          {message && <p>{message}</p>}
        </div>
      </section>
    );
  }

  return (
    <section className="mobileScreenStack">
      <div className="mobileScreenHero">
        <p className="mobileCapsLabel">Edit</p>
        <h1>Edit memory</h1>
        <p>Update the title, description, feed visibility, and public page visibility.</p>
      </div>

      <form className="mobileFormCard mobileEditMemoryForm" onSubmit={saveMemory}>
        <label>
          Title
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>

        <label>
          Description
          <textarea value={body} onChange={(event) => setBody(event.target.value)} />
        </label>

        <div className="mobileSecurityBox">
          <p className="mobileCapsLabel">
            <ShieldCheck size={15} />
            Security
          </p>

          <label>
            <input
              type="radio"
              name="feedVisibility"
              checked={feedVisibility === "private"}
              onChange={() => setFeedVisibility("private")}
            />
            <span>Private — only me</span>
          </label>

          <label>
            <input
              type="radio"
              name="feedVisibility"
              checked={feedVisibility === "network"}
              onChange={() => setFeedVisibility("network")}
            />
            <span>Network feed — connected people can see and comment</span>
          </label>

          <label>
            <input
              type="checkbox"
              checked={showOnPublicPage}
              onChange={(event) => setShowOnPublicPage(event.target.checked)}
            />
            <span>Show on public page</span>
          </label>
        </div>

        <button type="submit" disabled={saving}>
          <Save size={17} />
          {saving ? "Saving..." : "Save changes"}
        </button>

        <button type="button" onClick={() => router.push(`/mobile/memories/${memory.id}`)}>
          View memory
        </button>

        {message && <p className="mobileFormMessage">{message}</p>}
      </form>
    </section>
  );
}