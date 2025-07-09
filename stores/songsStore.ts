import { create } from 'zustand'
import { supabase } from '@/lib/supabaseClient'
import { SongsState, Song, CreateSong, UpdateSong, SongSchema, CreateSongSchema, UpdateSongSchema } from '@/types/song'
import { toast } from 'sonner'

export const useSongsStore = create<SongsState>((set, get) => ({
  songs: [],
  loading: false,
  error: null,

  validateSong: (song: unknown) => {
    try {
      const validatedSong = SongSchema.parse(song)
      return { success: true, data: validatedSong }
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, error: error.message }
      }
      return { success: false, error: 'Invalid song data' }
    }
  },

  fetchSongs: async () => {
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('song')
        .select('*')
        .order('title', { ascending: true })
      if (error) {
        throw error
      }

      set({ songs: data, loading: false })
    } catch (error) {
      console.error('Error fetching songs:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch songs', 
        loading: false 
      })
    }
  },
  getSong: async (id: string) => {
    const { data, error } = await supabase
      .from('song')
      .select('*')
      .eq('id', id)
    if (error) {
      throw error
    }
    return data[0] as Song
  },

  addSong: async (song: CreateSong) => {
    set({ loading: true, error: null })
    
    try {
   
      const { data, error } = await supabase
        .from('song')
        .insert([song])
        .select()

      if (error) {
        console.log(error)
        throw error
      }
      toast.success("Song saved successfully")

      set({ 
        songs: [data[0], ...get().songs], 
        loading: false 
      })
    } catch (error) {
      console.error('Error adding song:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add song', 
        loading: false 
      })
    }
  },

  updateSong: async (id: string, updates: Partial<UpdateSong>) => {
    console.log("updating song", id, updates)
    set({ loading: true, error: null })
    
    try {

      const { data, error } = await supabase
        .from('song')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) {
        throw error
      }
      set({ 
        songs: get().songs.map(song => song.id === id ? data[0] : song), 
        loading: false 
      })


    } catch (error) {
      console.error('Error updating song:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update song', 
        loading: false 
      })
    }
  },

  deleteSong: async (id: string) => {
    set({ loading: true, error: null })
    
    try {
      const { error } = await supabase
        .from('song')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      set(state => ({
        songs: state.songs.filter(song => song.id !== id),
        loading: false
      }))
    } catch (error) {
      console.error('Error deleting song:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete song', 
        loading: false 
      })
    }
  }
})) 