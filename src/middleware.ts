import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  isIdleExpired,
  isStaffActivity,
  isStaffPath,
  STAFF_ACTIVITY_COOKIE,
  STAFF_IDLE_MINUTES,
} from "@/lib/staff-session";

/**
 * Sign a staff session out after a spell of inactivity.
 *
 * The admin console shows every customer's details, so an unattended laptop
 * is a real exposure. Travellers and hosts are deliberately left alone — being
 * logged out mid-booking helps nobody.
 *
 * Returns a redirect when the session has gone stale, otherwise null and the
 * caller refreshes the stamp on the response it was going to send anyway.
 */
function staffIdleRedirect(request: NextRequest): NextResponse | null {
  if (!isStaffPath(request.nextUrl.pathname)) return null;
  // The sign-in pages themselves must stay reachable, or a timed-out agent
  // would bounce between the redirect and the page it points at.
  if (request.nextUrl.pathname.startsWith("/team/login")) return null;
  if (!isIdleExpired(request.cookies.get(STAFF_ACTIVITY_COOKIE)?.value)) return null;

  const url = request.nextUrl.clone();
  url.pathname = "/team/login";
  url.search = "?timeout=1";
  const bounce = NextResponse.redirect(url);
  bounce.cookies.delete(STAFF_ACTIVITY_COOKIE);
  bounce.cookies.delete("parkgo_session");
  return bounce;
}

/** Restart the inactivity clock on every staff page view or agent chat poll. */
function touchStaffActivity(request: NextRequest, response: NextResponse) {
  if (!isStaffActivity(request.nextUrl.pathname, request.nextUrl.search)) return;
  response.cookies.set(STAFF_ACTIVITY_COOKIE, String(Date.now()), {
    sameSite: "lax",
    path: "/",
    maxAge: STAFF_IDLE_MINUTES * 60,
  });
}

/**
 * Refreshes the Supabase auth session cookie on each request (required for
 * server-side auth with @supabase/ssr). No-op unless the app is in live mode
 * with Supabase configured, so mock deployments are unaffected.
 */
export async function middleware(request: NextRequest) {
  // IndexNow ownership proof: the protocol requires `/{key}.txt` to exist at
  // the site root and contain the key. Served from the same env var the ping
  // uses, so the two can never disagree.
  const indexNowKey = process.env.INDEXNOW_KEY;
  if (indexNowKey && request.nextUrl.pathname === `/${indexNowKey}.txt`) {
    return new NextResponse(indexNowKey, {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const idle = staffIdleRedirect(request);
  if (idle) return idle;

  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (process.env.PARKGO_MODE !== "live" || !url || !anon) {
    touchStaffActivity(request, response);
    return response;
  }

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Touch the session so expired access tokens are refreshed via cookies.
  await supabase.auth.getUser();
  // Stamp last, because setAll() above may have swapped `response` for a new
  // one — anything written before that point would be silently dropped.
  touchStaffActivity(request, response);
  return response;
}

export const config = {
  // Run on everything except static assets.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
