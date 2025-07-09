import { SongSchema } from "./song";
import { z } from "zod";


const setSongSchema = z.object({
  id: z.string(),
  set_id: z.string(),
  song_id: z.string(),
  key: z.string(),
  order: z.number(),
  youtube_link: z.string().optional(),
  notes: z.string().optional(),
  created_at: z.string(),
  song: SongSchema.optional(), // for joined queries
})
const setSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  created_at: z.string(),
  songs: z.array(setSongSchema),
})



const createSetSchema = setSchema.omit({ id: true, created_at: true, songs: true })
const createSetSongSchema = setSongSchema.omit({ id: true, created_at: true, set_id: true, song: true })

export type createSetSong = z.infer<typeof createSetSongSchema>
export type Set = z.infer<typeof setSchema>
export type SetSong = z.infer<typeof setSongSchema>