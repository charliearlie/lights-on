import { test, expect } from "@playwright/test";
import { createTestUser, deleteTestUser } from "../helpers/auth";
import { supabaseAdmin } from "../helpers/supabase";
import {
  signWebhookPayload,
  buildWebhookPayload,
  sendWebhook,
} from "../helpers/stripe";

const WEBHOOK_USER_EMAIL = "webhook-test@camber-test.local";
const WEBHOOK_USER_PASSWORD = "webhook-test-password-2024!";

test.describe("Stripe Webhooks", () => {
  let testUserId: string;
  let baseURL: string;

  test.beforeAll(async () => {
    baseURL = "http://localhost:5173";
    const user = await createTestUser(WEBHOOK_USER_EMAIL, WEBHOOK_USER_PASSWORD);
    testUserId = user.id;
  });

  test.afterAll(async () => {
    await deleteTestUser(testUserId);
  });

  test.describe("checkout.session.completed — service order", () => {
    let orderId: string;

    test.beforeAll(async () => {
      // Create a pending service order via admin
      const { data, error } = await supabaseAdmin
        .from("service_orders")
        .insert({
          user_id: testUserId,
          package: "starter",
          status: "pending",
          amount_paid: 4900,
        })
        .select()
        .single();
      if (error) throw error;
      orderId = data.id;
    });

    test("updates order status to paid and sets stripe_payment_id", async () => {
      const { response } = await sendWebhook(
        baseURL,
        "checkout.session.completed",
        {
          payment_intent: "pi_test_12345",
        },
        {
          order_id: orderId,
        }
      );

      expect(response.status).toBe(200);

      // Verify the order was updated
      const { data: order } = await supabaseAdmin
        .from("service_orders")
        .select("status, stripe_payment_id")
        .eq("id", orderId)
        .single();

      expect(order?.status).toBe("paid");
      expect(order?.stripe_payment_id).toBe("pi_test_12345");
    });
  });

  test.describe("checkout.session.completed — subscription", () => {
    test("sets stripe_customer_id on user profile", async () => {
      const { response } = await sendWebhook(
        baseURL,
        "checkout.session.completed",
        {
          customer: "cus_test_sub_99",
          subscription: "sub_test_99",
        },
        {
          user_id: testUserId,
        }
      );

      expect(response.status).toBe(200);

      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", testUserId)
        .single();

      expect(profile?.stripe_customer_id).toBe("cus_test_sub_99");
    });
  });

  test.describe("customer.subscription.created", () => {
    test("updates profile plan and transformations_limit", async () => {
      // Ensure stripe_customer_id is set from previous test or set it
      await supabaseAdmin
        .from("profiles")
        .update({ stripe_customer_id: "cus_test_sub_created" })
        .eq("id", testUserId);

      const periodStart = Math.floor(Date.now() / 1000);

      const { response } = await sendWebhook(
        baseURL,
        "customer.subscription.created",
        {
          customer: "cus_test_sub_created",
          current_period_start: periodStart,
        },
        {
          plan: "pro",
        }
      );

      expect(response.status).toBe(200);

      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("plan, transformations_limit, billing_period_start")
        .eq("id", testUserId)
        .single();

      expect(profile?.plan).toBe("pro");
      expect(profile?.transformations_limit).toBe(100);
      expect(profile?.billing_period_start).toBeTruthy();

      // Verify the billing_period_start matches (within a second)
      const expected = new Date(periodStart * 1000).toISOString();
      expect(profile?.billing_period_start).toBe(expected);
    });
  });

  test.describe("customer.subscription.deleted", () => {
    test("downgrades profile to free plan with limit of 5", async () => {
      // Set up user as a paying subscriber
      await supabaseAdmin
        .from("profiles")
        .update({
          stripe_customer_id: "cus_test_sub_deleted",
          plan: "pro",
          transformations_limit: 100,
        })
        .eq("id", testUserId);

      const { response } = await sendWebhook(
        baseURL,
        "customer.subscription.deleted",
        {
          customer: "cus_test_sub_deleted",
        }
      );

      expect(response.status).toBe(200);

      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("plan, transformations_limit")
        .eq("id", testUserId)
        .single();

      expect(profile?.plan).toBe("free");
      expect(profile?.transformations_limit).toBe(5);
    });
  });

  test.describe("invoice.payment_succeeded", () => {
    test("resets transformations_used to 0 on subscription_cycle", async () => {
      // Set up user with usage
      await supabaseAdmin
        .from("profiles")
        .update({
          stripe_customer_id: "cus_test_invoice",
          transformations_used: 50,
        })
        .eq("id", testUserId);

      const { response } = await sendWebhook(
        baseURL,
        "invoice.payment_succeeded",
        {
          customer: "cus_test_invoice",
          billing_reason: "subscription_cycle",
        }
      );

      expect(response.status).toBe(200);

      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("transformations_used")
        .eq("id", testUserId)
        .single();

      expect(profile?.transformations_used).toBe(0);
    });
  });

  test.describe("Signature verification", () => {
    test("returns 400 for invalid signature", async () => {
      const payload = buildWebhookPayload(
        "checkout.session.completed",
        { payment_intent: "pi_fake" },
        { order_id: "fake-id" }
      );

      const response = await fetch(`${baseURL}/api/webhooks/stripe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "stripe-signature": "t=1234567890,v1=invalid_signature_value",
        },
        body: payload,
      });

      expect(response.status).toBe(400);
    });

    test("returns 400 when stripe-signature header is missing", async () => {
      const payload = buildWebhookPayload(
        "checkout.session.completed",
        { payment_intent: "pi_fake" },
        { order_id: "fake-id" }
      );

      const response = await fetch(`${baseURL}/api/webhooks/stripe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: payload,
      });

      expect(response.status).toBe(400);
    });
  });
});
