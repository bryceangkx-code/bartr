"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Upload, X, Instagram } from "lucide-react";
import Image from "next/image";

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
import { createClient } from "@/lib/supabase/client";
import { CREATOR_NICHES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Profile, CreatorProfile } from "@/types/database";

const profileSchema = z.object({
  display_name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(300, "Max 300 characters").optional(),
  location: z.string().optional(),
  instagram_handle: z
    .string()
    .regex(/^[a-zA-Z0-9._]*$/, "Invalid handle — no @ needed")
    .optional()
    .or(z.literal("")),
  followers: z.coerce
    .number()
    .int()
    .min(0, "Must be 0 or more")
    .optional()
    .or(z.literal("")),
  engagement_rate: z.coerce
    .number()
    .min(0)
    .max(100, "Max 100%")
    .optional()
    .or(z.literal("")),
});

type ProfileValues = z.infer<typeof profileSchema>;

export default function CreatorProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: profileData }, { data: cpData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
          .from("creator_profiles")
          .select("*")
          .eq("id", user.id)
          .single(),
      ]);

      const profile = profileData as Profile | null;
      const cp = cpData as CreatorProfile | null;

      if (profile) {
        reset({
          display_name: profile.display_name ?? "",
          bio: profile.bio ?? "",
          location: profile.location ?? "",
          instagram_handle: cp?.instagram_handle ?? "",
          followers: cp?.followers ?? "",
          engagement_rate: cp?.engagement_rate ?? "",
        });
      }
      if (cp?.niches) setSelectedNiches(cp.niches);
      if (cp?.portfolio_urls) setPortfolioUrls(cp.portfolio_urls);
      setPageLoading(false);
    }
    load();
  }, []);

  function toggleNiche(niche: string) {
    setSelectedNiches((prev) =>
      prev.includes(niche) ? prev.filter((n) => n !== niche) : [...prev, niche]
    );
  }

  async function uploadImage(file: File) {
    if (portfolioUrls.length >= 6) {
      toast.error("Maximum 6 portfolio images");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("portfolio")
      .upload(path, file, { upsert: false });

    if (error) {
      toast.error("Upload failed: " + error.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("portfolio").getPublicUrl(path);

    setPortfolioUrls((prev) => [...prev, publicUrl]);
    setUploading(false);
    toast.success("Image uploaded");
  }

  async function removeImage(url: string) {
    setPortfolioUrls((prev) => prev.filter((u) => u !== url));
  }

  async function onSubmit(values: ProfileValues) {
    setLoading(true);

    const res = await fetch("/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        display_name: values.display_name,
        bio: values.bio || null,
        location: values.location || null,
        niches: selectedNiches,
        instagram_handle: values.instagram_handle || null,
        followers:
          values.followers === "" || values.followers === undefined
            ? null
            : Number(values.followers),
        engagement_rate:
          values.engagement_rate === "" || values.engagement_rate === undefined
            ? null
            : Number(values.engagement_rate),
        portfolio_urls: portfolioUrls,
      }),
    });

    const data = await res.json() as { error?: string };
    if (!res.ok) {
      toast.error(data.error ?? "Failed to save");
      setLoading(false);
      return;
    }

    toast.success("Profile saved!");
    setLoading(false);
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <p className="text-muted-foreground mt-1">
          Keep your profile up to date to attract the best brand deals.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="display_name">Display name</Label>
              <Input
                id="display_name"
                placeholder="Your name"
                {...register("display_name")}
              />
              {errors.display_name && (
                <p className="text-xs text-destructive">
                  {errors.display_name.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell brands about your content and audience (max 300 chars)"
                rows={3}
                {...register("bio")}
              />
              {errors.bio && (
                <p className="text-xs text-destructive">{errors.bio.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g. Singapore, Jakarta, KL"
                {...register("location")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Instagram stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Instagram className="h-4 w-4" />
              Instagram stats
            </CardTitle>
            <CardDescription>
              Self-reported — brands can see these on your profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="instagram_handle">Instagram handle</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  @
                </span>
                <Input
                  id="instagram_handle"
                  placeholder="yourhandle"
                  className="pl-7"
                  {...register("instagram_handle")}
                />
              </div>
              {errors.instagram_handle && (
                <p className="text-xs text-destructive">
                  {errors.instagram_handle.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="followers">Followers</Label>
                <Input
                  id="followers"
                  type="number"
                  placeholder="e.g. 25000"
                  min={0}
                  {...register("followers")}
                />
                {errors.followers && (
                  <p className="text-xs text-destructive">
                    {errors.followers.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="engagement_rate">
                  Engagement rate (%)
                </Label>
                <Input
                  id="engagement_rate"
                  type="number"
                  placeholder="e.g. 3.5"
                  step="0.1"
                  min={0}
                  max={100}
                  {...register("engagement_rate")}
                />
                {errors.engagement_rate && (
                  <p className="text-xs text-destructive">
                    {errors.engagement_rate.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Niches */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your niches</CardTitle>
            <CardDescription>
              Brands filter creators by niche — pick all that apply
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {CREATOR_NICHES.map((niche) => (
                <button
                  key={niche}
                  type="button"
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
            {selectedNiches.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedNiches.map((n) => (
                  <Badge key={n} variant="secondary">
                    {n}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Portfolio */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Portfolio</CardTitle>
            <CardDescription>
              Up to 6 images showcasing your best content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {portfolioUrls.map((url) => (
                <div
                  key={url}
                  className="relative aspect-square rounded-lg overflow-hidden border group"
                >
                  <Image
                    src={url}
                    alt="Portfolio"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {portfolioUrls.length < 6 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-[#4F46E5] transition-colors">
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">
                        Add photo
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadImage(file);
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {portfolioUrls.length}/6 images · Max 5MB each
            </p>
          </CardContent>
        </Card>

        <Separator />

        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Profile
        </Button>
      </form>
    </div>
  );
}
