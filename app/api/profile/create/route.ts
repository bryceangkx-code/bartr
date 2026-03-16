import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Verify the user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const role = body.role as string;

  if (role !== "creator" && role !== "brand") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // Create the base profile
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    role: role as "creator" | "brand",
    display_name: (body.display_name as string) ?? null,
    bio: (body.bio as string) || null,
    location: (body.location as string) || null,
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Create the role-specific profile
  if (role === "creator") {
    const { error: creatorError } = await supabase
      .from("creator_profiles")
      .upsert({
        id: user.id,
        niches: (body.niches as string[]) ?? [],
      });

    if (creatorError) {
      return NextResponse.json(
        { error: creatorError.message },
        { status: 500 }
      );
    }
  }

  if (role === "brand") {
    const { error: brandError } = await supabase.from("brand_profiles").upsert({
      id: user.id,
      company_name: (body.company_name as string) ?? null,
      website: (body.website as string) || null,
      category: (body.category as string) ?? null,
    });

    if (brandError) {
      return NextResponse.json({ error: brandError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
