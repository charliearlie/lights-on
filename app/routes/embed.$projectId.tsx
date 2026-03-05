import type { Route } from "./+types/embed.$projectId";
import { useLoaderData } from "react-router";
import { getSupabaseAdmin } from "../services/supabase.server";
import {
  ImageToggle,
  type ImageState,
  type TransitionType,
  type TriggerType,
} from "../components/image-toggle/ImageToggle";

// ---------------------------------------------------------------------------
// Loader — public route, no auth required
// ---------------------------------------------------------------------------

export async function loader({ params, request }: Route.LoaderArgs) {
  const supabase = getSupabaseAdmin();

  const { data: project, error } = await supabase
    .from("projects")
    .select(
      "id, name, settings, is_public, image_states(id, product_name, sort_order, states)",
    )
    .eq("id", params.projectId)
    .eq("is_public", true)
    .order("sort_order", { referencedTable: "image_states", ascending: true })
    .single();

  if (error || !project) {
    throw new Response("Project not found or is private", { status: 404 });
  }

  // Parse URL params for overrides
  const VALID_TRANSITIONS = ["crossfade", "slider", "flip"];
  const VALID_TRIGGERS = ["switch", "hover", "click"];

  const url = new URL(request.url);
  const rawTransition = url.searchParams.get("transition");
  const rawTrigger = url.searchParams.get("trigger");

  const projectTransition = (project.settings as Record<string, unknown>)?.transitionType as string | undefined;
  const projectTrigger = (project.settings as Record<string, unknown>)?.triggerType as string | undefined;

  const transition =
    (rawTransition && VALID_TRANSITIONS.includes(rawTransition) ? rawTransition : null) ||
    (projectTransition && VALID_TRANSITIONS.includes(projectTransition) ? projectTransition : null) ||
    "crossfade";
  const trigger =
    (rawTrigger && VALID_TRIGGERS.includes(rawTrigger) ? rawTrigger : null) ||
    (projectTrigger && VALID_TRIGGERS.includes(projectTrigger) ? projectTrigger : null) ||
    "hover";
  const theme = url.searchParams.get("theme") || "light";
  const stateIndex = Number(url.searchParams.get("state") || "0");

  return { project, transition, trigger, theme, stateIndex };
}

// ---------------------------------------------------------------------------
// Component — zero chrome, fills the viewport for iframe embedding
// ---------------------------------------------------------------------------

export default function EmbedPage() {
  const { project, transition, trigger, theme, stateIndex } =
    useLoaderData<typeof loader>();

  const imageStates = project.image_states;
  if (!imageStates || imageStates.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-400">
        No images
      </div>
    );
  }

  // Select which image_state to display (default to first, override via ?state=N)
  const selected =
    imageStates[Math.min(stateIndex, imageStates.length - 1)] ??
    imageStates[0];

  const rawStates: ImageState[] = (selected.states as { label: string; image_url: string }[]).map(
    (s) => ({
      label: s.label,
      src: s.image_url,
      alt: `${project.name} - ${s.label}`,
    }),
  );

  // In dark mode, reverse the states so the "on" image is default (index 0)
  // and hover/interaction reveals the "off" image — matching the site's
  // "dark = lights on" convention
  const states = theme === "dark" ? [...rawStates].reverse() : rawStates;

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="h-screen w-screen bg-white dark:bg-black">
        <ImageToggle
          states={states}
          transitionType={transition as TransitionType}
          triggerType={trigger as TriggerType}
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
