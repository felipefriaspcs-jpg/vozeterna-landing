"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../../lib/supabaseClient";

export default function NewLovedOnePage() {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }

    getUser();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    if (!user) {
      setMessage("Please sign in before creating a profile.");
      return;
    }

    if (!fullName.trim()) {
      setMessage("Please enter the person's full name.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("loved_ones").insert({
      user_id: user.id,
      full_name: fullName.trim(),
      relationship: relationship.trim() || null,
      birth_date: birthDate || null,
      death_date: deathDate || null,
      bio: bio.trim() || null,
    });

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    window.location.href = "/app/loved-ones";
  }

  if (!user) {
    return (
      <main className="appShell">
        <section className="appHero compact">
          <p className="appEyebrow">Create Profile</p>
          <h1>Please sign in</h1>
          <p>You need to sign in before creating a loved one profile.</p>

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
        <p className="appEyebrow">Create Profile</p>
        <h1>Loved One Profile</h1>
        <p>
          Start by creating a profile for the person whose voice, stories, photos, videos, and memories
          will be preserved.
        </p>
      </section>

      <form className="consentBox" onSubmit={handleSubmit}>
        <label className="fieldLabel" htmlFor="fullName">
          Full name
        </label>
        <input
          id="fullName"
          className="appInput"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Example: Maria Frias"
        />

        <label className="fieldLabel" htmlFor="relationship">
          Relationship
        </label>
        <input
          id="relationship"
          className="appInput"
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          placeholder="Example: Grandmother, Father, Wife, Friend"
        />

        <label className="fieldLabel" htmlFor="birthDate">
          Birth date optional
        </label>
        <input
          id="birthDate"
          className="appInput"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />

        <label className="fieldLabel" htmlFor="deathDate">
          Passing date optional
        </label>
        <input
          id="deathDate"
          className="appInput"
          type="date"
          value={deathDate}
          onChange={(e) => setDeathDate(e.target.value)}
        />

        <label className="fieldLabel" htmlFor="bio">
          Short story or notes
        </label>
        <textarea
          id="bio"
          className="appTextarea"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Write a short description, memory, faith note, family role, or legacy summary."
        />

        <div className="buttonRow">
          <button className="appButton" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save profile"}
          </button>

          <Link href="/app/loved-ones" className="appButton secondary">
            Cancel
          </Link>
        </div>

        {message && <div className="successBox">{message}</div>}
      </form>
    </main>
  );
}