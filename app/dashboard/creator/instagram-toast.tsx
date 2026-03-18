"use client";
import { useEffect } from "react";
import { toast } from "sonner";

export function InstagramToast() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("instagram");
    if (status === "connected") {
      toast.success("Instagram connected successfully!");
    } else if (status === "error") {
      const reason = params.get("reason") ?? "unknown";
      toast.error(`Instagram connection failed: ${reason.replace(/_/g, " ")}`);
    }
    if (status) {
      const url = new URL(window.location.href);
      url.searchParams.delete("instagram");
      url.searchParams.delete("reason");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);
  return null;
}
