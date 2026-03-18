import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

const PACKAGES = {
  starter: { credits: 5, amount: 1500, label: "5 Credits" },
  growth: { credits: 15, amount: 4000, label: "15 Credits" },
  pro: { credits: 30, amount: 7500, label: "30 Credits" },
} as const;

type PackageKey = keyof typeof PACKAGES;

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

  const { package: packageName } = body;

  const validPackages: PackageKey[] = ["starter", "growth", "pro"];
  if (!packageName || !validPackages.includes(packageName as PackageKey)) {
    return NextResponse.json(
      { error: "Invalid package. Must be one of: starter, growth, pro" },
      { status: 400 }
    );
  }

  const pkg = PACKAGES[packageName as PackageKey];

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "sgd",
            unit_amount: pkg.amount,
            product_data: { name: `Bartr — ${pkg.label}` },
          },
          quantity: 1,
        },
      ],
      metadata: {
        brand_id: user.id,
        credits: String(pkg.credits),
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/brand?credits=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/brand`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
