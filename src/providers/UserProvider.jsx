"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [folders, setFolders] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadAll(userId) {
    if (!userId) return;
    setLoading(true);
    try {
      const f = await supabase.from("folders").select("*").eq("user", userId);
      if (!f.error) setFolders(f.data || []);
      const r = await supabase
        .from("receipts")
        .select("*")
        .eq("user", userId)
        .order("created_at", { ascending: false });
      if (!r.error) setReceipts(r.data || []);
    } catch (e) {
      console.error("Error loading user data:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    // Initial fetch of the currently authenticated user
    async function init() {
      const { data, error } = await supabase.auth.getUser();
      if (!mounted) return;
      if (error) {
        console.warn("supabase getUser error:", error.message);
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(data?.user ?? null);
      if (data?.user?.id) await loadAll(data.user.id);
    }

    init();

    // Listen for auth changes and update context accordingly
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u?.id) loadAll(u.id);
        if (!u) {
          setFolders([]);
          setReceipts([]);
        }
      }
    );

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, [supabase]);

  const refresh = async () => {
    if (!user?.id) return;
    await loadAll(user.id);
  };

  return (
    <UserContext.Provider value={{ user, folders, receipts, loading, refresh }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserClient() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUserClient must be used within a UserProvider");
  }
  return ctx;
}

export default UserProvider;
