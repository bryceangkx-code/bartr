import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const VALID_CREDIT_AMOUNTS = new Set([5, 15, 30]);

export async function POST(request: Request) {
  // Read raw body for signature verification
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signature verification failed";
    console.error("[webhook] Signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Ignore all events except checkout.session.completed
  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // Extract and validate metadata
  const brandId = session.metadata?.brand_id;
  const creditsRaw = session.metadata?.credits;

  if (!brandId || !creditsRaw) {
    console.error("[webhook] Missing metadata in session:", session.id, {
      brandId,
      creditsRaw,
    });
    return NextResponse.json(
      { error: "Missing required metadata" },
      { status: 500 }
    );
  }

  const creditsToAdd = parseInt(creditsRaw, 10);
  if (!Number.isInteger(creditsToAdd) || creditsToAdd <= 0) {
    console.error("[webhook] Invalid credits value in metadata:", creditsRaw);
    return NextResponse.json(
      { error: "Invalid credits value" },
      { status: 500 }
    );
  }

  // Re-validate against known packages — do NOT trust arbitrary values
  if (!VALID_CREDIT_AMOUNTS.has(creditsToAdd)) {
    console.error(
      "[webhook] Credits amount not in valid packages:",
      creditsToAdd
    );
    return NextResponse.json(
      { error: "Credits amount not in valid packages" },
      { status: 500 }
    );
  }

  const admin = createAdminClient();

  try {
    // Atomically increment credits using the Postgres function
    const { error: rpcError } = await admin.rpc("add_brand_credits", {
      p_brand_id: brandId,
      p_amount: creditsToAdd,
    });

    if (rpcError) {
      console.error("[webhook] Failed to increment credits:", rpcError);
      return NextResponse.json(
        { error: "Failed to update credits" },
        { status: 500 }
      );
    }

    // Log the transaction
    const { error: insertError } = await admin
      .from("credit_transactions")
      .insert({
        brand_id: brandId,
        amount: creditsToAdd,
        action: "topup",
        stripe_session_id: session.id,
      });

    if (insertError) {
      // Handle idempotency: duplicate stripe_session_id means webhook fired twice
      if (
        insertError.code === "23505" || // Postgres unique violation
        insertError.message.includes("unique") ||
        insertError.message.includes("duplicate")
      ) {
        console.warn(
          "[webhook] Duplicate webhook for session:",
          session.id,
          "— returning idempotent 200"
        );
        return NextResponse.json({ received: true });
      }

      console.error("[webhook] Failed to insert credit transaction:", insertError);
      return NextResponse.json(
        { error: "Failed to log transaction" },
        { status: 500 }
      );
    }

    console.log(
      `[webhook] Granted ${creditsToAdd} credits to brand ${brandId} for session ${session.id}`
    );
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[webhook] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
