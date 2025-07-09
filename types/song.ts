import { z } from 'zod'

// Zod validation schema
export const SongSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  artist: z.string().min(1, 'Artist is required').max(255, 'Artist must be less than 255 characters'),
  key: z.string().min(1, 'Key is required').max(10, 'Key must be less than 10 characters'),
  tempo: z.number().min(1, 'Tempo must be at least 1 BPM').max(300, 'Tempo must be less than 300 BPM'),
  time_signature: z.string().min(1, 'Time signature is required').max(10, 'Time signature must be less than 10 characters'),
  chords: z.string().min(1, 'Chords are required'),
  created_at: z.string().datetime()
})

// Type for creating a new song (without id)
export const CreateSongSchema = SongSchema.omit({ id: true, created_at: true })

// Type for updating a song (all fields optional except id)
export const UpdateSongSchema = SongSchema.partial().extend({
  id: z.string().uuid(),
}).omit({
  created_at: true,
})

// TypeScript interfaces derived from Zod schemas
export type Song = z.infer<typeof SongSchema>
export type CreateSong = z.infer<typeof CreateSongSchema>
export type UpdateSong = z.infer<typeof UpdateSongSchema>

export interface SongsState {
  songs: Song[]
  loading: boolean
  error: string | null
  fetchSongs: () => Promise<void>
  getSong: (id: string) => Promise<Song>
  addSong: (song: CreateSong) => Promise<void>
  updateSong: (id: string, updates: Partial<UpdateSong>) => Promise<void>
  deleteSong: (id: string) => Promise<void>
  validateSong: (song: unknown) => { success: boolean; data?: Song; error?: string }
} 