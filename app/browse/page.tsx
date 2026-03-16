"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Search, Package, SlidersHorizontal, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { CREATOR_NICHES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Listing } from "@/types/database";

type ListingWithBrand = Listing & {
  brand_name: string | null;
};

export default function BrowsePage() {
  const [listings, setListings] = useState<ListingWithBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [maxValue, setMaxValue] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("listings")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      const raw = (data as Listing[] | null) ?? [];

      // Fetch brand names
      const brandIds = Array.from(new Set(raw.map((l) => l.brand_id)));
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", brandIds);

      const nameMap: Record<string, string | null> = {};
      (profilesData as { id: string; display_name: string | null }[] | null)?.forEach(
        (p) => { nameMap[p.id] = p.display_name; }
      );

      const { data: bpData } = await supabase
        .from("brand_profiles")
        .select("id, company_name")
        .in("id", brandIds);

      const companyMap: Record<string, string | null> = {};
      (bpData as { id: string; company_name: string | null }[] | null)?.forEach(
        (b) => { companyMap[b.id] = b.company_name; }
      );

      setListings(
        raw.map((l) => ({
          ...l,
          brand_name: companyMap[l.brand_id] ?? nameMap[l.brand_id] ?? "Brand",
        }))
      );
      setLoading(false);
    }
    load();
  }, []);

  function toggleNiche(niche: string) {
    setSelectedNiches((prev) =>
      prev.includes(niche) ? prev.filter((n) => n !== niche) : [...prev, niche]
    );
  }

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (
        search &&
        !l.title.toLowerCase().includes(search.toLowerCase()) &&
        !(l.brand_name ?? "").toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      if (selectedNiches.length > 0) {
        const listingNiches = l.niches ?? [];
        if (!selectedNiches.some((n) => listingNiches.includes(n))) return false;
      }
      if (maxValue && l.product_value_sgd != null) {
        if (l.product_value_sgd > Number(maxValue)) return false;
      }
      return true;
    });
  }, [listings, search, selectedNiches, maxValue]);

  const activeFilterCount =
    selectedNiches.length + (maxValue ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Browse Listings</h1>
              <p className="text-xs text-muted-foreground">
                {loading ? "Loading…" : `${filtered.length} active listing${filtered.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters((v) => !v)}
              className="gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-[#4F46E5] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search listings or brands…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white border rounded-xl p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm">Filters</h2>
              {activeFilterCount > 0 && (
                <button
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => { setSelectedNiches([]); setMaxValue(""); }}
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Niche</p>
              <div className="flex flex-wrap gap-2">
                {CREATOR_NICHES.map((niche) => (
                  <button
                    key={niche}
                    onClick={() => toggleNiche(niche)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      selectedNiches.includes(niche)
                        ? "border-[#4F46E5] bg-[#4F46E5] text-white"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    {niche}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 max-w-xs">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Max product value (SGD)</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">S$</span>
                <Input
                  type="number"
                  min={0}
                  placeholder="e.g. 200"
                  value={maxValue}
                  onChange={(e) => setMaxValue(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        )}

        {/* Active niche chips */}
        {selectedNiches.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedNiches.map((n) => (
              <button
                key={n}
                onClick={() => toggleNiche(n)}
                className="flex items-center gap-1 bg-indigo-50 text-[#4F46E5] text-xs font-medium px-2.5 py-1 rounded-full hover:bg-indigo-100 transition-colors"
              >
                {n} <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        )}

        {/* Listings grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-1/2 mt-1" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">No listings found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {listings.length === 0
                ? "No active listings yet — check back soon."
                : "Try adjusting your filters."}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`}>
                <Card className="h-full hover:border-[#4F46E5] hover:shadow-md transition-all cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <CardTitle className="text-sm font-semibold leading-snug line-clamp-2">
                          {listing.title}
                        </CardTitle>
                        <CardDescription className="mt-0.5 text-xs">
                          {listing.brand_name}
                        </CardDescription>
                      </div>
                      <span className="shrink-0 text-sm font-bold text-[#4F46E5]">
                        S${listing.product_value_sgd?.toFixed(0) ?? "—"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {listing.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {listing.description}
                      </p>
                    )}
                    {listing.niches && listing.niches.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {listing.niches.slice(0, 4).map((n) => (
                          <Badge key={n} variant="secondary" className="text-xs">
                            {n}
                          </Badge>
                        ))}
                        {listing.niches.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{listing.niches.length - 4}
                          </Badge>
                        )}
                      </div>
                    )}
                    {(listing.min_followers || listing.min_engagement_rate) && (
                      <p className="text-xs text-muted-foreground">
                        {listing.min_followers && `Min. ${listing.min_followers.toLocaleString()} followers`}
                        {listing.min_followers && listing.min_engagement_rate && " · "}
                        {listing.min_engagement_rate && `Min. ${listing.min_engagement_rate}% ER`}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
