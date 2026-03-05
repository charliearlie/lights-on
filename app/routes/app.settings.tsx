import { redirect, useFetcher, useSearchParams } from "react-router";
import type { Route } from "./+types/app.settings";
import { createSupabaseServerClient } from "../services/supabase.ssr.server";
import { getSupabaseAdmin } from "../services/supabase.server";
import { getSaasPriceId } from "../data/saas-plans.server";
import { saasPlans } from "../data/saas-plans";
import {
  createCustomer,
  createCheckoutSession,
  createPortalSession,
} from "../services/stripe.server";

// ---------------------------------------------------------------------------
// Loader
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return Response.json(
    { profile, email: user.email },
    { headers: responseHeaders },
  );
}

// ---------------------------------------------------------------------------
// Action
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
  const intent = formData.get("_action") as string;
  const origin = new URL(request.url).origin;

  // --- Update profile display name ---
  if (intent === "update-profile") {
    const displayName = formData.get("display_name") as string;

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("id", user.id);

    if (error) {
      return Response.json(
        { error: "Failed to update profile" },
        { status: 400, headers: responseHeaders },
      );
    }

    return Response.json({ success: true }, { headers: responseHeaders });
  }

  // --- Create Stripe checkout session for plan upgrade ---
  if (intent === "create-checkout") {
    const planId = formData.get("planId") as string;
    const priceId = getSaasPriceId(planId);

    const admin = getSupabaseAdmin();
    const { data: profile } = await admin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    let stripeCustomerId = profile?.stripe_customer_id as string | null;

    if (!stripeCustomerId) {
      const customer = await createCustomer({
        email: user.email!,
        metadata: { user_id: user.id },
      });
      stripeCustomerId = customer.id;

      await admin
        .from("profiles")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", user.id);
    }

    const session = await createCheckoutSession({
      customerId: stripeCustomerId,
      priceId,
      mode: "subscription",
      successUrl: origin + "/app/settings?upgraded=true",
      cancelUrl: origin + "/app/settings?cancelled=true",
      metadata: { user_id: user.id, plan: planId },
    });

    if (!session.url) {
      return Response.json(
        { error: "Stripe checkout session did not return a redirect URL." },
        { status: 500, headers: responseHeaders },
      );
    }

    return redirect(session.url, { headers: responseHeaders });
  }

  // --- Create Stripe Customer Portal session ---
  if (intent === "create-portal-session") {
    const admin = getSupabaseAdmin();
    const { data: profile } = await admin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    const stripeCustomerId = profile?.stripe_customer_id as string | null;

    if (!stripeCustomerId) {
      return Response.json(
        { error: "No billing account found" },
        { status: 400, headers: responseHeaders },
      );
    }

    const portalSession = await createPortalSession(
      stripeCustomerId,
      origin + "/app/settings",
    );

    return redirect(portalSession.url, { headers: responseHeaders });
  }

  return Response.json(
    { error: "Unknown action" },
    { status: 400, headers: responseHeaders },
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SettingsPage({ loaderData }: Route.ComponentProps) {
  const { profile, email } = loaderData;
  const [searchParams] = useSearchParams();
  const upgraded = searchParams.get("upgraded") === "true";
  const cancelled = searchParams.get("cancelled") === "true";

  const profileFetcher = useFetcher();
  const checkoutFetcher = useFetcher();
  const portalFetcher = useFetcher();

  const profileData = profileFetcher.data as
    | { success?: boolean; error?: string }
    | undefined;
  const profileSaving = profileFetcher.state !== "idle";

  const currentPlan = saasPlans.find((p) => p.id === profile?.plan) ??
    saasPlans[0];
  const isPaid = currentPlan.id !== "free";

  const used = profile?.transformations_used ?? 0;
  const limit = profile?.transformations_limit ?? currentPlan.transformationsLimit;
  const usagePercent = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

  const upgradePlans = saasPlans.filter((p) => p.id !== "free");

  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="mb-4 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
        Settings
      </p>
      <h1 className="font-display text-3xl italic text-[#1C1917] dark:text-[#F5F0E8]">
        Account &amp; Billing
      </h1>

      {/* Upgraded banner */}
      {upgraded && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400">
          Plan upgraded successfully!
        </div>
      )}

      {/* Cancelled banner */}
      {cancelled && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400">
          Upgrade cancelled
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Profile section                                                    */}
      {/* ----------------------------------------------------------------- */}
      <section className="mt-10 rounded-xl border border-border-light bg-card-light p-6 dark:border-border-dark dark:bg-card-dark">
        <h2 className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
          Profile
        </h2>

        <div className="mt-5 space-y-4">
          {/* Email (read-only) */}
          <div>
            <label className="mb-1.5 block text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
              Email
            </label>
            <p className="text-sm text-[#1C1917] dark:text-[#F5F0E8]">
              {email}
            </p>
          </div>

          {/* Display name (editable) */}
          <profileFetcher.Form method="post">
            <input type="hidden" name="_action" value="update-profile" />
            <label
              htmlFor="display_name"
              className="mb-1.5 block text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]"
            >
              Display name
            </label>
            <div className="flex items-center gap-3">
              <input
                id="display_name"
                name="display_name"
                type="text"
                defaultValue={profile?.display_name ?? ""}
                placeholder="Your name"
                className="flex-1 rounded-lg border border-border-light bg-white px-4 py-2.5 text-sm text-[#1C1917] placeholder-[#78716C]/50 outline-none transition-colors focus:border-ikea-blue dark:border-border-dark dark:bg-card-dark dark:text-[#F5F0E8] dark:placeholder-[#A8A097]/50 dark:focus:border-amber-glow"
              />
              <button
                type="submit"
                disabled={profileSaving}
                className="rounded-lg bg-ikea-blue px-4 py-2.5 text-[0.8125rem] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-amber-glow dark:text-[#1C1917]"
              >
                {profileSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </profileFetcher.Form>

          {/* Success / error feedback */}
          {profileData?.success && (
            <p className="text-sm text-green-600 dark:text-green-400">
              Profile updated.
            </p>
          )}
          {profileData?.error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {profileData.error}
            </p>
          )}
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Plan & Usage section                                               */}
      {/* ----------------------------------------------------------------- */}
      <section className="mt-6 rounded-xl border border-border-light bg-card-light p-6 dark:border-border-dark dark:bg-card-dark">
        <h2 className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
          Plan &amp; Usage
        </h2>

        <div className="mt-5 flex items-center gap-3">
          <span
            className={[
              "inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider",
              currentPlan.id === "free"
                ? "bg-[#E7E5E4] text-[#44403C] dark:bg-[#292524] dark:text-[#D6D3D1]"
                : currentPlan.id === "pro"
                  ? "bg-ikea-blue/10 text-ikea-blue dark:bg-amber-glow/10 dark:text-amber-glow"
                  : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
            ].join(" ")}
          >
            {currentPlan.name}
          </span>
          <span className="text-sm text-[#78716C] dark:text-[#A8A097]">
            {currentPlan.priceLabel}
          </span>
        </div>

        {/* Usage bar */}
        <div className="mt-5">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-[#44403C] dark:text-[#C4BAB0]">
              {used} of {limit} transforms used this period
            </span>
            <span className="text-[#78716C] dark:text-[#A8A097]">
              {Math.round(usagePercent)}%
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#E7E5E4] dark:bg-[#292524]">
            <div
              className={[
                "h-full rounded-full transition-all duration-500",
                usagePercent >= 90
                  ? "bg-red-500"
                  : usagePercent >= 70
                    ? "bg-amber-500"
                    : "bg-ikea-blue dark:bg-amber-glow",
              ].join(" ")}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>

        {isPaid && (
          <p className="mt-3 text-xs text-[#78716C] dark:text-[#A8A097]">
            Usage resets at the start of each billing period.
          </p>
        )}
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Billing section                                                    */}
      {/* ----------------------------------------------------------------- */}
      <section className="mt-6 rounded-xl border border-border-light bg-card-light p-6 dark:border-border-dark dark:bg-card-dark">
        <h2 className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
          Billing
        </h2>

        {!isPaid ? (
          <>
            <p className="mt-4 text-sm text-[#44403C] dark:text-[#C4BAB0]">
              You are on the Free plan. Upgrade to unlock more transforms and
              features.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {upgradePlans.map((plan) => {
                const isHighlighted = plan.highlighted;
                return (
                  <div
                    key={plan.id}
                    className={[
                      "relative flex flex-col overflow-hidden rounded-xl border transition-all duration-200",
                      isHighlighted
                        ? "border-ikea-blue dark:border-amber-glow"
                        : "border-border-light dark:border-border-dark",
                      "hover:scale-[1.015] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_0_0_1px_rgba(245,158,11,0.2),0_8px_24px_rgba(245,158,11,0.08)]",
                      "bg-card-light dark:bg-card-dark",
                    ].join(" ")}
                  >
                    {isHighlighted && (
                      <div className="bg-ikea-blue px-4 py-1.5 text-center text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-white dark:bg-amber-glow dark:text-[#1C1917]">
                        Recommended
                      </div>
                    )}

                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-display text-xl italic text-[#1C1917] dark:text-[#F5F0E8]">
                        {plan.name}
                      </h3>
                      <p className="mt-2 text-3xl font-semibold text-[#1C1917] dark:text-[#F5F0E8]">
                        {plan.priceLabel}
                      </p>

                      <ul className="mt-6 flex-1 space-y-3">
                        {plan.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-2 text-sm text-[#44403C] dark:text-[#C4BAB0]"
                          >
                            <svg
                              className="mt-0.5 h-4 w-4 shrink-0 text-ikea-blue dark:text-amber-glow"
                              viewBox="0 0 16 16"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <path
                                d="M3.5 8.5L6.5 11.5L12.5 4.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <checkoutFetcher.Form method="post" className="mt-6">
                        <input
                          type="hidden"
                          name="_action"
                          value="create-checkout"
                        />
                        <input
                          type="hidden"
                          name="planId"
                          value={plan.id}
                        />
                        <button
                          type="submit"
                          disabled={checkoutFetcher.state !== "idle"}
                          className={
                            isHighlighted
                              ? "w-full rounded-lg bg-ikea-blue px-4 py-2.5 text-center text-sm font-medium text-white transition-colors duration-300 hover:bg-[#004A8C] disabled:opacity-50 dark:bg-amber-glow dark:text-[#1C1917] dark:hover:bg-[#D97706]"
                              : "w-full rounded-lg border border-border-light px-4 py-2.5 text-center text-sm font-medium text-[#1C1917] transition-colors duration-300 hover:bg-[#F7F5F2] disabled:opacity-50 dark:border-border-dark dark:text-[#F5F0E8] dark:hover:bg-[#1A1915]"
                          }
                        >
                          {checkoutFetcher.state !== "idle"
                            ? "Redirecting..."
                            : "Upgrade"}
                        </button>
                      </checkoutFetcher.Form>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div className="mt-4 text-sm text-[#44403C] dark:text-[#C4BAB0]">
              <p>
                You are on the{" "}
                <span className="font-semibold text-[#1C1917] dark:text-[#F5F0E8]">
                  {currentPlan.name}
                </span>{" "}
                plan ({currentPlan.priceLabel}).
              </p>
              <p className="mt-1">
                Manage your subscription, update payment methods, or cancel via
                the Stripe Customer Portal.
              </p>
            </div>

            <portalFetcher.Form method="post" className="mt-6">
              <input
                type="hidden"
                name="_action"
                value="create-portal-session"
              />
              <button
                type="submit"
                disabled={portalFetcher.state !== "idle"}
                className="rounded-lg border border-border-light px-4 py-2.5 text-sm font-medium text-[#1C1917] transition-colors duration-300 hover:bg-[#F7F5F2] disabled:opacity-50 dark:border-border-dark dark:text-[#F5F0E8] dark:hover:bg-[#1A1915]"
              >
                {portalFetcher.state !== "idle"
                  ? "Redirecting..."
                  : "Manage Subscription"}
              </button>
            </portalFetcher.Form>
          </>
        )}
      </section>
    </main>
  );
}
