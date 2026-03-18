import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

const GRAPH_API_SCOPES = "public_profile,instagram_basic";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.redirect(
      new URL("/login", process.env.NEXT_PUBLIC_APP_URL!)
    );
  }

  const appId = process.env.FACEBOOK_APP_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appId || !appUrl) {
    return NextResponse.redirect(
      new URL("/dashboard/creator?instagram=error&reason=missing_config", appUrl ?? "http://localhost:3000")
    );
  }

  // Generate cryptographically random state for CSRF protection
  const state = crypto.randomBytes(32).toString("hex");
  const redirectUri = `${appUrl}/api/auth/instagram/callback`;

  const authUrl = new URL("https://www.facebook.com/v19.0/dialog/oauth");
  authUrl.searchParams.set("client_id", appId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", GRAPH_API_SCOPES);
  authUrl.searchParams.set("state", state);

  // Store state in a short-lived HttpOnly cookie for CSRF validation
  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set("instagram_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  return response;
}
