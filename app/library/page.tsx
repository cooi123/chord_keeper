"use client"

import { useState, useEffect } from "react"
import { Search, Edit, Trash2, Plus, Music } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

interface Song {
  id: number
  title: string
  artist: string
  key: string
  tempo: string
  lastEdited: string
}

export default function LibraryPage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("lastEdited")
  const [filterKey, setFilterKey] = useState("all")

  useEffect(() => {
    // Load songs from localStorage
    const savedSongs = JSON.parse(localStorage.getItem("chordkeeper-songs") || "[]")
    setSongs(savedSongs)
  }, [])

  const filteredSongs = songs
    .filter((song) => {
      const matchesSearch =
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesKey = filterKey === "all" || song.key === filterKey
      return matchesSearch && matchesKey
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title)
        case "artist":
          return a.artist.localeCompare(b.artist)
        case "key":
          return a.key.localeCompare(b.key)
        default:
          return new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime()
      }
    })

  const deleteSong = (id: number) => {
    const updatedSongs = songs.filter((song) => song.id !== id)
    setSongs(updatedSongs)
    localStorage.setItem("chordkeeper-songs", JSON.stringify(updatedSongs))
  }

  const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-6 w-6" />
              <h1 className="text-xl font-bold">My Library</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  Home
                </Button>
              </Link>
              <Link href="/sets">
                <Button variant="ghost" size="sm">
                  Sets
                </Button>
              </Link>
              <Link href="/editor">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Song
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your songs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lastEdited">Last Edited</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="artist">Artist</SelectItem>
              <SelectItem value="key">Key</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterKey} onValueChange={setFilterKey}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Filter by key" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Keys</SelectItem>
              {keys.map((key) => (
                <SelectItem key={key} value={key}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Songs Grid */}
        {filteredSongs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Music className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No songs found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {songs.length === 0
                  ? "Start building your library by creating your first song"
                  : "Try adjusting your search or filters"}
              </p>
              <Link href="/editor">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Song
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSongs.map((song) => (
              <Card key={song.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{song.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{song.artist}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <Badge variant="secondary">{song.key}</Badge>
                    <Badge variant="outline">{song.tempo} BPM</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Last edited: {new Date(song.lastEdited).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <Link href={`/editor/${song.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteSong(song.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
