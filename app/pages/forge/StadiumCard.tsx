import { useState } from "react";
import { MOCKUP_TYPES } from "../../lib/stadium-forge/styles";
import type { QueueItem, MockupType } from "../../lib/stadium-forge/types";

interface StadiumCardProps {
  item: QueueItem;
  model: string;
  onDownload: (item: QueueItem) => void;
  onRegen: (id: string) => void;
  onRemove: (id: string) => void;
  onUpscaled: (id: string, imageDataUri: string, resolution: string) => void;
  onMockupGenerated: (
    id: string,
    mockupType: string,
    imageUrl: string,
  ) => void;
}

const font = {
  display: "'Barlow Condensed', sans-serif",
  mono: "'IBM Plex Mono', monospace",
};

const STATUS_BADGE: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  queued: { bg: "bg-[#1e1e1e]", text: "text-[#888]", label: "Queued" },
  generating: { bg: "bg-[#0a1a2a]", text: "text-[#7dd3fc]", label: "Generating…" },
  done: { bg: "bg-[#1e2e10]", text: "text-[#a3e635]", label: "Done" },
  error: { bg: "bg-[#1a0a0a]", text: "text-[#f87171]", label: "Error" },
};

export function StadiumCard({
  item,
  model,
  onDownload,
  onRegen,
  onRemove,
  onUpscaled,
  onMockupGenerated,
}: StadiumCardProps) {
  const [loadingMockup, setLoadingMockup] = useState<string | null>(null);
  const [upscaling, setUpscaling] = useState(false);

  const [rw, rh] = (item.ratio || "3:4").split(":").map(Number);
  const badge = STATUS_BADGE[item.status] || STATUS_BADGE.queued;

  const handleMockup = async (type: MockupType) => {
    if (!item.result || loadingMockup) return;
    setLoadingMockup(type);

    try {
      const posterBase64 = item.result.split(",")[1];
      const res = await fetch("/api/forge/mockup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          posterBase64,
          mockupType: type,
          stadiumName: item.stadiumName,
          model,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error || `Error ${res.status}`,
        );
      }

      const data = (await res.json()) as { imageDataUri: string };
      onMockupGenerated(item.id, type, data.imageDataUri);
    } catch (e) {
      console.error("[StadiumForge] Mockup error:", e);
    } finally {
      setLoadingMockup(null);
    }
  };

  const handleUpscale = async (targetRes: string) => {
    if (!item.result || upscaling) return;
    setUpscaling(true);

    try {
      const imageBase64 = item.result.split(",")[1];
      const res = await fetch("/api/forge/upscale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          stadiumName: item.stadiumName,
          ratio: item.ratio,
          targetResolution: targetRes,
          model,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error || `Error ${res.status}`,
        );
      }

      const data = (await res.json()) as { imageDataUri: string };
      onUpscaled(item.id, data.imageDataUri, targetRes);
    } catch (e) {
      console.error("[StadiumForge] Upscale error:", e);
    } finally {
      setUpscaling(false);
    }
  };

  const downloadUrl = (url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
  };

  return (
    <div
      className={`bg-[#161616] border rounded-lg overflow-hidden transition-colors ${
        item.status === "done"
          ? "border-[#1e2e10]"
          : item.status === "error"
            ? "border-[#2a1010]"
            : item.status === "generating"
              ? "border-[#1a2a3a]"
              : "border-[#272727] hover:border-[#333]"
      }`}
    >
      {/* Preview */}
      <div
        className="relative bg-[#101010] overflow-hidden flex items-center justify-center"
        style={{ aspectRatio: `${rw}/${rh}` }}
      >
        {item.result ? (
          <img
            src={item.result}
            alt={item.stadiumName}
            className="w-full h-full object-cover block"
          />
        ) : item.refPreview ? (
          <img
            src={item.refPreview}
            alt="ref"
            className="w-full h-full object-cover block opacity-30 grayscale"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full opacity-20">
            <svg width="48" height="34" viewBox="0 0 48 34" fill="none">
              <rect x="1" y="1" width="46" height="32" rx="1" stroke="#2a2a2a" strokeWidth="1.5" />
              <line x1="24" y1="1" x2="24" y2="33" stroke="#2a2a2a" strokeWidth="1" />
              <circle cx="24" cy="17" r="6" stroke="#2a2a2a" strokeWidth="1" />
            </svg>
          </div>
        )}
        {item.status === "generating" && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="w-7 h-7 border-2 border-white/10 border-t-[#a3e635] rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-3 py-2.5 flex flex-col gap-1.5">
        <div
          style={{ fontFamily: font.display }}
          className="text-sm font-bold text-white truncate"
        >
          {item.stadiumName}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#666]">
            {item.clubName}
            {item.city &&
              item.city.toLowerCase() !== (item.clubName || "").toLowerCase() &&
              ` · ${item.city}`}
          </span>
          <div className="flex items-center gap-1.5">
            <span
              style={{ fontFamily: font.mono }}
              className="text-[9px] text-[#666]"
            >
              {item.resolution || "2K"} {item.ratio || "3:4"}
            </span>
            <div className="flex gap-[3px]">
              <span
                className="inline-block w-2 h-2 rounded-full border border-white/10"
                style={{ background: item.primaryColor }}
              />
              <span
                className="inline-block w-2 h-2 rounded-full border border-white/10"
                style={{ background: item.accentColor }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <span
            style={{ fontFamily: font.mono }}
            className={`text-[9px] tracking-[1px] uppercase px-[7px] py-[2px] rounded font-medium ${badge.bg} ${badge.text}`}
          >
            {badge.label}
          </span>
          {item.status === "done" && (
            <button
              onClick={() => onDownload(item)}
              className="border-none rounded w-6 h-6 text-[13px] cursor-pointer flex items-center justify-center transition-all bg-[#1e2e10] text-[#a3e635] hover:bg-[#a3e635] hover:text-black"
            >
              ↓
            </button>
          )}
          {item.status === "done" && item.resolution !== "4K" && (
            <button
              onClick={() => handleUpscale("4K")}
              disabled={upscaling}
              title="Upscale to 4K"
              style={{ fontFamily: font.mono }}
              className={`border-none rounded h-6 px-1.5 text-[9px] cursor-pointer flex items-center justify-center transition-all tracking-[0.5px] ${
                upscaling
                  ? "bg-[#0a1a2a] text-[#7dd3fc] opacity-60 pointer-events-none"
                  : "bg-[#1a1a2e] text-[#8888cc] hover:bg-[#2a2a4a] hover:text-[#aaaaee]"
              }`}
            >
              {upscaling ? "⏳" : "4K↑"}
            </button>
          )}
          {(item.status === "done" || item.status === "error") && (
            <button
              onClick={() => onRegen(item.id)}
              className="border-none rounded w-6 h-6 text-[13px] cursor-pointer flex items-center justify-center transition-all bg-[#1e1e1e] text-[#888] hover:bg-[#2a2a2a] hover:text-[#ccc]"
            >
              ↺
            </button>
          )}
          {item.status === "queued" && (
            <button
              onClick={() => onRemove(item.id)}
              className="border-none rounded w-6 h-6 text-[13px] cursor-pointer flex items-center justify-center transition-all bg-[#1e1e1e] text-[#555] hover:bg-[#2a1010] hover:text-[#f87171]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Error message */}
        {item.error && (
          <div
            style={{ fontFamily: font.mono }}
            className="text-[9px] text-[#f87171] leading-relaxed border-t border-[#2a1010] pt-1.5"
          >
            {item.error}
          </div>
        )}

        {/* Mockup bar */}
        {item.status === "done" && (
          <>
            <div className="flex gap-1 flex-wrap">
              {(
                Object.entries(MOCKUP_TYPES) as [
                  MockupType,
                  (typeof MOCKUP_TYPES)[MockupType],
                ][]
              ).map(([type, def]) => (
                <button
                  key={type}
                  onClick={() => handleMockup(type)}
                  disabled={loadingMockup !== null}
                  style={{ fontFamily: font.mono }}
                  className={`bg-[#1a1a2e] border border-[#2a2a4a] text-[#8888cc] px-2 py-[3px] rounded text-[9px] cursor-pointer transition-all tracking-[0.5px] hover:border-[#6666aa] hover:text-[#aaaaee] ${
                    loadingMockup === type
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }`}
                >
                  {loadingMockup === type ? "⏳" : def.label}
                </button>
              ))}
            </div>

            {/* Mockup thumbnails */}
            {Object.keys(item.mockups).length > 0 && (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-1.5 mt-1.5">
                {Object.entries(item.mockups).map(([type, url]) => (
                  <div
                    key={type}
                    className="rounded overflow-hidden cursor-pointer border border-[#272727] transition-colors hover:border-[#a3e635] relative"
                    style={{ aspectRatio: "4/3" }}
                    onClick={() =>
                      downloadUrl(
                        url,
                        `${item.stadiumName}-${type}.png`
                          .toLowerCase()
                          .replace(/[\s']+/g, "-"),
                      )
                    }
                  >
                    <img
                      src={url}
                      alt={type}
                      className="w-full h-full object-cover block"
                    />
                    <div
                      style={{ fontFamily: font.mono }}
                      className="text-[8px] text-[#666] px-1.5 py-[3px] bg-[#1c1c1c] uppercase tracking-[0.5px]"
                    >
                      {MOCKUP_TYPES[type as MockupType]?.label || type}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
