import { isRouteErrorResponse, Outlet, redirect, useRouteError } from "react-router";
import type { Route } from "./+types/app";
import type { MetaFunction } from "react-router";
import { createSupabaseServerClient } from "../services/supabase.ssr.server";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export const meta: MetaFunction = () => [
  { title: "Dashboard — Camber AI" },
  { name: "description", content: "Manage your AI-powered product image transformation projects." },
  { property: "og:title", content: "Dashboard — Camber AI" },
  { property: "og:type", content: "website" },
  { name: "twitter:card", content: "summary" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const responseHeaders = new Headers();

  try {
    const supabase = createSupabaseServerClient(request, responseHeaders);

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      throw redirect("/login", { headers: responseHeaders });
    }

    // Fetch profile using the SSR client
    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "display_name, plan, transformations_used, transformations_limit, stripe_customer_id",
      )
      .eq("id", user.id)
      .single();

    return Response.json(
      { user: { id: user.id, email: user.email }, profile },
      { headers: responseHeaders },
    );
  } catch (e) {
    // Re-throw redirects (they use throw in React Router)
    if (e instanceof Response) throw e;
    // Any other error (missing env vars, network failure) → send to login
    throw redirect("/login");
  }
}

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-surface-light transition-colors duration-300 dark:bg-surface-dark">
      <Header brand="camber" />
      <Outlet />
      <Footer />
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;
  const title = is404 ? "Not found" : "Something went wrong";
  const message = is404
    ? "This project or page doesn't exist."
    : "An unexpected error occurred. Please try again.";

  return (
    <div className="min-h-screen bg-surface-light transition-colors duration-300 dark:bg-surface-dark">
      <Header brand="camber" />
      <main className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
        <p className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
          Error {is404 ? 404 : 500}
        </p>
        <h1 className="mt-2 font-display text-3xl italic text-[#1C1917] dark:text-[#F5F0E8]">
          {title}
        </h1>
        <p className="mt-3 text-sm text-[#78716C] dark:text-[#A8A097]">
          {message}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg border border-border-light px-4 py-2.5 text-sm font-medium text-[#1C1917] transition-colors hover:bg-[#F5F0E8] dark:border-border-dark dark:text-[#F5F0E8] dark:hover:bg-[#292524]"
          >
            Try again
          </button>
          <a
            href="/app"
            className="rounded-lg bg-ikea-blue px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-amber-glow dark:text-[#1C1917]"
          >
            Back to dashboard
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
