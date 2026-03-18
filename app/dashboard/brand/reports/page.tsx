import { redirect } from "next/navigation";
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Profile } from "@/types/database";

const featureCards = [
  {
    icon: TrendingUp,
    title: "Campaign Analytics",
    description:
      "Track reach, impressions, and engagement across all your creator campaigns",
  },
  {
    icon: Users,
    title: "Creator Performance",
    description:
      "Compare performance metrics across your creator partnerships",
  },
  {
    icon: DollarSign,
    title: "ROI Dashboard",
    description:
      "Measure the return on your product seeding investment",
  },
];

export default async function BrandReportsPage() {
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

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="flex flex-col items-center text-center gap-4 py-10">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100">
          <BarChart3 className="h-8 w-8 text-[#7C3AED]" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Performance Reports
          </h1>
          <p className="text-sm font-semibold uppercase tracking-widest text-[#7C3AED]">
            Coming Soon
          </p>
        </div>
        <p className="max-w-lg text-muted-foreground text-sm leading-relaxed">
          AI-powered campaign performance reports, creator analytics, and ROI
          tracking are on the way. We&apos;re building tools to help you measure the
          real impact of your creator partnerships.
        </p>
      </div>

      {/* Feature preview cards */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4 text-center">
          What&apos;s coming
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {featureCards.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="bg-muted/40 border-dashed">
              <CardHeader className="pb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 mb-2">
                  <Icon className="h-4 w-4 text-[#7C3AED]" />
                </div>
                <CardTitle className="text-sm">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs leading-relaxed">
                  {description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
