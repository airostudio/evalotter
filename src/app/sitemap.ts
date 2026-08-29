import type { MetadataRoute } from "next";
import { CATALOGUE } from "@/config/catalogue";
import { listPublishedAssessments } from "@/lib/assessment-engine/queries";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const STATIC_ROUTES = [
  "",
  "/assessments",
  "/pricing",
  "/how-it-works",
  "/methodology",
  "/about",
  "/privacy",
  "/terms",
  "/refund-policy",
  "/cookie-policy",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let slugs: string[];
  try {
    const assessments = await listPublishedAssessments();
    slugs = assessments.length > 0 ? assessments.map((a) => a.slug) : CATALOGUE.filter((a) => !a.comingSoon).map((a) => a.slug);
  } catch {
    slugs = CATALOGUE.filter((a) => !a.comingSoon).map((a) => a.slug);
  }

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }));

  const assessmentEntries: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${SITE_URL}/assessments/${slug}`,
    lastModified: new Date(),
  }));

  return [...staticEntries, ...assessmentEntries];
}
