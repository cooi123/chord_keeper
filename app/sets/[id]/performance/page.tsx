"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import {
    Music,
    ChevronLeft,
    ChevronRight,
    Minimize2,
    Play,
    ArrowLeft,
    X,
    Eye,
    EyeOff,
    Download,
    Settings,
    MoreVertical,
    Maximize2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSets } from "@/hooks/useSets"
import { useIsMobile } from "@/hooks/use-mobile"
import Link from "next/link"
import { ChordProPreview } from "@/components/ChordProPreview"
import { Set } from "@/types/set"

export default function PerformancePage() {
    const params = useParams()
    const router = useRouter()
    const setId = params.id as string
    const isMobile = useIsMobile()

    const { sets, fetchSets, loading } = useSets()
    const [currentSet, setCurrentSet] = useState<Set | null>(null)
    const [currentSongIndex, setCurrentSongIndex] = useState(0)
    const [showNotes, setShowNotes] = useState(true)
    const [showChords, setShowChords] = useState(true)
    const [fontSize, setFontSize] = useState("text-base")
    const [showMobileControls, setShowMobileControls] = useState(false)
    const [isFullScreen, setIsFullScreen] = useState(false)
    const [showHeader, setShowHeader] = useState(true)
    
    // Visibility toggles
    const [showPerformanceNotes, setShowPerformanceNotes] = useState(true)
    const [showTransposeControls, setShowTransposeControls] = useState(true)
    const [showDownloadButton, setShowDownloadButton] = useState(true)

    // Scroll detection refs
    const lastScrollY = useRef(0)
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null)

    // Swipe detection refs
    const touchStartX = useRef<number | null>(null)
    const touchEndX = useRef<number | null>(null)
    const minSwipeDistance = 50

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

    // Scroll detection for header visibility
    useEffect(() => {
        if (!isFullScreen) return

        const handleScroll = () => {
            const currentScrollY = window.scrollY
            
            if (currentScrollY > lastScrollY.current + 10) {
                // Scrolling down - hide header
                setShowHeader(false)
            } else if (currentScrollY < lastScrollY.current - 10) {
                // Scrolling up - show header
                setShowHeader(true)
            }
            
            lastScrollY.current = currentScrollY

            // Clear existing timeout
            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current)
            }

            // Auto-hide header after scrolling stops
            scrollTimeout.current = setTimeout(() => {
                setShowHeader(false)
            }, 2000)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', handleScroll)
            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current)
            }
        }
    }, [isFullScreen])

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
                case "Escape":
                    if (isFullScreen) {
                        setIsFullScreen(false)
                    } else if (isMobile && showMobileControls) {
                        setShowMobileControls(false)
                    }
                    break
                case "f":
                    event.preventDefault()
                    setIsFullScreen(!isFullScreen)
                    break
                case "t":
                    setShowTransposeControls(!showTransposeControls)
                    break
                case "n":
                    setShowPerformanceNotes(!showPerformanceNotes)
                    break
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [currentSet, currentSongIndex, isMobile, showMobileControls, showTransposeControls, showPerformanceNotes, isFullScreen])

    // Touch handlers for swipe gestures
    const onTouchStart = (e: React.TouchEvent) => {
        touchEndX.current = null
        touchStartX.current = e.targetTouches[0].clientX
    }

    const onTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX
    }

    const onTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return
        
        const distance = touchStartX.current - touchEndX.current
        const isLeftSwipe = distance > minSwipeDistance
        const isRightSwipe = distance < -minSwipeDistance

        if (isLeftSwipe) {
            goToNextSong()
        }
        if (isRightSwipe) {
            goToPreviousSong()
        }
    }

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

    // Full Screen Layout
    if (isFullScreen) {
        return (
            <div className="h-screen flex flex-col bg-background">
                {/* Collapsible Header */}
                <div className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b transition-all duration-300 ${
                    showHeader ? 'translate-y-0' : '-translate-y-full'
                }`}>
                    <div className="flex items-center justify-between p-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsFullScreen(false)}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Exit Full Screen
                        </Button>
                        
                        <div className="text-center">
                            <h1 className="text-lg font-semibold">{currentSong?.title || "Unknown Song"}</h1>
                            <p className="text-sm text-muted-foreground">
                                {currentSongIndex + 1} of {currentSet.songs.length} • {currentSet.name}
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToPreviousSong}
                                disabled={currentSongIndex === 0}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToNextSong}
                                disabled={currentSongIndex === currentSet.songs.length - 1}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Full Screen Content */}
                <div className="flex-1 pt-16">
                    {showChords && currentSong?.chords && (
                        <div className="h-full">
                            <ChordProPreview
                                value={`
{key: ${currentSong.key}}

${currentSong.chords}`}
                                originalKey={currentSong.key}
                                previewKey={currentSet.songs[currentSongIndex].key}
                                showTransposeControls={false}
                                showDownloadButton={false}
                                showFontControls={false}
                                showKeyInfo={false}
                            />
                        </div>
                    )}
                </div>

                {/* Full Screen Navigation Hint */}
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full border">
                    <p className="text-xs text-muted-foreground">
                        Swipe left/right to navigate • Scroll up for controls • Press F to exit
                    </p>
                </div>
            </div>
        )
    }

    // Mobile Layout
    if (isMobile) {
        return (
            <div className="h-screen flex flex-col bg-background">
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-4 border-b bg-background">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    
                    <div className="text-center">
                        <h1 className="text-lg font-semibold">{currentSet.name}</h1>
                        <p className="text-sm text-muted-foreground">
                            {currentSongIndex + 1} of {currentSet.songs.length}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsFullScreen(true)}
                        >
                            <Maximize2 className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <Settings className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Display Settings</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    onClick={() => setShowPerformanceNotes(!showPerformanceNotes)}
                                    className="flex items-center justify-between"
                                >
                                    <span>Performance Notes</span>
                                    {showPerformanceNotes ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={() => setShowTransposeControls(!showTransposeControls)}
                                    className="flex items-center justify-between"
                                >
                                    <span>Transpose Controls</span>
                                    {showTransposeControls ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={() => setShowDownloadButton(!showDownloadButton)}
                                    className="flex items-center justify-between"
                                >
                                    <span>Download Button</span>
                                    {showDownloadButton ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowMobileControls(!showMobileControls)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Mobile Controls Overlay */}
                {showMobileControls && (
                    <div className="absolute top-16 left-0 right-0 z-50 bg-background border-b p-4">
                        <div className="flex items-center justify-between mb-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToPreviousSong}
                                disabled={currentSongIndex === 0}
                                className="flex items-center gap-2"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>

                            <div className="text-center">
                                <h2 className="text-lg font-semibold">{currentSong?.title || "Unknown Song"}</h2>
                                <p className="text-sm text-muted-foreground">{currentSong?.artist || "Unknown Artist"}</p>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToNextSong}
                                disabled={currentSongIndex === currentSet.songs.length - 1}
                                className="flex items-center gap-2"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex items-center justify-center gap-4">
                            <Badge variant="secondary">{currentSet.songs[currentSongIndex]?.key || "C"}</Badge>
                            <Badge variant="outline">{currentSong?.tempo || 120} BPM</Badge>
                            {currentSet.songs[currentSongIndex]?.youtube_link && (
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
                )}

                {/* Mobile Song Content */}
                <div 
                    className="flex-1 overflow-hidden"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    {/* Notes Section */}
                    {showPerformanceNotes && showNotes && currentSet.songs[currentSongIndex]?.notes && (
                        <div className="p-4 bg-muted/50 border-b">
                            <h4 className="font-semibold text-sm mb-2">Performance Notes:</h4>
                            <p className={`${fontSize} text-muted-foreground`}>
                                {currentSet.songs[currentSongIndex].notes}
                            </p>
                        </div>
                    )}

                    {/* Chord Chart - Full Screen */}
                    {showChords && currentSong?.chords && (
                        <div className="h-full">
                            <ChordProPreview
                                value={`
{key: ${currentSong.key}}

${currentSong.chords}`}
                                originalKey={currentSong.key}
                                previewKey={currentSet.songs[currentSongIndex].key}
                                showTransposeControls={showTransposeControls}
                                showDownloadButton={showDownloadButton}
                            />
                        </div>
                    )}
                </div>

                {/* Mobile Navigation Hint */}
                <div className="p-4 text-center bg-muted/30">
                    <p className="text-xs text-muted-foreground">
                        Swipe left/right to navigate • Tap X for controls • Tap ⚙️ for settings • Tap ⛶ for full screen
                    </p>
                </div>
            </div>
        )
    }

    // Desktop Layout
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
                                    
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsFullScreen(true)}
                                        className="flex items-center gap-2"
                                    >
                                        <Maximize2 className="h-4 w-4" />
                                        Full Screen
                                    </Button>
                                    
                                    {/* Desktop Settings Dropdown */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="flex items-center gap-2">
                                                <Settings className="h-4 w-4" />
                                                Settings
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                            <DropdownMenuLabel>Display Settings</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem 
                                                onClick={() => setShowPerformanceNotes(!showPerformanceNotes)}
                                                className="flex items-center justify-between"
                                            >
                                                <span>Performance Notes</span>
                                                {showPerformanceNotes ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                onClick={() => setShowTransposeControls(!showTransposeControls)}
                                                className="flex items-center justify-between"
                                            >
                                                <span>Transpose Controls</span>
                                                {showTransposeControls ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                onClick={() => setShowDownloadButton(!showDownloadButton)}
                                                className="flex items-center justify-between"
                                            >
                                                <span>Download Button</span>
                                                {showDownloadButton ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
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
                            {showPerformanceNotes && showNotes && currentSet?.songs?.[currentSongIndex]?.notes && (
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
                                        showTransposeControls={showTransposeControls}
                                        showDownloadButton={showDownloadButton}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Keyboard Navigation Hint */}
                    <div className="flex items-center justify-center mt-6">
                        <span className="text-sm text-muted-foreground">
                            Use ← → arrow keys or spacebar to navigate • Press F for full screen • Press T to toggle transpose • Press N to toggle notes
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
