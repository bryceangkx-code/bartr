"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
  CardDescription,
  CardFooter,
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
import { Badge } from "@/components/ui/badge";
import { BRAND_CATEGORIES, CREATOR_NICHES } from "@/lib/constants";
import { cn } from "@/lib/utils";

// ── Creator schema ─────────────────────────────────────────────────────────
const creatorSchema = z.object({
  display_name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(300, "Bio max 300 characters").optional(),
  location: z.string().optional(),
  niches: z.array(z.string()).min(1, "Pick at least one niche"),
});

// ── Brand schema ────────────────────────────────────────────────────────────
const brandSchema = z.object({
  display_name: z.string().min(2, "Name must be at least 2 characters"),
  company_name: z.string().min(1, "Company name is required"),
  website: z
    .string()
    .url("Enter a valid URL (include https://)")
    .optional()
    .or(z.literal("")),
  category: z.string().min(1, "Pick a category"),
  bio: z.string().max(300, "Bio max 300 characters").optional(),
  location: z.string().optional(),
});

type CreatorValues = z.infer<typeof creatorSchema>;
type BrandValues = z.infer<typeof brandSchema>;

export default function OnboardingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlRole = searchParams.get("role") as "creator" | "brand" | null;

  const [loading, setLoading] = useState(false);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [role, setRole] = useState<"creator" | "brand" | null>(urlRole);

  // If URL param is missing, get role from the authenticated session metadata
  useEffect(() => {
    if (urlRole) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      const metaRole = user?.user_metadata?.role as "creator" | "brand" | undefined;
      if (metaRole) setRole(metaRole);
    });
  }, [urlRole]);

  const creatorForm = useForm<CreatorValues>({
    resolver: zodResolver(creatorSchema),
    defaultValues: { niches: [] },
  });

  const brandForm = useForm<BrandValues>({
    resolver: zodResolver(brandSchema),
  });

  function toggleNiche(niche: string) {
    const next = selectedNiches.includes(niche)
      ? selectedNiches.filter((n) => n !== niche)
      : [...selectedNiches, niche];
    setSelectedNiches(next);
    creatorForm.setValue("niches", next, { shouldValidate: true });
  }

  async function submitCreator(values: CreatorValues) {
    setLoading(true);
    const res = await fetch("/api/profile/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "creator", ...values }),
    });

    const data = await res.json() as { error?: string };
    if (!res.ok) {
      toast.error(data.error ?? "Failed to save profile");
      setLoading(false);
      return;
    }

    router.push("/dashboard/creator");
  }

  async function submitBrand(values: BrandValues) {
    setLoading(true);
    const res = await fetch("/api/profile/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "brand", ...values }),
    });

    const data = await res.json() as { error?: string };
    if (!res.ok) {
      toast.error(data.error ?? "Failed to save profile");
      setLoading(false);
      return;
    }

    router.push("/dashboard/brand");
  }

  if (!role || (role !== "creator" && role !== "brand")) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Oops</CardTitle>
          <CardDescription>
            Invalid onboarding link. Please sign up again.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full">
            <a href="/signup">Back to Sign Up</a>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // ── Creator form ───────────────────────────────────────────────────────────
  if (role === "creator") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Set up your creator profile</CardTitle>
          <CardDescription>
            Tell brands a bit about yourself and your content
          </CardDescription>
        </CardHeader>
        <form onSubmit={creatorForm.handleSubmit(submitCreator)}>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="display_name">Your name</Label>
              <Input
                id="display_name"
                placeholder="How you want to be known"
                {...creatorForm.register("display_name")}
              />
              {creatorForm.formState.errors.display_name && (
                <p className="text-xs text-destructive">
                  {creatorForm.formState.errors.display_name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Describe your content and audience (max 300 chars)"
                rows={3}
                {...creatorForm.register("bio")}
              />
              {creatorForm.formState.errors.bio && (
                <p className="text-xs text-destructive">
                  {creatorForm.formState.errors.bio.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g. Singapore, Jakarta, KL"
                {...creatorForm.register("location")}
              />
            </div>

            <div className="space-y-2">
              <Label>Your niches</Label>
              <p className="text-xs text-muted-foreground">
                Pick all that apply — brands use this to find you
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
                        ? "border-[#4F46E5] bg-[#4F46E5] text-white"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    {niche}
                  </button>
                ))}
              </div>
              {creatorForm.formState.errors.niches && (
                <p className="text-xs text-destructive">
                  {creatorForm.formState.errors.niches.message}
                </p>
              )}
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
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Profile
            </Button>
          </CardFooter>
        </form>
      </Card>
    );
  }

  // ── Brand form ─────────────────────────────────────────────────────────────
  return (
    <Card>
      <CardHeader>
        <CardTitle>Set up your brand profile</CardTitle>
        <CardDescription>
          Tell creators about your brand and what you offer
        </CardDescription>
      </CardHeader>
      <form onSubmit={brandForm.handleSubmit(submitBrand)}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="display_name">Your name</Label>
            <Input
              id="display_name"
              placeholder="Your name or contact person"
              {...brandForm.register("display_name")}
            />
            {brandForm.formState.errors.display_name && (
              <p className="text-xs text-destructive">
                {brandForm.formState.errors.display_name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="company_name">Company / Brand name</Label>
            <Input
              id="company_name"
              placeholder="e.g. Sunnies Studios"
              {...brandForm.register("company_name")}
            />
            {brandForm.formState.errors.company_name && (
              <p className="text-xs text-destructive">
                {brandForm.formState.errors.company_name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Select
              onValueChange={(val) =>
                brandForm.setValue("category", val, { shouldValidate: true })
              }
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {BRAND_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {brandForm.formState.errors.category && (
              <p className="text-xs text-destructive">
                {brandForm.formState.errors.category.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://yourbrand.com"
              {...brandForm.register("website")}
            />
            {brandForm.formState.errors.website && (
              <p className="text-xs text-destructive">
                {brandForm.formState.errors.website.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">About your brand</Label>
            <Textarea
              id="bio"
              placeholder="Describe your brand and what makes it special (max 300 chars)"
              rows={3}
              {...brandForm.register("bio")}
            />
            {brandForm.formState.errors.bio && (
              <p className="text-xs text-destructive">
                {brandForm.formState.errors.bio.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g. Singapore, Jakarta, KL"
              {...brandForm.register("location")}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Profile
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
