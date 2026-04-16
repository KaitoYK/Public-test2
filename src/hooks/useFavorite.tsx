"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react"; // ✅ import useSession จาก next-auth/react
import axios from "axios";

// ─────────────────────────────────────────────────────────────
// useFavorites — client-side hook สำหรับจัดการ favorites
// ดึงรายการ favoriteIDs ของ user และมี toggle add/remove
// ─────────────────────────────────────────────────────────────
export const useFavorites = () => {
  const { data: session } = useSession(); // ✅ ใช้ useSession ได้แล้ว

  const [favoriteIDs, setFavoriteIDs] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ดึง favorites ทั้งหมดของ user จาก API
  const fetchFavorites = useCallback(async () => {
    if (!session?.user) return;
    try {
      setLoading(true);
      const res = await axios.get<{ prompt_id: number }[]>("/api/favorites");
      setFavoriteIDs(res.data.map((f) => f.prompt_id));
    } catch (err) {
      console.error("Failed to fetch favorites:", err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // ตรวจสอบว่า prompt นั้น favorite อยู่หรือเปล่า
  const isFavorite = (promptId: number) => favoriteIDs.includes(promptId);

  // toggle: ถ้า favorite อยู่แล้ว → ลบออก, ถ้ายังไม่มี → เพิ่ม
  const toggleFavorite = async (promptId: number) => {
    const alreadyFav = isFavorite(promptId);
    try {
      if (alreadyFav) {
        await axios.delete(`/api/favorites/${promptId}`);
        setFavoriteIDs((prev) => prev.filter((id) => id !== promptId));
      } else {
        await axios.post("/api/favorites", { prompt_id: promptId });
        setFavoriteIDs((prev) => [...prev, promptId]);
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  return { favoriteIDs, isFavorite, toggleFavorite, loading, refresh: fetchFavorites };
};
