import { useState, useCallback, useRef } from "react";
import { CampaignBar } from "./CampaignBar";
import { AddPanel } from "./AddPanel";
import { GalleryGrid } from "./GalleryGrid";
import type { QueueItem, StyleKey } from "../../lib/stadium-forge/types";

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function ForgePage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentStyle, setCurrentStyle] = useState<StyleKey>("bauhaus");
  const [model, setModel] = useState("gemini-3.1-flash-image-preview");
  const [resolution, setResolution] = useState("2K");
  const [ratio, setRatio] = useState("3:4");
  const [isRunning, setIsRunning] = useState(false);
  const stopRef = useRef(false);

  const statDone = queue.filter((i) => i.status === "done").length;
  const statQueued = queue.filter((i) => i.status === "queued").length;
  const statGen = queue.filter((i) => i.status === "generating").length;

  const handleAdd = useCallback(
    (item: Omit<QueueItem, "id">) => {
      setQueue((prev) => [...prev, { ...item, id: uid() }]);
    },
    [],
  );

  const handleRemove = useCallback((id: string) => {
    setQueue((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const handleRegen = useCallback((id: string) => {
    setQueue((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: "queued" as const, result: null, error: null }
          : i,
      ),
    );
  }, []);

  const handleDownload = useCallback((item: QueueItem) => {
    if (!item.result) return;
    const a = document.createElement("a");
    a.href = item.result;
    a.download = `${item.stadiumName}.png`
      .toLowerCase()
      .replace(/[\s']+/g, "-");
    a.click();
  }, []);

  const handleDownloadAll = useCallback(() => {
    queue
      .filter((i) => i.status === "done" && i.result)
      .forEach((item) => {
        const a = document.createElement("a");
        a.href = item.result!;
        a.download = `${item.stadiumName}.png`
          .toLowerCase()
          .replace(/[\s']+/g, "-");
        a.click();
      });
  }, [queue]);

  const handleUpscaled = useCallback(
    (id: string, imageDataUri: string, newResolution: string) => {
      setQueue((prev) =>
        prev.map((i) =>
          i.id === id
            ? { ...i, result: imageDataUri, resolution: newResolution }
            : i,
        ),
      );
    },
    [],
  );

  const handleMockupGenerated = useCallback(
    (id: string, mockupType: string, imageUrl: string) => {
      setQueue((prev) =>
        prev.map((i) =>
          i.id === id
            ? { ...i, mockups: { ...i.mockups, [mockupType]: imageUrl } }
            : i,
        ),
      );
    },
    [],
  );

  const generateOne = useCallback(
    async (item: QueueItem) => {
      // Mark as generating
      setQueue((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, status: "generating" as const } : i,
        ),
      );

      try {
        const res = await fetch("/api/forge/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stadiumName: item.stadiumName,
            clubName: item.clubName,
            city: item.city,
            year: item.year,
            coords: item.coords,
            primaryColor: item.primaryColor,
            accentColor: item.accentColor,
            style: currentStyle,
            ratio: item.ratio,
            resolution: item.resolution,
            model,
            refImageBase64: item.refImage?.base64,
            refImageMimeType: item.refImage?.mimeType,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            (data as { error?: string }).error || `Error ${res.status}`,
          );
        }

        const data = (await res.json()) as {
          imageDataUri: string;
          storageUrl: string | null;
        };

        setQueue((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, status: "done" as const, result: data.imageDataUri }
              : i,
          ),
        );
      } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error";
        setQueue((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, status: "error" as const, error: message }
              : i,
          ),
        );
      }
    },
    [currentStyle, model],
  );

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    stopRef.current = false;

    // Snapshot items to run
    const toRun = queue.filter(
      (i) => i.status === "queued" || i.status === "error",
    );

    for (const item of toRun) {
      if (stopRef.current) break;
      await generateOne(item);
    }

    setIsRunning(false);
  }, [queue, generateOne]);

  const handleStop = useCallback(() => {
    stopRef.current = true;
    setIsRunning(false);
  }, []);

  return (
    <>
      <CampaignBar
        currentStyle={currentStyle}
        onStyleChange={setCurrentStyle}
        model={model}
        onModelChange={setModel}
        resolution={resolution}
        onResolutionChange={setResolution}
        ratio={ratio}
        onRatioChange={setRatio}
        statDone={statDone}
        statQueued={statQueued}
        statGen={statGen}
      />
      <div
        className="grid h-[calc(100vh-52px)]"
        style={{ gridTemplateColumns: "340px 1fr" }}
      >
        <AddPanel ratio={ratio} resolution={resolution} onAdd={handleAdd} />
        <GalleryGrid
          queue={queue}
          model={model}
          isRunning={isRunning}
          onRun={handleRun}
          onStop={handleStop}
          onDownload={handleDownload}
          onDownloadAll={handleDownloadAll}
          onRegen={handleRegen}
          onRemove={handleRemove}
          onUpscaled={handleUpscaled}
          onMockupGenerated={handleMockupGenerated}
        />
      </div>
    </>
  );
}
