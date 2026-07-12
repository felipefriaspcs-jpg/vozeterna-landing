"use client";

import FamilyActivityFeed from "../../../components/social/FamilyActivityFeed";

export default function MobileFeedPage() {
  return (
    <section className="mobileScreenStack">
      <div className="mobileScreenHero">
        <p className="mobileCapsLabel">Family Network</p>
        <h1>Network feed</h1>
        <p>Private updates from the family and friend networks you belong to.</p>
      </div>

      <FamilyActivityFeed />
    </section>
  );
}