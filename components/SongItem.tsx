import { useState } from "react"
import { Edit, Trash2, ChevronUp, ChevronDown, Play, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { SetSong } from "@/types/set"

interface SongItemProps {
  song: SetSong
  index: number
  isFirst: boolean
  isLast: boolean
  onMoveUp: (index: number) => Promise<void>
  onMoveDown: (index: number) => Promise<void>
  onRemove: (songId: string) => Promise<void>
  onUpdateSong: (songId: string, updates: { youtube?: string; notes?: string }) => Promise<void>
}

export function SongItem({
  song,
  index,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onRemove,
  onUpdateSong,
}: SongItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [youtubeLink, setYoutubeLink] = useState(song.youtube_link || "")
  const [notes, setNotes] = useState(song.notes || "")

  const handleSave = async () => {
    await onUpdateSong(song.song_id, {
      youtube: youtubeLink,
      notes: notes,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setYoutubeLink(song.youtube_link || "")
    setNotes(song.notes || "")
    setIsEditing(false)
  }

  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50">
      <div className="flex flex-col gap-1 mt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => await onMoveUp(index)}
          disabled={isFirst}
          className="h-6 w-6 p-0"
        >
          <ChevronUp className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => await onMoveDown(index)}
          disabled={isLast}
          className="h-6 w-6 p-0"
        >
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full text-sm font-medium mt-2">
        {index + 1}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold">{song.song?.title || "Unknown Song"}</h3>
            <p className="text-sm text-muted-foreground">{song.song?.artist}</p>

            {!isEditing ? (
              <>
                {song.youtube_link && (
                  <div className="mt-2">
                    <a
                      href={song.youtube_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Play className="h-3 w-3" />
                      Watch on YouTube
                    </a>
                  </div>
                )}

                {song.notes && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                      <strong>Notes:</strong> {song.notes}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="mt-4 space-y-3">
                <div>
                  <Label htmlFor={`youtube-${song.song_id}`} className="text-sm">
                    YouTube Link
                  </Label>
                  <Input
                    id={`youtube-${song.song_id}`}
                    placeholder="https://youtube.com/watch?v=..."
                    className="text-sm mt-1"
                    value={youtubeLink}
                    onChange={(e) => setYoutubeLink(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`notes-${song.song_id}`} className="text-sm">
                    Notes
                  </Label>
                  <textarea
                    id={`notes-${song.song_id}`}
                    placeholder="Performance notes, key changes, etc..."
                    className="w-full min-h-[60px] px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md resize-none mt-1"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 ml-4">
            <Badge variant="secondary">{song.key}</Badge>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-2">
        {!isEditing ? (
          <>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Link href={`/editor/${song.song_id}`}>
              <Button variant="outline" size="sm">
                Edit Chords
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => await onRemove(song.song_id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={async () => await handleSave()}>
              <Save className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
} 