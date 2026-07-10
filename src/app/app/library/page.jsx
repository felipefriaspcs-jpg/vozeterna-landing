"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

export default function LibraryPage() {
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
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

      const { data, error } = await supabase.storage
        .from("family-media")
        .list(currentUser.id, {
          limit: 100,
          offset: 0,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      setFiles(data || []);

      const urlMap = {};

      for (const file of data || []) {
        const filePath = `${currentUser.id}/${file.name}`;

        const { data: signedData } = await supabase.storage
          .from("family-media")
          .createSignedUrl(filePath, 60 * 10);

        if (signedData?.signedUrl) {
          urlMap[file.name] = signedData.signedUrl;
        }
      }

      setSignedUrls(urlMap);
      setLoading(false);
    }

    loadLibrary();
  }, []);

  function getFileKind(fileName) {
    const lower = fileName.toLowerCase();

    if (lower.match(/\.(jpg|jpeg|png|webp)$/)) return "image";
    if (lower.match(/\.(mp3|wav|webm|mpeg)$/)) return "audio";
    if (lower.match(/\.(mp4|mov|webm|quicktime)$/)) return "video";

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

          <Link href="/app/profile" className="appButton secondary">
            View profile
          </Link>
        </div>
      </section>

      <section className="libraryBox">
        {message && <div className="successBox">{message}</div>}

        {files.length === 0 ? (
          <div className="emptyState">
            <h2>No memories uploaded yet</h2>
            <p>Upload your first photo, audio file, or video to begin building your family vault.</p>
            <Link href="/app/upload" className="appButton">
              Upload memories
            </Link>
          </div>
        ) : (
          <div className="libraryGrid">
            {files.map((file) => {
              const kind = getFileKind(file.name);
              const url = signedUrls[file.name];

              return (
                <article className="memoryCard" key={file.name}>
                  <div className="memoryPreview">
                    {kind === "image" && url && (
                      <img src={url} alt={file.name} />
                    )}

                    {kind === "audio" && url && (
                      <audio controls src={url} />
                    )}

                    {kind === "video" && url && (
                      <video controls src={url} />
                    )}

                    {kind === "file" && (
                      <span>File</span>
                    )}
                  </div>

                  <div className="memoryInfo">
                    <h2>{file.name}</h2>
                    <p>{kind.toUpperCase()}</p>

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