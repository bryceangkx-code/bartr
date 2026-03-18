import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Instagram, MapPin, Users, TrendingUp, ArrowLeft } from "lucide-react";

import { VerifiedBadge } from "@/components/shared/verified-badge";

import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Profile, CreatorProfile } from "@/types/database";

export default async function PublicCreatorProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", params.id)
    .eq("role", "creator")
    .single();

  const profile = profileData as Profile | null;
  if (!profile) notFound();

  const { data: cpData } = await supabase
    .from("creator_profiles")
    .select("*")
    .eq("id", params.id)
    .single();

  const cp = cpData as CreatorProfile | null;

  const initials = profile.display_name
    ? profile.display_name.slice(0, 2).toUpperCase()
    : "??";

  function formatNumber(n: number | null) {
    if (!n) return "—";
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple top bar */}
      <header className="bg-white border-b px-4 h-14 flex items-center">
        <Link
          href="/creators"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All creators
        </Link>
        <Link href="/" className="ml-auto text-lg font-bold text-[#7C3AED]">
          Bartr
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Hero card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 shrink-0">
                <AvatarImage src={profile.avatar_url ?? undefined} />
                <AvatarFallback className="bg-violet-100 text-[#7C3AED] text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold truncate flex items-center gap-1.5">
                  {profile.display_name ?? "Creator"}
                  {cp?.instagram_verified && <VerifiedBadge />}
                </h1>
                {cp?.instagram_handle && (
                  <a
                    href={`https://instagram.com/${cp.instagram_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-[#7C3AED] transition-colors mt-0.5"
                  >
                    <Instagram className="h-3.5 w-3.5" />@{cp.instagram_handle}
                  </a>
                )}
                {profile.location && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {profile.location}
                  </div>
                )}
              </div>
              <Button asChild size="sm" className="shrink-0">
                <Link href={`/browse`}>Browse deals</Link>
              </Button>
            </div>

            {profile.bio && (
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* Stats row */}
            {(cp?.followers || cp?.engagement_rate) && (
              <div className="mt-4 flex gap-6">
                {cp.followers && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-[#7C3AED]" />
                    <span className="font-semibold">
                      {formatNumber(cp.followers)}
                    </span>
                    <span className="text-muted-foreground">followers</span>
                  </div>
                )}
                {cp.engagement_rate && (
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-[#7C3AED]" />
                    <span className="font-semibold">{cp.engagement_rate}%</span>
                    <span className="text-muted-foreground">engagement</span>
                  </div>
                )}
                <span className="ml-auto text-xs text-muted-foreground italic">
                  Self-reported
                </span>
              </div>
            )}

            {/* Niche tags */}
            {cp?.niches && cp.niches.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {cp.niches.map((niche) => (
                  <Badge key={niche} variant="secondary">
                    {niche}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Portfolio */}
        {cp?.portfolio_urls && cp.portfolio_urls.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {cp.portfolio_urls.map((url, i) => (
                  <div
                    key={i}
                    className="aspect-square relative rounded-lg overflow-hidden border"
                  >
                    <Image
                      src={url}
                      alt={`Portfolio ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty portfolio */}
        {(!cp?.portfolio_urls || cp.portfolio_urls.length === 0) && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              No portfolio images yet.
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
