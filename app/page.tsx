"use client"

import { useEffect, useState } from "react"
import { Search, Plus, Music, BookOpen, List, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useSongsStore } from "@/stores/songsStore"
import { useRouter } from "next/navigation"



export default function HomePage() {
  const { songs, loading, fetchSongs } = useSongsStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState(songs)
  const router = useRouter()
  useEffect(() => {
    fetchSongs()
  }, [])

  useEffect(() => {
    setSearchResults(songs)
  }, [songs, loading])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim() === "") {
      setSearchResults(songs)
    } else {
      const filtered = songs.filter(
        (song) =>
          song.title.toLowerCase().includes(query.toLowerCase()) ||
          song.artist.toLowerCase().includes(query.toLowerCase()),
      )
      setSearchResults(filtered)
    }
  }


  return (
    <div className="min-h-screen bg-background">

      {loading && <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">

          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Find Songs</h2>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for songs or artists..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Search Results */}
            <div className="space-y-3">
              {searchResults.map((song) => (
                <Card key={song.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{song.title}</h3>
                        <p className="text-sm text-muted-foreground">{song.artist}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary">{song.key}</Badge>
                          <Badge variant="outline">{song.tempo}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Add to Set
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => router.push(`/song/${song.id}`)}>
                          Preview
                        </Button>
                        <Link href={`/editor/${song.id}`}>
                          <Button size="sm">Edit</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/editor">
                  <Button className="w-full bg-transparent" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Song
                  </Button>
                </Link>

                <Link href="/sets">
                  <Button className="w-full bg-transparent" variant="outline">
                    <List className="h-4 w-4 mr-2" />
                    Manage Sets
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
