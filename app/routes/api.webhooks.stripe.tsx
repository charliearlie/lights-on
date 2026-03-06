import type { Route } from "./+types/api.webhooks.stripe";
import { constructWebhookEvent } from "../services/stripe.server";
import { getSupabaseAdmin } from "../services/supabase.server";

// Action-only route — no loader, no UI
export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event;
  try {
    event = constructWebhookEvent(payload, signature);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return new Response(`Webhook error: ${message}`, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      if (userId && session.subscription) {
        const { error } = await supabase
          .from("profiles")
          .update({
            stripe_customer_id: session.customer as string,
          })
          .eq("id", userId);
        if (error) console.error("Webhook: failed to update stripe_customer_id", error);
      }

      // Service order handling
      const orderId = session.metadata?.order_id;
      if (orderId) {
        const { error } = await supabase
          .from("service_orders")
          .update({
            stripe_payment_id: session.payment_intent as string,
            status: "paid",
          })
          .eq("id", orderId);
        if (error) console.error("Webhook: failed to update service_order", error);
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer;

      const plan = subscription.metadata?.plan ?? "pro";
      const limitsMap: Record<string, number> = {
        free: 5,
        pro: 100,
        business: 500,
      };

      const { error: subError } = await supabase
        .from("profiles")
        .update({
          plan,
          transformations_limit: limitsMap[plan] ?? 100,
          billing_period_start: new Date(
            subscription.current_period_start * 1000,
          ).toISOString(),
        })
        .eq("stripe_customer_id", customerId);
      if (subError) console.error("Webhook: failed to update subscription profile", subError);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer;

      const { error: delError } = await supabase
        .from("profiles")
        .update({
          plan: "free",
          transformations_limit: 5,
        })
        .eq("stripe_customer_id", customerId);
      if (delError) console.error("Webhook: failed to downgrade subscription", delError);
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object;
      if (invoice.billing_reason === "subscription_cycle") {
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer;

        // Reset usage counter at the start of each billing period
        const { error: resetError } = await supabase
          .from("profiles")
          .update({ transformations_used: 0 })
          .eq("stripe_customer_id", customerId);
        if (resetError) console.error("Webhook: failed to reset usage counter", resetError);
      }
      break;
    }

    case "invoice.payment_failed": {
      // Log for monitoring — could send notification email
      console.error(
        `Payment failed for invoice ${event.data.object.id}`,
      );
      break;
    }
  }

  return new Response("ok", { status: 200 });
}
