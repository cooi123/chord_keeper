import React, { useEffect, useMemo, useState } from "react";
import { ChordProParser, HtmlFormatter, Song, Transposer } from "chordproject-parser";
import { Download, ZoomIn, ZoomOut } from "lucide-react";
import { useReactToPrint } from "react-to-print";

import "../styles/chordpro-preview.css";
import { useRef } from "react";
import { findStepToTranspose } from "@/utils/transpose";
import { useIsMobile } from "@/hooks/use-mobile";


type ChordProPreviewProps = {
  value: string;
  originalKey: string;
  previewKey: string;
  showTransposeControls?: boolean;
  showDownloadButton?: boolean;
  showFontControls?: boolean;
  showKeyInfo?: boolean;
};

export const ChordProPreview: React.FC<ChordProPreviewProps> = ({ 
  value, 
  originalKey: defaultKey, 
  previewKey, 
  showTransposeControls = true,
  showDownloadButton = true,
  showFontControls = true,
  showKeyInfo = true
}) => {
  const [selectedKey, setSelectedKey] = useState<string>(previewKey);
  const [song, setSong] = useState<Song | null>(null);
  const [fontSize, setFontSize] = useState<string>("base");
  const isMobile = useIsMobile();

  const parser = new ChordProParser();
  useEffect(() => {
    const song = parser.parse(value);
    const steps = findStepToTranspose(song.key?.toString() || "", previewKey);
    const transposed = transpose(song, steps > 0 ? "up" : "down", Math.abs(steps));
    setSong(transposed);
    setSelectedKey(transposed.key?.toString() || "");
  }, [value]);

  const transpose = (song: Song, direction: "up" | "down", steps: number = 1) => {
    let transposed = song;
    for (let i = 0; i < steps; i++) {
      console.log("transposed", transposed.key?.toString());

      transposed = Transposer.transpose(transposed, direction);
    }
    return transposed;
  };

  const transposeHandler = (direction: "up" | "down", steps: number = 1) => {
    if (!song) return;
    const transposed = transpose(song, direction, steps);
    setSong(transposed);
    setSelectedKey(transposed.key?.toString() || "");
  }

  const fontSizes = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"];
  
  const increaseFontSize = () => {
    const currentIndex = fontSizes.indexOf(fontSize);
    if (currentIndex < fontSizes.length - 1) {
      setFontSize(fontSizes[currentIndex + 1]);
    }
  };

  const decreaseFontSize = () => {
    const currentIndex = fontSizes.indexOf(fontSize);
    if (currentIndex > 0) {
      setFontSize(fontSizes[currentIndex - 1]);
    }
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
    <div className={`flex flex-col gap-2 ${isMobile ? 'h-screen' : ''}`}>
      {/* Mobile Controls - Stacked Layout */}
      {isMobile && (
        <div className="flex flex-col gap-2 p-2 bg-background border-b">
          <div className="flex items-center justify-between">
            {showTransposeControls && (
              <div className="flex items-center gap-2">
                <button onClick={() => transposeHandler("down")} className="border rounded px-3 py-2 text-sm">-</button>
                <span className="text-sm font-medium">Transpose</span>
                <button onClick={() => transposeHandler("up")} className="border rounded px-3 py-2 text-sm">+</button>
              </div>
            )}
            
            {showFontControls && (
              <div className="font-size-controls">
                <button
                  onClick={decreaseFontSize}
                  className="font-size-btn"
                  disabled={fontSize === "xs"}
                  title="Decrease font size"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="font-size-display">{fontSize.toUpperCase()}</span>
                <button
                  onClick={increaseFontSize}
                  className="font-size-btn"
                  disabled={fontSize === "4xl"}
                  title="Increase font size"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          
          {showKeyInfo && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Current Key: <b>{selectedKey}</b></span>
              <span>Original Key: <b>{defaultKey}</b></span>
            </div>
          )}
          
          {showDownloadButton && (
            <button
              onClick={handleDownloadPDF}
              className="border rounded px-3 py-2 bg-primary text-white hover:bg-primary/90 transition flex items-center justify-center text-sm"
              aria-label="Download PDF"
              title="Download PDF"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
          )}
        </div>
      )}

      {/* Desktop Controls - Horizontal Layout */}
      {!isMobile && (
        <div className="flex items-center justify-center mb-2 gap-4 w-full">
          {showTransposeControls && (
            <div className="flex items-center gap-2">
              <button onClick={() => transposeHandler("down")} className="border rounded px-2 py-1 text-base">-</button>
              <span className="text-base">Transpose</span>
              <button onClick={() => transposeHandler("up")} className="border rounded px-2 py-1 text-base">+</button>

              {showKeyInfo && (
                <>
                  <span className="ml-4 text-sm ">Current Key: <b>{selectedKey}</b></span>
                  <span className="ml-4 text-sm ">Original Key: <b>{defaultKey}</b></span>
                </>
              )}
            </div>
          )}
          
          {showFontControls && (
            <div className="font-size-controls">
              <button
                onClick={decreaseFontSize}
                className="font-size-btn"
                disabled={fontSize === "xs"}
                title="Decrease font size"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-size-display">{fontSize.toUpperCase()}</span>
              <button
                onClick={increaseFontSize}
                className="font-size-btn"
                disabled={fontSize === "4xl"}
                title="Increase font size"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          )}

          {showDownloadButton && (
            <button
              onClick={handleDownloadPDF}
              className="border rounded px-2 py-1 bg-primary text-white hover:bg-primary/90 transition flex items-center justify-center ml-4 text-base"
              aria-label="Download PDF"
              title="Download PDF"
            >
              <Download className="w-5 h-5 leading-none" />
            </button>
          )}
        </div>
      )}

      {/* Preview Content */}
      <div className={`chordpro-preview border rounded p-2 bg-background overflow-auto font-size-${fontSize} ${isMobile ? 'flex-1 min-h-0' : ''}`}>
        <div ref={contentRef} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
};

export default ChordProPreview; 