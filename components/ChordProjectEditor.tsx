import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { ChordProParser, HtmlFormatter } from "chordproject-parser";
import "../styles/chordpro-preview.css"; // Adjust path as needed

type ChordProEditorProps = {
  value: string;
  onChange?: (val: string) => void;
};

export const ChordProEditor: React.FC<ChordProEditorProps> = ({
  value,
  onChange,
}) => {
  const [code, setCode] = useState(value );
const parser = new ChordProParser();
const formatter = new HtmlFormatter();

  // Update both local and parent state
  const handleChange = (val: string) => {
    setCode(val);
    onChange?.(val);
  };
  const song = parser.parse(code);

  // Parse ChordPro to HTML
  let html = "";
  try {
    html = formatter.format(song).join("\n")
  } catch (e) {
    html = "<div style='color:red'>Error parsing ChordPro</div>";
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 h-screen">
      <div className="w-full md:w-1/2">
        <CodeMirror
          value={code}
          height="100vh"
          extensions={[markdown()]}
          onChange={handleChange}
          theme="light"
        />
      </div>
      <div className="w-full md:w-1/2 chordpro-preview border rounded p-2 bg-background overflow-auto">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
};

export default ChordProEditor;
