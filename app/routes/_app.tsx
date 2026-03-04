import { Outlet, redirect } from "react-router";
import type { Route } from "./+types/_app";
import { getSupabaseAdmin } from "../services/supabase.server";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("cookie") ?? "";

  // Check for auth token in cookie (sb-access-token or similar)
  // For now, check Authorization header or redirect to home
  const url = new URL(request.url);

  // Simple auth check — will be expanded with proper Supabase auth
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    // No auth token found — redirect to home page
    throw redirect("/?login=required");
  }

  const token = authHeader.slice(7);
  const supabase = getSupabaseAdmin();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw redirect("/?login=required");
  }

  return { user: { id: user.id, email: user.email } };
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
