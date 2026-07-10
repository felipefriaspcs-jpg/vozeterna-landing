"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

export default function LibraryPage() {
  const [user, setUser] = useState(null);
  const [memories, setMemories] = useState([]);
  const [signedUrls, setSignedUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadLibrary() {
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData.user;

      setUser(currentUser);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("media_assets")
        .select(`
          id,
          file_name,
          file_path,
          file_type,
          file_size,
          title,
          created_at,
          loved_ones (
            full_name,
            relationship
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      setMemories(data || []);

      const urlMap = {};

      for (const memory of data || []) {
        const { data: signedData } = await supabase.storage
          .from("family-media")
          .createSignedUrl(memory.file_path, 60 * 10);

        if (signedData?.signedUrl) {
          urlMap[memory.id] = signedData.signedUrl;
        }
      }

      setSignedUrls(urlMap);
      setLoading(false);
    }

    loadLibrary();
  }, []);

  function getFileKind(fileName, fileType) {
    const type = fileType || "";
    const lower = fileName.toLowerCase();

    if (type.startsWith("image/") || lower.match(/\.(jpg|jpeg|png|webp)$/)) return "image";
    if (type.startsWith("audio/") || lower.match(/\.(mp3|wav|webm|mpeg)$/)) return "audio";
    if (type.startsWith("video/") || lower.match(/\.(mp4|mov|webm|quicktime)$/)) return "video";

    return "file";
  }

  if (loading) {
    return (
      <main className="appShell">
        <section className="appHero compact">
          <p className="appEyebrow">Memory Library</p>
          <h1>Loading memories...</h1>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="appShell">
        <section className="appHero compact">
          <p className="appEyebrow">Memory Library</p>
          <h1>Please sign in</h1>
          <p>You need to sign in before viewing your private family memories.</p>

          <div className="buttonRow">
            <Link href="/app/login" className="appButton">
              Sign in
            </Link>

            <Link href="/app" className="appButton secondary">
              Back to app
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="appShell">
      <section className="appHero compact">
        <p className="appEyebrow">Memory Library</p>
        <h1>Your Saved Memories</h1>
        <p>View the photos, audio files, and videos saved inside your private VozEterna vault.</p>

        <div className="buttonRow">
          <Link href="/app/upload" className="appButton">
            Upload more
          </Link>

          <Link href="/app/loved-ones" className="appButton secondary">
            Loved one profiles
          </Link>
        </div>
      </section>

      <section className="libraryBox">
        {message && <div className="successBox">{message}</div>}

        {memories.length === 0 ? (
          <div className="emptyState">
            <h2>No memories uploaded yet</h2>
            <p>Upload your first photo, audio file, or video to begin building your family vault.</p>
            <Link href="/app/upload" className="appButton">
              Upload memories
            </Link>
          </div>
        ) : (
          <div className="libraryGrid">
            {memories.map((memory) => {
              const kind = getFileKind(memory.file_name, memory.file_type);
              const url = signedUrls[memory.id];

              return (
                <article className="memoryCard" key={memory.id}>
                  <div className="memoryPreview">
                    {kind === "image" && url && <img src={url} alt={memory.file_name} />}
                    {kind === "audio" && url && <audio controls src={url} />}
                    {kind === "video" && url && <video controls src={url} />}
                    {kind === "file" && <span>File</span>}
                  </div>

                  <div className="memoryInfo">
                    <h2>{memory.file_name}</h2>
                    <p>{kind.toUpperCase()}</p>

                    {memory.loved_ones?.full_name && (
                      <p className="memoryBio">
                        For: {memory.loved_ones.full_name}
                        {memory.loved_ones.relationship ? ` — ${memory.loved_ones.relationship}` : ""}
                      </p>
                    )}

                    {url && (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="textLink">
                        Open secure link
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}