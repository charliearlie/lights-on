import { redirect, useFetcher, useSearchParams } from "react-router";
import type { Route } from "./+types/login";
import { createSupabaseServerClient } from "../services/supabase.ssr.server";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

// ---------------------------------------------------------------------------
// Loader — redirect to /app if already authenticated
// ---------------------------------------------------------------------------

export async function loader({ request }: Route.LoaderArgs) {
  const responseHeaders = new Headers();
  const supabase = createSupabaseServerClient(request, responseHeaders);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return redirect("/app", { headers: responseHeaders });
  }

  return Response.json({}, { headers: responseHeaders });
}

// ---------------------------------------------------------------------------
// Action — send magic link OTP
// ---------------------------------------------------------------------------

export async function action({ request }: Route.ActionArgs) {
  const responseHeaders = new Headers();
  const supabase = createSupabaseServerClient(request, responseHeaders);

  const formData = await request.formData();
  const email = formData.get("email") as string;

  if (!email) {
    return Response.json(
      { error: "Email is required" },
      { status: 400, headers: responseHeaders },
    );
  }

  const origin = new URL(request.url).origin;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: origin + "/auth/callback" },
  });

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 400, headers: responseHeaders },
    );
  }

  return Response.json({ success: true }, { headers: responseHeaders });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LoginPage() {
  const fetcher = useFetcher();
  const [searchParams] = useSearchParams();
  const linkError = searchParams.get("error");

  const isSubmitting = fetcher.state !== "idle";
  const data = fetcher.data as
    | { success?: boolean; error?: string }
    | undefined;

  return (
    <div className="min-h-screen bg-surface-light transition-colors duration-300 dark:bg-surface-dark">
      <Header />
      <main className="mx-auto flex max-w-md flex-col items-center px-4 py-24 sm:px-6">
        <p className="mb-2 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
          Sign in
        </p>
        <h1 className="font-display text-3xl italic text-[#1C1917] dark:text-[#F5F0E8]">
          Sign in
        </h1>
        <p className="mt-3 text-center text-sm text-[#78716C] dark:text-[#A8A097]">
          Enter your email to receive a magic link.
        </p>

        {/* Invalid link error from callback redirect */}
        {linkError === "invalid_link" && (
          <div className="mt-6 w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
            The magic link is invalid or has expired. Please try again.
          </div>
        )}

        {/* Action error */}
        {data?.error && (
          <div className="mt-6 w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
            {data.error}
          </div>
        )}

        {/* Success message */}
        {data?.success ? (
          <div className="mt-6 w-full rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400">
            Check your email for a magic link!
          </div>
        ) : (
          <fetcher.Form method="post" className="mt-8 w-full space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-lg border border-border-light bg-white px-4 py-2.5 text-sm text-[#1C1917] placeholder-[#78716C]/50 outline-none transition-colors focus:border-ikea-blue dark:border-border-dark dark:bg-card-dark dark:text-[#F5F0E8] dark:placeholder-[#A8A097]/50 dark:focus:border-amber-glow"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-ikea-blue px-4 py-2.5 text-[0.8125rem] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-amber-glow dark:text-[#1C1917]"
            >
              {isSubmitting ? "Sending..." : "Send magic link"}
            </button>
          </fetcher.Form>
        )}
      </main>
      <Footer />
    </div>
  );
}
