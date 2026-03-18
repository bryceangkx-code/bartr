import { BadgeCheck } from "lucide-react";

/**
 * Small inline badge shown next to a creator's name when instagram_verified is true.
 */
export function VerifiedBadge() {
  return (
    <span title="Instagram Verified" aria-label="Instagram Verified">
      <BadgeCheck className="h-4 w-4 text-[#7C3AED] inline-block flex-shrink-0" />
    </span>
  );
}
