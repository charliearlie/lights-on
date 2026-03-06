import { test, expect } from "@playwright/test";
import path from "path";
import { createTestUser, deleteTestUser } from "../helpers/auth";
import {
  supabaseAdmin,
  createTestProject,
  createTestImageState,
} from "../helpers/supabase";
import { TEST_USER_PASSWORD } from "../helpers/test-data";

// Unique email to avoid collisions with other test suites
const EMBED_USER_EMAIL = `embed-iframe-${Date.now()}@camber-test.local`;

test.describe("Embed route and iframe", () => {
  let userId: string;
  let projectId: string;

  test.beforeAll(async () => {
    const user = await createTestUser(EMBED_USER_EMAIL, TEST_USER_PASSWORD);
    userId = user.id;

    const project = await createTestProject(userId, "Embed Test Project", true);
    projectId = project.id;

    await createTestImageState(projectId);
  });

  test.afterAll(async () => {
    if (userId) {
      // Clean up image states, projects, then user
      await supabaseAdmin
        .from("image_states")
        .delete()
        .eq("project_id", projectId);
      await supabaseAdmin.from("projects").delete().eq("user_id", userId);
      await supabaseAdmin.from("profiles").delete().eq("id", userId);
      await deleteTestUser(userId);
    }
  });

  test("direct embed renders with no chrome", async ({ page }) => {
    await page.goto(`/embed/${projectId}`);

    // At least one image should be visible
    await expect(page.locator("img").first()).toBeVisible({ timeout: 15000 });

    // No header or footer — zero chrome
    await expect(page.locator("header")).toHaveCount(0);
    await expect(page.locator("footer")).toHaveCount(0);
    await expect(page.locator("nav")).toHaveCount(0);
  });

  test("query param overrides work", async ({ page }) => {
    await page.goto(
      `/embed/${projectId}?transition=slider&trigger=click&theme=light`
    );

    // Page loads without errors and images are visible
    await expect(page.locator("img").first()).toBeVisible({ timeout: 15000 });
  });

  test("dark theme param applies dark class", async ({ page }) => {
    await page.goto(`/embed/${projectId}?theme=dark`);

    await expect(page.locator("img").first()).toBeVisible({ timeout: 15000 });

    // The embed route wraps content in a div with class "dark" when theme=dark
    const darkContainer = page.locator("div.dark");
    await expect(darkContainer).toBeVisible();
  });

  test("private project returns 404", async ({ page }) => {
    // Set project to private
    await supabaseAdmin
      .from("projects")
      .update({ is_public: false })
      .eq("id", projectId);

    try {
      const response = await page.goto(`/embed/${projectId}`);
      expect(response?.status()).toBe(404);
    } finally {
      // Restore public visibility
      await supabaseAdmin
        .from("projects")
        .update({ is_public: true })
        .eq("id", projectId);
    }
  });

  test("non-existent project returns 404", async ({ page }) => {
    const response = await page.goto(
      "/embed/00000000-0000-0000-0000-000000000000"
    );
    expect(response?.status()).toBe(404);
  });

  test("embed in iframe on external page", async ({ page }) => {
    const testPagePath = path.resolve(
      __dirname,
      "../fixtures/embed-test-page.html"
    );
    await page.goto(`file://${testPagePath}`);

    // Host page should load
    await expect(page.locator("h1")).toContainText("External Page");

    // Set the iframe src dynamically
    const embedUrl = `http://localhost:5173/embed/${projectId}?transition=crossfade&trigger=hover`;
    await page.evaluate(
      (src) => {
        const iframe = document.getElementById(
          "camber-embed"
        ) as HTMLIFrameElement;
        iframe.src = src;
      },
      embedUrl
    );

    // Access iframe content
    const frame = page.frameLocator("#camber-embed");

    // Verify an image is visible inside the iframe
    await expect(frame.locator("img").first()).toBeVisible({ timeout: 15000 });

    // Verify iframe dimensions
    const iframeBox = await page.locator("#camber-embed").boundingBox();
    expect(iframeBox?.width).toBe(600);
    expect(iframeBox?.height).toBe(400);
  });

  test("embed in iframe with dark theme", async ({ page }) => {
    const testPagePath = path.resolve(
      __dirname,
      "../fixtures/embed-test-page.html"
    );
    await page.goto(`file://${testPagePath}`);

    const embedUrl = `http://localhost:5173/embed/${projectId}?theme=dark`;
    await page.evaluate(
      (src) => {
        const iframe = document.getElementById(
          "camber-embed"
        ) as HTMLIFrameElement;
        iframe.src = src;
      },
      embedUrl
    );

    const frame = page.frameLocator("#camber-embed");

    // Content loads inside the iframe
    await expect(frame.locator("img").first()).toBeVisible({ timeout: 15000 });
  });

  test("embed is interactive in iframe", async ({ page }) => {
    const testPagePath = path.resolve(
      __dirname,
      "../fixtures/embed-test-page.html"
    );
    await page.goto(`file://${testPagePath}`);

    const embedUrl = `http://localhost:5173/embed/${projectId}?trigger=click`;
    await page.evaluate(
      (src) => {
        const iframe = document.getElementById(
          "camber-embed"
        ) as HTMLIFrameElement;
        iframe.src = src;
      },
      embedUrl
    );

    const frame = page.frameLocator("#camber-embed");

    // Wait for images to load
    await expect(frame.locator("img").first()).toBeVisible({ timeout: 15000 });

    // Click the toggle area (the container with role="button" for click trigger)
    await frame.locator("[role='button']").click();

    // Page should remain loaded after interaction (no crash)
    await expect(frame.locator("img").first()).toBeVisible();
  });
});
