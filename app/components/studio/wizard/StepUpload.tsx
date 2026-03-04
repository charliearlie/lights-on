import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface StepUploadProps {
  files: File[];
  sendLater: boolean;
  onFilesChange: (files: File[]) => void;
  onSendLaterChange: (sendLater: boolean) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function StepUpload({
  files,
  sendLater,
  onFilesChange,
  onSendLaterChange,
  onBack,
  onContinue,
}: StepUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const canContinue = sendLater || files.length > 0;

  // Create stable object URLs for previews, revoke on cleanup
  const previewUrls = useMemo(
    () => files.map((f) => URL.createObjectURL(f)),
    [files],
  );
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const arr = Array.from(newFiles).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (arr.length > 0) {
        onFilesChange([...files, ...arr]);
      }
    },
    [files, onFilesChange],
  );

  const removeFile = useCallback(
    (index: number) => {
      onFilesChange(files.filter((_, i) => i !== index));
    },
    [files, onFilesChange],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles],
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
        // Reset input so the same file can be added again
        e.target.value = "";
      }
    },
    [addFiles],
  );

  return (
    <div>
      <p className="mb-2 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
        Step 3
      </p>
      <h2 className="font-display text-[2rem] italic text-[#1C1917] dark:text-[#F5F0E8]">
        Upload your product images
      </h2>

      {/* Drop zone */}
      <div className="mt-8">
        <button
          type="button"
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          disabled={sendLater}
          className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors duration-300 ${
            sendLater
              ? "cursor-not-allowed border-border-light/50 bg-surface-light/50 opacity-50 dark:border-border-dark/50 dark:bg-card-dark/50"
              : isDragOver
                ? "border-ikea-blue bg-ikea-blue/5 dark:border-amber-glow dark:bg-amber-glow/5"
                : "border-border-light bg-transparent hover:border-[#78716C]/40 dark:border-border-dark dark:hover:border-[#78716C]/40"
          }`}
        >
          {/* Cloud upload icon */}
          <svg
            className="mb-3 h-10 w-10 text-[#78716C] dark:text-[#A8A097]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 3.75 3.75 0 013.572 5.345A3.002 3.002 0 0118 19.5H6.75z"
            />
          </svg>
          <p className="text-sm font-medium text-[#44403C] dark:text-[#C4BAB0]">
            Drag & drop images here or click to browse
          </p>
          <p className="mt-1 text-xs text-[#78716C] dark:text-[#A8A097]">
            PNG, JPG, WebP accepted
          </p>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Thumbnail grid */}
      {files.length > 0 && (
        <div className="mt-6 grid grid-cols-4 gap-3">
          {files.map((file, i) => (
            <div key={`${file.name}-${i}`} className="group relative">
              <div className="aspect-square overflow-hidden rounded-lg border border-border-light dark:border-border-dark">
                <img
                  src={previewUrls[i]}
                  alt={file.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label={`Remove ${file.name}`}
              >
                &times;
              </button>
              <p className="mt-1 truncate text-[0.625rem] text-[#78716C] dark:text-[#A8A097]">
                {file.name}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Send later checkbox */}
      <label className="mt-6 flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={sendLater}
          onChange={(e) => onSendLaterChange(e.target.checked)}
          className="h-4 w-4 rounded border-border-light text-ikea-blue accent-ikea-blue dark:border-border-dark dark:accent-amber-glow"
        />
        <span className="text-sm text-[#44403C] dark:text-[#C4BAB0]">
          I'll send images later
        </span>
      </label>

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-border-light px-6 py-3 font-medium text-[#44403C] transition-colors hover:bg-surface-light dark:border-border-dark dark:text-[#C4BAB0] dark:hover:bg-card-dark"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          className="rounded-lg bg-ikea-blue px-6 py-3 font-medium text-white transition-colors hover:bg-ikea-blue/90 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-amber-glow dark:text-[#1C1917] dark:hover:bg-amber-glow/90"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
