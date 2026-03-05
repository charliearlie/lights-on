import type { Route } from "./+types/auth.callback";
import { redirect } from "react-router";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "../services/supabase.ssr.server";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const responseHeaders = new Headers();
  const supabase = createSupabaseServerClient(request, responseHeaders);

  // PKCE flow — Supabase redirects with a `code` param
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return redirect("/app", { headers: responseHeaders });
    }
  }

  // Legacy flow — token_hash + type
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      return redirect("/app", { headers: responseHeaders });
    }
  }

  return redirect("/login?error=invalid_link", { headers: responseHeaders });
}
