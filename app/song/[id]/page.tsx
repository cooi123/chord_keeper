"use client"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { ChordProPreview } from "@/components/ChordProPreview"
import { useSongsStore } from "@/stores/songsStore"
import { Song } from "@/types/song"
import { Loader2 } from "lucide-react"

export default function SongPage() {
  const { id } = useParams()
  const { getSong, loading } = useSongsStore()
  const [song, setSong] = useState<Song | null>(null)
  const [chordProFormat, setChordProFormat] = useState<string>("")
  
  const addMetadata = (song: Song) =>
    `
    {title: ${song.title}}
{artist: ${song.artist}}
{key: ${song.key}}
{tempo: ${song.tempo}}
{time_signature: ${song.time_signature}}
${song.chords}
    `
  
  useEffect(() => {
    if (id) {
      getSong(id as string).then((song) => {
        setSong(song)
        setChordProFormat(addMetadata(song))
      })
    }
  }, [id])

  return (
    <div>
      {loading && <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>}
      {chordProFormat && <ChordProPreview value={chordProFormat} originalKey={song?.key || ""} />}
    </div>
  )
} 