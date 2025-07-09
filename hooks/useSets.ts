import { useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import type { createSetSong, Set } from "../types/set";

export function useSets() {
  const [sets, setSets] = useState<Set[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);

  // Fetch all sets with their songs (joined)
  const fetchSets = useCallback(async () => {
    setLoading(true);
    setErrorState(null);
    const { data, error } = await supabase
      .from("set")
      .select(`*, setsong(*, song:song_id(*))`)
      .order("created_at", { ascending: false });
    if (error) {
      setErrorState(error.message);
      setLoading(false);
      return;
    }
    // Map to expected structure
    const mapped = (data || []).map((set: any) => ({
      ...set,
      songs: (set.setsong || [])
        .sort((a: any, b: any) => a.order - b.order)
        .map((ss: any) => ({
          ...ss,
          song: ss.song,
        })),
    }));
    setSets(mapped);
    setLoading(false);
  }, []);

  // Create a new set and its songs
  const createSet = useCallback(
    async (
      name: string,
      description: string,
      songs: createSetSong[]
    ) => {
      setLoading(true);
      setErrorState(null);
      // 1. Insert set
      const { data: setData, error: setInsertError } = await supabase
        .from("set")
        .insert([{ name, description }])
        .select()
        .single();
      if (setInsertError) {
        setErrorState(setInsertError.message);
        setLoading(false);
        return null;
      }
      // 2. Insert setsong rows
      const setsongRows = songs.map((s) => ({
        set_id: setData.id,
        song_id: s.song_id,
        key: s.key,
        order: s.order,
        youtube_link: s.youtube_link,
        notes: s.notes,
      }));
      const { error: setsongError } = await supabase.from("setsong").insert(setsongRows);
      if (setsongError) {
        setErrorState(setsongError.message);
        setLoading(false);
        return null;
      }
      await fetchSets();
      setLoading(false);
      return setData;
    },
    [fetchSets]
  );

  // Delete a set (cascades to setsong)
  const deleteSet = useCallback(
    async (id: string) => {
      setLoading(true);
      setErrorState(null);
      const { error } = await supabase.from("set").delete().eq("id", id);
      if (error) {
        setErrorState(error.message);
        setLoading(false);
        return;
      }
      await fetchSets();
      setLoading(false);
    },
    [fetchSets]
  );

  // Update set details (name and description)
  const updateSetDetails = useCallback(
    async (setId: string, updates: { name?: string; description?: string }) => {
      setLoading(true);
      setErrorState(null);
      const { error } = await supabase
        .from("set")
        .update(updates)
        .eq("id", setId);
      if (error) {
        setErrorState(error.message);
        setLoading(false);
        return false;
      }
      await fetchSets();
      setLoading(false);
      return true;
    },
    [fetchSets]
  );

  // Move song up in set order
  const moveSongUp = useCallback(
    async (setId: string, songIndex: number) => {
      if (songIndex === 0) return false; // Can't move first song up

      setLoading(true);
      setErrorState(null);

      const currentSet = sets.find(s => s.id === setId);
      if (!currentSet || songIndex >= currentSet.songs.length) {
        setLoading(false);
        return false;
      }

      // Get the two songs that need to be swapped
      const currentSong = currentSet.songs[songIndex];
      const previousSong = currentSet.songs[songIndex - 1];

      // Extract only the setsong fields, omitting the joined song object
      const updates = [
        {
          id: previousSong.id,
          set_id: setId,
          song_id: previousSong.song_id,
          key: previousSong.key,
          order: songIndex + 1, // Previous song moves down
          youtube_link: previousSong.youtube_link,
          notes: previousSong.notes,
        },
        {
          id: currentSong.id,
          set_id: setId,
          song_id: currentSong.song_id,
          key: currentSong.key,
          order: songIndex, // Current song moves up
          youtube_link: currentSong.youtube_link,
          notes: currentSong.notes,
        }
      ];
      console.log("updates", updates);

      const { data, error } = await supabase
        .from("setsong")
        .upsert(updates, { onConflict: "id" });
      console.log("data", data);
      if (error) {
        setErrorState(error.message);
        setLoading(false);
        return false;
      }

      //only update local state
      const newSongs = [...currentSet.songs];
      newSongs[songIndex] = currentSong;
      newSongs[songIndex - 1] = previousSong;
      setSets(sets.map(s => s.id === setId ? { ...s, songs: newSongs } : s));

      setLoading(false);
      return true;
    },
    [sets, fetchSets]
  );

  // Move song down in set order
  const moveSongDown = useCallback(
    async (setId: string, songIndex: number) => {
      const currentSet = sets.find(s => s.id === setId);
      if (!currentSet || songIndex >= currentSet.songs.length - 1) {
        return false; // Can't move last song down
      }

      setLoading(true);
      setErrorState(null);

      // Get the two songs that need to be swapped
      const currentSong = currentSet.songs[songIndex];
      const nextSong = currentSet.songs[songIndex + 1];



      // Extract only the setsong fields, omitting the joined song object
      const updates = [
        {
          id: currentSong.id,
          set_id: setId,
          song_id: currentSong.song_id,
          key: currentSong.key,
          order: songIndex + 2, // Current song moves down
          youtube_link: currentSong.youtube_link,
          notes: currentSong.notes,
        },
        {
          id: nextSong.id,
          set_id: setId,
          song_id: nextSong.song_id,
          key: nextSong.key,
          order: songIndex + 1, // Next song moves up
          youtube_link: nextSong.youtube_link,
          notes: nextSong.notes,
        }
      ];

      const { error } = await supabase
        .from("setsong")
        .upsert(updates, { onConflict: "id" });

      if (error) {
        setErrorState(error.message);
        setLoading(false);
        return false;
      }

      //update local state
      const newSongs = [...currentSet.songs];
      newSongs[songIndex] = nextSong;
      newSongs[songIndex + 1] = currentSong;
      setSets(sets.map(s => s.id === setId ? { ...s, songs: newSongs } : s));

      setLoading(false);
      return true;
    },
    [sets, fetchSets]
  );

  // Remove song from set
  const removeSongFromSet = useCallback(
    async (setId: string, songId: string) => {
      setLoading(true);
      setErrorState(null);

      const { error } = await supabase
        .from("setsong")
        .delete()
        .eq("set_id", setId)
        .eq("song_id", songId);

      if (error) {
        setErrorState(error.message);
        setLoading(false);
        return false;
      }

      // Reorder remaining songs
      const currentSet = sets.find(s => s.id === setId);
      if (currentSet) {
        const remainingSongs = currentSet.songs
          .filter(s => s.song_id !== songId)

        const remainingSongUpdates = remainingSongs.map((song, index) => ({
          id: song.id,
          order: index + 1,
          youtube_link: song.youtube_link,
          notes: song.notes,
          key: song.key,
          set_id: setId,
          song_id: song.song_id,

        }));

        if (remainingSongs.length > 0) {
          const { error: reorderError } = await supabase
            .from("setsong")
            .upsert(remainingSongUpdates, { onConflict: "id" });

          if (reorderError) {
            setErrorState(reorderError.message);
            setLoading(false);
            return false;
          }
          setSets(sets.map(s => s.id === setId ? { ...s, songs: remainingSongs } : s));
        }
      }

      setLoading(false);
      //update local state


      return true;
    },
    [sets, fetchSets]
  );

  // Add songs to set
  const addSongsToSet = useCallback(
    async (setId: string, songsToAdd: Array<{
      song_id: string;
      key: string;
      youtube_link?: string;
      notes?: string;
    }>) => {
      setLoading(true);
      setErrorState(null);

      const currentSet = sets.find(s => s.id === setId);
      const nextOrder = currentSet ? currentSet.songs.length + 1 : 1;

      const setsongRows = songsToAdd.map((song, index) => ({
        set_id: setId,
        song_id: song.song_id,
        key: song.key,
        order: nextOrder + index,
        youtube_link: song.youtube_link || "",
        notes: song.notes || "",
      }));

      const { error } = await supabase
        .from("setsong")
        .insert(setsongRows);

      if (error) {
        setErrorState(error.message);
        setLoading(false);
        return false;
      }

      await fetchSets();

      setLoading(false);
      return true;
    },
    [sets, fetchSets]
  );

  // Update song details in set (youtube_link, notes)
  const updateSongInSet = useCallback(
    async (setId: string, songId: string, updates: {
      youtube_link?: string;
      notes?: string;
      key?: string;
    }) => {
      setLoading(true);
      setErrorState(null);

      const { error } = await supabase
        .from("setsong")
        .update(updates)
        .eq("set_id", setId)
        .eq("song_id", songId);

      if (error) {
        setErrorState(error.message);
        setLoading(false);
        return false;
      }

      await fetchSets();
      setLoading(false);
      return true;
    },
    [fetchSets]
  );

  return {
    sets,
    loading,
    error,
    fetchSets,
    createSet,
    deleteSet,
    updateSetDetails,
    moveSongUp,
    moveSongDown,
    removeSongFromSet,
    addSongsToSet,
    updateSongInSet,
    setSets, // exposed for manual updates if needed
  };
} 