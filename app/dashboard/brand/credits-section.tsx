"use client";

import { useEffect, useState } from "react";
import { Loader2, CreditCard, Coins } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CreditTransaction } from "@/types/database";

type Package = {
  key: "starter" | "growth" | "pro";
  label: string;
  credits: number;
  price: string;
  popular?: boolean;
};

const PACKAGES: Package[] = [
  { key: "starter", label: "Starter", credits: 5, price: "S$15" },
  { key: "growth", label: "Growth", credits: 15, price: "S$40", popular: true },
  { key: "pro", label: "Pro", credits: 30, price: "S$75" },
];

interface CreditsSectionProps {
  credits: number;
  transactions: CreditTransaction[];
}

export function CreditsSection({ credits, transactions }: CreditsSectionProps) {
  const [buying, setBuying] = useState<string | null>(null);

  // Check for ?credits=success on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("credits") === "success") {
      toast.success("Credits added! Your account has been topped up.");
      // Clean up the URL without triggering a navigation
      const url = new URL(window.location.href);
      url.searchParams.delete("credits");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  async function handleBuy(packageKey: "starter" | "growth" | "pro") {
    setBuying(packageKey);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package: packageKey }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        toast.error(data.error ?? "Failed to start checkout. Please try again.");
        setBuying(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error("Something went wrong. Please try again.");
      setBuying(null);
    }
  }

  return (
    <>
      {/* Credit balance card */}
      <Card className="border-[#7C3AED]/20 bg-violet-50/40">
        <CardHeader className="flex flex-row items-center gap-3 pb-3">
          <div className="rounded-lg bg-violet-100 p-2">
            <Coins className="h-5 w-5 text-[#7C3AED]" />
          </div>
          <div>
            <CardTitle className="text-base">Credit balance</CardTitle>
            <CardDescription>
              Credits are used to unlock creator contact details
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-5xl font-bold text-[#7C3AED]">
            {credits}
            <span className="text-xl font-medium text-muted-foreground ml-2">
              credit{credits !== 1 ? "s" : ""}
            </span>
          </p>
          {credits === 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Purchase a package below to get started.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Buy credits */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-[#7C3AED]" />
          Buy credits
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PACKAGES.map((pkg) => (
            <Card
              key={pkg.key}
              className={
                pkg.popular
                  ? "border-[#7C3AED] shadow-md relative"
                  : "relative"
              }
            >
              {pkg.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-[#7C3AED] text-white hover:bg-[#7C3AED] px-3 text-xs">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-2 pt-5">
                <CardTitle className="text-base">{pkg.label}</CardTitle>
                <CardDescription>{pkg.credits} credits</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{pkg.price}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(
                    (pkg.key === "starter"
                      ? 1500
                      : pkg.key === "growth"
                      ? 4000
                      : 7500) /
                    pkg.credits /
                    100
                  ).toFixed(2)}{" "}
                  SGD / credit
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  className={
                    pkg.popular
                      ? "w-full bg-[#7C3AED] hover:bg-[#6d28d9]"
                      : "w-full"
                  }
                  variant={pkg.popular ? "default" : "outline"}
                  disabled={buying === pkg.key}
                  onClick={() => handleBuy(pkg.key)}
                >
                  {buying === pkg.key ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {buying === pkg.key ? "Redirecting…" : "Buy"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Transaction history */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transaction history</CardTitle>
            <CardDescription>Your last 20 credit transactions</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                      Action
                    </th>
                    <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">
                      Credits
                    </th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                      Note
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(tx.created_at).toLocaleDateString("en-SG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 capitalize">
                        {tx.action.replace(/_/g, " ")}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-semibold tabular-nums ${
                          tx.amount > 0 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {tx.amount > 0 ? "+" : ""}
                        {tx.amount}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {tx.note ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
