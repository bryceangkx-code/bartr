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

  const { listing_id, creator_note } = body;

  if (!listing_id) {
    return NextResponse.json({ error: "listing_id is required" }, { status: 400 });
  }

  // Fetch listing to get brand_id and check status
  const { data: listingData, error: listingError } = await supabase
    .from("listings")
    .select("id, brand_id, status")
    .eq("id", listing_id as string)
    .single();

  if (listingError || !listingData) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const listing = listingData as { id: string; brand_id: string; status: string };

  if (listing.status !== "active") {
    return NextResponse.json(
      { error: "This listing is not accepting applications" },
      { status: 400 }
    );
  }

  // Check not already applied
  const { data: existing } = await supabase
    .from("deals")
    .select("id")
    .eq("listing_id", listing_id as string)
    .eq("creator_id", user.id)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "You have already applied to this listing" },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from("deals")
    .insert({
      listing_id: listing_id as string,
      creator_id: user.id,
      brand_id: listing.brand_id,
      status: "applied",
      creator_note: (creator_note as string | null) ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: (data as { id: string }).id });
}
