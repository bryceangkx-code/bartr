"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { BRAND_CATEGORIES } from "@/lib/constants";
import type { Profile, BrandProfile } from "@/types/database";

const schema = z.object({
  display_name: z.string().min(2, "Name must be at least 2 characters"),
  company_name: z.string().min(1, "Company name is required"),
  website: z
    .string()
    .url("Enter a valid URL (include https://)")
    .optional()
    .or(z.literal("")),
  category: z.string().min(1, "Pick a category"),
  bio: z.string().max(300, "Max 300 characters").optional(),
  location: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export default function BrandProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const selectedCategory = watch("category");

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: profileData }, { data: bpData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("brand_profiles").select("*").eq("id", user.id).single(),
      ]);

      const profile = profileData as Profile | null;
      const bp = bpData as BrandProfile | null;

      reset({
        display_name: profile?.display_name ?? "",
        bio: profile?.bio ?? "",
        location: profile?.location ?? "",
        company_name: bp?.company_name ?? "",
        website: bp?.website ?? "",
        category: bp?.category ?? "",
      });
      setPageLoading(false);
    }
    load();
  }, []);

  async function onSubmit(values: Values) {
    setLoading(true);

    const res = await fetch("/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        display_name: values.display_name,
        bio: values.bio || null,
        location: values.location || null,
        company_name: values.company_name,
        website: values.website || null,
        category: values.category,
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
        <h1 className="text-2xl font-bold">Brand Profile</h1>
        <p className="text-muted-foreground mt-1">
          Keep your profile complete to attract quality creators.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="display_name">Your name</Label>
              <Input
                id="display_name"
                placeholder="Your name or contact person"
                {...register("display_name")}
              />
              {errors.display_name && (
                <p className="text-xs text-destructive">
                  {errors.display_name.message}
                </p>
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

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Brand info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="company_name">Brand / Company name</Label>
              <Input
                id="company_name"
                placeholder="e.g. Sunnies Studios"
                {...register("company_name")}
              />
              {errors.company_name && (
                <p className="text-xs text-destructive">
                  {errors.company_name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={(v) =>
                  setValue("category", v, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {BRAND_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-destructive">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://yourbrand.com"
                {...register("website")}
              />
              {errors.website && (
                <p className="text-xs text-destructive">
                  {errors.website.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">About your brand</Label>
              <Textarea
                id="bio"
                placeholder="Tell creators what your brand is about (max 300 chars)"
                rows={3}
                {...register("bio")}
              />
              {errors.bio && (
                <p className="text-xs text-destructive">{errors.bio.message}</p>
              )}
            </div>
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
