"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Package, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { DEAL_STATUS_LABELS } from "@/lib/constants";
import type { Deal, Listing } from "@/types/database";

type DealWithListing = Deal & { listing: Pick<Listing, "title" | "product_value_sgd"> | null };

const STATUS_STYLES: Record<string, string> = {
  applied: "bg-blue-50 text-blue-700",
  accepted: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-600",
  in_progress: "bg-yellow-50 text-yellow-700",
  completed: "bg-indigo-50 text-[#4F46E5]",
  cancelled: "bg-gray-100 text-gray-500",
};

export default function CreatorDealsPage() {
  const [deals, setDeals] = useState<DealWithListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  async function load() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("deals")
      .select("*")
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false });

    const rawDeals = (data as Deal[] | null) ?? [];

    if (rawDeals.length === 0) {
      setDeals([]);
      setLoading(false);
      return;
    }

    const listingIds = rawDeals.map((d) => d.listing_id);
    const { data: listingsData } = await supabase
      .from("listings")
      .select("id, title, product_value_sgd")
      .in("id", listingIds);

    const listingMap: Record<string, Pick<Listing, "title" | "product_value_sgd">> = {};
    (listingsData as (Pick<Listing, "title" | "product_value_sgd"> & { id: string })[] | null)?.forEach(
      (l) => { listingMap[l.id] = l; }
    );

    setDeals(
      rawDeals.map((d) => ({ ...d, listing: listingMap[d.listing_id] ?? null }))
    );
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function cancelDeal(id: string) {
    setUpdating(id);
    const res = await fetch(`/api/deals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    const data = await res.json() as { error?: string };
    if (!res.ok) {
      toast.error(data.error ?? "Failed to cancel");
    } else {
      toast.success("Application cancelled");
      await load();
    }
    setUpdating(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Deals</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Track your applications and active collaborations
        </p>
      </div>

      {deals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <Package className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">No deals yet.</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/browse">Browse listings</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {deals.map((deal) => (
            <Card key={deal.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">
                      {deal.listing?.title ?? "Listing removed"}
                    </CardTitle>
                    {deal.listing?.product_value_sgd && (
                      <CardDescription>
                        S${deal.listing.product_value_sgd.toFixed(2)} product value
                      </CardDescription>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[deal.status] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {DEAL_STATUS_LABELS[deal.status] ?? deal.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Timeline hints */}
                {deal.status === "accepted" && (
                  <div className="rounded-lg bg-green-50 border border-green-100 px-3 py-2 text-sm text-green-800">
                    Your application was accepted! The brand will be in touch about shipping.
                  </div>
                )}
                {deal.status === "in_progress" && (
                  <div className="rounded-lg bg-yellow-50 border border-yellow-100 px-3 py-2 text-sm text-yellow-800">
                    Product on the way — create your content and deliver your deliverables.
                  </div>
                )}
                {deal.status === "completed" && (
                  <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-2 text-sm text-[#4F46E5]">
                    Deal complete! Thanks for your collaboration.
                  </div>
                )}
                {deal.status === "rejected" && (
                  <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
                    This application wasn&apos;t successful. Keep applying!
                  </div>
                )}

                {/* Brand note */}
                {deal.brand_note && (
                  <div className="text-sm text-muted-foreground bg-gray-50 rounded-lg px-3 py-2">
                    <span className="font-medium text-foreground">Brand note: </span>
                    {deal.brand_note}
                  </div>
                )}

                {/* Your note */}
                {deal.creator_note && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Your note: </span>
                    {deal.creator_note}
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="text-xs text-muted-foreground">
                    Applied {new Date(deal.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/listings/${deal.listing_id}`}>
                        View listing <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    {(deal.status === "applied" || deal.status === "accepted") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        disabled={updating === deal.id}
                        onClick={() => cancelDeal(deal.id)}
                      >
                        {updating === deal.id && (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        )}
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
