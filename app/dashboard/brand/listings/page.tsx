"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Eye, Pause, X, Loader2, Edit2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { Listing } from "@/types/database";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-700",
  closed: "bg-gray-100 text-gray-600",
};

export default function BrandListingsPage() {
  const supabase = createClient();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  async function load() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("listings")
      .select("*")
      .eq("brand_id", user.id)
      .order("created_at", { ascending: false });

    setListings((data as Listing[] | null) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: "active" | "paused" | "closed") {
    setUpdating(id);
    const res = await fetch(`/api/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    const data = await res.json() as { error?: string };
    if (!res.ok) {
      toast.error(data.error ?? "Failed to update listing");
    } else {
      toast.success(`Listing ${status}`);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Listings</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {listings.length} listing{listings.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/brand/listings/new">
            <Plus className="mr-2 h-4 w-4" />
            New Listing
          </Link>
        </Button>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <p className="text-muted-foreground">No listings yet.</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/brand/listings/new">
                <Plus className="mr-2 h-4 w-4" />
                Create your first listing
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <Card key={listing.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <CardTitle className="text-base">{listing.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {listing.description}
                    </CardDescription>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[listing.status] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {listing.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>S${listing.product_value_sgd?.toFixed(2) ?? "—"} value</span>
                    {listing.niches && listing.niches.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {listing.niches.slice(0, 3).map((n) => (
                          <Badge key={n} variant="secondary" className="text-xs">
                            {n}
                          </Badge>
                        ))}
                        {listing.niches.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{listing.niches.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/dashboard/brand/listings/${listing.id}/edit`}>
                        <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/listings/${listing.id}`}>
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        View
                      </Link>
                    </Button>
                    {listing.status === "active" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={updating === listing.id}
                        onClick={() => updateStatus(listing.id, "paused")}
                      >
                        {updating === listing.id ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Pause className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        Pause
                      </Button>
                    )}
                    {listing.status === "paused" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={updating === listing.id}
                        onClick={() => updateStatus(listing.id, "active")}
                      >
                        {updating === listing.id ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : null}
                        Activate
                      </Button>
                    )}
                    {listing.status !== "closed" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        disabled={updating === listing.id}
                        onClick={() => updateStatus(listing.id, "closed")}
                      >
                        <X className="mr-1.5 h-3.5 w-3.5" />
                        Close
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
