import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function createTestProject(
  userId: string,
  name: string,
  isPublic = false
) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  const { data, error } = await supabaseAdmin
    .from("projects")
    .insert({ user_id: userId, name, slug, is_public: isPublic })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createTestImageState(projectId: string) {
  const { data, error } = await supabaseAdmin
    .from("image_states")
    .insert({
      project_id: projectId,
      product_name: "Test Product",
      sort_order: 0,
      states: [
        {
          label: "Off",
          image_url: "https://placehold.co/400x400/FFFFFF/999?text=OFF",
        },
        {
          label: "On",
          image_url: "https://placehold.co/400x400/1a1a1a/FFD700?text=ON",
        },
      ],
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function cleanupTestData(userId: string) {
  const { data: projects } = await supabaseAdmin
    .from("projects")
    .select("id")
    .eq("user_id", userId);

  if (projects) {
    for (const project of projects) {
      await supabaseAdmin
        .from("image_states")
        .delete()
        .eq("project_id", project.id);
    }
  }
  await supabaseAdmin.from("transformations").delete().eq("user_id", userId);
  await supabaseAdmin.from("projects").delete().eq("user_id", userId);
  await supabaseAdmin.from("service_orders").delete().eq("user_id", userId);
}
