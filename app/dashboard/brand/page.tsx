import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Users, ListChecks, ArrowRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Profile, BrandProfile, Deal, Listing } from "@/types/database";

type DealWithListing = Deal & { listings: Pick<Listing, "title"> | null };
type ListingRow = Pick<Listing, "id" | "title" | "status">;

export default async function BrandDashboardPage() {
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
  if (!profile || profile.role !== "brand") redirect("/dashboard");

  const { data: bpData } = await supabase
    .from("brand_profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  const brandProfile = bpData as BrandProfile | null;

  const { data: listingsData } = await supabase
    .from("listings")
    .select("id, title, status")
    .eq("brand_id", user.id)
    .order("created_at", { ascending: false });
  const listings = listingsData as ListingRow[] | null;

  const { data: dealsData } = await supabase
    .from("deals")
    .select("*, listings(title), creator_id")
    .eq("brand_id", user.id)
    .eq("status", "applied")
    .order("created_at", { ascending: false })
    .limit(5);
  const pendingDeals = dealsData as DealWithListing[] | null;

  const activeListings = listings?.filter((l) => l.status === "active") ?? [];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome, {brandProfile?.company_name ?? profile.display_name ?? "Brand"} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your listings and creator applications.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard
          label="Active listings"
          value={activeListings.length}
          sub="currently live"
        />
        <StatCard
          label="Pending applications"
          value={pendingDeals?.length ?? 0}
          sub="awaiting review"
          highlight={!!pendingDeals?.length}
        />
        <StatCard
          label="Total listings"
          value={listings?.length ?? 0}
          sub="ever posted"
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickAction
          icon={<Plus className="h-5 w-5 text-[#7C3AED]" />}
          title="Post a listing"
          description="Offer your product in exchange for content"
          href="/dashboard/brand/listings/new"
          cta="Create listing"
        />
        <QuickAction
          icon={<ListChecks className="h-5 w-5 text-[#7C3AED]" />}
          title="Manage listings"
          description="View, pause, or close your existing listings"
          href="/dashboard/brand/listings"
          cta="View listings"
        />
        <QuickAction
          icon={<Users className="h-5 w-5 text-[#7C3AED]" />}
          title="Browse creators"
          description="Discover creators that match your brand"
          href="/creators"
          cta="Browse creators"
        />
      </div>

      {/* Pending applications */}
      {pendingDeals && pendingDeals.length > 0 ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Pending applications</CardTitle>
              <CardDescription>Creators waiting for your response</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/brand/deals">
                See all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="divide-y">
            {pendingDeals.map((deal) => {
              const listing = deal.listings as { title: string } | null;
              return (
                <div
                  key={deal.id}
                  className="py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{listing?.title ?? "Listing"}</p>
                    <p className="text-xs text-muted-foreground">
                      Application received
                    </p>
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/dashboard/brand/deals/${deal.id}`}>Review</Link>
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground text-sm mb-3">
              No pending applications yet.{" "}
              {activeListings.length === 0
                ? "Post your first listing to get started."
                : "Check back soon!"}
            </p>
            {activeListings.length === 0 && (
              <Button asChild>
                <Link href="/dashboard/brand/listings/new">Post a listing</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: number;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-[#7C3AED]" : ""}>
      <CardContent className="pt-5">
        <p className={`text-3xl font-bold ${highlight ? "text-[#7C3AED]" : ""}`}>
          {value}
        </p>
        <p className="text-sm font-medium mt-0.5">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
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
