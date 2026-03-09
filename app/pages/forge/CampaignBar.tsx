import { STYLES } from "../../lib/stadium-forge/styles";
import type { StyleKey } from "../../lib/stadium-forge/types";

interface CampaignBarProps {
  currentStyle: StyleKey;
  onStyleChange: (style: StyleKey) => void;
  model: string;
  onModelChange: (model: string) => void;
  resolution: string;
  onResolutionChange: (res: string) => void;
  ratio: string;
  onRatioChange: (ratio: string) => void;
  statDone: number;
  statQueued: number;
  statGen: number;
}

const font = {
  display: "'Barlow Condensed', sans-serif",
  mono: "'IBM Plex Mono', monospace",
  body: "'Barlow', sans-serif",
};

export function CampaignBar({
  currentStyle,
  onStyleChange,
  model,
  onModelChange,
  resolution,
  onResolutionChange,
  ratio,
  onRatioChange,
  statDone,
  statQueued,
  statGen,
}: CampaignBarProps) {
  return (
    <div className="flex items-center h-[52px] border-b border-[#272727] bg-[#161616] sticky top-0 z-50 overflow-x-auto">
      {/* Brand */}
      <div className="px-5 border-r border-[#272727] h-full flex items-center gap-2.5 shrink-0">
        <div>
          <div
            style={{ fontFamily: font.display }}
            className="text-xl font-extrabold tracking-[2px] text-white"
          >
            Stadium Forge
          </div>
          <div
            style={{ fontFamily: font.mono }}
            className="text-[9px] text-[#a3e635] tracking-[1px]"
          >
            CAMPAIGN MODE
          </div>
        </div>
      </div>

      {/* Style pills */}
      <div className="flex items-center h-full px-4 border-r border-[#272727] gap-2.5 shrink-0">
        <span
          style={{ fontFamily: font.mono }}
          className="text-[9px] text-[#666] tracking-[1px] uppercase whitespace-nowrap"
        >
          Style
        </span>
        <div className="flex flex-wrap gap-[5px]">
          {(Object.entries(STYLES) as [StyleKey, (typeof STYLES)[StyleKey]][]).map(
            ([key, style]) => (
              <button
                key={key}
                onClick={() => onStyleChange(key)}
                style={{ fontFamily: font.mono }}
                className={`px-3 py-1 rounded text-[10px] cursor-pointer transition-all whitespace-nowrap border ${
                  key === currentStyle
                    ? "border-[#a3e635] text-[#a3e635] bg-[#1e2e10]"
                    : "border-[#333] text-[#666] bg-[#101010] hover:border-[#444] hover:text-[#ccc]"
                }`}
              >
                {style.label}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Model */}
      <div className="flex items-center h-full px-4 border-r border-[#272727] gap-2.5 shrink-0">
        <span
          style={{ fontFamily: font.mono }}
          className="text-[9px] text-[#666] tracking-[1px] uppercase whitespace-nowrap"
        >
          Model
        </span>
        <select
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          style={{ fontFamily: font.mono }}
          className="bg-[#101010] border border-[#333] text-[#e0dbd4] px-2.5 py-[5px] rounded text-[11px] outline-none focus:border-[#a3e635] max-w-[260px]"
        >
          <option value="gemini-2.0-flash-preview-image-generation">
            Flash Preview
          </option>
          <option value="gemini-2.0-flash-exp">Flash Exp</option>
          <option value="gemini-3.1-flash-image-preview">Nano Banana 2</option>
          <option value="gemini-3-pro-image-preview">Nano Banana Pro</option>
        </select>
      </div>

      {/* Resolution */}
      <div className="flex items-center h-full px-4 border-r border-[#272727] gap-2.5 shrink-0">
        <span
          style={{ fontFamily: font.mono }}
          className="text-[9px] text-[#666] tracking-[1px] uppercase whitespace-nowrap"
        >
          Resolution
        </span>
        <select
          value={resolution}
          onChange={(e) => onResolutionChange(e.target.value)}
          style={{ fontFamily: font.mono }}
          className="bg-[#101010] border border-[#333] text-[#e0dbd4] px-2.5 py-[5px] rounded text-[11px] outline-none focus:border-[#a3e635]"
        >
          <option value="1K">1K · Draft</option>
          <option value="2K">2K · Proof</option>
          <option value="4K">4K · Print</option>
        </select>
      </div>

      {/* Ratio */}
      <div className="flex items-center h-full px-4 border-r border-[#272727] gap-2.5 shrink-0">
        <span
          style={{ fontFamily: font.mono }}
          className="text-[9px] text-[#666] tracking-[1px] uppercase whitespace-nowrap"
        >
          Ratio
        </span>
        <select
          value={ratio}
          onChange={(e) => onRatioChange(e.target.value)}
          style={{ fontFamily: font.mono }}
          className="bg-[#101010] border border-[#333] text-[#e0dbd4] px-2.5 py-[5px] rounded text-[11px] outline-none focus:border-[#a3e635]"
        >
          <option value="3:4">3:4 · Poster</option>
          <option value="2:3">2:3 · Tall</option>
          <option value="4:5">4:5 · Frame</option>
          <option value="1:1">1:1 · Square</option>
          <option value="9:16">9:16 · Phone</option>
        </select>
      </div>

      {/* Stats */}
      <div className="ml-auto px-5 flex items-center gap-4 shrink-0">
        <div style={{ fontFamily: font.mono }} className="text-[10px] text-[#666]">
          Done <span className="text-[#e0dbd4] font-medium">{statDone}</span>
        </div>
        <div style={{ fontFamily: font.mono }} className="text-[10px] text-[#666]">
          Queued <span className="text-[#e0dbd4] font-medium">{statQueued}</span>
        </div>
        {statGen > 0 && (
          <div
            style={{ fontFamily: font.mono }}
            className="text-[10px] text-[#7dd3fc]"
          >
            Generating{" "}
            <span className="text-[#e0dbd4] font-medium">{statGen}</span>
          </div>
        )}
      </div>
    </div>
  );
}
