import { useState, useRef, useCallback, useEffect } from "react";
import { Link, redirect, useFetcher } from "react-router";
import type { Route } from "./+types/app.project.$id";
import { createSupabaseServerClient } from "../services/supabase.ssr.server";
import { getSupabaseAdmin } from "../services/supabase.server";
import { useDarkMode } from "../context/dark-mode";
import {
  ImageToggle,
  type ImageState,
  type TransitionType,
  type TriggerType,
} from "../components/image-toggle/ImageToggle";
import { ErrorBanner } from "../components/ErrorBanner";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ImageStateRow {
  id: string;
  product_name: string;
  sort_order: number;
  states: Array<{ label: string; image_url: string }>;
  created_at: string;
}

interface Project {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  settings: {
    transitionType?: TransitionType;
    triggerType?: TriggerType;
  } | null;
  is_public: boolean;
  image_states: ImageStateRow[];
}

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

export async function loader({ request, params }: Route.LoaderArgs) {
  const responseHeaders = new Headers();
  const supabase = createSupabaseServerClient(request, responseHeaders);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const { data: project, error } = await supabase
    .from("projects")
    .select(
      "*, image_states(id, product_name, sort_order, states, created_at)",
    )
    .eq("id", params.id)
    .eq("user_id", user.id)
    .order("sort_order", { referencedTable: "image_states", ascending: true })
    .single();

  if (error || !project) {
    throw new Response("Project not found", { status: 404 });
  }

  return Response.json({ project }, { headers: responseHeaders });
}

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

export async function action({ request, params }: Route.ActionArgs) {
  const responseHeaders = new Headers();
  const supabase = createSupabaseServerClient(request, responseHeaders);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401, headers: responseHeaders },
    );
  }

  const formData = await request.formData();
  const intent = formData.get("_action") as string;

  switch (intent) {
    case "update-name": {
      const name = formData.get("name") as string;
      if (!name?.trim()) {
        return Response.json(
          { error: "Name is required" },
          { status: 400, headers: responseHeaders },
        );
      }
      const { error } = await supabase
        .from("projects")
        .update({ name: name.trim() })
        .eq("id", params.id)
        .eq("user_id", user.id);

      if (error) {
        return Response.json(
          { error: "Failed to update name" },
          { status: 500, headers: responseHeaders },
        );
      }
      return Response.json({ ok: true }, { headers: responseHeaders });
    }

    case "toggle-public": {
      const isPublic = formData.get("is_public") === "true";
      const { error } = await supabase
        .from("projects")
        .update({ is_public: isPublic })
        .eq("id", params.id)
        .eq("user_id", user.id);

      if (error) {
        return Response.json(
          { error: "Failed to update visibility" },
          { status: 500, headers: responseHeaders },
        );
      }
      return Response.json({ ok: true }, { headers: responseHeaders });
    }

    case "update-settings": {
      const transitionType = formData.get("transitionType") as string;
      const triggerType = formData.get("triggerType") as string;

      const VALID_TRANSITION_TYPES = ["crossfade", "slider", "flip"];
      const VALID_TRIGGER_TYPES = ["switch", "hover", "click"];

      if (transitionType && !VALID_TRANSITION_TYPES.includes(transitionType)) {
        return Response.json(
          { error: `Invalid transitionType. Must be one of: ${VALID_TRANSITION_TYPES.join(", ")}` },
          { status: 400, headers: responseHeaders },
        );
      }
      if (triggerType && !VALID_TRIGGER_TYPES.includes(triggerType)) {
        return Response.json(
          { error: `Invalid triggerType. Must be one of: ${VALID_TRIGGER_TYPES.join(", ")}` },
          { status: 400, headers: responseHeaders },
        );
      }

      const settings: Record<string, string> = {};
      if (transitionType) settings.transitionType = transitionType;
      if (triggerType) settings.triggerType = triggerType;

      const { error } = await supabase
        .from("projects")
        .update({ settings })
        .eq("id", params.id)
        .eq("user_id", user.id);

      if (error) {
        return Response.json(
          { error: "Failed to update settings" },
          { status: 500, headers: responseHeaders },
        );
      }
      return Response.json({ ok: true }, { headers: responseHeaders });
    }

    case "delete-project": {
      // Delete image states first (cascade may handle this, but be explicit)
      await supabase
        .from("image_states")
        .delete()
        .eq("project_id", params.id);

      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", params.id)
        .eq("user_id", user.id);

      if (error) {
        return Response.json(
          { error: "Failed to delete project" },
          { status: 500, headers: responseHeaders },
        );
      }
      return redirect("/app", { headers: responseHeaders });
    }

    case "delete-image-state": {
      const stateId = formData.get("stateId") as string;
      if (!stateId) {
        return Response.json(
          { error: "Missing state ID" },
          { status: 400, headers: responseHeaders },
        );
      }

      // Verify the project belongs to the authenticated user
      const { data: ownerCheck } = await supabase
        .from("projects")
        .select("id")
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single();

      if (!ownerCheck) {
        return Response.json(
          { error: "Project not found" },
          { status: 404, headers: responseHeaders },
        );
      }

      // Use admin client to delete (RLS may restrict direct deletes)
      const adminSupabase = getSupabaseAdmin();
      const { error } = await adminSupabase
        .from("image_states")
        .delete()
        .eq("id", stateId)
        .eq("project_id", params.id);

      if (error) {
        return Response.json(
          { error: "Failed to delete image state" },
          { status: 500, headers: responseHeaders },
        );
      }
      return Response.json({ ok: true }, { headers: responseHeaders });
    }

    default:
      return Response.json(
        { error: "Unknown action" },
        { status: 400, headers: responseHeaders },
      );
  }
}

// ---------------------------------------------------------------------------
// Transformation types
// ---------------------------------------------------------------------------

const TRANSFORMATION_TYPES = [
  { value: "lights-on", label: "Lights On" },
  { value: "lights-off", label: "Lights Off" },
  { value: "day-to-night", label: "Day to Night" },
  { value: "night-to-day", label: "Night to Day" },
  { value: "empty-to-staged", label: "Empty to Staged" },
  { value: "plain-to-lifestyle", label: "Plain to Lifestyle" },
] as const;

const TRANSITION_TYPES: TransitionType[] = ["crossfade", "slider", "flip"];
const TRIGGER_TYPES: TriggerType[] = ["switch", "hover", "click"];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProjectEditorPage({
  loaderData,
}: Route.ComponentProps) {
  const { project } = loaderData as { project: Project };

  const transitionType: TransitionType =
    project.settings?.transitionType ?? "crossfade";
  const triggerType: TriggerType = project.settings?.triggerType ?? "switch";

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      {/* Header section */}
      <ProjectHeader project={project} />

      {/* Upload + Transform wizard */}
      <TransformWizard projectId={project.id} />

      {/* Image states grid */}
      <ImageStatesGrid
        imageStates={project.image_states}
        transitionType={transitionType}
        triggerType={triggerType}
      />

      {/* Toggle configuration */}
      <ToggleConfiguration
        transitionType={transitionType}
        triggerType={triggerType}
      />

      {/* Embed code section */}
      <EmbedSection
        projectId={project.id}
        isPublic={project.is_public}
        transitionType={transitionType}
        triggerType={triggerType}
      />
    </main>
  );
}

// ---------------------------------------------------------------------------
// ProjectHeader
// ---------------------------------------------------------------------------

function ProjectHeader({ project }: { project: Project }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const nameFetcher = useFetcher();
  const publicFetcher = useFetcher();
  const deleteFetcher = useFetcher();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const saveName = useCallback(() => {
    setIsEditing(false);
    if (name.trim() && name.trim() !== project.name) {
      nameFetcher.submit(
        { _action: "update-name", name: name.trim() },
        { method: "post" },
      );
    } else {
      setName(project.name);
    }
  }, [name, project.name, nameFetcher]);

  return (
    <div className="mb-12">
      {/* Back link */}
      <Link
        to="/app"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#78716C] transition-colors hover:text-[#1C1917] dark:text-[#A8A097] dark:hover:text-[#F5F0E8]"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="shrink-0"
        >
          <path
            d="M10 12L6 8l4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to projects
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <p className="mb-2 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
            Project
          </p>

          {/* Editable name */}
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={saveName}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveName();
                if (e.key === "Escape") {
                  setName(project.name);
                  setIsEditing(false);
                }
              }}
              className="w-full max-w-lg rounded-lg border border-border-light bg-white px-3 py-1.5 font-display text-3xl italic text-[#1C1917] outline-none focus:border-ikea-blue dark:border-border-dark dark:bg-card-dark dark:text-[#F5F0E8] dark:focus:border-amber-glow"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="group flex items-center gap-2 text-left"
            >
              <h1 className="font-display text-3xl italic text-[#1C1917] dark:text-[#F5F0E8]">
                {project.name}
              </h1>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="shrink-0 text-[#78716C] opacity-0 transition-opacity group-hover:opacity-100 dark:text-[#A8A097]"
              >
                <path
                  d="M11.3 2.7a1 1 0 011.4 1.4L5.4 11.4l-2.8.7.7-2.8 7.3-7.3z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Public toggle */}
          <publicFetcher.Form method="post">
            <input type="hidden" name="_action" value="toggle-public" />
            <input
              type="hidden"
              name="is_public"
              value={String(!project.is_public)}
            />
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg border border-border-light px-3 py-2 text-xs font-medium transition-colors hover:bg-[#F5F0E8] dark:border-border-dark dark:hover:bg-[#292524]"
            >
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  project.is_public
                    ? "bg-green-500"
                    : "bg-[#78716C] dark:bg-[#A8A097]"
                }`}
              />
              <span className="text-[#1C1917] dark:text-[#F5F0E8]">
                {project.is_public ? "Public" : "Private"}
              </span>
            </button>
          </publicFetcher.Form>

          {/* Delete */}
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600 dark:text-red-400">
                Are you sure?
              </span>
              <deleteFetcher.Form method="post">
                <input type="hidden" name="_action" value="delete-project" />
                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
                >
                  Delete
                </button>
              </deleteFetcher.Form>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg border border-border-light px-3 py-2 text-xs font-medium text-[#1C1917] transition-colors hover:bg-[#F5F0E8] dark:border-border-dark dark:text-[#F5F0E8] dark:hover:bg-[#292524]"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TransformWizard
// ---------------------------------------------------------------------------

type WizardStep = "upload" | "review" | "transforming" | "preview";

const WIZARD_STEPS: { key: WizardStep; label: string }[] = [
  { key: "upload", label: "Upload" },
  { key: "review", label: "Prepare" },
  { key: "transforming", label: "Transform" },
  { key: "preview", label: "Save" },
];

function SpinnerIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
    </svg>
  );
}

function TransformWizard({ projectId }: { projectId: string }) {
  // Wizard state
  const [step, setStep] = useState<WizardStep>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [transformationType, setTransformationType] = useState<string>(
    TRANSFORMATION_TYPES[0].value,
  );
  const [preparePrompt, setPreparePrompt] = useState("");
  const [skipPrepare, setSkipPrepare] = useState(false);
  const [productName, setProductName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // AI result data URIs (held in memory until save)
  const [preparedDataUri, setPreparedDataUri] = useState<string | null>(null);
  const [preparedMimeType, setPreparedMimeType] = useState<string | null>(null);
  const [transformedDataUri, setTransformedDataUri] = useState<string | null>(null);
  const [transformedMimeType, setTransformedMimeType] = useState<string | null>(null);

  // Fetchers
  const prepareFetcher = useFetcher();
  const transformFetcher = useFetcher();
  const saveFetcher = useFetcher();

  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPreparing = prepareFetcher.state !== "idle";
  const isSaving = saveFetcher.state !== "idle";

  // Clean up preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Handle prepare response
  const prepareData = prepareFetcher.data as
    | { preparedImageDataUri?: string; preparedMimeType?: string; error?: string }
    | undefined;

  useEffect(() => {
    if (prepareData?.preparedImageDataUri) {
      setPreparedDataUri(prepareData.preparedImageDataUri);
      setPreparedMimeType(prepareData.preparedMimeType ?? "image/png");
      setError(null);
      setStep("review");
    }
    if (prepareData?.error) {
      setError(prepareData.error);
    }
  }, [prepareData]);

  // Handle transform response
  const transformData = transformFetcher.data as
    | { imageDataUri?: string; mimeType?: string; error?: string }
    | undefined;

  useEffect(() => {
    if (transformData?.imageDataUri) {
      setTransformedDataUri(transformData.imageDataUri);
      setTransformedMimeType(transformData.mimeType ?? "image/png");
      setError(null);
      setStep("preview");
    }
    if (transformData?.error) {
      setError(transformData.error);
      setStep(skipPrepare ? "upload" : "review");
    }
  }, [transformData, skipPrepare]);

  // Handle save response
  const saveData = saveFetcher.data as
    | { imageState?: unknown; error?: string }
    | undefined;

  useEffect(() => {
    if (saveData?.imageState) {
      toast.success("Image pair saved to project");
      resetWizard();
    }
    if (saveData?.error) {
      toast.error(saveData.error);
    }
  }, [saveData]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setProductName(file.name.replace(/\.[^.]+$/, ""));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const resetWizard = useCallback(() => {
    setStep("upload");
    setSelectedFile(null);
    setPreviewUrl(null);
    setPreparePrompt("");
    setSkipPrepare(false);
    setProductName("");
    setError(null);
    setPreparedDataUri(null);
    setPreparedMimeType(null);
    setTransformedDataUri(null);
    setTransformedMimeType(null);
  }, []);

  // Convert file to data URI
  const fileToDataUri = useCallback(async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        "",
      ),
    );
    return `data:${file.type || "image/png"};base64,${base64}`;
  }, []);

  // Step 1 → Prepare or skip
  const handlePrepare = useCallback(async () => {
    if (!selectedFile) return;
    setError(null);

    if (skipPrepare) {
      const dataUri = await fileToDataUri(selectedFile);
      setPreparedDataUri(dataUri);
      setPreparedMimeType(selectedFile.type || "image/png");
      setStep("transforming");
      transformFetcher.submit(
        JSON.stringify({
          imageDataUri: dataUri,
          transformationType,
        }),
        {
          method: "post",
          action: "/api/transform",
          encType: "application/json",
        },
      );
      return;
    }

    const formData = new FormData();
    formData.set("file", selectedFile);
    formData.set("preparePrompt", preparePrompt);
    prepareFetcher.submit(formData, {
      method: "post",
      action: "/api/prepare-image",
      encType: "multipart/form-data",
    });
  }, [
    selectedFile,
    skipPrepare,
    preparePrompt,
    transformationType,
    prepareFetcher,
    transformFetcher,
    fileToDataUri,
  ]);

  // Step 2 → Transform the prepared image
  const handleTransform = useCallback(() => {
    if (!preparedDataUri) return;
    setError(null);
    setStep("transforming");
    transformFetcher.submit(
      JSON.stringify({
        imageDataUri: preparedDataUri,
        transformationType,
      }),
      {
        method: "post",
        action: "/api/transform",
        encType: "application/json",
      },
    );
  }, [preparedDataUri, transformationType, transformFetcher]);

  // Step 2 → Regenerate preparation
  const handleRegenerate = useCallback(() => {
    if (!selectedFile) return;
    setError(null);
    const formData = new FormData();
    formData.set("file", selectedFile);
    formData.set("preparePrompt", preparePrompt);
    prepareFetcher.submit(formData, {
      method: "post",
      action: "/api/prepare-image",
      encType: "multipart/form-data",
    });
  }, [selectedFile, preparePrompt, prepareFetcher]);

  // Step 4 → Save the pair
  const handleSave = useCallback(() => {
    if (!preparedDataUri || !transformedDataUri) return;
    const transformLabel =
      TRANSFORMATION_TYPES.find((t) => t.value === transformationType)?.label ??
      "On";

    saveFetcher.submit(
      JSON.stringify({
        projectId,
        offImageDataUri: preparedDataUri,
        offMimeType: preparedMimeType,
        onImageDataUri: transformedDataUri,
        onMimeType: transformedMimeType,
        productName: productName || "Untitled",
        transformLabel,
      }),
      {
        method: "post",
        action: "/api/save-image-pair",
        encType: "application/json",
      },
    );
  }, [
    projectId,
    preparedDataUri,
    preparedMimeType,
    transformedDataUri,
    transformedMimeType,
    transformationType,
    productName,
    saveFetcher,
  ]);

  return (
    <section className="mb-12">
      <h2 className="mb-1 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
        Upload &amp; Transform
      </h2>
      <p className="mb-4 text-sm text-[#78716C] dark:text-[#A8A097]">
        Upload an image, optionally prepare it with AI, then transform.
      </p>

      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-1">
        {WIZARD_STEPS.map((s, i) => {
          const stepIdx = WIZARD_STEPS.findIndex((ws) => ws.key === step);
          const isDone = i < stepIdx;
          const isCurrent = i === stepIdx;
          return (
            <div key={s.key} className="flex items-center gap-1">
              {i > 0 && (
                <div
                  className={`h-px w-6 ${
                    isDone
                      ? "bg-ikea-blue dark:bg-amber-glow"
                      : "bg-[#E7E5E4] dark:bg-[#292524]"
                  }`}
                />
              )}
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[0.625rem] font-medium ${
                  isCurrent
                    ? "bg-ikea-blue text-white dark:bg-amber-glow dark:text-[#1C1917]"
                    : isDone
                      ? "bg-ikea-blue/20 text-ikea-blue dark:bg-amber-glow/20 dark:text-amber-glow"
                      : "bg-[#E7E5E4] text-[#78716C] dark:bg-[#292524] dark:text-[#A8A097]"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-[0.6875rem] ${
                  isCurrent
                    ? "font-medium text-[#1C1917] dark:text-[#F5F0E8]"
                    : "text-[#78716C] dark:text-[#A8A097]"
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} />
        </div>
      )}

      {/* ------ Step: Upload ------ */}
      {step === "upload" && (
        <div className="space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors ${
              dragOver
                ? "border-ikea-blue bg-ikea-blue/5 dark:border-amber-glow dark:bg-amber-glow/5"
                : selectedFile
                  ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/10"
                  : "border-border-light hover:border-[#78716C] dark:border-border-dark dark:hover:border-[#A8A097]"
            }`}
          >
            {previewUrl ? (
              <div className="flex items-center gap-3">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-16 w-16 rounded object-cover"
                />
                <div className="text-left">
                  <p className="text-sm font-medium text-[#1C1917] dark:text-[#F5F0E8]">
                    {selectedFile?.name}
                  </p>
                  <p className="text-xs text-[#78716C] dark:text-[#A8A097]">
                    Click or drag to replace
                  </p>
                </div>
              </div>
            ) : (
              <>
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="mb-2 text-[#78716C] dark:text-[#A8A097]"
                >
                  <path
                    d="M12 16V8m0 0l-3 3m3-3l3 3M21 15v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-sm text-[#78716C] dark:text-[#A8A097]">
                  Drag &amp; drop an image, or{" "}
                  <span className="font-medium text-ikea-blue dark:text-amber-glow">
                    browse
                  </span>
                </p>
              </>
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

          {/* Controls */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-3">
              {/* Transformation type */}
              <div>
                <label className="mb-1.5 block text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
                  Transformation
                </label>
                <select
                  value={transformationType}
                  onChange={(e) => setTransformationType(e.target.value)}
                  className="w-full rounded-lg border border-border-light bg-white px-3 py-2.5 text-sm text-[#1C1917] outline-none transition-colors focus:border-ikea-blue dark:border-border-dark dark:bg-card-dark dark:text-[#F5F0E8] dark:focus:border-amber-glow"
                >
                  {TRANSFORMATION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preparation prompt */}
              {!skipPrepare && (
                <div>
                  <label className="mb-1.5 block text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
                    Preparation Instructions
                    <span className="normal-case tracking-normal"> (optional)</span>
                  </label>
                  <textarea
                    value={preparePrompt}
                    onChange={(e) => setPreparePrompt(e.target.value)}
                    placeholder="e.g., Zoom out slightly, center the product on a clean white background..."
                    rows={2}
                    className="w-full rounded-lg border border-border-light bg-white px-3 py-2.5 text-sm text-[#1C1917] placeholder-[#78716C]/50 outline-none transition-colors focus:border-ikea-blue dark:border-border-dark dark:bg-card-dark dark:text-[#F5F0E8] dark:placeholder-[#A8A097]/50 dark:focus:border-amber-glow"
                  />
                </div>
              )}

              {/* Skip preparation checkbox */}
              <label className="flex items-center gap-2 text-sm text-[#44403C] dark:text-[#C4BAB0]">
                <input
                  type="checkbox"
                  checked={skipPrepare}
                  onChange={(e) => setSkipPrepare(e.target.checked)}
                  className="rounded border-border-light accent-ikea-blue dark:border-border-dark dark:accent-amber-glow"
                />
                Use my image directly (skip preparation)
              </label>
            </div>

            <button
              type="button"
              onClick={handlePrepare}
              disabled={!selectedFile || isPreparing}
              className="shrink-0 rounded-lg bg-ikea-blue px-6 py-2.5 text-[0.8125rem] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-amber-glow dark:text-[#1C1917]"
            >
              {isPreparing ? (
                <span className="flex items-center gap-2">
                  <SpinnerIcon /> Preparing...
                </span>
              ) : skipPrepare ? (
                "Transform"
              ) : (
                "Prepare & Preview"
              )}
            </button>
          </div>

          <p className="text-xs text-[#78716C] dark:text-[#A8A097]">
            Uses 1 transform
          </p>
        </div>
      )}

      {/* ------ Step: Review prepared image ------ */}
      {step === "review" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Raw upload */}
            <div>
              <p className="mb-2 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
                Original Upload
              </p>
              <div className="aspect-square overflow-hidden rounded-lg border border-border-light bg-[#F5F5F4] dark:border-border-dark dark:bg-[#1C1917]">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Original upload"
                    className="h-full w-full object-contain"
                  />
                )}
              </div>
            </div>

            {/* Prepared image */}
            <div>
              <p className="mb-2 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
                AI Prepared
              </p>
              <div className="aspect-square overflow-hidden rounded-lg border border-border-light bg-[#F5F5F4] dark:border-border-dark dark:bg-[#1C1917]">
                {isPreparing ? (
                  <div className="flex h-full items-center justify-center">
                    <SpinnerIcon className="h-8 w-8 text-[#78716C] dark:text-[#A8A097]" />
                  </div>
                ) : preparedDataUri ? (
                  <img
                    src={preparedDataUri}
                    alt="AI prepared"
                    className="h-full w-full object-contain"
                  />
                ) : null}
              </div>
            </div>
          </div>

          {/* Prompt for regeneration */}
          <div>
            <label className="mb-1.5 block text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
              Adjust Instructions
            </label>
            <textarea
              value={preparePrompt}
              onChange={(e) => setPreparePrompt(e.target.value)}
              placeholder="Tweak your preparation instructions and regenerate..."
              rows={2}
              className="w-full rounded-lg border border-border-light bg-white px-3 py-2.5 text-sm text-[#1C1917] placeholder-[#78716C]/50 outline-none transition-colors focus:border-ikea-blue dark:border-border-dark dark:bg-card-dark dark:text-[#F5F0E8] dark:placeholder-[#A8A097]/50 dark:focus:border-amber-glow"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={isPreparing}
              className="rounded-lg border border-border-light px-4 py-2.5 text-[0.8125rem] font-medium text-[#1C1917] transition-colors hover:bg-[#F5F0E8] disabled:opacity-50 dark:border-border-dark dark:text-[#F5F0E8] dark:hover:bg-[#292524]"
            >
              {isPreparing ? (
                <span className="flex items-center gap-2">
                  <SpinnerIcon /> Regenerating...
                </span>
              ) : (
                "Regenerate"
              )}
            </button>
            <button
              type="button"
              onClick={handleTransform}
              disabled={!preparedDataUri || isPreparing}
              className="rounded-lg bg-ikea-blue px-6 py-2.5 text-[0.8125rem] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-amber-glow dark:text-[#1C1917]"
            >
              Accept &amp; Transform
            </button>
            <button
              type="button"
              onClick={resetWizard}
              className="text-sm text-[#78716C] transition-colors hover:text-[#1C1917] dark:text-[#A8A097] dark:hover:text-[#F5F0E8]"
            >
              Start over
            </button>
          </div>
        </div>
      )}

      {/* ------ Step: Transforming ------ */}
      {step === "transforming" && (
        <div className="space-y-4">
          <div className="mx-auto max-w-md">
            <div className="relative aspect-square overflow-hidden rounded-lg border border-border-light bg-[#F5F5F4] dark:border-border-dark dark:bg-[#1C1917]">
              {preparedDataUri && (
                <img
                  src={preparedDataUri}
                  alt="Transforming..."
                  className="h-full w-full object-contain opacity-50"
                />
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <SpinnerIcon className="h-10 w-10 text-ikea-blue dark:text-amber-glow" />
                <p className="text-sm font-medium text-[#1C1917] dark:text-[#F5F0E8]">
                  Transforming...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------ Step: Preview & Save ------ */}
      {step === "preview" && (
        <div className="space-y-4">
          <div className="mx-auto max-w-md">
            {preparedDataUri && transformedDataUri && (
              <ImageToggle
                states={[
                  { label: "Off", src: preparedDataUri, alt: `${productName} - Off` },
                  {
                    label:
                      TRANSFORMATION_TYPES.find(
                        (t) => t.value === transformationType,
                      )?.label ?? "On",
                    src: transformedDataUri,
                    alt: `${productName} - On`,
                  },
                ]}
                transitionType="crossfade"
                triggerType="switch"
                className="aspect-square w-full rounded-lg border border-border-light dark:border-border-dark"
              />
            )}
          </div>

          {/* Product name */}
          <div>
            <label className="mb-1.5 block text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
              Product Name
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full max-w-xs rounded-lg border border-border-light bg-white px-3 py-2.5 text-sm text-[#1C1917] outline-none transition-colors focus:border-ikea-blue dark:border-border-dark dark:bg-card-dark dark:text-[#F5F0E8] dark:focus:border-amber-glow"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-lg bg-ikea-blue px-6 py-2.5 text-[0.8125rem] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-amber-glow dark:text-[#1C1917]"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <SpinnerIcon /> Saving...
                </span>
              ) : (
                "Save to Project"
              )}
            </button>
            <button
              type="button"
              onClick={resetWizard}
              className="text-sm text-[#78716C] transition-colors hover:text-[#1C1917] dark:text-[#A8A097] dark:hover:text-[#F5F0E8]"
            >
              Start over
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// ImageStatesGrid
// ---------------------------------------------------------------------------

function ImageStatesGrid({
  imageStates,
  transitionType,
  triggerType,
}: {
  imageStates: ImageStateRow[];
  transitionType: TransitionType;
  triggerType: TriggerType;
}) {
  const { isDark } = useDarkMode();
  const [previewOn, setPreviewOn] = useState(isDark);

  // Sync with dark mode when it changes
  useEffect(() => {
    setPreviewOn(isDark);
  }, [isDark]);

  return (
    <section className="mb-12">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="mb-1 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
            Image States
          </h2>
          <p className="text-sm text-[#78716C] dark:text-[#A8A097]">
            Your transformed images with interactive toggles.
          </p>
        </div>

        {imageStates.length > 0 && (
          <button
            type="button"
            onClick={() => setPreviewOn((p) => !p)}
            className="flex items-center gap-2 rounded-lg border border-border-light px-3 py-2 text-xs font-medium transition-colors hover:bg-[#F5F0E8] dark:border-border-dark dark:hover:bg-[#292524]"
          >
            <div
              className={`relative h-5 w-9 rounded-full transition-colors ${
                previewOn ? "bg-ikea-blue dark:bg-amber-glow" : "bg-[#D6D3D1] dark:bg-[#44403C]"
              }`}
            >
              <div
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  previewOn ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </div>
            <span className="text-[#1C1917] dark:text-[#F5F0E8]">
              {previewOn ? "On" : "Off"}
            </span>
          </button>
        )}
      </div>

      {imageStates.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-light px-8 py-16 text-center dark:border-border-dark">
          <p className="text-sm text-[#78716C] dark:text-[#A8A097]">
            No images yet. Upload and transform an image above to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {imageStates.map((state) => (
            <ImageStateCard
              key={state.id}
              imageState={state}
              transitionType={transitionType}
              triggerType={triggerType}
              previewOn={previewOn}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// ImageStateCard
// ---------------------------------------------------------------------------

function ImageStateCard({
  imageState,
  transitionType,
  previewOn,
}: {
  imageState: ImageStateRow;
  transitionType: TransitionType;
  triggerType: TriggerType;
  previewOn: boolean;
}) {
  const fetcher = useFetcher();
  const isDeleting = fetcher.state !== "idle";

  const states: ImageState[] = imageState.states.map((s) => ({
    label: s.label,
    src: s.image_url,
    alt: `${imageState.product_name} - ${s.label}`,
  }));

  if (isDeleting) return null;

  return (
    <div className="group overflow-hidden rounded-lg border border-border-light bg-white transition-shadow hover:shadow-md dark:border-border-dark dark:bg-card-dark">
      <div className="aspect-square">
        <ImageToggle
          states={states}
          transitionType={transitionType}
          triggerType="external"
          activeStateIndex={previewOn ? 1 : 0}
          className="h-full w-full"
        />
      </div>
      <div className="flex items-center justify-between border-t border-border-light px-4 py-3 dark:border-border-dark">
        <p className="truncate text-sm font-medium text-[#1C1917] dark:text-[#F5F0E8]">
          {imageState.product_name}
        </p>
        <fetcher.Form method="post">
          <input type="hidden" name="_action" value="delete-image-state" />
          <input type="hidden" name="stateId" value={imageState.id} />
          <button
            type="submit"
            className="rounded p-1 text-[#78716C] opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:text-[#A8A097] dark:hover:bg-red-900/20 dark:hover:text-red-400"
            title="Delete image state"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M4.5 5.5l.5 7h6l.5-7M6.5 8v2.5M9.5 8v2.5M2.5 5.5h11M6 5.5V4a1 1 0 011-1h2a1 1 0 011 1v1.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </fetcher.Form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ToggleConfiguration
// ---------------------------------------------------------------------------

function ToggleConfiguration({
  transitionType,
  triggerType,
}: {
  transitionType: TransitionType;
  triggerType: TriggerType;
}) {
  const fetcher = useFetcher();
  const [localTransition, setLocalTransition] =
    useState<TransitionType>(transitionType);
  const [localTrigger, setLocalTrigger] = useState<TriggerType>(triggerType);

  const saveSettings = useCallback(
    (newTransition: TransitionType, newTrigger: TriggerType) => {
      fetcher.submit(
        {
          _action: "update-settings",
          transitionType: newTransition,
          triggerType: newTrigger,
        },
        { method: "post" },
      );
    },
    [fetcher],
  );

  return (
    <section className="mb-12">
      <h2 className="mb-1 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
        Toggle Configuration
      </h2>
      <p className="mb-4 text-sm text-[#78716C] dark:text-[#A8A097]">
        Configure how the image toggle behaves in embeds.
      </p>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div>
          <label className="mb-1.5 block text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
            Transition Type
          </label>
          <select
            value={localTransition}
            onChange={(e) => {
              const val = e.target.value as TransitionType;
              setLocalTransition(val);
              saveSettings(val, localTrigger);
            }}
            className="rounded-lg border border-border-light bg-white px-3 py-2.5 text-sm capitalize text-[#1C1917] outline-none transition-colors focus:border-ikea-blue dark:border-border-dark dark:bg-card-dark dark:text-[#F5F0E8] dark:focus:border-amber-glow"
          >
            {TRANSITION_TYPES.map((t) => (
              <option key={t} value={t} className="capitalize">
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
            Trigger Type
          </label>
          <select
            value={localTrigger}
            onChange={(e) => {
              const val = e.target.value as TriggerType;
              setLocalTrigger(val);
              saveSettings(localTransition, val);
            }}
            className="rounded-lg border border-border-light bg-white px-3 py-2.5 text-sm capitalize text-[#1C1917] outline-none transition-colors focus:border-ikea-blue dark:border-border-dark dark:bg-card-dark dark:text-[#F5F0E8] dark:focus:border-amber-glow"
          >
            {TRIGGER_TYPES.map((t) => (
              <option key={t} value={t} className="capitalize">
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// EmbedSection
// ---------------------------------------------------------------------------

function EmbedSection({
  projectId,
  isPublic,
  transitionType,
  triggerType,
}: {
  projectId: string;
  isPublic: boolean;
  transitionType: TransitionType;
  triggerType: TriggerType;
}) {
  const { isDark } = useDarkMode();
  const [copied, setCopied] = useState(false);

  const themeParam = isDark ? "dark" : "light";
  const embedUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/embed/${projectId}?transition=${transitionType}&trigger=${triggerType}&theme=${themeParam}`;
  const embedCode = `<iframe src="${embedUrl}" width="600" height="400" frameborder="0" style="border-radius: 8px; overflow: hidden;"></iframe>`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      toast.success("Embed code copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text
    }
  }, [embedCode]);

  return (
    <section className="mb-12">
      <h2 className="mb-1 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
        Embed Preview
      </h2>
      <p className="mb-4 text-sm text-[#78716C] dark:text-[#A8A097]">
        This is how the embed will look on your site.
      </p>

      {/* Private warning */}
      {!isPublic && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400">
          Make your project public to use the embed.
        </div>
      )}

      {/* Live iframe preview */}
      {isPublic && (
        <div className="mb-6 flex justify-center rounded-xl border border-border-light bg-[#F5F0E8] p-6 dark:border-border-dark dark:bg-[#1C1917]">
          <iframe
            src={embedUrl}
            width="600"
            height="400"
            style={{ borderRadius: "8px", overflow: "hidden", border: "none", display: "block" }}
            title="Embed preview"
          />
        </div>
      )}

      {/* Code snippet */}
      <p className="mb-2 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
        Embed Code
      </p>
      <div className="relative rounded-lg border border-border-light bg-[#1C1917] p-4 dark:border-border-dark">
        <pre className="overflow-x-auto text-xs leading-relaxed text-[#A8A097]">
          <code>{embedCode}</code>
        </pre>
        <button
          type="button"
          onClick={handleCopy}
          className="absolute right-3 top-3 rounded-md bg-[#292524] px-3 py-1.5 text-xs font-medium text-[#F5F0E8] transition-colors hover:bg-[#44403C]"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </section>
  );
}
