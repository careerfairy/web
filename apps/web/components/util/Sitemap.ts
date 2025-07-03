import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Group } from "@careerfairy/shared-lib/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { companyNameSlugify } from "@careerfairy/shared-lib/utils"

/**
 * Maps live streams to sitemap URLs
 * @param path - The base path for the sitemap
 * @param events - Array of LivestreamEvent objects
 * @returns A string representing the sitemap URLs for the live streams
 */
export const mapLiveStreamsToSiteMap = (
   path: string,
   events: LivestreamEvent[]
): string => {
   return `${events
      .map(
         (event) =>
            `<url>
            <loc>${`${path}/${event.id}`}</loc>
            <lastmod>${event.lastUpdated?.toDate?.().toString()}</lastmod>
            <changefreq>${event.hasEnded ? "never" : "daily"}</changefreq>
        </url>`
      )
      .join("")}`
}

export const mapSparksToSiteMap = (path: string, sparks: Spark[]): string => {
   return `${sparks
      .map((spark) => {
         const lastModified = spark.updatedAt
            ? spark.updatedAt?.toDate?.().toString()
            : spark.createdAt.toDate?.().toString()

         return `<url>
                    <loc>${`${path}/${spark.id}`}</loc>
                    <lastmod>${lastModified}</lastmod>
                </url>`
      })
      .join("")}`
}

/**
 * Maps groups to sitemap URLs
 * @param path - The base path for the sitemap
 * @param groups - Array of Group objects
 * @returns A string representing the sitemap URLs for the groups
 */
export const mapGroupsToSiteMap = (path: string, groups: Group[]): string => {
   return `${groups
      .map(
         (group) =>
            `<url>
            <loc>${`${path}/${companyNameSlugify(group.universityName)}`}</loc>
        </url>`
      )
      .join("")}`
}

export const mapCustomJobsToSiteMap = (
   path: string,
   jobs: CustomJob[]
): string => {
   return `${jobs
      .map((job) => {
         return `<url>
         <loc>${`${path}/${job.id}`}</loc>
         <lastmod>${job.updatedAt?.toDate?.().toString()}</lastmod>
      </url>`
      })
      .join("")}`
}
/**
 * Maps web flow paths to sitemap URLs
 * @param paths - Array of paths to be mapped
 * @returns A string representing the sitemap URLs for the web flow paths
 */
export const mapWebFlowToSiteMap = (paths: string[]): string => {
   return `${paths
      .map(
         (path) =>
            `<url>
            <loc>${path}</loc>
        </url>`
      )
      .join("")}`
}

/**
 * Wraps the provided sitemap content in XML format
 * @param siteMap - The sitemap content to be wrapped
 * @returns A string representing the sitemap content wrapped in XML format
 */
export const siteMapXmlWrapper = (siteMap: string): string => {
   return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${siteMap}
    </urlset>`
}
