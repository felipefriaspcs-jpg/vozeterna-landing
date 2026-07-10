"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

export default function LovedOnesPage() {
  const [user, setUser] = useState(null);
  const [lovedOnes, setLovedOnes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadLovedOnes() {
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData.user;
      setUser(currentUser);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("loved_ones")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(error.message);
      } else {
        setLovedOnes(data || []);
      }

      setLoading(false);
    }

    loadLovedOnes();
  }, []);

  if (loading) {
    return (
      <main className="appShell">
        <section className="appHero compact">
          <p className="appEyebrow">Loved One Profiles</p>
          <h1>Loading...</h1>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="appShell">
        <section className="appHero compact">
          <p className="appEyebrow">Loved One Profiles</p>
          <h1>Please sign in</h1>
          <p>You need to sign in before creating a family legacy profile.</p>

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
        <p className="appEyebrow">Loved One Profiles</p>
        <h1>Who are these memories for?</h1>
        <p>
          Create a profile for a parent, grandparent, spouse, relative, friend, or loved one whose voice,
          stories, photos, and memories you want to preserve.
        </p>

        <div className="buttonRow">
          <Link href="/app/loved-ones/new" className="appButton">
            Create profile
          </Link>

          <Link href="/app/library" className="appButton secondary">
            View library
          </Link>
        </div>
      </section>

      <section className="libraryBox">
        {message && <div className="successBox">{message}</div>}

        {lovedOnes.length === 0 ? (
          <div className="emptyState">
            <h2>No profiles yet</h2>
            <p>Create your first loved one profile to begin organizing memories with meaning.</p>

            <Link href="/app/loved-ones/new" className="appButton">
              Create first profile
            </Link>
          </div>
        ) : (
          <div className="libraryGrid">
            {lovedOnes.map((person) => (
              <article className="memoryCard" key={person.id}>
                <div className="memoryInfo">
                  <p>Legacy Profile</p>
                  <h2>{person.full_name}</h2>

                  {person.relationship && <p>{person.relationship}</p>}

                  {person.bio && (
                    <p className="memoryBio">{person.bio}</p>
                  )}

                  <Link href="/app/upload" className="textLink">
                    Upload memories for this profile
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}