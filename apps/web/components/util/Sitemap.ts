import { Group } from "@careerfairy/shared-lib/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { companyNameSlugify } from "@careerfairy/shared-lib/utils"
import { getBaseUrl } from "components/helperFunctions/HelperFunctions"

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
            <loc>${`${getBaseUrl()}${path}/${event.id}`}</loc>
            <lastmod>${event.lastUpdated?.toDate?.().toString()}</lastmod>
            <changeFrequency>daily</changeFrequency>
        </url>`
      )
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
            <loc>${`${getBaseUrl()}${path}/${companyNameSlugify(
               group.universityName
            )}`}</loc>
        </url>`
      )
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
            <loc>${`${getBaseUrl()}/${path}`}</loc>
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
