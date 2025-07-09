import React, { useEffect, useState } from "react";
import { ChordProParser, HtmlFormatter, Song, Transposer } from "chordproject-parser";
import { Download } from "lucide-react";
import { useReactToPrint } from "react-to-print";

import "../styles/chordpro-preview.css";
import { useRef } from "react";

const ALL_KEYS = [
  "C", "C#","Db", "D", "D#","Eb", "E", "F", "F#","Gb", "G", "G#","Ab", "A", "A#","Bb", "B"
];

type ChordProPreviewProps = {
  value: string;
  originalKey: string;
};

export const ChordProPreview: React.FC<ChordProPreviewProps> = ({ value, originalKey: defaultKey }) => {
  const [selectedKey, setSelectedKey] = useState<string>(defaultKey);
  const [song, setSong] = useState<Song | null>(null);

  const parser = new ChordProParser();
  useEffect(() => {
    const song = parser.parse(value);
    setSong(song);
  }, [value]);
  
  const transpose = (direction: "up" | "down", steps: number = 1) => {
    if (!song) return;
    let transposed = song;
    transposed = Transposer.transpose(transposed, direction);

    setSong(transposed);
    setSelectedKey(transposed.key?.toString() || "");
  };
  const formatter = new HtmlFormatter();
  const html = song ? formatter.format(song).join("\n") : "";

  const contentRef = useRef(null);
  const reactToPrintFn = useReactToPrint({
    contentRef: contentRef
  })

  const handleDownloadPDF = async () => {
    reactToPrintFn();

  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-center mb-2 gap-4 w-full">
        <div className="flex items-center gap-2">
          <button onClick={() => transpose("down")} className="border rounded px-2 py-1 text-base">-</button>
          <span className="text-base">Transpose</span>
          <button onClick={() => transpose("up")} className="border rounded px-2 py-1 text-base">+</button>
         
          <span className="ml-4 text-sm ">Current Key: <b>{selectedKey }</b></span>
          <span className="ml-4 text-sm ">Original Key: <b>{defaultKey}</b></span>

        </div>
        <button
          onClick={handleDownloadPDF}
          className="border rounded px-2 py-1 bg-primary text-white hover:bg-primary/90 transition flex items-center justify-center ml-4 text-base"
          aria-label="Download PDF"
          title="Download PDF"
        >
         <Download className="w-5 h-5 leading-none" />
        </button>
      </div>
      <div className="chordpro-preview border rounded p-2 bg-background overflow-auto">
        <div ref={contentRef} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
};

export default ChordProPreview; 