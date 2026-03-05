import Stripe from "stripe";

// ---------------------------------------------------------------------------
// Stripe server-side client and helpers
// ---------------------------------------------------------------------------

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (_stripe) return _stripe;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY environment variable");

  _stripe = new Stripe(key);
  return _stripe;
}

export { getStripe };

// ---------------------------------------------------------------------------
// Customer helpers
// ---------------------------------------------------------------------------

export async function createCustomer(params: {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Customer> {
  return getStripe().customers.create({
    email: params.email,
    name: params.name,
    metadata: params.metadata,
  });
}

// ---------------------------------------------------------------------------
// Checkout helpers
// ---------------------------------------------------------------------------

export async function createCheckoutSession(params: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  mode?: "subscription" | "payment";
  metadata?: Record<string, string>;
}): Promise<Stripe.Checkout.Session> {
  return getStripe().checkout.sessions.create({
    customer: params.customerId,
    line_items: [{ price: params.priceId, quantity: 1 }],
    mode: params.mode ?? "subscription",
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
  });
}

// ---------------------------------------------------------------------------
// Subscription helpers
// ---------------------------------------------------------------------------

export async function createSubscription(params: {
  customerId: string;
  priceId: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Subscription> {
  return getStripe().subscriptions.create({
    customer: params.customerId,
    items: [{ price: params.priceId }],
    metadata: params.metadata,
  });
}

export async function cancelSubscription(
  subscriptionId: string,
): Promise<Stripe.Subscription> {
  return getStripe().subscriptions.cancel(subscriptionId);
}

// ---------------------------------------------------------------------------
// Webhook verification
// ---------------------------------------------------------------------------

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET environment variable");
  }
  return getStripe().webhooks.constructEvent(payload, signature, secret);
}

// ---------------------------------------------------------------------------
// Billing Portal helpers
// ---------------------------------------------------------------------------

export async function createPortalSession(customerId: string, returnUrl: string) {
  return getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
