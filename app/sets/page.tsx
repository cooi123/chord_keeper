"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

interface Song {
  id: number
  title: string
  artist: string
  key: string
}

interface Set {
  id: number
  name: string
  description: string
  songs: Song[]
  createdAt: string
}

export default function SetsPage() {
  const [sets, setSets] = useState<Set[]>([])
  const [songs, setSongs] = useState<Song[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newSetName, setNewSetName] = useState("")
  const [newSetDescription, setNewSetDescription] = useState("")
  const [selectedSongs, setSelectedSongs] = useState<number[]>([])

  useEffect(() => {
    // Load sets and songs from localStorage
    const savedSets = JSON.parse(localStorage.getItem("chordkeeper-sets") || "[]")
    const savedSongs = JSON.parse(localStorage.getItem("chordkeeper-songs") || "[]")
    setSets(savedSets)
    setSongs(savedSongs)
  }, [])

  const createSet = () => {
    const newSet: Set = {
      id: Date.now(),
      name: newSetName,
      description: newSetDescription,
      songs: songs.filter((song) => selectedSongs.includes(song.id)),
      createdAt: new Date().toISOString(),
    }

    const updatedSets = [...sets, newSet]
    setSets(updatedSets)
    localStorage.setItem("chordkeeper-sets", JSON.stringify(updatedSets))

    // Reset form
    setNewSetName("")
    setNewSetDescription("")
    setSelectedSongs([])
    setIsCreateDialogOpen(false)
  }

  const deleteSet = (id: number) => {
    const updatedSets = sets.filter((set) => set.id !== id)
    setSets(updatedSets)
    localStorage.setItem("chordkeeper-sets", JSON.stringify(updatedSets))
  }

  const toggleSongSelection = (songId: number) => {
    setSelectedSongs((prev) => (prev.includes(songId) ? prev.filter((id) => id !== songId) : [...prev, songId]))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <List className="h-6 w-6" />
              <h1 className="text-xl font-bold">Song Sets</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  Home
                </Button>
              </Link>
              <Link href="/library">
                <Button variant="ghost" size="sm">
                  Library
                </Button>
              </Link>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Set
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Set</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="setName">Set Name</Label>
                      <Input
                        id="setName"
                        value={newSetName}
                        onChange={(e) => setNewSetName(e.target.value)}
                        placeholder="e.g., Sunday Morning Service, Open Mic Night"
                      />
                    </div>
                    <div>
                      <Label htmlFor="setDescription">Description</Label>
                      <Input
                        id="setDescription"
                        value={newSetDescription}
                        onChange={(e) => setNewSetDescription(e.target.value)}
                        placeholder="Optional description"
                      />
                    </div>
                    <div>
                      <Label>Select Songs</Label>
                      <div className="max-h-60 overflow-y-auto border rounded-md p-4 space-y-2">
                        {songs.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No songs in your library yet.</p>
                        ) : (
                          songs.map((song) => (
                            <div key={song.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`song-${song.id}`}
                                checked={selectedSongs.includes(song.id)}
                                onCheckedChange={() => toggleSongSelection(song.id)}
                              />
                              <Label htmlFor={`song-${song.id}`} className="flex-1 cursor-pointer">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="font-medium">{song.title}</span>
                                    <span className="text-sm text-muted-foreground ml-2">by {song.artist}</span>
                                  </div>
                                  <Badge variant="outline">{song.key}</Badge>
                                </div>
                              </Label>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createSet} disabled={!newSetName.trim()}>
                        Create Set
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {sets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <List className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sets created yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first set to organize songs for performances, practice sessions, or events
              </p>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Set
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Set</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="setName">Set Name</Label>
                      <Input
                        id="setName"
                        value={newSetName}
                        onChange={(e) => setNewSetName(e.target.value)}
                        placeholder="e.g., Sunday Morning Service, Open Mic Night"
                      />
                    </div>
                    <div>
                      <Label htmlFor="setDescription">Description</Label>
                      <Input
                        id="setDescription"
                        value={newSetDescription}
                        onChange={(e) => setNewSetDescription(e.target.value)}
                        placeholder="Optional description"
                      />
                    </div>
                    <div>
                      <Label>Select Songs</Label>
                      <div className="max-h-60 overflow-y-auto border rounded-md p-4 space-y-2">
                        {songs.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No songs in your library yet.</p>
                        ) : (
                          songs.map((song) => (
                            <div key={song.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`song-${song.id}`}
                                checked={selectedSongs.includes(song.id)}
                                onCheckedChange={() => toggleSongSelection(song.id)}
                              />
                              <Label htmlFor={`song-${song.id}`} className="flex-1 cursor-pointer">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="font-medium">{song.title}</span>
                                    <span className="text-sm text-muted-foreground ml-2">by {song.artist}</span>
                                  </div>
                                  <Badge variant="outline">{song.key}</Badge>
                                </div>
                              </Label>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createSet} disabled={!newSetName.trim()}>
                        Create Set
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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
                    {set.songs.slice(0, 3).map((song) => (
                      <div key={song.id} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{song.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {song.key}
                        </Badge>
                      </div>
                    ))}
                    {set.songs.length > 3 && (
                      <p className="text-xs text-muted-foreground">+{set.songs.length - 3} more songs</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteSet(set.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Created: {new Date(set.createdAt).toLocaleDateString()}
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
