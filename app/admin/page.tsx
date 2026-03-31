import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GrantForm } from "./grant-form";
import type { Profile, BrandProfile, CreditTransaction } from "@/types/database";

type Brand = { id: string; company_name: string | null; display_name: string | null; credits: number };

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if ((profileData as { role: string } | null)?.role !== "admin") redirect("/dashboard");

  // Fetch all brands with credit balances
  const [{ data: profilesData }, { data: bpData }] = await Promise.all([
    supabase.from("profiles").select("id, display_name").eq("role", "brand"),
    supabase.from("brand_profiles").select("id, company_name, credits"),
  ]);

  const profileMap: Record<string, string | null> = {};
  (profilesData as Pick<Profile, "id" | "display_name">[] | null)?.forEach(
    (p) => { profileMap[p.id] = p.display_name; }
  );

  const brands: Brand[] = (bpData as (Pick<BrandProfile, "id" | "company_name" | "credits">)[] | null)?.map(
    (b) => ({ id: b.id, company_name: b.company_name, display_name: profileMap[b.id] ?? null, credits: b.credits })
  ) ?? [];

  // Fetch recent transactions
  const { data: txData } = await supabase
    .from("credit_transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);
  const transactions = (txData as CreditTransaction[] | null) ?? [];

  const brandNameMap: Record<string, string> = {};
  brands.forEach((b) => { brandNameMap[b.id] = b.company_name ?? b.display_name ?? b.id; });

  const totalCreditsInCirculation = brands.reduce((sum, b) => sum + b.credits, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Bartr internal ops</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-5">
              <p className="text-2xl font-bold">{brands.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total brands</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-2xl font-bold text-[#7C3AED]">{totalCreditsInCirculation}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Credits in circulation</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-2xl font-bold">{transactions.filter(t => t.action === "admin_grant").length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Manual grants</p>
            </CardContent>
          </Card>
        </div>

        {/* Grant form */}
        <GrantForm brands={brands} />

        {/* Brand balances */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Brand Balances</CardTitle>
            <CardDescription>Current credit balance per brand</CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            {brands.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No brands yet.</p>
            ) : (
              brands
                .sort((a, b) => b.credits - a.credits)
                .map((b) => (
                  <div key={b.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{b.company_name ?? b.display_name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground font-mono">{b.id}</p>
                    </div>
                    <span className={`text-sm font-bold ${b.credits > 0 ? "text-[#7C3AED]" : "text-muted-foreground"}`}>
                      {b.credits} cr
                    </span>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        {/* Transaction log */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Transactions</CardTitle>
            <CardDescription>Last 30 credit events</CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No transactions yet.</p>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {brandNameMap[tx.brand_id] ?? tx.brand_id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.action.replace(/_/g, " ")}
                      {tx.note ? ` · ${tx.note}` : ""}
                      {" · "}
                      {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`shrink-0 text-sm font-bold ${tx.amount > 0 ? "text-green-600" : "text-red-500"}`}>
                    {tx.amount > 0 ? "+" : ""}{tx.amount}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
