"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Music, Plus, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { useSets } from "@/hooks/useSets"
import { supabase } from "@/lib/supabaseClient"
import type { Song } from "@/types/song"
import { SongItem } from "@/components/SongItem"

export default function SetDetailPage() {
  const params = useParams()
  const setId = params.id as string

  const { sets, fetchSets, loading, error, updateSetDetails, moveSongUp, moveSongDown, removeSongFromSet, addSongsToSet, updateSongInSet } = useSets()
  const [currentSet, setCurrentSet] = useState<any | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")

  const [isAddSongDialogOpen, setIsAddSongDialogOpen] = useState(false)
  const [availableSongs, setAvailableSongs] = useState<Song[]>([])
  const [selectedNewSongs, setSelectedNewSongs] = useState<string[]>([])

  const [songYoutubeLinks, setSongYoutubeLinks] = useState<Record<string, string>>({})
  const [songNotesMap, setSongNotesMap] = useState<Record<string, string>>({})

  const [searchQuery, setSearchQuery] = useState("")

  // Filtered available songs
  const filteredAvailableSongs = availableSongs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    fetchSets()
    fetchSongs()
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    if (sets && sets.length > 0) {
      const found = sets.find((s: any) => s.id === setId)
      if (found) {
        setCurrentSet(found)
        setEditName(found.name)
        setEditDescription(found.description)
      }
    }
  }, [sets, setId])

  const fetchSongs = async () => {
    const { data, error } = await supabase.from("song").select("*")
    if (!error && data) {
      // Exclude songs already in set
      const inSet = currentSet ? currentSet.songs.map((s: any) => s.song_id) : []
      setAvailableSongs(data.filter((song: Song) => !inSet.includes(song.id)))
    }
  }

  const moveUp = async (index: number) => {
    if (!currentSet || index === 0) return
    try {
      const success = await moveSongUp(setId, index)
      if (success) {
        // Update local state will be handled by fetchSets in the hook
        await fetchSets()
      }
    } catch (error) {
      console.error('Error moving song up:', error)
    }
  }

  const moveDown = async (index: number) => {
    if (!currentSet || index === currentSet.songs.length - 1) return
    try {
      const success = await moveSongDown(setId, index)
      if (success) {
        // Update local state will be handled by fetchSets in the hook
        await fetchSets()
      }
    } catch (error) {
      console.error('Error moving song down:', error)
    }
  }

  const removeSong = async (songId: string) => {
    if (!currentSet) return
    try {
      const success = await removeSongFromSet(setId, songId)
      if (success) {
        // Add back to available songs
        const removedSong = currentSet.songs.find((ss: any) => ss.song_id === songId)
        if (removedSong && removedSong.song) {
          setAvailableSongs((prev) => [...prev, removedSong.song])
        }
        // Update local state will be handled by fetchSets in the hook
        await fetchSets()
      }
    } catch (error) {
      console.error('Error removing song:', error)
    }
  }

  const saveSetDetails = async () => {
    if (!currentSet) return
    try {
      const success = await updateSetDetails(setId, { name: editName, description: editDescription })
      if (success) {
        setIsEditDialogOpen(false)
        // Update local state will be handled by fetchSets in the hook
        await fetchSets()
      }
    } catch (error) {
      console.error('Error saving set details:', error)
    }
  }

  const toggleNewSongSelection = (songId: string) => {
    setSelectedNewSongs((prev) => (prev.includes(songId) ? prev.filter((id) => id !== songId) : [...prev, songId]))
  }

  const handleAddSongsToSet = async () => {
    if (!currentSet) return
    try {
      const songsToAdd = availableSongs
        .filter((song) => selectedNewSongs.includes(song.id))
        .map((song) => ({
          song_id: song.id,
          key: song.key,
          youtube_link: songYoutubeLinks[song.id] || "",
          notes: songNotesMap[song.id] || "",
        }))
      
      const success = await addSongsToSet(setId, songsToAdd)
      if (success) {
        setAvailableSongs(availableSongs.filter((song) => !selectedNewSongs.includes(song.id)))
        setSelectedNewSongs([])
        setSongYoutubeLinks({})
        setSongNotesMap({})
        setSearchQuery("")
        setIsAddSongDialogOpen(false)
        // Update local state will be handled by fetchSets in the hook
        await fetchSets()
      }
    } catch (error) {
      console.error('Error adding songs to set:', error)
    }
  }

  const updateSongDetails = async (songId: string, updates: { youtube?: string; notes?: string }) => {
    if (!currentSet) return
    try {
      const success = await updateSongInSet(setId, songId, {
        youtube_link: updates.youtube,
        notes: updates.notes,
      })
      if (success) {
        await fetchSets()
      }
    } catch (error) {
      console.error('Error updating song details:', error)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>
  if (!currentSet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Set not found</h2>
          <Link href="/sets">
            <Button>Back to Sets</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/sets">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Sets
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">{currentSet.name}</h1>
                {currentSet.description && <p className="text-sm text-muted-foreground">{currentSet.description}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Set
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Set Details</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="editName">Set Name</Label>
                      <Input id="editName" value={editName} onChange={(e) => setEditName(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="editDescription">Description</Label>
                      <Input
                        id="editDescription"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={async () => await saveSetDetails()}>Save Changes</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-4">
          <div>
       

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Dialog open={isAddSongDialogOpen} onOpenChange={setIsAddSongDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-transparent" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Songs
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                      <DialogTitle>Add Songs to Set</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4" style={{ height: "calc(80vh - 120px)" }}>
                      {/* Search Bar */}
                      <div>
                        <Label>Search Songs</Label>
                        <Input
                          placeholder="Search by title or artist..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full"
                        />
                      </div>

                      {/* Search Results */}
                      <div className="border rounded-md" style={{ height: "400px" }}>
                        {filteredAvailableSongs.length === 0 ? (
                          <div className="p-8 text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                            {searchQuery ? (
                              <>
                                <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No songs found matching "{searchQuery}"</p>
                              </>
                            ) : (
                              <>
                                <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>Start typing to search for songs</p>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="h-full overflow-y-auto">
                            <div className="space-y-2 p-4">
                              {filteredAvailableSongs.map((song) => (
                                <div key={song.id} className="border rounded-lg">
                                  <div
                                    className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-muted/50"
                                    onClick={() => toggleNewSongSelection(song.id)}
                                  >
                                    <Checkbox
                                      id={`new-song-${song.id}`}
                                      checked={selectedNewSongs.includes(song.id)}
                                      onCheckedChange={() => toggleNewSongSelection(song.id)}
                                    />
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <span className="font-medium">{song.title}</span>
                                          <span className="text-sm text-muted-foreground ml-2">by {song.artist}</span>
                                        </div>
                                        <Badge variant="outline">{song.key}</Badge>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Accordion Details */}
                                  {selectedNewSongs.includes(song.id) && (
                                    <div className="border-t bg-muted/20 p-3 space-y-3">
                                      <div>
                                        <Label htmlFor={`youtube-${song.id}`} className="text-sm">
                                          YouTube Link
                                        </Label>
                                        <Input
                                          id={`youtube-${song.id}`}
                                          placeholder="https://youtube.com/watch?v=..."
                                          className="text-sm mt-1"
                                          value={songYoutubeLinks[song.id] || ""}
                                          onChange={(e) =>
                                            setSongYoutubeLinks((prev) => ({
                                              ...prev,
                                              [song.id]: e.target.value,
                                            }))
                                          }
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor={`notes-${song.id}`} className="text-sm">
                                          Notes
                                        </Label>
                                        <textarea
                                          id={`notes-${song.id}`}
                                          placeholder="Performance notes, key changes, etc..."
                                          className="w-full min-h-[60px] px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md resize-none mt-1"
                                          value={songNotesMap[song.id] || ""}
                                          onChange={(e) =>
                                            setSongNotesMap((prev) => ({
                                              ...prev,
                                              [song.id]: e.target.value,
                                            }))
                                          }
                                        />
                                      </div>
                                      <div className="flex justify-end">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            toggleNewSongSelection(song.id)
                                          }}
                                          className="text-xs"
                                        >
                                          Collapse
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddSongDialogOpen(false)
                          setSelectedNewSongs([])
                          setSongYoutubeLinks({})
                          setSongNotesMap({})
                          setSearchQuery("")
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddSongsToSet} disabled={selectedNewSongs.length === 0}>
                        Add {selectedNewSongs.length} Song{selectedNewSongs.length !== 1 ? "s" : ""}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button className="w-full bg-transparent" variant="outline">
                  Export Set List
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Songs List */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Songs in Set</CardTitle>
              </CardHeader>
              <CardContent>
                {currentSet.songs.length === 0 ? (
                  <div className="text-center py-8">
                    <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No songs in this set yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentSet.songs.map((ss: any, index: number) => (
                      <SongItem
                        key={ss.song_id}
                        song={ss}
                        index={index}
                        isFirst={index === 0}
                        isLast={index === currentSet.songs.length - 1}
                        onMoveUp={moveUp}
                        onMoveDown={moveDown}
                        onRemove={removeSong}
                        onUpdateSong={updateSongDetails}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 