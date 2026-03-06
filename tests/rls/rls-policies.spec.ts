import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { createTestUser, getTestSession, deleteTestUser } from "../helpers/auth";
import {
  supabaseAdmin,
  createTestProject,
  createTestImageState,
} from "../helpers/supabase";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;

const USER_A_EMAIL = "rls-test-a@camber-test.local";
const USER_A_PASSWORD = "rls-test-password-a-2024!";
const USER_B_EMAIL = "rls-test-b@camber-test.local";
const USER_B_PASSWORD = "rls-test-password-b-2024!";

function createUserClient(accessToken: string) {
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

test.describe("Row Level Security Policies", () => {
  let userAId: string;
  let userBId: string;
  let userAClient: ReturnType<typeof createUserClient>;
  let userBClient: ReturnType<typeof createUserClient>;

  // Test data IDs
  let projectA: { id: string; name: string };
  let projectB: { id: string; name: string };
  let projectBPublic: { id: string; name: string };
  let imageStateA: { id: string };
  let imageStateB: { id: string };
  let orderAId: string;
  let orderBId: string;
  let transformationAId: string;
  let transformationBId: string;

  test.beforeAll(async () => {
    // Create test users
    const userA = await createTestUser(USER_A_EMAIL, USER_A_PASSWORD);
    const userB = await createTestUser(USER_B_EMAIL, USER_B_PASSWORD);
    userAId = userA.id;
    userBId = userB.id;

    // Get sessions and create per-user clients
    const sessionA = await getTestSession(USER_A_EMAIL, USER_A_PASSWORD);
    const sessionB = await getTestSession(USER_B_EMAIL, USER_B_PASSWORD);
    userAClient = createUserClient(sessionA.access_token);
    userBClient = createUserClient(sessionB.access_token);

    // Create test projects via admin
    projectA = await createTestProject(userAId, "RLS Test Project A");
    projectB = await createTestProject(userBId, "RLS Test Project B");
    projectBPublic = await createTestProject(userBId, "RLS Test Public B", true);

    // Create image states
    imageStateA = await createTestImageState(projectA.id);
    imageStateB = await createTestImageState(projectB.id);

    // Create service orders via admin
    const { data: orderA } = await supabaseAdmin
      .from("service_orders")
      .insert({
        user_id: userAId,
        package: "starter",
        status: "pending",
        amount_paid: 4900,
      })
      .select()
      .single();
    orderAId = orderA!.id;

    const { data: orderB } = await supabaseAdmin
      .from("service_orders")
      .insert({
        user_id: userBId,
        package: "pro",
        status: "pending",
        amount_paid: 9900,
      })
      .select()
      .single();
    orderBId = orderB!.id;

    // Create transformations via admin
    const { data: txA } = await supabaseAdmin
      .from("transformations")
      .insert({
        user_id: userAId,
        project_id: projectA.id,
        source_image_url: "https://example.com/a.png",
        transformation_type: "illuminate",
        status: "completed",
      })
      .select()
      .single();
    transformationAId = txA!.id;

    const { data: txB } = await supabaseAdmin
      .from("transformations")
      .insert({
        user_id: userBId,
        project_id: projectB.id,
        source_image_url: "https://example.com/b.png",
        transformation_type: "illuminate",
        status: "completed",
      })
      .select()
      .single();
    transformationBId = txB!.id;
  });

  test.afterAll(async () => {
    // Clean up in correct order (foreign keys)
    await supabaseAdmin.from("transformations").delete().eq("id", transformationAId);
    await supabaseAdmin.from("transformations").delete().eq("id", transformationBId);
    await supabaseAdmin.from("service_orders").delete().eq("id", orderAId);
    await supabaseAdmin.from("service_orders").delete().eq("id", orderBId);
    await supabaseAdmin.from("image_states").delete().eq("id", imageStateA.id);
    await supabaseAdmin.from("image_states").delete().eq("id", imageStateB.id);
    await supabaseAdmin.from("projects").delete().eq("id", projectA.id);
    await supabaseAdmin.from("projects").delete().eq("id", projectB.id);
    await supabaseAdmin.from("projects").delete().eq("id", projectBPublic.id);
    await deleteTestUser(userAId);
    await deleteTestUser(userBId);
  });

  test.describe("Profiles", () => {
    test("user can read own profile", async () => {
      const { data, error } = await userAClient
        .from("profiles")
        .select("*")
        .eq("id", userAId);

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data![0].id).toBe(userAId);
    });

    test("user cannot read another user's profile", async () => {
      const { data, error } = await userAClient
        .from("profiles")
        .select("*")
        .eq("id", userBId);

      expect(error).toBeNull();
      expect(data).toHaveLength(0);
    });

    test("user can update own display_name", async () => {
      const { error } = await userAClient
        .from("profiles")
        .update({ display_name: "Updated A" })
        .eq("id", userAId);

      expect(error).toBeNull();

      // Verify via admin
      const { data } = await supabaseAdmin
        .from("profiles")
        .select("display_name")
        .eq("id", userAId)
        .single();
      expect(data?.display_name).toBe("Updated A");
    });

    test("user cannot update another user's display_name", async () => {
      // Get current value
      const { data: before } = await supabaseAdmin
        .from("profiles")
        .select("display_name")
        .eq("id", userBId)
        .single();

      await userAClient
        .from("profiles")
        .update({ display_name: "Hacked!" })
        .eq("id", userBId);

      // Verify via admin the value didn't change
      const { data: after } = await supabaseAdmin
        .from("profiles")
        .select("display_name")
        .eq("id", userBId)
        .single();
      expect(after?.display_name).toBe(before?.display_name);
    });
  });

  test.describe("Projects", () => {
    test("user can see own projects", async () => {
      const { data, error } = await userAClient
        .from("projects")
        .select("*")
        .eq("id", projectA.id);

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data![0].id).toBe(projectA.id);
    });

    test("user cannot see another user's private projects", async () => {
      const { data, error } = await userAClient
        .from("projects")
        .select("*")
        .eq("id", projectB.id);

      expect(error).toBeNull();
      expect(data).toHaveLength(0);
    });

    test("user can see another user's public projects", async () => {
      const { data, error } = await userAClient
        .from("projects")
        .select("*")
        .eq("id", projectBPublic.id);

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data![0].id).toBe(projectBPublic.id);
    });

    test("user cannot update another user's project", async () => {
      const { data: before } = await supabaseAdmin
        .from("projects")
        .select("name")
        .eq("id", projectB.id)
        .single();

      await userAClient
        .from("projects")
        .update({ name: "Hacked Project!" })
        .eq("id", projectB.id);

      const { data: after } = await supabaseAdmin
        .from("projects")
        .select("name")
        .eq("id", projectB.id)
        .single();
      expect(after?.name).toBe(before?.name);
    });

    test("user cannot delete another user's project", async () => {
      await userAClient
        .from("projects")
        .delete()
        .eq("id", projectB.id);

      // Verify project still exists via admin
      const { data } = await supabaseAdmin
        .from("projects")
        .select("id")
        .eq("id", projectB.id)
        .single();
      expect(data).not.toBeNull();
    });
  });

  test.describe("Image States", () => {
    test("user can see image states for own project", async () => {
      const { data, error } = await userAClient
        .from("image_states")
        .select("*")
        .eq("project_id", projectA.id);

      expect(error).toBeNull();
      expect(data!.length).toBeGreaterThanOrEqual(1);
    });

    test("user cannot see image states for another user's private project", async () => {
      const { data, error } = await userAClient
        .from("image_states")
        .select("*")
        .eq("project_id", projectB.id);

      expect(error).toBeNull();
      expect(data).toHaveLength(0);
    });
  });

  test.describe("Service Orders", () => {
    test("user can see own orders", async () => {
      const { data, error } = await userAClient
        .from("service_orders")
        .select("*")
        .eq("id", orderAId);

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data![0].id).toBe(orderAId);
    });

    test("user cannot see another user's orders", async () => {
      const { data, error } = await userAClient
        .from("service_orders")
        .select("*")
        .eq("id", orderBId);

      expect(error).toBeNull();
      expect(data).toHaveLength(0);
    });
  });

  test.describe("Transformations", () => {
    test("user can see own transformations", async () => {
      const { data, error } = await userAClient
        .from("transformations")
        .select("*")
        .eq("id", transformationAId);

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data![0].id).toBe(transformationAId);
    });

    test("user cannot see another user's transformations", async () => {
      const { data, error } = await userAClient
        .from("transformations")
        .select("*")
        .eq("id", transformationBId);

      expect(error).toBeNull();
      expect(data).toHaveLength(0);
    });
  });

  test.describe("Known RLS policy gaps", () => {
    test("document missing policies", () => {
      console.log("[RLS GAP] service_orders: missing UPDATE policy — users cannot update their own orders via client");
      console.log("[RLS GAP] service_orders: missing DELETE policy — users cannot cancel their own orders via client");
      console.log("[RLS GAP] transformations: missing UPDATE policy — users cannot update their own transformations via client");
    });
  });
});
