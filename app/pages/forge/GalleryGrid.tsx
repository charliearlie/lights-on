import { StadiumCard } from "./StadiumCard";
import type { QueueItem } from "../../lib/stadium-forge/types";

interface GalleryGridProps {
  queue: QueueItem[];
  model: string;
  isRunning: boolean;
  onRun: () => void;
  onStop: () => void;
  onDownload: (item: QueueItem) => void;
  onDownloadAll: () => void;
  onRegen: (id: string) => void;
  onRemove: (id: string) => void;
  onMockupGenerated: (id: string, mockupType: string, imageUrl: string) => void;
}

const font = {
  display: "'Barlow Condensed', sans-serif",
  mono: "'IBM Plex Mono', monospace",
};

export function GalleryGrid({
  queue,
  model,
  isRunning,
  onRun,
  onStop,
  onDownload,
  onDownloadAll,
  onRegen,
  onRemove,
  onMockupGenerated,
}: GalleryGridProps) {
  const queuedCount = queue.filter((i) => i.status === "queued").length;
  const doneCount = queue.filter((i) => i.status === "done").length;

  return (
    <div className="overflow-y-auto flex flex-col bg-[#101010]">
      {/* Gallery area */}
      <div className="flex-1 p-5">
        <div className="flex items-center justify-between mb-4">
          <div
            style={{ fontFamily: font.display }}
            className="text-[13px] font-bold tracking-[2px] uppercase text-[#666]"
          >
            Production Queue
          </div>
        </div>

        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[320px] opacity-20">
            <div className="grid grid-cols-3 grid-rows-2 gap-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[60px] h-[60px] border border-[#333] rounded"
                />
              ))}
            </div>
            <div
              style={{ fontFamily: font.mono }}
              className="text-[11px] text-[#666] tracking-[2px] uppercase mt-3"
            >
              Queue is empty
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
            {[...queue].reverse().map((item) => (
              <StadiumCard
                key={item.id}
                item={item}
                model={model}
                onDownload={onDownload}
                onRegen={onRegen}
                onRemove={onRemove}
                onMockupGenerated={onMockupGenerated}
              />
            ))}
          </div>
        )}
      </div>

      {/* Run bar */}
      <div className="px-4 py-3 border-t border-[#272727] flex flex-col gap-2 bg-[#161616]">
        <button
          onClick={isRunning ? onStop : onRun}
          disabled={!isRunning && queuedCount === 0}
          style={{ fontFamily: font.display }}
          className="bg-white text-[#0a0a0a] border-none py-3 rounded-[6px] text-[18px] font-extrabold tracking-[3px] cursor-pointer uppercase transition-all w-full hover:bg-[#e0e0e0] disabled:bg-[#2a2a2a] disabled:text-[#555] disabled:cursor-not-allowed"
        >
          {isRunning ? "■ Stop" : `Run All (${queuedCount})`}
        </button>
        {doneCount > 0 && (
          <button
            onClick={onDownloadAll}
            style={{ fontFamily: font.mono }}
            className="bg-transparent border border-[#333] text-[#666] px-3.5 py-1.5 rounded text-[10px] tracking-[1px] cursor-pointer uppercase transition-all hover:border-[#a3e635] hover:text-[#a3e635]"
          >
            ↓ Download All
          </button>
        )}
      </div>
    </div>
  );
}
