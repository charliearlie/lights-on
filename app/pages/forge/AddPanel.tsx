import { useState, useRef, useCallback } from "react";
import { CLUBS } from "../../lib/stadium-forge/clubs";
import { fmtCoord } from "../../lib/stadium-forge/prompts";
import type { QueueItem, Club } from "../../lib/stadium-forge/types";

interface AddPanelProps {
  ratio: string;
  resolution: string;
  onAdd: (item: Omit<QueueItem, "id">) => void;
}

const font = {
  display: "'Barlow Condensed', sans-serif",
  mono: "'IBM Plex Mono', monospace",
  body: "'Barlow', sans-serif",
};

export function AddPanel({ ratio, resolution, onAdd }: AddPanelProps) {
  const [clubSearch, setClubSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [stadiumName, setStadiumName] = useState("");
  const [clubName, setClubName] = useState("");
  const [city, setCity] = useState("");
  const [year, setYear] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#C8102E");
  const [accentColor, setAccentColor] = useState("#F6EB61");
  const [refImage, setRefImage] = useState<{
    base64: string;
    mimeType: string;
  } | null>(null);
  const [refPreview, setRefPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const filtered = CLUBS.filter(
    (c) =>
      clubSearch &&
      (c.name.toLowerCase().includes(clubSearch.toLowerCase()) ||
        c.stadium.toLowerCase().includes(clubSearch.toLowerCase())),
  );

  const fillFromClub = useCallback((club: Club) => {
    setStadiumName(club.stadium);
    setClubName(club.name);
    setCity(club.city);
    setYear(club.year);
    setLat(club.lat);
    setLon(club.lon);
    setPrimaryColor(club.p);
    setAccentColor(club.a);
    setClubSearch(club.name);
    setDropdownOpen(false);
  }, []);

  const handleFile = useCallback((file: File) => {
    if (!file?.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setRefPreview(dataUrl);
      setRefImage({
        base64: dataUrl.split(",")[1],
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleAdd = () => {
    if (!stadiumName.trim()) return;
    onAdd({
      stadiumName: stadiumName.trim(),
      clubName: clubName.trim(),
      city: city.trim(),
      year: year.trim(),
      coords: fmtCoord(lat, lon),
      primaryColor,
      accentColor,
      ratio,
      resolution,
      refImage,
      refPreview,
      status: "queued",
      result: null,
      error: null,
      mockups: {},
    });
    // Reset form
    setStadiumName("");
    setClubName("");
    setClubSearch("");
    setCity("");
    setYear("");
    setLat("");
    setLon("");
    setRefImage(null);
    setRefPreview(null);
  };

  const inputClass =
    "bg-[#101010] border border-[#333] text-[#e0dbd4] px-2.5 py-2 rounded-[5px] text-[13px] outline-none w-full focus:border-[#a3e635]";
  const inputSmClass =
    "bg-[#101010] border border-[#333] text-[#e0dbd4] px-2.5 py-1.5 rounded-[5px] text-[12px] outline-none w-full focus:border-[#a3e635]";
  const labelClass =
    "text-[9px] text-[#666] tracking-[1px] uppercase";

  return (
    <div className="border-r border-[#272727] flex flex-col overflow-y-auto bg-[#161616]">
      {/* Header */}
      <div className="px-4 pt-3.5 pb-2.5 border-b border-[#272727] flex items-baseline gap-2">
        <div
          style={{ fontFamily: font.display }}
          className="text-[15px] font-bold tracking-[2px] uppercase text-white"
        >
          Add Stadium
        </div>
        <div style={{ fontFamily: font.mono }} className="text-[9px] text-[#666]">
          One at a time
        </div>
      </div>

      {/* Form */}
      <div className="px-4 py-3.5 flex flex-col gap-3 flex-1" style={{ fontFamily: font.body }}>
        {/* Club search */}
        <div className="flex flex-col gap-[5px]">
          <label style={{ fontFamily: font.mono }} className={labelClass}>
            Quick-fill from club
          </label>
          <div className="relative">
            <input
              className={inputClass}
              value={clubSearch}
              onChange={(e) => {
                setClubSearch(e.target.value);
                setDropdownOpen(true);
              }}
              onFocus={() => setDropdownOpen(true)}
              onBlur={() => {
                blurTimeoutRef.current = setTimeout(
                  () => setDropdownOpen(false),
                  150,
                );
              }}
              placeholder="Search Premier League clubs…"
              autoComplete="off"
            />
            {dropdownOpen && filtered.length > 0 && (
              <div className="absolute top-[calc(100%+2px)] left-0 right-0 bg-[#1c1c1c] border border-[#333] rounded-[5px] z-[100] max-h-[200px] overflow-y-auto">
                {filtered.map((club) => (
                  <div
                    key={club.name}
                    className="flex items-center gap-2.5 px-3 py-2 cursor-pointer text-[12px] border-b border-[#272727] last:border-b-0 hover:bg-[#272727]"
                    onMouseDown={() => {
                      clearTimeout(blurTimeoutRef.current);
                      fillFromClub(club);
                    }}
                  >
                    <div className="flex gap-[3px]">
                      <div
                        className="w-2.5 h-2.5 rounded-full border border-white/10"
                        style={{ background: club.p }}
                      />
                      <div
                        className="w-2.5 h-2.5 rounded-full border border-white/10"
                        style={{ background: club.a }}
                      />
                    </div>
                    <div>
                      <div className="font-medium text-[12px]">{club.name}</div>
                      <div className="text-[10px] text-[#666]">
                        {club.stadium} · {club.city}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stadium name */}
        <div className="flex flex-col gap-[5px]">
          <label style={{ fontFamily: font.mono }} className={labelClass}>
            Stadium name
          </label>
          <input
            className={inputClass}
            value={stadiumName}
            onChange={(e) => setStadiumName(e.target.value)}
            placeholder="Anfield"
          />
        </div>

        {/* Club + City row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-[5px]">
            <label style={{ fontFamily: font.mono }} className={labelClass}>
              Club name
            </label>
            <input
              className={inputSmClass}
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              placeholder="Liverpool"
            />
          </div>
          <div className="flex flex-col gap-[5px]">
            <label style={{ fontFamily: font.mono }} className={labelClass}>
              City
            </label>
            <input
              className={inputSmClass}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Liverpool"
            />
          </div>
        </div>

        {/* Year + Lat + Lon row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col gap-[5px]">
            <label style={{ fontFamily: font.mono }} className={labelClass}>
              Year opened
            </label>
            <input
              className={inputSmClass}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="1884"
            />
          </div>
          <div className="flex flex-col gap-[5px]">
            <label style={{ fontFamily: font.mono }} className={labelClass}>
              Lat
            </label>
            <input
              className={inputSmClass}
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="53.4308"
            />
          </div>
          <div className="flex flex-col gap-[5px]">
            <label style={{ fontFamily: font.mono }} className={labelClass}>
              Lon
            </label>
            <input
              className={inputSmClass}
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              placeholder="-2.9609"
            />
          </div>
        </div>

        {/* Colours */}
        <div className="flex flex-col gap-[5px]">
          <label style={{ fontFamily: font.mono }} className={labelClass}>
            Colours
          </label>
          <div className="grid grid-cols-2 gap-2">
            <ColorField
              label="PRI"
              color={primaryColor}
              onChange={setPrimaryColor}
            />
            <ColorField
              label="ACC"
              color={accentColor}
              onChange={setAccentColor}
            />
          </div>
        </div>

        {/* Reference image */}
        <div className="flex flex-col gap-[5px]">
          <label style={{ fontFamily: font.mono }} className={labelClass}>
            Satellite footprint
          </label>
          <div
            className={`border-[1.5px] border-dashed rounded-[6px] cursor-pointer overflow-hidden transition-colors min-h-[100px] flex items-center justify-center flex-col gap-1.5 ${
              refPreview
                ? "border-[#333] bg-[#101010]"
                : "border-[#333] bg-[#101010] hover:border-[#a3e635] hover:bg-[#1e2e10]"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add("border-[#a3e635]", "bg-[#1e2e10]");
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove(
                "border-[#a3e635]",
                "bg-[#1e2e10]",
              );
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove(
                "border-[#a3e635]",
                "bg-[#1e2e10]",
              );
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
          >
            {refPreview ? (
              <img
                src={refPreview}
                alt="ref"
                className="w-full h-[120px] object-cover block"
              />
            ) : (
              <>
                <span className="text-[22px]">🛰</span>
                <span className="text-[11px] text-[#666] text-center leading-relaxed px-4">
                  Drop Google Maps screenshot
                  <br />
                  or click to upload
                </span>
              </>
            )}
          </div>
          {refPreview && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRefImage(null);
                setRefPreview(null);
              }}
              style={{ fontFamily: font.mono }}
              className="bg-transparent border-none text-[#666] text-[11px] cursor-pointer text-left mt-[3px]"
            >
              × remove image
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>

        {/* Add button */}
        <button
          onClick={handleAdd}
          disabled={!stadiumName.trim()}
          style={{ fontFamily: font.display }}
          className="bg-[#a3e635] text-[#0a0a0a] border-none py-[11px] rounded-[6px] text-[16px] font-bold tracking-[2px] cursor-pointer uppercase transition-all w-full hover:bg-[#bef264] disabled:bg-[#1e2e10] disabled:text-[#3a5a1a] disabled:cursor-not-allowed"
        >
          + Add to Queue
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Colour picker sub-component
// ---------------------------------------------------------------------------

function ColorField({
  label,
  color,
  onChange,
}: {
  label: string;
  color: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="bg-[#101010] border border-[#333] rounded-[5px] px-2.5 py-1.5 flex items-center gap-2">
      <div className="w-[22px] h-[22px] rounded shrink-0 border border-white/10 relative overflow-hidden cursor-pointer">
        <div
          className="absolute inset-0"
          style={{ background: color }}
        />
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </div>
      <input
        value={color}
        onChange={(e) => {
          if (/^#[0-9a-f]{6}$/i.test(e.target.value)) {
            onChange(e.target.value);
          }
        }}
        maxLength={7}
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        className="bg-transparent border-none outline-none text-[#e0dbd4] text-[11px] w-[60px]"
      />
      <span
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        className="text-[9px] text-[#666]"
      >
        {label}
      </span>
    </div>
  );
}
