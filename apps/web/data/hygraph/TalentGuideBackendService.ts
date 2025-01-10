import { gql, GraphQLClient } from "graphql-request"
import { createTalentGuideClient } from "./client"
import { FORCE_GERMAN_LOCALE } from "./constants"
import { talentGuideModulePageFragment } from "./fragments"
import {
   Page,
   PageType,
   TalentGuideModule,
   TalentGuideModulePageResponse,
   TalentGuideRootPageResponse,
   TalentGuideSlugsResponse,
} from "./types"

/**
 * Service class for interacting with Talent Guide data from Hygraph CMS.
 *
 * This class provides methods to fetch Talent Guide related content,
 * including module pages, root pages, and slugs.
 *
 * @class
 */
export class TalentGuideBackendService {
   private client: GraphQLClient

   constructor({ preview = false }: { preview?: boolean } = {}) {
      this.client = createTalentGuideClient(preview)
   }

   /**
    * Get all levels module page slugs, eg /levels/(networking) or /levels/(interviewing)
    */
   async getAllTalentGuideModulePageSlugs(): Promise<string[]> {
      const query = gql`
         {
            pages(where: { pageType: ${PageType.TALENT_GUIDE_MODULE_PAGE} }) {
               slug
            }
         }
      `

      const data = await this.client.request<TalentGuideSlugsResponse>(query)

      return data.pages.map((guide: { slug: string }) => guide.slug)
   }

   /**
    * Get the levels root page, eg /levels
    */
   async getTalentGuideRootPage(slug: string): Promise<Page> {
      const query = gql`
         query GetTalentGuideRootPage($slug: String!) {
            pages(where: { pageType: ${PageType.TALENT_GUIDE_ROOT_PAGE}, slug: $slug }) {
               slug
            }
         }
      `
      const { pages } = await this.client.request<TalentGuideRootPageResponse>(
         query,
         {
            slug,
         }
      )

      return pages[0]
   }

   async getTalentGuideModulePageBySlug(
      slug: string,
      locale: string = "en"
   ): Promise<Page> {
      const forcedLocale = FORCE_GERMAN_LOCALE ? "de" : locale // TODO: remove when other languages for talent guide are available

      const query = gql`
         query GetTalentGuideBySlug($slug: String!, $locale: Locale!) {
            page(where: { slug: $slug }, locales: [$locale]) ${talentGuideModulePageFragment}
         }
      `

      const { page } = await this.client.request<TalentGuideModulePageResponse>(
         query,
         {
            slug,
            locale: forcedLocale,
         }
      )

      return page
   }

   /**
    * Get all talent guide module pages
    * @param locale - The locale to fetch content in
    * @returns Promise<Page[]> Array of all module pages
    */
   async getAllTalentGuideModulePages(
      locale: string = "en"
   ): Promise<Page<TalentGuideModule>[]> {
      const forcedLocale = FORCE_GERMAN_LOCALE ? "de" : locale

      const query = gql`
         query GetAllTalentGuideModules($locale: Locale!) {
            pages(
               where: { pageType: ${PageType.TALENT_GUIDE_MODULE_PAGE} }, 
               locales: [$locale]
            ) ${talentGuideModulePageFragment}
         }
      `

      const data = await this.client.request<{
         pages: Page<TalentGuideModule>[]
      }>(query, {
         locale: forcedLocale,
      })

      // Sort the pages by content.level
      return data.pages.sort(
         (a, b) => (a.content?.level ?? 0) - (b.content?.level ?? 0)
      )
   }
}

/**
 * Singleton instance of TalentGuideBackendService for published content.
 */
export const tgBackendService = new TalentGuideBackendService()

/**
 * Singleton instance of TalentGuideBackendService for unpublished content.
 */
export const tgBackendPreviewService = new TalentGuideBackendService({
   preview: true,
})
