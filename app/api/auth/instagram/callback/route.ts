import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const GRAPH_API_VERSION = "v19.0";
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

function errorRedirect(reason: string): NextResponse {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return NextResponse.redirect(
    `${appUrl}/dashboard/creator?instagram=error&reason=${encodeURIComponent(reason)}`
  );
}

export async function GET(request: Request): Promise<NextResponse> {
  // Check required env vars
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appId || !appSecret) {
    return errorRedirect("missing_env_config");
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return errorRedirect("missing_code_or_state");
  }

  const redirectUri = `${appUrl}/api/auth/instagram/callback`;

  // Step 1: Exchange code for short-lived token
  const shortTokenParams = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: redirectUri,
    code,
  });

  const shortTokenRes = await fetch(`${GRAPH_API_BASE}/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: shortTokenParams.toString(),
  });

  const shortTokenData = await shortTokenRes.json() as {
    access_token: string;
    token_type: string;
    error?: { message: string };
  };

  if (!shortTokenRes.ok || shortTokenData.error || !shortTokenData.access_token) {
    return errorRedirect(shortTokenData.error?.message ?? "short_token_exchange_failed");
  }

  const shortToken = shortTokenData.access_token;

  // Step 2: Exchange short-lived token for long-lived token
  const longTokenParams = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortToken,
  });

  const longTokenRes = await fetch(
    `${GRAPH_API_BASE}/oauth/access_token?${longTokenParams.toString()}`
  );

  const longTokenData = await longTokenRes.json() as {
    access_token: string;
    token_type: string;
    expires_in?: number;
    error?: { message: string };
  };

  if (!longTokenRes.ok || longTokenData.error || !longTokenData.access_token) {
    return errorRedirect(longTokenData.error?.message ?? "long_token_exchange_failed");
  }

  const longToken = longTokenData.access_token;

  // Step 3: Get the user's Instagram business account info from their Facebook Page
  const meParams = new URLSearchParams({
    fields: "instagram_business_account",
    access_token: longToken,
  });

  const meRes = await fetch(`${GRAPH_API_BASE}/me?${meParams.toString()}`);

  const meData = await meRes.json() as {
    id: string;
    instagram_business_account?: { id: string };
    error?: { message: string };
  };

  if (!meRes.ok || meData.error) {
    return errorRedirect(meData.error?.message ?? "me_request_failed");
  }

  if (!meData.instagram_business_account?.id) {
    return errorRedirect("no_business_account");
  }

  const igAccountId = meData.instagram_business_account.id;

  // Step 4: Get the Instagram account username and followers count
  const igParams = new URLSearchParams({
    fields: "username,followers_count",
    access_token: longToken,
  });

  const igRes = await fetch(`${GRAPH_API_BASE}/${igAccountId}?${igParams.toString()}`);

  const igData = await igRes.json() as {
    id: string;
    username?: string;
    followers_count?: number;
    error?: { message: string };
  };

  if (!igRes.ok || igData.error || !igData.username) {
    return errorRedirect(igData.error?.message ?? "ig_account_fetch_failed");
  }

  const igUsername = igData.username;

  // Step 5: Authenticate the Supabase user from the session
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return errorRedirect("unauthenticated");
  }

  // Step 6: Update creator_profiles via admin client
  const admin = createAdminClient();

  const { error: updateError } = await admin
    .from("creator_profiles")
    .update({
      instagram_verified: true,
      instagram_access_token: longToken,
      instagram_token_expires_at: new Date(
        Date.now() + 60 * 24 * 60 * 60 * 1000
      ).toISOString(), // 60 days
      instagram_user_id: igAccountId,
      instagram_handle: igUsername,
    })
    .eq("id", user.id);

  if (updateError) {
    return errorRedirect("profile_update_failed");
  }

  // Step 7: Redirect to dashboard with success indicator
  return NextResponse.redirect(
    `${appUrl}/dashboard/creator?instagram=connected`
  );
}
