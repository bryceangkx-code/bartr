"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Users, BarChart2, Package } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import type { Listing, BrandProfile, Profile } from "@/types/database";

type ListingWithBrand = Listing & {
  brand: Pick<Profile, "display_name"> & Pick<BrandProfile, "company_name" | "category">;
};

export default function ListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [listing, setListing] = useState<ListingWithBrand | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [note, setNote] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setCurrentUserId(user?.id ?? null);

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setUserRole((profileData as { role: string } | null)?.role ?? null);
      }

      const { data: listingData } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();

      const l = listingData as Listing | null;
      if (!l) {
        setLoading(false);
        return;
      }

      // Fetch brand info
      const [{ data: profileData }, { data: bpData }] = await Promise.all([
        supabase.from("profiles").select("display_name").eq("id", l.brand_id).single(),
        supabase.from("brand_profiles").select("company_name, category").eq("id", l.brand_id).single(),
      ]);

      setListing({
        ...l,
        brand: {
          display_name: (profileData as { display_name: string | null } | null)?.display_name ?? null,
          company_name: (bpData as { company_name: string | null; category: string | null } | null)?.company_name ?? null,
          category: (bpData as { company_name: string | null; category: string | null } | null)?.category ?? null,
        },
      });

      if (user) {
        const { data: dealData } = await supabase
          .from("deals")
          .select("id")
          .eq("listing_id", id)
          .eq("creator_id", user.id)
          .single();
        setAlreadyApplied(!!dealData);
      }

      setLoading(false);
    }
    load();
  }, [id]);

  async function applyToListing() {
    if (!currentUserId) {
      router.push("/login");
      return;
    }
    setApplying(true);
    const res = await fetch("/api/deals/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listing_id: id, creator_note: note || null }),
    });

    const data = await res.json() as { error?: string };
    if (!res.ok) {
      toast.error(data.error ?? "Failed to apply");
    } else {
      toast.success("Application sent!");
      setAlreadyApplied(true);
    }
    setApplying(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <p className="text-muted-foreground">Listing not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/browse">Browse listings</Link>
        </Button>
      </div>
    );
  }

  const isBrandOwner = currentUserId === listing.brand_id;
  const isCreator = userRole === "creator";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/browse"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{listing.title}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            by{" "}
            <span className="font-medium text-foreground">
              {listing.brand.company_name ?? listing.brand.display_name ?? "Brand"}
            </span>
            {listing.brand.category && (
              <span> · {listing.brand.category}</span>
            )}
          </p>
        </div>
      </div>

      {listing.status !== "active" && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-2.5 text-sm text-yellow-800">
          This listing is currently <strong>{listing.status}</strong> and not accepting new applications.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">What you&apos;ll receive</CardTitle>
          <CardDescription>{listing.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Package className="h-5 w-5 text-muted-foreground" />
            <span>S${listing.product_value_sgd?.toFixed(2) ?? "—"} estimated value</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">What you need to deliver</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{listing.deliverables}</p>
        </CardContent>
      </Card>

      {(listing.min_followers || listing.min_engagement_rate || (listing.niches && listing.niches.length > 0)) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Creator requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {listing.min_followers && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Min. {listing.min_followers.toLocaleString()} followers</span>
              </div>
            )}
            {listing.min_engagement_rate && (
              <div className="flex items-center gap-2 text-sm">
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
                <span>Min. {listing.min_engagement_rate}% engagement rate</span>
              </div>
            )}
            {listing.niches && listing.niches.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {listing.niches.map((n) => (
                  <Badge key={n} variant="secondary">
                    {n}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isCreator && listing.status === "active" && !isBrandOwner && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Apply to this listing</CardTitle>
              <CardDescription>
                Send a note to the brand explaining why you&apos;re a great fit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional: Tell the brand about your content style, audience, or past collaborations..."
                rows={4}
                disabled={alreadyApplied || applying}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
              <Button
                onClick={applyToListing}
                disabled={alreadyApplied || applying}
                className="w-full sm:w-auto"
              >
                {applying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {alreadyApplied ? "Already Applied" : "Apply Now"}
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {!currentUserId && listing.status === "active" && (
        <>
          <Separator />
          <div className="text-center py-4">
            <p className="text-muted-foreground text-sm mb-3">
              Sign in as a creator to apply to this listing
            </p>
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </>
      )}

      {isBrandOwner && (
        <>
          <Separator />
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/dashboard/brand/listings">My Listings</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
