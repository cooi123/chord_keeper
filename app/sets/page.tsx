"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSets } from "@/hooks/useSets"
import { supabase } from "@/lib/supabaseClient"
import type { Song } from "@/types/song"
import SetCreateDialog from "./SetCreateDialog"
import { createSetSong } from "@/types/set"

export default function SetsPage() {
  const router = useRouter()
  const { sets, loading, error, fetchSets, createSet, deleteSet } = useSets()
  const [songs, setSongs] = useState<Song[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newSetName, setNewSetName] = useState("")
  const [newSetDescription, setNewSetDescription] = useState("")
  const [selectedSongs, setSelectedSongs] = useState<string[]>([])
  const [songYoutubeLinks, setSongYoutubeLinks] = useState<Record<string, string>>({})
  const [songNotesMap, setSongNotesMap] = useState<Record<string, string>>({})
  const [songKeys, setSongKeys] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchSets()
    fetchSongs()
    // eslint-disable-next-line
  }, [])

  const fetchSongs = async () => {
    const { data, error } = await supabase.from("song").select("*")
    if (!error && data) setSongs(data)
  }

  const handleCreateSet = async () => {
    // For now, use the song's default key and order by selection order
    const songsToAdd = selectedSongs.map((songId, idx) => {
      const song = songs.find((s) => s.id === songId)
      return {
        song_id: songId,
        key: songKeys[songId] || song?.key || "C",
        order: idx + 1,
        youtube_link: songYoutubeLinks[songId] || "",
        notes: songNotesMap[songId] || "",
      } as createSetSong
    })
    const createdSet = await createSet(newSetName, newSetDescription, songsToAdd)
    
    // Reset form
    setNewSetName("")
    setNewSetDescription("")
    setSelectedSongs([])
    setSongYoutubeLinks({})
    setSongNotesMap({})
    setSongKeys({})
    setIsCreateDialogOpen(false)
    
    // Redirect to the created set if successful
    if (createdSet?.id) {
      router.push(`/sets/${createdSet.id}`)
    }
  }

  const handleDeleteSet = async (id: string) => {
    await deleteSet(id)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header removed as requested */}
      <div className="container mx-auto px-4 py-8">
        {/* Add New Set Button */}
        <div className="mb-6 flex justify-end">
        <SetCreateDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          songs={songs}
          selectedSongs={selectedSongs}
          setSelectedSongs={setSelectedSongs}
          newSetName={newSetName}
          setNewSetName={setNewSetName}
          newSetDescription={newSetDescription}
          setNewSetDescription={setNewSetDescription}
          songYoutubeLinks={songYoutubeLinks}
          setSongYoutubeLinks={setSongYoutubeLinks}
          songNotesMap={songNotesMap}
          setSongNotesMap={setSongNotesMap}
          songKeys={songKeys}
          setSongKeys={setSongKeys}
          onCreate={handleCreateSet}
        />
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : sets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <List className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sets created yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first set to organize songs for performances, practice sessions, or events
              </p>
              
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sets.map((set) => (
              <Card key={set.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{set.name}</span>
                    <Badge variant="secondary">{set.songs.length} songs</Badge>
                  </CardTitle>
                  {set.description && <p className="text-sm text-muted-foreground">{set.description}</p>}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {set.songs.slice(0, 3).map((ss) => (
                      <div key={ss.id} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{ss.song?.title || "Unknown Song"}</span>
                        <Badge variant="outline" className="text-xs">
                          {ss.key}
                        </Badge>
                      </div>
                    ))}
                    {set.songs.length > 3 && (
                      <p className="text-xs text-muted-foreground">+{set.songs.length - 3} more songs</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => router.push(`/sets/${set.id}`)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSet(set.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Created: {new Date(set.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      
      </div>
    </div>
  )
}
