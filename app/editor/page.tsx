"use client"

import { useState, useEffect } from "react"
import { Save, Play, Pause, Settings, ChevronDown, ChevronUp, ArrowRight, ChevronRight, ChevronLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import dynamic from "next/dynamic";
const ChordProEditor = dynamic(() => import("@/components/ChordProjectEditor"), { ssr: false });
import { useSongsStore } from "@/stores/songsStore"
import { CreateSong, Song } from "@/types/song"
import { validateCreateSong } from "@/lib/validation"
import { useRouter } from "next/navigation"

const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const timeSignatures = ["4/4", "3/4", "2/4", "6/8", "12/8"]

export default function EditorPage() {
  const { addSong, loading } = useSongsStore()
  const router = useRouter()

  const [songData, setSongData] = useState<CreateSong>({
    title: "",
    artist: "",
    key: "C",
    tempo: 120,
    time_signature: "4/4",
    chords: "",
  })
  const [isPanelCollasped, setisPanelCollasped] = useState(false)
  const [validationError, setValidationError] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)


  const handleSave = async () => {
    setValidationError("")

    // Validate the song data
    const validation = validateCreateSong(songData)

    if (!validation.success) {
      setValidationError(validation.error || "Validation failed")
      return
    }

    try {
      setIsSaving(true)
      await addSong(songData)
      setSongData({
        title: "",
        artist: "",
        key: "C",
        tempo: 120,
        time_signature: "4/4",
        chords: "",
      })
      //redirect to home page
      router.push("/")
      setValidationError("")
    } catch (error) {
      console.log(error)
      setValidationError("Failed to save song. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {loading && <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>}

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
                      onChange={(e) => setSongData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter song title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="artist">Artist</Label>
                    <Input
                      id="artist"
                      value={songData.artist}
                      onChange={(e) => setSongData((prev) => ({ ...prev, artist: e.target.value }))}
                      placeholder="Enter artist name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="key">Key</Label>
                      <Select
                        value={songData.key}
                        onValueChange={(value) => setSongData((prev) => ({ ...prev, key: value }))}
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
                        onChange={(e) => setSongData((prev) => ({ ...prev, tempo: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="timeSignature">Time Signature</Label>
                      <Select
                        value={songData.time_signature}
                        onValueChange={(value) => setSongData((prev) => ({ ...prev, time_signature: value }))}
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
                        onClick={handleSave}
                        className="flex-1"
                        disabled={isSaving}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? "Saving..." : "Save Song"}
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
                  value={songData.chords}
                  onChange={(val) => setSongData((prev) => ({ ...prev, chords: val }))}
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
