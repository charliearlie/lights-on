import crypto from "crypto";

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

/**
 * Signs a Stripe webhook payload with the webhook secret.
 * Produces a valid `stripe-signature` header value.
 */
export function signWebhookPayload(payload: string, timestamp?: number): string {
  const ts = timestamp ?? Math.floor(Date.now() / 1000);
  const signedPayload = `${ts}.${payload}`;
  const signature = crypto
    .createHmac("sha256", STRIPE_WEBHOOK_SECRET)
    .update(signedPayload)
    .digest("hex");
  return `t=${ts},v1=${signature}`;
}

/**
 * Constructs a Stripe event-like payload for testing webhooks.
 */
export function buildWebhookPayload(
  eventType: string,
  data: Record<string, unknown>,
  metadata?: Record<string, string>
) {
  const event = {
    id: `evt_test_${crypto.randomUUID().replace(/-/g, "")}`,
    object: "event",
    type: eventType,
    data: {
      object: {
        ...data,
        ...(metadata ? { metadata } : {}),
      },
    },
    created: Math.floor(Date.now() / 1000),
    livemode: false,
  };
  return JSON.stringify(event);
}

/**
 * Sends a signed webhook request to the local dev server.
 */
export async function sendWebhook(
  baseURL: string,
  eventType: string,
  data: Record<string, unknown>,
  metadata?: Record<string, string>
) {
  const payload = buildWebhookPayload(eventType, data, metadata);
  const signature = signWebhookPayload(payload);

  const response = await fetch(`${baseURL}/api/webhooks/stripe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": signature,
    },
    body: payload,
  });

  return { response, payload: JSON.parse(payload) };
}
