import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

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

  // Update base profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      display_name: body.display_name as string | null,
      bio: body.bio as string | null,
      location: body.location as string | null,
    })
    .eq("id", user.id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Update creator profile fields if present
  const creatorFields: Record<string, unknown> = {};
  if ("instagram_handle" in body) creatorFields.instagram_handle = body.instagram_handle;
  if ("followers" in body) creatorFields.followers = body.followers;
  if ("engagement_rate" in body) creatorFields.engagement_rate = body.engagement_rate;
  if ("niches" in body) creatorFields.niches = body.niches;
  if ("portfolio_urls" in body) creatorFields.portfolio_urls = body.portfolio_urls;

  if (Object.keys(creatorFields).length > 0) {
    const { error: cpError } = await supabase
      .from("creator_profiles")
      .update(creatorFields)
      .eq("id", user.id);

    if (cpError) {
      return NextResponse.json({ error: cpError.message }, { status: 500 });
    }
  }

  // Update brand profile fields if present
  const brandFields: Record<string, unknown> = {};
  if ("company_name" in body) brandFields.company_name = body.company_name;
  if ("website" in body) brandFields.website = body.website;
  if ("category" in body) brandFields.category = body.category;

  if (Object.keys(brandFields).length > 0) {
    const { error: bpError } = await supabase
      .from("brand_profiles")
      .update(brandFields)
      .eq("id", user.id);

    if (bpError) {
      return NextResponse.json({ error: bpError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
