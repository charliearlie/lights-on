import { Outlet } from "react-router";
import type { Route } from "./+types/forge";
import { createSupabaseServerClient } from "../services/supabase.ssr.server";

export function links() {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@300;400;500&family=IBM+Plex+Mono:wght@400;500&display=swap",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const responseHeaders = new Headers();

  try {
    const supabase = createSupabaseServerClient(request, responseHeaders);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    const adminId = process.env.ADMIN_USER_ID;

    if (error || !user || !adminId || user.id !== adminId) {
      throw new Response("Not Found", { status: 404 });
    }

    return Response.json(
      { user: { id: user.id, email: user.email } },
      { headers: responseHeaders },
    );
  } catch (e) {
    if (e instanceof Response) throw e;
    throw new Response("Not Found", { status: 404 });
  }
}

export default function ForgeLayout() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#101010",
        color: "#e0dbd4",
        fontFamily: "'Barlow', sans-serif",
      }}
    >
      <Outlet />
    </div>
  );
}
