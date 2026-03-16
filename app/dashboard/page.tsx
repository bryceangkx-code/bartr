import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

/**
 * /dashboard — smart redirect based on user role.
 * Middleware ensures only authenticated users reach here.
 */
export default async function DashboardRootPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const profile = data as Pick<Profile, "role"> | null;

  if (!profile) redirect("/onboarding");

  if (profile.role === "creator") redirect("/dashboard/creator");
  if (profile.role === "brand") redirect("/dashboard/brand");

  redirect("/login");
}
