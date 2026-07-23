
import { notFound } from "next/navigation";
import { resolveNewsletterIssue } from "@/lib/newsletter-resolver";
import { NewsletterTemplate } from "@/components/marketing/newsletter-template";
import { pageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  let title = "OWL Weekly Newsletter";
  try {
    const data = await resolveNewsletterIssue(slug);
    if (data) title = `${data.title} — Issue #${data.issue_number}`;
  } catch { /* no-op */ }
  return pageMetadata({ title, path: `/newsletter/${slug}` });
}

export default async function NewsletterIssuePage({ params }: Props) {
  const { slug } = await params;
  const data = await resolveNewsletterIssue(slug).catch(() => null);
  if (!data) notFound();

  return (
    <main className="min-h-screen bg-[#f3f4f6] py-8">
      <NewsletterTemplate data={data} />
    </main>
  );
}
