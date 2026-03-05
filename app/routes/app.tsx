import { Outlet, redirect } from "react-router";
import type { Route } from "./+types/app";
import { createSupabaseServerClient } from "../services/supabase.ssr.server";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

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
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
