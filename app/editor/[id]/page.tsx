"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Save, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChordProEditor } from "@/components/ChordProjectEditor"
import { useSongsStore } from "@/stores/songsStore"
import { Song, UpdateSong, UpdateSongSchema } from "@/types/song"
import { validateSong } from "@/lib/validation"

const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const timeSignatures = ["4/4", "3/4", "2/4", "6/8", "12/8"]

export default function EditSongPage() {
  const { id } = useParams()
  const { getSong, updateSong, loading } = useSongsStore()
  const router = useRouter()

  const [songData, setSongData] = useState<UpdateSong | null>(null)
  const [isPanelCollasped, setisPanelCollasped] = useState(false)
  const [validationError, setValidationError] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (id) {
      setFetching(true)
      getSong(id as string)
        .then((song) => {
          const updateSongObj = UpdateSongSchema.parse({ ...song, id: song.id });
          setSongData(updateSongObj);
        })
        .finally(() => setFetching(false))
    }
  }, [id])


  const handleUpdate = async () => {
    setValidationError("")
    if (!songData) return
    // Validate the song data
    const validation = validateSong(songData)
    if (!validation.success) {
      setValidationError(validation.error || "Validation failed")
      return
    }
    try {
      setIsSaving(true)
      await updateSong(String(songData.id), songData)
      router.push("/song/" + String(songData.id))
      setValidationError("")
    } catch (error) {
      setValidationError("Failed to update song. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (fetching || loading || !songData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-0">
          {/* Song Info Panel */}
          <div className={`transition-all duration-300 ${isPanelCollasped ? "w-12" : "w-80"} flex-shrink-0`}>
            {isPanelCollasped ? (
              <Card className="h-fit">
                <CardContent className="p-3">
                  <Button variant="ghost" size="sm" onClick={() => setisPanelCollasped(false)} className="w-full h-10">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="cursor-pointer" onClick={() => setisPanelCollasped(true)}>
                  <CardTitle className="flex items-center justify-between">
                    Song Information
                    <ChevronLeft className="h-4 w-4" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={songData.title}
                      onChange={(e) => setSongData((prev) => prev ? { ...prev, title: e.target.value } : prev)}
                      placeholder="Enter song title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="artist">Artist</Label>
                    <Input
                      id="artist"
                      value={songData.artist}
                      onChange={(e) => setSongData((prev) => prev ? { ...prev, artist: e.target.value } : prev)}
                      placeholder="Enter artist name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="key">Key</Label>
                      <Select
                        value={songData.key}
                        onValueChange={(value) => setSongData((prev) => prev ? { ...prev, key: value } : prev)}
                      >
                        <SelectTrigger>
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
                    <div>
                      <Label htmlFor="tempo">Tempo (BPM)</Label>
                      <Input
                        id="tempo"
                        type="number"
                        value={songData.tempo}
                        onChange={(e) => setSongData((prev) => prev ? { ...prev, tempo: parseInt(e.target.value) } : prev)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="timeSignature">Time Signature</Label>
                      <Select
                        value={songData.time_signature}
                        onValueChange={(value) => setSongData((prev) => prev ? { ...prev, time_signature: value } : prev)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSignatures.map((sig) => (
                            <SelectItem key={sig} value={sig}>
                              {sig}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    {validationError && (
                      <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                        <p className="text-sm text-destructive">{validationError}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleUpdate}
                        className="flex-1"
                        disabled={isSaving}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? "Updating..." : "Update Song"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Editor Panel */}
          <div className="flex-1">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Chord Chart</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ChordProEditor
                  value={songData.chords || ""}
                  onChange={(val) => setSongData((prev) => prev ? { ...prev, chords: val } : prev)}
                />
                <div className="mt-4 text-xs text-muted-foreground">
                  <p>
                    <strong>Tip:</strong> Use curly braces for sections like {`{start_of_verse: Verse ...}`}, {`{start_of_chorus: Chorus ...}`} ,{`{start_of_bridge: Bridge ...}`} ,{`{start_of_ending: Ending ...}`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
