import { useRef } from "react";
import { Link, redirect, useFetcher, useLoaderData, useRouteLoaderData } from "react-router";
import type { Route } from "./+types/app._index";
import { createSupabaseServerClient } from "../services/supabase.ssr.server";
import { ProjectCard } from "../components/ProjectCard";
import { saasPlans } from "../data/saas-plans";

// ---------------------------------------------------------------------------
// Loader — fetch user projects
// ---------------------------------------------------------------------------

export async function loader({ request }: Route.LoaderArgs) {
  const responseHeaders = new Headers();
  const supabase = createSupabaseServerClient(request, responseHeaders);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw redirect("/login", { headers: responseHeaders });
  }

  const { data: projects } = await supabase
    .from("projects")
    .select(
      "id, name, slug, is_public, created_at, updated_at, image_states(id, states)",
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return Response.json(
    { projects: projects ?? [] },
    { headers: responseHeaders },
  );
}

// ---------------------------------------------------------------------------
// Action — create project
// ---------------------------------------------------------------------------

export async function action({ request }: Route.ActionArgs) {
  const responseHeaders = new Headers();
  const supabase = createSupabaseServerClient(request, responseHeaders);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw redirect("/login", { headers: responseHeaders });
  }

  const formData = await request.formData();
  const name = (formData.get("name") as string) || "Untitled Project";
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const { data: project, error } = await supabase
    .from("projects")
    .insert({ user_id: user.id, name, slug })
    .select()
    .single();

  if (error) {
    return Response.json(
      { error: "Failed to create project" },
      { status: 500, headers: responseHeaders },
    );
  }

  return redirect(`/app/project/${project.id}`, { headers: responseHeaders });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const { projects } = useLoaderData<typeof loader>();
  const appData = useRouteLoaderData("routes/app") as {
    user: { id: string; email: string };
    profile: {
      display_name: string;
      plan: string;
      transformations_used: number;
      transformations_limit: number;
      stripe_customer_id: string | null;
    };
  } | undefined;

  const profile = appData?.profile;
  const plan = saasPlans.find((p) => p.id === profile?.plan) ?? saasPlans[0];
  const used = profile?.transformations_used ?? 0;
  const limit = profile?.transformations_limit ?? plan.transformationsLimit;
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

  const fetcher = useFetcher();
  const isCreating = fetcher.state !== "idle";
  const nameInputRef = useRef<HTMLInputElement>(null);

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      {/* ----------------------------------------------------------------- */}
      {/* Page header                                                       */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-4 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
            Dashboard
          </p>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-4xl italic text-[#1C1917] dark:text-[#F5F0E8]">
              Your projects
            </h1>
            <span className="rounded-full bg-ikea-blue/10 px-2.5 py-0.5 text-[0.6875rem] font-medium capitalize text-ikea-blue dark:bg-amber-glow/10 dark:text-amber-glow">
              {plan.name}
            </span>
          </div>
        </div>

        {/* Usage meter */}
        <div className="w-full sm:w-56">
          <div className="flex items-baseline justify-between">
            <span className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
              Transforms
            </span>
            <span className="text-sm tabular-nums text-[#44403C] dark:text-[#C4BAB0]">
              {used} / {limit}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#E7E5E4] dark:bg-[#292524]">
            <div
              className="h-full rounded-full bg-ikea-blue transition-all duration-300 dark:bg-amber-glow"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* New project form                                                  */}
      {/* ----------------------------------------------------------------- */}
      <div className="mt-10">
        <fetcher.Form method="post" className="flex gap-3">
          <input
            ref={nameInputRef}
            name="name"
            type="text"
            placeholder="Project name"
            required
            className="w-full max-w-xs rounded-lg border border-border-light bg-white px-4 py-2.5 text-sm text-[#1C1917] placeholder-[#78716C]/50 outline-none transition-colors focus:border-ikea-blue dark:border-border-dark dark:bg-card-dark dark:text-[#F5F0E8] dark:placeholder-[#A8A097]/50 dark:focus:border-amber-glow"
          />
          <button
            type="submit"
            disabled={isCreating}
            className="shrink-0 rounded-lg bg-ikea-blue px-5 py-2.5 text-[0.8125rem] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-amber-glow dark:text-[#1C1917]"
          >
            {isCreating ? "Creating..." : "New Project"}
          </button>
        </fetcher.Form>

        {/* Action error */}
        {fetcher.data &&
          typeof fetcher.data === "object" &&
          "error" in (fetcher.data as Record<string, unknown>) && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
              {(fetcher.data as { error: string }).error}
            </div>
          )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Project grid / empty state                                        */}
      {/* ----------------------------------------------------------------- */}
      {projects.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project: any) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="mt-20 flex flex-col items-center text-center">
          {/* Placeholder icon */}
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#F5F5F4] dark:bg-[#292524]">
            <svg
              className="h-10 w-10 text-[#A8A29E] dark:text-[#57534E]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                d="M12 5v14M5 12h14"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="mt-6 font-display text-xl italic text-[#1C1917] dark:text-[#F5F0E8]">
            No projects yet
          </h2>
          <p className="mt-2 max-w-sm text-sm text-[#78716C] dark:text-[#A8A097]">
            Create your first project to get started. Upload images, configure
            states, and preview your interactive toggle.
          </p>
          <button
            type="button"
            onClick={() => nameInputRef.current?.focus()}
            className="mt-6 rounded-lg bg-ikea-blue px-5 py-2.5 text-[0.8125rem] font-medium text-white transition-opacity hover:opacity-90 dark:bg-amber-glow dark:text-[#1C1917]"
          >
            Create a project
          </button>
        </div>
      )}
    </main>
  );
}
