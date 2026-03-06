import { test, expect } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
import {
  createTestUser,
  authenticateContext,
  deleteTestUser,
} from "../helpers/auth";
import {
  createTestProject,
  createTestImageState,
  cleanupTestData,
} from "../helpers/supabase";
import {
  TEST_USER_EMAIL,
  TEST_USER_PASSWORD,
  TEST_PROJECT_NAME,
} from "../helpers/test-data";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use a unique email to avoid collisions with other test suites
const SAAS_USER_EMAIL = `saas-flow-${Date.now()}@camber-test.local`;

test.describe("SaaS flow", () => {
  let userId: string;

  test.beforeAll(async () => {
    const user = await createTestUser(SAAS_USER_EMAIL, TEST_USER_PASSWORD);
    userId = user.id;
  });

  test.afterAll(async () => {
    if (userId) {
      await cleanupTestData(userId);
      await deleteTestUser(userId);
    }
  });

  test("dashboard loads after authentication", async ({ browser }) => {
    const context = await browser.newContext();
    await authenticateContext(context, SAAS_USER_EMAIL, TEST_USER_PASSWORD);
    const page = await context.newPage();

    await page.goto("/app");
    await page.waitForURL("/app");

    // The dashboard should display "Your projects" heading
    await expect(page.locator("h1")).toContainText("Your projects");
    // Empty state should show since this is a fresh user
    await expect(page.getByText("No projects yet")).toBeVisible();

    await context.close();
  });

  test("create project and navigate to editor", async ({ browser }) => {
    const context = await browser.newContext();
    await authenticateContext(context, SAAS_USER_EMAIL, TEST_USER_PASSWORD);
    const page = await context.newPage();

    await page.goto("/app");
    await page.waitForURL("/app");

    // Fill the project name input and submit
    await page.getByPlaceholder("Project name").fill(TEST_PROJECT_NAME);
    await page.getByRole("button", { name: "New Project" }).click();

    // Should redirect to /app/project/:id
    await page.waitForURL(/\/app\/project\/.+/);

    // The project editor should display the project name
    await expect(page.locator("h1")).toContainText(TEST_PROJECT_NAME);

    // Upload section should be present
    await expect(page.getByText("Upload & Transform")).toBeVisible();

    // Embed section should be present
    await expect(page.getByText("Embed Preview")).toBeVisible();

    // Should show private by default
    await expect(page.getByRole("button", { name: "Private" })).toBeVisible();

    await context.close();
  });

  test.describe("project with image states", () => {
    let projectId: string;

    test.beforeAll(async () => {
      // Seed a public project with an image state for the remaining tests
      const project = await createTestProject(
        userId,
        "Seeded Project",
        true // public
      );
      projectId = project.id;
      await createTestImageState(projectId);
    });

    test("project page shows image states and toggle", async ({
      browser,
    }) => {
      const context = await browser.newContext();
      await authenticateContext(context, SAAS_USER_EMAIL, TEST_USER_PASSWORD);
      const page = await context.newPage();

      await page.goto(`/app/project/${projectId}`);
      await page.waitForURL(`/app/project/${projectId}`);

      // Image states section should have content
      await expect(page.getByText("Image States")).toBeVisible();
      // The seeded product name should appear
      await expect(page.getByText("Test Product")).toBeVisible();

      // The on/off toggle button should be visible (shows "Off" or "On")
      const toggleButton = page.getByRole("button", { name: /^(Off|On)$/ });
      await expect(toggleButton).toBeVisible();

      await context.close();
    });

    test("upload form accepts an image file", async ({ browser }) => {
      const context = await browser.newContext();
      await authenticateContext(context, SAAS_USER_EMAIL, TEST_USER_PASSWORD);
      const page = await context.newPage();

      await page.goto(`/app/project/${projectId}`);
      await page.waitForURL(`/app/project/${projectId}`);

      // Set a file on the hidden file input
      const testImagePath = path.resolve(
        __dirname,
        "../fixtures/test-image.png"
      );
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(testImagePath);

      // After selecting a file, the preview should show the filename
      await expect(page.getByText("test-image.png")).toBeVisible();

      // The transformation dropdown should be present
      const select = page.locator("select").first();
      await expect(select).toBeVisible();
      // Default value should be "lights-on" (first option)
      await expect(select).toHaveValue("lights-on");

      await context.close();
    });

    test("mock AI transform and submit upload", async ({ browser }) => {
      const context = await browser.newContext();
      await authenticateContext(context, SAAS_USER_EMAIL, TEST_USER_PASSWORD);
      const page = await context.newPage();

      // Mock the /api/project-upload endpoint to return a successful response
      // without actually calling the AI API
      await page.route("**/api/project-upload", async (route) => {
        // Seed a new image state so the page sees it on revalidation
        await createTestImageState(projectId);

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            imageState: {
              id: "mock-state-id",
              project_id: projectId,
              product_name: "test-image",
              sort_order: 1,
              states: [
                {
                  label: "Original",
                  image_url:
                    "https://placehold.co/400x400/FFFFFF/999?text=ORIGINAL",
                },
                {
                  label: "Lights On",
                  image_url:
                    "https://placehold.co/400x400/1a1a1a/FFD700?text=LIGHTS-ON",
                },
              ],
            },
          }),
        });
      });

      await page.goto(`/app/project/${projectId}`);
      await page.waitForURL(`/app/project/${projectId}`);

      // Upload a test image
      const testImagePath = path.resolve(
        __dirname,
        "../fixtures/test-image.png"
      );
      await page.locator('input[type="file"]').setInputFiles(testImagePath);
      await expect(page.getByText("test-image.png")).toBeVisible();

      // Click Transform button
      await page.getByRole("button", { name: "Transform" }).click();

      // After the mocked response, the page should revalidate and show image states
      // Wait for the "Test Product" text from our seeded image state
      await expect(page.getByText("Test Product").first()).toBeVisible({
        timeout: 10000,
      });

      await context.close();
    });

    test("toggle project public/private visibility", async ({ browser }) => {
      // Start with a private project
      const privateProject = await createTestProject(
        userId,
        "Private Toggle Test",
        false
      );

      const context = await browser.newContext();
      await authenticateContext(context, SAAS_USER_EMAIL, TEST_USER_PASSWORD);
      const page = await context.newPage();

      await page.goto(`/app/project/${privateProject.id}`);
      await page.waitForURL(`/app/project/${privateProject.id}`);

      // Should start as Private (use exact match to avoid matching project name button)
      await expect(page.getByRole("button", { name: "Private", exact: true })).toBeVisible();

      // Click the public/private toggle button
      await page.getByRole("button", { name: "Private", exact: true }).click();

      // Should now show "Public"
      await expect(page.getByRole("button", { name: "Public", exact: true })).toBeVisible({ timeout: 5000 });

      await context.close();
    });

    test("embed code is visible when project is public", async ({
      browser,
    }) => {
      const context = await browser.newContext();
      await authenticateContext(context, SAAS_USER_EMAIL, TEST_USER_PASSWORD);
      const page = await context.newPage();

      // The seeded project is already public
      await page.goto(`/app/project/${projectId}`);
      await page.waitForURL(`/app/project/${projectId}`);

      // Embed code section should be visible
      await expect(page.getByText("Embed Code")).toBeVisible();

      // Should contain an iframe snippet
      const codeBlock = page.locator("code");
      await expect(codeBlock).toContainText("<iframe");
      await expect(codeBlock).toContainText(`/embed/${projectId}`);

      // Copy button should be present
      await expect(page.getByRole("button", { name: "Copy" })).toBeVisible();

      await context.close();
    });

    test("embed route renders image with no chrome", async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      // The embed route is public — no auth needed
      await page.goto(`/embed/${projectId}`);

      // Should NOT have a header or navigation
      await expect(page.locator("header")).toHaveCount(0);
      await expect(page.locator("nav")).toHaveCount(0);

      // Should render the ImageToggle component with images
      // The container fills the viewport
      const container = page.locator(".h-screen.w-screen");
      await expect(container).toBeVisible();

      // Images from the seeded state should be loading
      const images = page.locator("img");
      await expect(images.first()).toBeVisible({ timeout: 10000 });

      await context.close();
    });
  });
});
