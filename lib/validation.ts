import { z } from 'zod'
import {  CreateSongSchema, UpdateSongSchema } from '@/types/song'

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

// Enhanced validation with custom rules
export const validateSongWithCustomRules = (song: unknown): ValidationResult<z.infer<typeof SongSchema>> => {
  const basicValidation = validateSong(song)
  
  if (!basicValidation.success || !basicValidation.data) {
    return basicValidation
  }

  const data = basicValidation.data
  const errors: string[] = []

  // Custom key validation
  if (!validateKey(data.key)) {
    errors.push(`Invalid key: ${data.key}. Please use a valid musical key.`)
  }

  // Custom tempo validation
  if (!validateTempo(data.tempo)) {
    errors.push(`Invalid tempo: ${data.tempo}. Tempo must be between 1 and 300 BPM.`)
  }

  // Custom time signature validation
  if (!validateTimeSignature(data.time_signature)) {
    errors.push(`Invalid time signature: ${data.time_signature}. Please use format like "4/4", "3/4", etc.`)
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: errors.join(', ')
    }
  }

  return basicValidation
} 