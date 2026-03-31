"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { CREATOR_NICHES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const listingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  product_value_sgd: z.coerce.number().positive("Must be greater than 0"),
  deliverables: z.string().min(10, "Describe what the creator must produce"),
  min_followers: z.coerce
    .number()
    .int()
    .min(0, "Must be 0 or more")
    .optional()
    .or(z.literal("")),
  min_engagement_rate: z.coerce
    .number()
    .min(0)
    .max(100)
    .optional()
    .or(z.literal("")),
});

type ListingValues = z.infer<typeof listingSchema>;

export default function EditListingPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [fetchLoading, setFetchLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ListingValues>({ resolver: zodResolver(listingSchema) });

  useEffect(() => {
    async function fetchListing() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/dashboard/brand/listings");
        return;
      }

      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .eq("brand_id", user.id)
        .single();

      if (error || !data) {
        router.replace("/dashboard/brand/listings");
        return;
      }

      const listing = data as {
        title: string;
        description: string;
        product_value_sgd: number | null;
        deliverables: string;
        min_followers: number | null;
        min_engagement_rate: number | null;
        niches: string[] | null;
      };

      reset({
        title: listing.title,
        description: listing.description,
        product_value_sgd: listing.product_value_sgd ?? undefined,
        deliverables: listing.deliverables,
        min_followers: listing.min_followers ?? "",
        min_engagement_rate: listing.min_engagement_rate ?? "",
      });

      setSelectedNiches(listing.niches ?? []);
      setFetchLoading(false);
    }

    fetchListing();
  }, [id, reset, router]);

  function toggleNiche(niche: string) {
    setSelectedNiches((prev) =>
      prev.includes(niche) ? prev.filter((n) => n !== niche) : [...prev, niche]
    );
  }

  async function onSubmit(values: ListingValues) {
    setSubmitting(true);

    const res = await fetch(`/api/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        min_followers:
          values.min_followers === "" || values.min_followers === undefined
            ? null
            : Number(values.min_followers),
        min_engagement_rate:
          values.min_engagement_rate === "" ||
          values.min_engagement_rate === undefined
            ? null
            : Number(values.min_engagement_rate),
        niches: selectedNiches,
      }),
    });

    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      toast.error(data.error ?? "Failed to update listing");
      setSubmitting(false);
      return;
    }

    toast.success("Listing updated");
    router.push("/dashboard/brand/listings");
  }

  if (fetchLoading) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded" />
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/brand/listings"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Listing</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Update your listing details
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* What you're offering */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">What you&apos;re offering</CardTitle>
            <CardDescription>
              Describe the product or service creators will receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Listing title</Label>
              <Input
                id="title"
                placeholder="e.g. Free skincare set for Instagram review"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell creators exactly what they'll receive, any product variants available, shipping details, etc."
                rows={4}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="product_value_sgd">
                Estimated product value (SGD)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                  S$
                </span>
                <Input
                  id="product_value_sgd"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  className="pl-9"
                  {...register("product_value_sgd")}
                />
              </div>
              {errors.product_value_sgd && (
                <p className="text-xs text-destructive">
                  {errors.product_value_sgd.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* What you need */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">What you need in return</CardTitle>
            <CardDescription>
              Describe what content the creator must produce
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="deliverables">Deliverables</Label>
              <Textarea
                id="deliverables"
                placeholder="e.g. 1× Instagram feed post + 3× Stories featuring the product, with tag @yourbrand. Must be posted within 14 days of receiving the product."
                rows={4}
                {...register("deliverables")}
              />
              {errors.deliverables && (
                <p className="text-xs text-destructive">
                  {errors.deliverables.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Creator requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Creator requirements</CardTitle>
            <CardDescription>
              Optional — set minimum thresholds to filter applicants
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="min_followers">Min. followers</Label>
                <Input
                  id="min_followers"
                  type="number"
                  min={0}
                  placeholder="e.g. 5000"
                  {...register("min_followers")}
                />
                {errors.min_followers && (
                  <p className="text-xs text-destructive">
                    {errors.min_followers.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="min_engagement_rate">
                  Min. engagement (%)
                </Label>
                <Input
                  id="min_engagement_rate"
                  type="number"
                  step="0.1"
                  min={0}
                  max={100}
                  placeholder="e.g. 2.0"
                  {...register("min_engagement_rate")}
                />
                {errors.min_engagement_rate && (
                  <p className="text-xs text-destructive">
                    {errors.min_engagement_rate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preferred niches</Label>
              <p className="text-xs text-muted-foreground">
                Select all that match your brand
              </p>
              <div className="flex flex-wrap gap-2">
                {CREATOR_NICHES.map((niche) => (
                  <button
                    key={niche}
                    type="button"
                    onClick={() => toggleNiche(niche)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      selectedNiches.includes(niche)
                        ? "border-[#7C3AED] bg-[#7C3AED] text-white"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    {niche}
                  </button>
                ))}
              </div>
              {selectedNiches.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {selectedNiches.map((n) => (
                    <Badge key={n} variant="secondary">
                      {n}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/brand/listings">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
