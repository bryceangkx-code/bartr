import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

  const admin = createAdminClient();

  // Step 1 — Atomic credit decrement (BEFORE listing insert).
  // The Postgres function does a single UPDATE … WHERE credits >= 1 and returns
  // TRUE only when one row was updated, eliminating the TOCTOU race condition
  // that existed with the previous SELECT-then-UPDATE pattern.
  const { data: deducted, error: deductError } = await admin.rpc("decrement_brand_credit", {
    p_brand_id: user.id,
  });

  if (deductError || !deducted) {
    return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
  }

  // Step 2 — Insert listing only after credits are successfully reserved.
  const { data, error: insertError } = await supabase
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

  if (insertError) {
    // Step 3 — Compensating transaction: restore the deducted credit so the
    // brand is not charged for a listing that was never persisted.
    await admin.rpc("increment_brand_credit_compensate", { p_brand_id: user.id });
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const listingId = (data as { id: string }).id;

  // Step 4 — Log the credit transaction. Error is checked and surfaced.
  const { error: logError } = await admin.from("credit_transactions").insert({
    brand_id: user.id,
    amount: -1,
    action: "post_listing",
    listing_id: listingId,
  });

  if (logError) {
    // Non-fatal: listing was created and credit was deducted successfully.
    // Log for observability but do not fail the request.
    console.error("Failed to log credit transaction:", logError.message);
  }

  return NextResponse.json({ id: listingId });
}
