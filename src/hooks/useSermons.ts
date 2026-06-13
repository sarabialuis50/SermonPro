import { useState, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import { Sermon } from "../types";

function sermonToRow(sermon: Sermon, userId: string) {
  return {
    id: sermon.id,
    user_id: userId,
    title: sermon.title,
    theme: sermon.theme || "",
    main_passage: sermon.mainPassage || "",
    duration_minutes: sermon.durationMinutes || 40,
    notes: sermon.notes || "",
    sections: sermon.sections || [],
    bible_version: sermon.bibleVersion || "RVR1960",
    updated_at: new Date().toISOString(),
  };
}

function rowToSermon(row: any): Sermon {
  return {
    id: row.id,
    title: row.title,
    theme: row.theme,
    mainPassage: row.main_passage,
    durationMinutes: row.duration_minutes,
    notes: row.notes,
    sections: row.sections || [],
    bibleVersion: row.bible_version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useSermons(userId: string | undefined, isDemo?: boolean) {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSermons = useCallback(async () => {
    if (isDemo) {
      setLoading(true);
      const saved = localStorage.getItem("sermonpro_demo_sermons");
      if (saved) setSermons(JSON.parse(saved));
      else setSermons([]);
      setLoading(false);
      return;
    }
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("sermons")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setSermons((data || []).map(rowToSermon));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [userId, isDemo]);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveSermon = useCallback((sermon: Sermon) => {
    if (isDemo) {
      setSermons((prev) => {
        const next = prev.map((s) => (s.id === sermon.id ? sermon : s));
        if (!prev.find((s) => s.id === sermon.id)) next.unshift(sermon);
        localStorage.setItem("sermonpro_demo_sermons", JSON.stringify(next));
        return next;
      });
      return;
    }
    if (!userId) return;

    // Optimistic update for immediate UI response
    setSermons((prev) => {
      const exists = prev.find((s) => s.id === sermon.id);
      if (exists) {
        return prev.map((s) => (s.id === sermon.id ? sermon : s));
      }
      return [sermon, ...prev];
    });

    // Debounce the network request
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const row = sermonToRow(sermon, userId);
      supabase
        .from("sermons")
        .upsert(row, { onConflict: "id" })
        .then(({ error }) => {
          if (error) {
            console.error("Error saving sermon:", error);
          }
        });
    }, 1000); // 1 second debounce
  }, [userId, isDemo]);

  const deleteSermon = useCallback(async (sermonId: string) => {
    if (isDemo) {
      setSermons((prev) => {
        const next = prev.filter((s) => s.id !== sermonId);
        localStorage.setItem("sermonpro_demo_sermons", JSON.stringify(next));
        return next;
      });
      return;
    }
    if (!userId) return;
    const { error: deleteError } = await supabase
      .from("sermons")
      .delete()
      .eq("id", sermonId)
      .eq("user_id", userId);

    if (deleteError) {
      console.error("Error deleting sermon:", deleteError);
      return;
    }

    setSermons((prev) => prev.filter((s) => s.id !== sermonId));
  }, [userId, isDemo]);

  const createSermon = useCallback(async (sermon: Sermon) => {
    if (isDemo) {
      setSermons((prev) => {
        const next = [sermon, ...prev];
        localStorage.setItem("sermonpro_demo_sermons", JSON.stringify(next));
        return next;
      });
      return;
    }
    if (!userId) return;
    const row = { ...sermonToRow(sermon, userId), created_at: new Date().toISOString() };
    const { error: insertError } = await supabase.from("sermons").insert(row);

    if (insertError) {
      console.error("Error creating sermon:", insertError);
      return;
    }

    setSermons((prev) => [sermon, ...prev]);
  }, [userId, isDemo]);

  return { sermons, setSermons, loading, error, fetchSermons, saveSermon, deleteSermon, createSermon };
}
