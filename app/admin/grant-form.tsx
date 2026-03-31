"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type Brand = { id: string; company_name: string | null; display_name: string | null; credits: number };

export function GrantForm({ brands }: { brands: Brand[] }) {
  const [brandId, setBrandId] = useState("");
  const [amount, setAmount] = useState("5");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!brandId) { toast.error("Select a brand"); return; }

    setLoading(true);
    const res = await fetch("/api/admin/credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand_id: brandId, amount: Number(amount), note: note || undefined }),
    });
    const data = await res.json() as { error?: string; credits_added?: number };
    if (!res.ok) {
      toast.error(data.error ?? "Failed");
    } else {
      toast.success(`Granted ${data.credits_added} credits`);
      setBrandId("");
      setAmount("5");
      setNote("");
    }
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Grant Credits</CardTitle>
        <CardDescription>Manually add credits to a brand account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="brand">Brand</Label>
            <select
              id="brand"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">— Select a brand —</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.company_name ?? b.display_name ?? b.id} ({b.credits} credits)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Credits to grant</Label>
              <Input
                id="amount"
                type="number"
                min={1}
                max={100}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="note">Note (optional)</Label>
              <Input
                id="note"
                placeholder="e.g. Onboarding bonus"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Grant Credits
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
