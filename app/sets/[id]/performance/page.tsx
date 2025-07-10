"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import {
    Music,
    ChevronLeft,
    ChevronRight,
    Minimize2,
    Play,
    ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSets } from "@/hooks/useSets"
import Link from "next/link"
import { ChordProPreview } from "@/components/ChordProPreview"
import { Set } from "@/types/set"

export default function PerformancePage() {
    const params = useParams()
    const router = useRouter()
    const setId = params.id as string

    const { sets, fetchSets, loading } = useSets()
    const [currentSet, setCurrentSet] = useState<Set | null>(null)
    const [currentSongIndex, setCurrentSongIndex] = useState(0)
    const [showNotes, setShowNotes] = useState(true)
    const [showChords, setShowChords] = useState(true)
    const [fontSize, setFontSize] = useState("text-base")

    // Fetch sets on component mount
    useEffect(() => {
        fetchSets()
    }, [fetchSets])

    // Set current set when sets are loaded
    useEffect(() => {
        if (sets && sets.length > 0) {
            const found = sets.find((s: any) => s.id === setId)
            if (found) {
                setCurrentSet(found)
            }
        }
    }, [sets, setId])

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!currentSet) return

            switch (event.key) {
                case "ArrowLeft":
                    event.preventDefault()
                    goToPreviousSong()
                    break
                case "ArrowRight":
                case " ":
                    event.preventDefault()
                    goToNextSong()
                    break

            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [currentSet, currentSongIndex])



    // Navigation functions


    const goToNextSong = useCallback(() => {
        if (currentSet && currentSongIndex < currentSet.songs.length - 1) {
            setCurrentSongIndex(currentSongIndex + 1)
        }
    }, [currentSet, currentSongIndex])

    const goToPreviousSong = useCallback(() => {
        if (currentSongIndex > 0) {
            setCurrentSongIndex(currentSongIndex - 1)
        }
    }, [currentSongIndex])


    // Get current song
    const currentSong = currentSet?.songs[currentSongIndex]?.song || null


    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
                    <p className="text-muted-foreground">Loading performance view...</p>
                </div>
            </div>
        )
    }
    if (!currentSet) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Set not found</h2>
                </div>
            </div>
        )
    }


    if (currentSet.songs.length === 0) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">No songs in set</h2>
                    <p className="text-muted-foreground mb-4">Add songs to this set to start performing</p>
                    <Link href={`/sets/${setId}`}>
                        <Button>Edit Set</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className={`container mx-auto px-4 py-6`}>
            <div className="grid gap-6 lg:grid-cols-1">
                {/* Main Content */}
                <div className="col-span-1">
                    <Card className={`min-h-[600px]`}>
                        {/* Progress Bar and Navigation */}
                        <div className="p-6 pb-0">
                            <div className="flex items-center justify-between mb-4">
                                <Button
                                    variant="outline"
                                    onClick={goToPreviousSong}
                                    disabled={currentSongIndex === 0}
                                    className="flex items-center gap-2"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>

                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-muted-foreground">
                                        Song {currentSongIndex + 1} of {currentSet?.songs?.length || 0}
                                    </span>

                                </div>

                                <Button
                                    variant="outline"
                                    onClick={goToNextSong}
                                    disabled={currentSongIndex === (currentSet?.songs?.length || 0) - 1}
                                    className="flex items-center gap-2"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl">{currentSong?.title || "Unknown Song"}</CardTitle>
                                <p className="text-muted-foreground">{currentSong?.artist || "Unknown Artist"}</p>
                                <div className="flex gap-2 mt-2">
                                    <Badge variant="secondary">{currentSet?.songs?.[currentSongIndex]?.key || "C"}</Badge>
                                    <Badge variant="outline">{currentSong?.tempo || 120} BPM</Badge>
                                    {currentSet?.songs?.[currentSongIndex]?.youtube_link && (
                                        <a
                                            href={currentSet.songs[currentSongIndex].youtube_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            <Play className="h-3 w-3" />
                                            YouTube
                                        </a>
                                    )}
                                </div>
                            </div>

                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Notes Section */}
                            {showNotes && currentSet?.songs?.[currentSongIndex]?.notes && (
                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-sm mb-2">Performance Notes:</h4>
                                    <p className={`${fontSize} text-muted-foreground`}>{currentSet.songs[currentSongIndex].notes}</p>
                                </div>
                            )}

                            {/* Chord Chart */}
                            {showChords && currentSong?.chords && (
                                <div className="space-y-2">


                                    <ChordProPreview
                                        value={`
{key: ${currentSong.key}}

${currentSong.chords}`}
                                        originalKey={currentSong.key}
                                        previewKey={currentSet.songs[currentSongIndex].key}
                                    />

                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Keyboard Navigation Hint */}
                    <div className="flex items-center justify-center mt-6">
                        <span className="text-sm text-muted-foreground">Use ← → arrow keys or spacebar to navigate</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
