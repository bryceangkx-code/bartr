import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BRAND_TRANSITIONS: Record<string, string[]> = {
  applied: ["accepted", "rejected"],
  accepted: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
};

const CREATOR_TRANSITIONS: Record<string, string[]> = {
  applied: ["cancelled"],
  accepted: ["cancelled"],
};

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

  const newStatus = body.status as string;
  const brandNote = body.brand_note as string | undefined;

  // Fetch the deal
  const { data: dealData, error: dealError } = await supabase
    .from("deals")
    .select("*")
    .eq("id", params.id)
    .single();

  if (dealError || !dealData) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  const deal = dealData as {
    id: string;
    brand_id: string;
    creator_id: string;
    status: string;
  };

  const isBrand = user.id === deal.brand_id;
  const isCreator = user.id === deal.creator_id;

  if (!isBrand && !isCreator) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Validate transition
  const allowed = isBrand
    ? BRAND_TRANSITIONS[deal.status] ?? []
    : CREATOR_TRANSITIONS[deal.status] ?? [];

  if (!allowed.includes(newStatus)) {
    return NextResponse.json(
      { error: `Cannot move from '${deal.status}' to '${newStatus}'` },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = { status: newStatus };
  if (isBrand && brandNote !== undefined) updates.brand_note = brandNote;

  const { error: updateError } = await supabase
    .from("deals")
    .update(updates)
    .eq("id", params.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
