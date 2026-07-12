"use client";

import { useEffect, useState } from "react";
import MobileDashboard from "../../../components/app/dashboard/MobileDashboard";
import { getStoredAppLanguage } from "../../../lib/appLanguage";
import { supabase } from "../../../lib/supabaseClient";

function formatStorage(bytes) {
  const safeBytes = Number(bytes) || 0;

  if (safeBytes <= 0) {
    return "0 KB";
  }

  if (safeBytes < 1024 * 1024) {
    return `${(safeBytes / 1024).toFixed(1)} KB`;
  }

  return `${(safeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MobileAppDashboardPage() {
  const [language, setLanguage] = useState("en");
  const [user, setUser] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [stats, setStats] = useState({
    profiles: 0,
    memories: 0,
    publicMemorials: 0,
    consentRecords: 0,
    albums: 0,
    storageBytes: 0,
  });

  const storageLimitBytes = 50 * 1024 * 1024;
  const storageBytes = Number(stats.storageBytes) || 0;
  const storagePercent = Math.min(
    100,
    Math.max(0, Math.round((storageBytes / storageLimitBytes) * 100))
  );
  const storageDisplay = loadingStats ? "—" : formatStorage(storageBytes);

  useEffect(() => {
    setLanguage(getStoredAppLanguage());
  }, []);

  useEffect(() => {
    async function loadMobileDashboard() {
      setLoadingStats(true);

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      setUser(currentUser);

      if (!currentUser) {
        setStats({
          profiles: 0,
          memories: 0,
          publicMemorials: 0,
          consentRecords: 0,
          albums: 0,
          storageBytes: 0,
        });
        setLoadingStats(false);
        return;
      }

      const [
        profilesResult,
        memoriesResult,
        publicMemorialsResult,
        consentResult,
        albumsResult,
        storageResult,
      ] = await Promise.all([
        supabase.from("loved_ones").select("id", { count: "exact", head: true }),
        supabase.from("media_assets").select("id", { count: "exact", head: true }),
        supabase.from("loved_ones").select("id", { count: "exact", head: true }).eq("memorial_public", true),
        supabase.from("consent_records").select("id", { count: "exact", head: true }),
        supabase.from("memory_collections").select("id", { count: "exact", head: true }),
        supabase.from("media_assets").select("file_size"),
      ]);

      const storageBytes = (storageResult.data || []).reduce((total, item) => {
        return total + (Number(item.file_size) || 0);
      }, 0);

      setStats({
        profiles: profilesResult.count || 0,
        memories: memoriesResult.count || 0,
        publicMemorials: publicMemorialsResult.count || 0,
        consentRecords: consentResult.count || 0,
        albums: albumsResult.count || 0,
        storageBytes,
      });

      setLoadingStats(false);
    }

    loadMobileDashboard();
  }, []);

  return (
    <MobileDashboard
      language={language}
      user={user}
      stats={stats}
      loadingStats={loadingStats}
      storageDisplay={storageDisplay}
      storagePercent={storagePercent}
    />
  );
}