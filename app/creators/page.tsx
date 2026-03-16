"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Search, Users, SlidersHorizontal, X, Instagram } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { CREATOR_NICHES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Profile, CreatorProfile } from "@/types/database";

type CreatorCard = Pick<Profile, "id" | "display_name" | "avatar_url" | "bio" | "location"> &
  Pick<CreatorProfile, "instagram_handle" | "followers" | "engagement_rate" | "niches">;

function formatNumber(n: number | null) {
  if (!n) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export default function CreatorsPage() {
  const [creators, setCreators] = useState<CreatorCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [minFollowers, setMinFollowers] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, bio, location")
        .eq("role", "creator")
        .order("created_at", { ascending: false });

      const profiles = (profilesData as Pick<Profile, "id" | "display_name" | "avatar_url" | "bio" | "location">[] | null) ?? [];
      if (profiles.length === 0) {
        setLoading(false);
        return;
      }

      const ids = profiles.map((p) => p.id);
      const { data: cpData } = await supabase
        .from("creator_profiles")
        .select("id, instagram_handle, followers, engagement_rate, niches")
        .in("id", ids);

      const cpMap: Record<string, Partial<CreatorProfile>> = {};
      (cpData as Partial<CreatorProfile & { id: string }>[] | null)?.forEach(
        (cp) => { if (cp.id) cpMap[cp.id] = cp; }
      );

      setCreators(
        profiles.map((p) => ({
          ...p,
          instagram_handle: cpMap[p.id]?.instagram_handle ?? null,
          followers: cpMap[p.id]?.followers ?? null,
          engagement_rate: cpMap[p.id]?.engagement_rate ?? null,
          niches: cpMap[p.id]?.niches ?? null,
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
    return creators.filter((c) => {
      if (
        search &&
        !(c.display_name ?? "").toLowerCase().includes(search.toLowerCase()) &&
        !(c.instagram_handle ?? "").toLowerCase().includes(search.toLowerCase()) &&
        !(c.location ?? "").toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      if (selectedNiches.length > 0) {
        const creatorNiches = c.niches ?? [];
        if (!selectedNiches.some((n) => creatorNiches.includes(n))) return false;
      }
      if (minFollowers && c.followers != null) {
        if (c.followers < Number(minFollowers)) return false;
      }
      return true;
    });
  }, [creators, search, selectedNiches, minFollowers]);

  const activeFilterCount = selectedNiches.length + (minFollowers ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Browse Creators</h1>
              <p className="text-xs text-muted-foreground">
                {loading ? "Loading…" : `${filtered.length} creator${filtered.length !== 1 ? "s" : ""}`}
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
              placeholder="Search by name, handle, or location…"
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
                  onClick={() => { setSelectedNiches([]); setMinFollowers(""); }}
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
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Min. followers</p>
              <Input
                type="number"
                min={0}
                placeholder="e.g. 5000"
                value={minFollowers}
                onChange={(e) => setMinFollowers(e.target.value)}
              />
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

        {/* Creators grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">No creators found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {creators.length === 0
                ? "No creators have joined yet — check back soon."
                : "Try adjusting your filters."}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((creator) => {
              const initials = creator.display_name
                ? creator.display_name.slice(0, 2).toUpperCase()
                : "??";
              const followers = formatNumber(creator.followers);

              return (
                <Link key={creator.id} href={`/creator/${creator.id}`}>
                  <Card className="h-full hover:border-[#4F46E5] hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="pt-5 space-y-3">
                      {/* Header row */}
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 shrink-0">
                          <AvatarImage src={creator.avatar_url ?? undefined} />
                          <AvatarFallback className="bg-indigo-100 text-[#4F46E5] font-semibold text-sm">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {creator.display_name ?? "Creator"}
                          </p>
                          {creator.instagram_handle ? (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                              <Instagram className="h-3 w-3 shrink-0" />
                              @{creator.instagram_handle}
                            </p>
                          ) : creator.location ? (
                            <p className="text-xs text-muted-foreground truncate">
                              {creator.location}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      {/* Bio */}
                      {creator.bio && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {creator.bio}
                        </p>
                      )}

                      {/* Stats */}
                      {(followers || creator.engagement_rate) && (
                        <div className="flex items-center gap-3 text-xs">
                          {followers && (
                            <span className="flex items-center gap-1 font-medium">
                              <Users className="h-3.5 w-3.5 text-[#4F46E5]" />
                              {followers}
                            </span>
                          )}
                          {creator.engagement_rate && (
                            <span className="text-muted-foreground">
                              {creator.engagement_rate}% ER
                            </span>
                          )}
                        </div>
                      )}

                      {/* Niches */}
                      {creator.niches && creator.niches.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {creator.niches.slice(0, 3).map((n) => (
                            <Badge key={n} variant="secondary" className="text-xs">
                              {n}
                            </Badge>
                          ))}
                          {creator.niches.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{creator.niches.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
