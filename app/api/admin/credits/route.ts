import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  // 1. Verify authentication
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Verify admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if ((profile as { role: string } | null)?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3. Parse request body
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { brand_id, amount, note } = body;

  // 4. Validate inputs
  if (!brand_id || typeof brand_id !== "string" || brand_id.trim() === "") {
    return NextResponse.json(
      { error: "brand_id must be a non-empty string" },
      { status: 400 }
    );
  }

  if (
    typeof amount !== "number" ||
    !Number.isInteger(amount) ||
    amount < 1 ||
    amount > 100
  ) {
    return NextResponse.json(
      { error: "amount must be a positive integer between 1 and 100" },
      { status: 400 }
    );
  }

  if (note !== undefined && typeof note !== "string") {
    return NextResponse.json(
      { error: "note must be a string if provided" },
      { status: 400 }
    );
  }

  const adminClient = createAdminClient();

  // 5. Atomically update brand credits via RPC
  const { error: rpcError } = await adminClient.rpc("add_brand_credits", {
    p_brand_id: brand_id,
    p_amount: amount,
  });

  if (rpcError) {
    console.error("[admin/credits] add_brand_credits RPC error:", rpcError);
    return NextResponse.json(
      { error: "Failed to update credits" },
      { status: 500 }
    );
  }

  // 6. Insert credit_transactions row
  const { error: txError } = await adminClient
    .from("credit_transactions")
    .insert({
      brand_id,
      amount,
      action: "admin_grant",
      note: (note as string | undefined) ?? null,
    });

  if (txError) {
    console.error("[admin/credits] credit_transactions insert error:", txError);
    return NextResponse.json(
      { error: "Credits updated but failed to record transaction" },
      { status: 500 }
    );
  }

  // 7. Return success
  return NextResponse.json({ success: true, credits_added: amount });
}
