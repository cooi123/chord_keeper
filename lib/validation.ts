import { z } from 'zod'
import {  CreateSongSchema } from '@/types/song'

// Validation result type
export interface ValidationResult<T> {
  success: boolean
  data?: T
  error?: string
  errors?: z.ZodError
}

// Validate a song object
export const validateSong = (song: unknown): ValidationResult<z.infer<typeof CreateSongSchema>> => {
  try {
    const validatedSong = CreateSongSchema.parse(song)
    return { success: true, data: validatedSong }
  } catch (error) {
    console.log("error", error)

    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors.map(e => e.message).join(', '),
        errors: error
      }
    }
    return { success: false, error: 'Invalid song data' }
  }
}


// Custom validation helpers
export const validateKey = (key: string): boolean => {
  // Common musical keys (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
  const validKeys = [
    'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
    'Cm', 'C#m', 'Dbm', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gbm', 'Gm', 'G#m', 'Abm', 'Am', 'A#m', 'Bbm', 'Bm'
  ]
  return validKeys.includes(key)
}

export const validateTempo = (tempo: number): boolean => {
  return tempo >= 1 && tempo <= 300
}

export const validateTimeSignature = (timeSignature: string): boolean => {
  // Common time signatures (4/4, 3/4, 6/8, etc.)
  const timeSignaturePattern = /^[1-9]\/[1-9]$/
  return timeSignaturePattern.test(timeSignature)
}
