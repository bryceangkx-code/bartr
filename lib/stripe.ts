import Stripe from "stripe";

// Lazy getter: throws at call time (not module load) so the build succeeds
// without STRIPE_SECRET_KEY set.
export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
  });
}
