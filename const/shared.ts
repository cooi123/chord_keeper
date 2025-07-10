export const SAMPLE_CHORDS = `
{c: Intro}
[D / / / | G / / / | Bm / / / | G / / / |]
{start_of_verse: Verse 1}
This is a [C]ChordPro [G]example
{end_of_verse}

{start_of_chorus: Chorus}
This is a [C]ChordPro [G]example
{end_of_chorus}

{c: INSTRUMENTAL}
[D / / / | G / / / | Bm / / / | G / / / |]

{start_of_verse: Verse 2}
This is a [C]ChordPro [G]example
{end_of_verse}

{start_of_bridge: Bridge 1}
This is a [C]ChordPro [G]example
{end_of_bridge}

{start_of_bridge: Bridge 2B}
This is a [C]ChordPro [G]example
{end_of_bridge}

{start_of_ending: Ending}
This is a [C]ChordPro [G]example
{end_of_ending}
`;

export const ALL_KEYS = [
    "C", "C#","Db", "D", "D#","Eb", "E", "F", "F#","Gb", "G", "G#","Ab", "A", "A#","Bb", "B"
  ];



export const KEY_MAP:Record<string, number>={
    "C": 0,
    "C#": 1,
    "Db": 1,
    "D": 2,
    "D#": 3,
    "Eb": 3,
    "E": 4,
    "F": 5,
    "F#": 6,
    "Gb": 6,
    "G": 7,
    "G#": 8,
    "Ab": 8,
    "A": 9,
    "A#": 10,
    "Bb": 10,
    "B": 11
}