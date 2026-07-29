import { unsubscribeFromBlog } from "@/lib/data/blog";
import { verifyUnsubscribeSig } from "@/lib/blog-notify";

export const dynamic = "force-dynamic";

/**
 * One click from the email footer. A GET on purpose — mail clients prefetch
 * links, but unsubscribing someone who was about to be unsubscribed is
 * harmless, unlike making them fill in a form to stop being emailed.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("e") ?? "";
  const sig = searchParams.get("sig") ?? "";

  // The signature binds the link to the address it was mailed to; without it
  // anyone could unsubscribe anyone else by guessing their email.
  if (!email || !verifyUnsubscribeSig(email, sig)) {
    return new Response("Invalid link", { status: 400 });
  }
  await unsubscribeFromBlog(email);
  return new Response(
    `<!doctype html><meta charset="utf-8"><title>Unsubscribed</title>
     <body style="font-family:system-ui;max-width:26rem;margin:15vh auto;text-align:center;color:#15171A">
     <h1 style="font-size:1.3rem">You're unsubscribed</h1>
     <p style="color:#5B6472">No more blog emails to ${email.replace(/</g, "&lt;")}.</p>
     <p><a href="/blog" style="color:#C9510B">Back to the blog</a></p></body>`,
    { headers: { "content-type": "text/html; charset=utf-8" } }
  );
}
