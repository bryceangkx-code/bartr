import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const allowedStatuses = ["active", "paused", "closed"];
  if (body.status && !allowedStatuses.includes(body.status as string)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if ("status" in body) updates.status = body.status;
  if ("title" in body) updates.title = body.title;
  if ("description" in body) updates.description = body.description;
  if ("product_value_sgd" in body) updates.product_value_sgd = body.product_value_sgd;
  if ("deliverables" in body) updates.deliverables = body.deliverables;
  if ("niches" in body) updates.niches = body.niches;
  if ("min_followers" in body) updates.min_followers = body.min_followers;
  if ("min_engagement_rate" in body) updates.min_engagement_rate = body.min_engagement_rate;

  const { error } = await supabase
    .from("listings")
    .update(updates)
    .eq("id", params.id)
    .eq("brand_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
