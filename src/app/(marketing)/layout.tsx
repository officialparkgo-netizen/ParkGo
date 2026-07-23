import { Megaphone } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { getPlatformSettings } from "@/lib/data/settings";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Site-wide announcement, managed from /admin/settings.
  const settings = await getPlatformSettings();
  const announcement =
    settings.announcementOn && settings.announcement ? settings.announcement : null;

  return (
    <>
      {announcement && (
        <div
          data-announcement
          className="flex items-center justify-center gap-2 bg-navy-900 px-4 py-2 text-center text-sm font-semibold text-white"
        >
          <Megaphone className="h-4 w-4 shrink-0 text-accent-400" aria-hidden />
          {announcement}
        </div>
      )}
      <SiteHeader />
      <main id="main-content">{children}</main>
      <SiteFooter />
    </>
  );
}
