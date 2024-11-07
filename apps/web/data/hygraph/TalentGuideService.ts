import { gql, GraphQLClient } from "graphql-request"
import { createTalentGuideClient } from "./client"
import { moduleStepFragment, seoComponentFragment } from "./fragments"
import {
   Page,
   PageType,
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
export class TalentGuideService {
   private client: GraphQLClient

   constructor({ preview = false }: { preview?: boolean } = {}) {
      this.client = createTalentGuideClient(preview)
   }

   /**
    * Get all talent guide module page slugs, eg /talent-guide/(networking) or /talent-guide/(interviewing)
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
    * Get the talent guide root page, eg /talent-guide
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
      const query = gql`
         query GetTalentGuideBySlug($slug: String!, $locale: Locale!) {
            page(where: { slug: $slug }, locales: [$locale]) {
               slug
               seo ${seoComponentFragment}
               content {
                  moduleName
                  moduleDescription
                  moduleDuration
                  category
                  contentTopicTags
                  businessFunctionTags
                  moduleSteps ${moduleStepFragment}
               }
            }
         }
      `

      const { page } = await this.client.request<TalentGuideModulePageResponse>(
         query,
         {
            slug,
            locale,
         }
      )

      return page
   }
}

/**
 * Singleton instance of TalentGuideService for published content.
 */
export const tgService = new TalentGuideService()

/**
 * Singleton instance of TalentGuideService for unpublished content.
 */
export const tgPreviewService = new TalentGuideService({
   preview: true,
})
