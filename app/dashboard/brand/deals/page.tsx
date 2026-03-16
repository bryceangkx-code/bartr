"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Users, Check, X, Package, ArrowRight, Instagram } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { DEAL_STATUS_LABELS } from "@/lib/constants";
import type { Deal, Listing, Profile, CreatorProfile } from "@/types/database";

type Application = Deal & {
  listing: Pick<Listing, "title" | "product_value_sgd"> | null;
  creator: Pick<Profile, "display_name" | "avatar_url"> & Pick<CreatorProfile, "instagram_handle" | "followers" | "engagement_rate"> | null;
};

const STATUS_STYLES: Record<string, string> = {
  applied: "bg-blue-50 text-blue-700",
  accepted: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-600",
  in_progress: "bg-yellow-50 text-yellow-700",
  completed: "bg-indigo-50 text-[#4F46E5]",
  cancelled: "bg-gray-100 text-gray-500",
};

function formatNumber(n: number | null) {
  if (!n) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export default function BrandDealsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "active" | "closed">("pending");

  async function load() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: dealsData } = await supabase
      .from("deals")
      .select("*")
      .eq("brand_id", user.id)
      .order("created_at", { ascending: false });

    const rawDeals = (dealsData as Deal[] | null) ?? [];
    if (rawDeals.length === 0) {
      setApplications([]);
      setLoading(false);
      return;
    }

    const listingIds = Array.from(new Set(rawDeals.map((d) => d.listing_id)));
    const creatorIds = Array.from(new Set(rawDeals.map((d) => d.creator_id)));

    const [{ data: listingsData }, { data: profilesData }, { data: cpData }] =
      await Promise.all([
        supabase.from("listings").select("id, title, product_value_sgd").in("id", listingIds),
        supabase.from("profiles").select("id, display_name, avatar_url").in("id", creatorIds),
        supabase.from("creator_profiles").select("id, instagram_handle, followers, engagement_rate").in("id", creatorIds),
      ]);

    const listingMap: Record<string, Pick<Listing, "title" | "product_value_sgd">> = {};
    (listingsData as (Pick<Listing, "title" | "product_value_sgd"> & { id: string })[] | null)?.forEach(
      (l) => { listingMap[l.id] = l; }
    );

    const profileMap: Record<string, Pick<Profile, "display_name" | "avatar_url">> = {};
    (profilesData as (Pick<Profile, "display_name" | "avatar_url"> & { id: string })[] | null)?.forEach(
      (p) => { profileMap[p.id] = p; }
    );

    const cpMap: Record<string, Pick<CreatorProfile, "instagram_handle" | "followers" | "engagement_rate">> = {};
    (cpData as (Pick<CreatorProfile, "instagram_handle" | "followers" | "engagement_rate"> & { id: string })[] | null)?.forEach(
      (cp) => { cpMap[cp.id] = cp; }
    );

    setApplications(
      rawDeals.map((d) => ({
        ...d,
        listing: listingMap[d.listing_id] ?? null,
        creator: profileMap[d.creator_id]
          ? {
              display_name: profileMap[d.creator_id].display_name,
              avatar_url: profileMap[d.creator_id].avatar_url,
              instagram_handle: cpMap[d.creator_id]?.instagram_handle ?? null,
              followers: cpMap[d.creator_id]?.followers ?? null,
              engagement_rate: cpMap[d.creator_id]?.engagement_rate ?? null,
            }
          : null,
      }))
    );
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateDeal(id: string, status: string) {
    setUpdating(id);
    const res = await fetch(`/api/deals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json() as { error?: string };
    if (!res.ok) {
      toast.error(data.error ?? "Failed to update");
    } else {
      toast.success(`Deal ${status}`);
      await load();
    }
    setUpdating(null);
  }

  const tabs = {
    pending: applications.filter((a) => a.status === "applied"),
    active: applications.filter((a) => ["accepted", "in_progress"].includes(a.status)),
    closed: applications.filter((a) => ["completed", "rejected", "cancelled"].includes(a.status)),
  };

  const displayed = tabs[activeTab];

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
        <h1 className="text-2xl font-bold">Applications</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Review and manage creator applications to your listings
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(["pending", "active", "closed"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? "border-[#4F46E5] text-[#4F46E5]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
            {tabs[tab].length > 0 && (
              <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded-full">
                {tabs[tab].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <Users className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              {activeTab === "pending"
                ? "No pending applications yet."
                : activeTab === "active"
                ? "No active deals."
                : "No closed deals yet."}
            </p>
            {activeTab === "pending" && (
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/brand/listings">View your listings</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayed.map((app) => {
            const initials = app.creator?.display_name
              ? app.creator.display_name.slice(0, 2).toUpperCase()
              : "??";
            const followers = formatNumber(app.creator?.followers ?? null);

            return (
              <Card key={app.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {app.listing?.title ?? "Listing removed"}
                      {app.listing?.product_value_sgd && (
                        <span className="ml-2 font-normal">
                          · S${app.listing.product_value_sgd.toFixed(0)}
                        </span>
                      )}
                    </CardTitle>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[app.status] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {DEAL_STATUS_LABELS[app.status] ?? app.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Creator info */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={app.creator?.avatar_url ?? undefined} />
                      <AvatarFallback className="bg-indigo-100 text-[#4F46E5] text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">
                        {app.creator?.display_name ?? "Creator"}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        {app.creator?.instagram_handle && (
                          <span className="flex items-center gap-1">
                            <Instagram className="h-3 w-3" />
                            @{app.creator.instagram_handle}
                          </span>
                        )}
                        {followers && (
                          <span>{followers} followers</span>
                        )}
                        {app.creator?.engagement_rate && (
                          <span>{app.creator.engagement_rate}% ER</span>
                        )}
                      </div>
                    </div>
                    <Button asChild variant="ghost" size="sm" className="ml-auto shrink-0">
                      <Link href={`/creator/${app.creator_id}`}>
                        Profile <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>

                  {/* Creator note */}
                  {app.creator_note && (
                    <>
                      <Separator />
                      <div className="text-sm">
                        <span className="font-medium">Creator&apos;s note: </span>
                        <span className="text-muted-foreground">{app.creator_note}</span>
                      </div>
                    </>
                  )}

                  {/* Status-specific messaging */}
                  {app.status === "in_progress" && (
                    <div className="rounded-lg bg-yellow-50 border border-yellow-100 px-3 py-2 text-sm text-yellow-800">
                      Product shipped — waiting for creator to deliver content.
                    </div>
                  )}
                  {app.status === "completed" && (
                    <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-2 text-sm text-[#4F46E5]">
                      Deal complete!
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <span className="text-xs text-muted-foreground">
                      {new Date(app.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      {app.status === "applied" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive border-red-200"
                            disabled={updating === app.id}
                            onClick={() => updateDeal(app.id, "rejected")}
                          >
                            <X className="mr-1 h-3.5 w-3.5" />
                            Decline
                          </Button>
                          <Button
                            size="sm"
                            disabled={updating === app.id}
                            onClick={() => updateDeal(app.id, "accepted")}
                          >
                            {updating === app.id ? (
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="mr-1 h-3.5 w-3.5" />
                            )}
                            Accept
                          </Button>
                        </>
                      )}
                      {app.status === "accepted" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updating === app.id}
                          onClick={() => updateDeal(app.id, "in_progress")}
                        >
                          {updating === app.id && (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          )}
                          <Package className="mr-1 h-3.5 w-3.5" />
                          Mark shipped
                        </Button>
                      )}
                      {app.status === "in_progress" && (
                        <Button
                          size="sm"
                          disabled={updating === app.id}
                          onClick={() => updateDeal(app.id, "completed")}
                        >
                          {updating === app.id && (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          )}
                          <Check className="mr-1 h-3.5 w-3.5" />
                          Mark complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
