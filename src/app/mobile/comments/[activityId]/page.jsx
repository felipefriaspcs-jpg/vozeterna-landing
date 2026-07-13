"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MessageCircle, Send } from "lucide-react";
import { supabase } from "../../../../lib/supabaseClient";

export default function MobileCommentsPage() {
  const params = useParams();
  const activityId = params?.activityId;

  const [activity, setActivity] = useState(null);
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (activityId) {
      loadComments(activityId);
    }
  }, [activityId]);

  async function loadComments(id) {
    setLoading(true);
    setMessage("");

    try {
      const { data: activityData, error: activityError } = await supabase
        .from("network_activity")
        .select("id, network_id, memory_id, title, created_at")
        .eq("id", id)
        .maybeSingle();

      if (activityError) {
        setMessage(activityError.message);
        setActivity(null);
        setComments([]);
        setLoading(false);
        return;
      }

      if (!activityData) {
        setMessage("Feed item not found.");
        setActivity(null);
        setComments([]);
        setLoading(false);
        return;
      }

      const { data: commentData, error: commentError } = await supabase
        .from("network_comments")
        .select("id, body, created_at, created_by")
        .eq("activity_id", id)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });

      if (commentError) {
        setMessage(commentError.message);
      }

      setActivity(activityData);
      setComments(commentData || []);
      setLoading(false);
    } catch (error) {
      setMessage(error.message || "Could not load comments.");
      setLoading(false);
    }
  }

  async function sendComment(event) {
    event.preventDefault();

    const cleanBody = body.trim();

    if (!cleanBody) {
      setMessage("Please write a comment before sending.");
      return;
    }

    if (!activity?.id || sending) return;

    setSending(true);
    setMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please sign in before commenting.");
        setSending(false);
        return;
      }

      const { error } = await supabase.from("network_comments").insert({
        network_id: activity.network_id,
        activity_id: activity.id,
        memory_id: activity.memory_id || null,
        created_by: user.id,
        body: cleanBody,
      });

      if (error) {
        setMessage(error.message);
        setSending(false);
        return;
      }

      setBody("");
      setSending(false);
      loadComments(activity.id);
    } catch (error) {
      setMessage(error.message || "Could not send comment.");
      setSending(false);
    }
  }

  return (
    <section className="mobileScreenStack">
      <div className="mobileScreenHero">
        <p className="mobileCapsLabel">Comments</p>
        <h1>Comments</h1>
        <p>Private comments for this feed item.</p>
      </div>

      <section className="mobileCommentsPanel">
        <Link href="/mobile/feed" className="mobileBackToFeed">
          Back to feed
        </Link>

        {loading ? (
          <p className="mobileFormHelper">Loading comments...</p>
        ) : !activity ? (
          <p className="mobileFormMessage">{message || "Feed item not found."}</p>
        ) : (
          <>
            <div className="mobileCommentSubject">
              <MessageCircle size={19} />
              <div>
                <strong>{activity.title || "Memory comments"}</strong>
                <span>{new Date(activity.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="mobileCommentList">
              {comments.length === 0 ? (
                <p className="mobileFormHelper">No comments yet.</p>
              ) : (
                comments.map((comment) => (
                  <article className="mobileCommentBubble" key={comment.id}>
                    <p>{comment.body}</p>
                    <span>{new Date(comment.created_at).toLocaleString()}</span>
                  </article>
                ))
              )}
            </div>

            <form className="mobileCommentForm" onSubmit={sendComment}>
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Write a comment..."
              />

              <button type="submit" disabled={sending || !body.trim()}>
                <Send size={16} />
                {sending ? "Sending..." : "Send"}
              </button>
            </form>

            {message && <p className="mobileFormMessage">{message}</p>}
          </>
        )}
      </section>
    </section>
  );
}