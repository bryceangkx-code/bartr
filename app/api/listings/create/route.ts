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

  return NextResponse.json({ id: (data as { id: string }).id });
}
