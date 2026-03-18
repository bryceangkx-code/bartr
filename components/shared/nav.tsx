"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/database";

interface NavProps {
  profile: Profile;
}

export default function Nav({ profile }: NavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isCreator = profile.role === "creator";
  const initials = profile.display_name
    ? profile.display_name.slice(0, 2).toUpperCase()
    : "??";

  async function signOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    router.push("/login");
    router.refresh();
  }

  const links = isCreator
    ? [
        { href: "/dashboard/creator", label: "Dashboard" },
        { href: "/browse", label: "Browse Listings" },
        { href: "/dashboard/creator/deals", label: "My Deals" },
      ]
    : [
        { href: "/dashboard/brand", label: "Dashboard" },
        { href: "/dashboard/brand/listings", label: "My Listings" },
        { href: "/creators", label: "Browse Creators" },
        { href: "/dashboard/brand/deals", label: "Applications" },
        { href: "/dashboard/brand/reports", label: "Reports" },
      ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="text-xl font-bold text-[#7C3AED]">
          Bartr
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md transition-colors",
                  active
                    ? "text-[#7C3AED] font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Right — avatar + sign out */}
        <div className="hidden md:flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="bg-violet-100 text-[#7C3AED] text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-1">
          {links.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "block px-3 py-2 text-sm rounded-md",
                  active ? "text-[#7C3AED] font-medium bg-violet-50" : "hover:bg-muted"
                )}
              >
                {l.label}
              </Link>
            );
          })}
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-3 py-2 text-sm text-destructive w-full rounded-md hover:bg-muted"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </header>
  );
}
