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
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { title, description, product_value_sgd, deliverables, niches, min_followers, min_engagement_rate } = body;

  if (!title || !description || !product_value_sgd || !deliverables) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Credit check
  const { data: brandData } = await supabase
    .from("brand_profiles")
    .select("credits")
    .eq("id", user.id)
    .single();

  const credits = (brandData as { credits: number } | null)?.credits ?? 0;
  if (credits < 1) {
    return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
  }

  const { data, error } = await supabase
    .from("listings")
    .insert({
      brand_id: user.id,
      title: title as string,
      description: description as string,
      product_value_sgd: product_value_sgd as number,
      deliverables: deliverables as string,
      niches: (niches as string[]) ?? [],
      min_followers: (min_followers as number | null) ?? null,
      min_engagement_rate: (min_engagement_rate as number | null) ?? null,
      status: "active",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const listingId = (data as { id: string }).id;

  // Deduct credit and log transaction
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  await admin.from("brand_profiles").update({ credits: credits - 1 }).eq("id", user.id);
  await admin.from("credit_transactions").insert({
    brand_id: user.id,
    amount: -1,
    action: "post_listing",
    listing_id: listingId,
  });

  return NextResponse.json({ id: listingId });
}
