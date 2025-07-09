import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Song } from "@/types/song"

interface SongSearchSelectProps {
  songs: Song[]
  selectedSongs: string[]
  setSelectedSongs: (ids: string[]) => void
  expandedSongs: string[]
  onExpand: (id: string) => void
  onCollapse: (id: string) => void
  songYoutubeLinks: Record<string, string>
  setSongYoutubeLinks: (map: Record<string, string>) => void
  songNotesMap: Record<string, string>
  setSongNotesMap: (map: Record<string, string>) => void
  songKeys: Record<string, string>
  setSongKeys: (map: Record<string, string>) => void
}

const SongSearchSelect: React.FC<SongSearchSelectProps> = ({
  songs,
  selectedSongs,
  setSelectedSongs,
  expandedSongs,
  onExpand,
  onCollapse,
  songYoutubeLinks,
  setSongYoutubeLinks,
  songNotesMap,
  setSongNotesMap,
  songKeys,
  setSongKeys,
}) => {
  const [searchQuery, setSearchQuery] = useState("")

  const toggleSongSelection = (songId: string) => {
    setSelectedSongs(
      selectedSongs.includes(songId)
        ? selectedSongs.filter((id) => id !== songId)
        : [...selectedSongs, songId]
    )
    // If selecting, also expand
    if (!selectedSongs.includes(songId)) {
      onExpand(songId)
    }
    // If unselecting, also collapse
    else {
      onCollapse(songId)
    }
  }

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

  return (
    <div>
      <Label>Search Songs</Label>
      <Input
        placeholder="Search by title or artist..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full mb-2"
      />
      <div className="max-h-60 overflow-y-auto border rounded-md p-4 space-y-2">
        {filteredSongs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No songs found.</p>
        ) : (
          filteredSongs.map((song) => (
            <div key={song.id} className="border rounded-lg">
              <div
                className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-muted/50"
                onClick={() => toggleSongSelection(song.id)}
              >
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
                    <div className="flex flex-col items-end gap-1">
                      <Label className="text-xs text-muted-foreground">Key</Label>
                      <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <Select
                          value={songKeys[song.id] || song.key}
                          onValueChange={(value) => {
                            setSongKeys({
                              ...songKeys,
                              [song.id]: value,
                            })
                          }}
                        >
                          <SelectTrigger className="w-20 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {keys.map((key) => (
                              <SelectItem key={key} value={key}>
                                {key}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </Label>
                {/* Expand/collapse button */}
                {selectedSongs.includes(song.id) && (
                  expandedSongs.includes(song.id) ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onCollapse(song.id)
                      }}
                      className="text-xs"
                    >
                      Collapse
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onExpand(song.id)
                      }}
                      className="text-xs"
                    >
                      Details
                    </Button>
                  )
                )}
              </div>
              {/* Accordion Details for expanded songs */}
              {selectedSongs.includes(song.id) && expandedSongs.includes(song.id) && (
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
                        setSongYoutubeLinks({
                          ...songYoutubeLinks,
                          [song.id]: e.target.value,
                        })
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
                        setSongNotesMap({
                          ...songNotesMap,
                          [song.id]: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default SongSearchSelect 