"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Circle, Inbox } from "lucide-react";
import { getInitialMobileLanguage } from "../../../components/mobile/mobileLanguage";
import { supabase } from "../../../lib/supabaseClient";

const copy = {
  en: {
    label: "NOTIFICATIONS",
    title: "Notifications",
    subtitle: "Updates from shared vaults, memories, and family conversations.",
    loading: "Loading notifications...",
    error: "Could not load notifications. Please try again.",
    emptyTitle: "No notifications yet",
    emptyText:
      "When family members add memories, comment, or interact with shared vaults, you'll see updates here.",
    markAllRead: "Mark all read",
    unread: "Unread",
    read: "Read",
    open: "Open",
    notification: "Notification",
  },
  es: {
    label: "NOTIFICACIONES",
    title: "Notificaciones",
    subtitle: "Actualizaciones de bovedas compartidas, recuerdos y conversaciones familiares.",
    loading: "Cargando notificaciones...",
    error: "No se pudieron cargar las notificaciones. Intentalo de nuevo.",
    emptyTitle: "Todavia no hay notificaciones",
    emptyText:
      "Cuando familiares agreguen recuerdos, comenten o interactuen con bovedas compartidas, veras actualizaciones aqui.",
    markAllRead: "Marcar todo leido",
    unread: "No leida",
    read: "Leida",
    open: "Abrir",
    notification: "Notificacion",
  },
};

const NOTIFICATION_COLUMNS =
  "id, type, title, body, target_url, read_at, created_at, actor_id, network_id, vault_id, memory_id, comment_id";

function formatNotificationType(type = "", fallback) {
  const label = String(type || "")
    .replace(/_/g, " ")
    .trim();

  if (!label) return fallback;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatNotificationDate(value, language) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(language === "es" ? "es-MX" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getSafeTargetUrl(targetUrl = "") {
  const cleanUrl = String(targetUrl || "").trim();
  if (!cleanUrl) return "";

  if (cleanUrl.startsWith("/")) {
    return cleanUrl;
  }

  try {
    const url = new URL(cleanUrl);
    if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
  } catch {
    return "";
  }

  return "";
}

function navigateToTarget(router, targetUrl) {
  if (!targetUrl) return;

  if (targetUrl.startsWith("/")) {
    router.push(targetUrl);
    return;
  }

  window.location.assign(targetUrl);
}

export default function MobileNotificationsPage() {
  const router = useRouter();
  const [language, setLanguage] = useState("en");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [markingAll, setMarkingAll] = useState(false);
  const [openingId, setOpeningId] = useState("");

  const t = copy[language] || copy.en;
  const unreadCount = notifications.filter((notification) => !notification.read_at).length;

  useEffect(() => {
    setLanguage(getInitialMobileLanguage());

    function handleLanguageChange(event) {
      if (event.detail === "en" || event.detail === "es") {
        setLanguage(event.detail);
      }
    }

    window.addEventListener("vozeterna-language-change", handleLanguageChange);
    return () => window.removeEventListener("vozeterna-language-change", handleLanguageChange);
  }, []);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("notifications")
      .select(NOTIFICATION_COLUMNS)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Mobile notifications error:", error.message);
      setNotifications([]);
      setMessage(t.error);
      setLoading(false);
      return;
    }

    setNotifications(data || []);
    setLoading(false);
  }

  async function markNotificationRead(notification) {
    if (!notification?.id || notification.read_at) return;

    const readAt = new Date().toISOString();
    setNotifications((current) =>
      current.map((item) => (item.id === notification.id ? { ...item, read_at: readAt } : item))
    );

    const { error } = await supabase.rpc("mark_notification_read", {
      target_notification_id: notification.id,
    });

    if (error) {
      console.error("Mark notification read error:", error.message);
      setNotifications((current) =>
        current.map((item) => (item.id === notification.id ? { ...item, read_at: notification.read_at } : item))
      );
      throw error;
    }
  }

  async function openNotification(notification) {
    if (!notification?.id || openingId) return;

    setOpeningId(notification.id);
    setMessage("");

    try {
      await markNotificationRead(notification);
      const targetUrl = getSafeTargetUrl(notification.target_url);
      navigateToTarget(router, targetUrl);
    } catch {
      setMessage(t.error);
    } finally {
      setOpeningId("");
    }
  }

  async function markAllRead() {
    if (markingAll || unreadCount === 0) return;

    setMarkingAll(true);
    setMessage("");

    const previousNotifications = notifications;
    const readAt = new Date().toISOString();
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read_at: notification.read_at || readAt,
      }))
    );

    const { error } = await supabase.rpc("mark_all_notifications_read");

    if (error) {
      console.error("Mark all notifications read error:", error.message);
      setNotifications(previousNotifications);
      setMessage(t.error);
    }

    setMarkingAll(false);
  }

  return (
    <section className="mobileScreenStack mobileNotificationsPage">
      <div className="mobileScreenHero mobileNotificationsHeader">
        <div>
          <p className="mobileCapsLabel">{t.label}</p>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>

        {unreadCount > 0 && (
          <button type="button" onClick={markAllRead} disabled={markingAll}>
            <CheckCheck size={16} />
            {t.markAllRead}
          </button>
        )}
      </div>

      {loading && (
        <section className="mobileFormCard mobileNotificationsEmpty">
          <Bell size={24} />
          <p>{t.loading}</p>
        </section>
      )}

      {!loading && message && <p className="mobileFormMessage">{message}</p>}

      {!loading && notifications.length === 0 && (
        <section className="mobileNotificationsEmpty">
          <Inbox size={25} />
          <h2>{t.emptyTitle}</h2>
          <p>{t.emptyText}</p>
        </section>
      )}

      {!loading && notifications.length > 0 && (
        <section className="mobileNotificationsList">
          {notifications.map((notification) => {
            const unread = !notification.read_at;
            const targetUrl = getSafeTargetUrl(notification.target_url);

            return (
              <button
                type="button"
                key={notification.id}
                className={unread ? "mobileNotificationCard mobileNotificationUnread" : "mobileNotificationCard"}
                onClick={() => openNotification(notification)}
                disabled={openingId === notification.id}
              >
                <span className="mobileNotificationStatus" aria-hidden="true">
                  {unread ? <Circle size={10} fill="currentColor" /> : <CheckCheck size={14} />}
                </span>

                <span className="mobileNotificationBody">
                  <span className="mobileNotificationMeta">
                    <span>{formatNotificationType(notification.type, t.notification)}</span>
                    <span>{formatNotificationDate(notification.created_at, language)}</span>
                  </span>

                  <strong>{notification.title || t.notification}</strong>
                  {notification.body && <span className="mobileNotificationText">{notification.body}</span>}

                  <span className="mobileNotificationMeta">
                    <span>{unread ? t.unread : t.read}</span>
                    {targetUrl && <span>{t.open}</span>}
                  </span>
                </span>
              </button>
            );
          })}
        </section>
      )}
    </section>
  );
}
