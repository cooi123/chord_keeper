import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Song } from "@/types/song";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import SongSearchSelect from "./SongSearchSelect";

interface SetCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  songs: Song[];
  selectedSongs: string[];
  setSelectedSongs: (ids: string[]) => void;
  newSetName: string;
  setNewSetName: (name: string) => void;
  newSetDescription: string;
  setNewSetDescription: (desc: string) => void;
  songYoutubeLinks: Record<string, string>;
  setSongYoutubeLinks: (map: Record<string, string>) => void;
  songNotesMap: Record<string, string>;
  setSongNotesMap: (map: Record<string, string>) => void;
  songKeys: Record<string, string>;
  setSongKeys: (map: Record<string, string>) => void;
  onCreate: () => void;
}

const SetCreateDialog: React.FC<SetCreateDialogProps> = ({
  open,
  onOpenChange,
  songs,
  selectedSongs,
  setSelectedSongs,
  newSetName,
  setNewSetName,
  newSetDescription,
  setNewSetDescription,
  songYoutubeLinks,
  setSongYoutubeLinks,
  songNotesMap,
  setSongNotesMap,
  songKeys,
  setSongKeys,
  onCreate,
}) => {
  const [expandedSongs, setExpandedSongs] = useState<string[]>([])

  const handleExpand = (songId: string) => {
    setExpandedSongs((prev) => prev.includes(songId) ? prev : [...prev, songId])
  }
  const handleCollapse = (songId: string) => {
    setExpandedSongs((prev) => prev.filter((id) => id !== songId))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add New Set
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Set</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="setName">Set Name</Label>
            <Input
              id="setName"
              value={newSetName}
              onChange={(e) => setNewSetName(e.target.value)}
              placeholder="e.g., Sunday Morning Service, Open Mic Night"
            />
          </div>
          <div>
            <Label htmlFor="setDescription">Description</Label>
            <Input
              id="setDescription"
              value={newSetDescription}
              onChange={(e) => setNewSetDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>
          <SongSearchSelect
            songs={songs}
            selectedSongs={selectedSongs}
            setSelectedSongs={setSelectedSongs}
            expandedSongs={expandedSongs}
            onExpand={handleExpand}
            onCollapse={handleCollapse}
            songYoutubeLinks={songYoutubeLinks}
            setSongYoutubeLinks={setSongYoutubeLinks}
            songNotesMap={songNotesMap}
            setSongNotesMap={setSongNotesMap}
            songKeys={songKeys}
            setSongKeys={setSongKeys}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={onCreate} disabled={!newSetName.trim()}>
              Create Set
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SetCreateDialog; 