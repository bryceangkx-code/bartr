import { redirect } from "next/navigation";
import Link from "next/link";
import { Instagram, Package, CheckCircle2, ArrowRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Profile, CreatorProfile, Deal, Listing } from "@/types/database";
import { InstagramToast } from "./instagram-toast";

type DealWithListing = Deal & { listings: Pick<Listing, "title"> | null };

export default async function CreatorDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  const profile = profileData as Profile | null;
  if (!profile || profile.role !== "creator") redirect("/dashboard");

  const { data: cpData } = await supabase
    .from("creator_profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  const creatorProfile = cpData as CreatorProfile | null;

  const { data: dealsData } = await supabase
    .from("deals")
    .select("*, listings(title)")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);
  const recentDeals = dealsData as DealWithListing[] | null;

  // Profile completion score
  const checks = [
    !!profile.display_name,
    !!profile.bio,
    !!(creatorProfile?.instagram_handle && creatorProfile?.followers),
    (creatorProfile?.niches ?? []).length > 0,
    (creatorProfile?.portfolio_urls ?? []).length > 0,
  ];
  const completion = Math.round(
    (checks.filter(Boolean).length / checks.length) * 100
  );

  return (
    <div className="space-y-6">
      <InstagramToast />
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {profile.display_name ?? "Creator"} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your Bartr account.
        </p>
      </div>

      {/* Profile completion card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile completion</CardTitle>
          <CardDescription>
            A complete profile gets 3× more brand interest
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-[#7C3AED] transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-[#7C3AED]">
              {completion}%
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <CompletionItem done={!!profile.display_name} label="Display name" />
            <CompletionItem done={!!profile.bio} label="Bio" />
            <CompletionItem
              done={!!(creatorProfile?.instagram_handle && creatorProfile?.followers)}
              label="Instagram stats"
            />
            <CompletionItem
              done={(creatorProfile?.niches ?? []).length > 0}
              label="Niche tags"
            />
            <CompletionItem
              done={(creatorProfile?.portfolio_urls ?? []).length > 0}
              label="Portfolio images"
            />
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/creator/profile">
              Complete my profile <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Instagram verification card */}
      {creatorProfile?.instagram_verified ? (
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Instagram className="h-5 w-5 text-green-600" />
              <CardTitle className="text-base">Instagram Connected</CardTitle>
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            </div>
            {creatorProfile.instagram_handle && (
              <CardDescription className="text-green-700">
                @{creatorProfile.instagram_handle}
                {creatorProfile.followers != null && (
                  <> &middot; {creatorProfile.followers.toLocaleString()} followers</>
                )}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/api/auth/instagram/initiate">Reconnect</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center">
                <Instagram className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-base">Connect Instagram</CardTitle>
                <CardDescription>
                  Verify your Instagram account to appear in brand searches and unlock more opportunities.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0">
              <Link href="/api/auth/instagram/initiate">
                <Instagram className="h-4 w-4 mr-2" />
                Connect with Instagram
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickAction
          icon={<Instagram className="h-5 w-5 text-[#7C3AED]" />}
          title={
            creatorProfile?.instagram_handle
              ? `@${creatorProfile.instagram_handle}`
              : "Add Instagram stats"
          }
          description={
            creatorProfile?.instagram_handle
              ? `${(creatorProfile.followers ?? 0).toLocaleString()} followers · ${creatorProfile.engagement_rate ?? 0}% ER`
              : "Add your handle and follower count"
          }
          href="/dashboard/creator/profile"
          cta={creatorProfile?.instagram_handle ? "Edit stats" : "Add now"}
        />
        <QuickAction
          icon={<Package className="h-5 w-5 text-[#7C3AED]" />}
          title="Browse listings"
          description="Find brands offering products for your content"
          href="/browse"
          cta="Browse deals"
        />
        <QuickAction
          icon={<CheckCircle2 className="h-5 w-5 text-[#7C3AED]" />}
          title="My deals"
          description={`${recentDeals?.length ?? 0} active deal${recentDeals?.length !== 1 ? "s" : ""}`}
          href="/dashboard/creator/deals"
          cta="View deals"
        />
      </div>

      {/* Recent deals */}
      {recentDeals && recentDeals.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent deals</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {recentDeals.map((deal) => {
              const listing = deal.listings as { title: string } | null;
              return (
                <div
                  key={deal.id}
                  className="py-3 flex items-center justify-between"
                >
                  <span className="text-sm font-medium">
                    {listing?.title ?? "Listing"}
                  </span>
                  <StatusBadge status={deal.status} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground text-sm mb-3">
              No deals yet — go find your first one!
            </p>
            <Button asChild>
              <Link href="/browse">Browse listings</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CompletionItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2 ${done ? "text-foreground" : "text-muted-foreground"}`}>
      <div
        className={`h-2 w-2 rounded-full ${done ? "bg-[#7C3AED]" : "bg-muted-foreground/30"}`}
      />
      {label}
    </div>
  );
}

function QuickAction({
  icon,
  title,
  description,
  href,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6 space-y-2">
        {icon}
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
        <Button asChild variant="outline" size="sm" className="w-full mt-2">
          <Link href={href}>{cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    applied: "bg-blue-100 text-blue-700",
    accepted: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    in_progress: "bg-violet-100 text-violet-700",
    completed: "bg-gray-100 text-gray-700",
    cancelled: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${map[status] ?? "bg-muted"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
