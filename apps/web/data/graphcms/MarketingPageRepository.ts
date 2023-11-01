import { fetchAPI } from "./index"
import {
   companyLogosQueryProps,
   companyValuesQueryProps,
   eventsSectionQueryProps,
   fieldOfStudyQueryProps,
   heroQueryProps,
   highlightListQueryProps,
   HygraphRemoteFieldOfStudyResponse,
   HygraphResponseMarketingPage,
   imageQueryProps,
   marketingSignupQueryProps,
   seoQueryProps,
   Slug,
   testimonialListQueryProps,
   testimonialQueryProps,
   textBlockQueryProps,
   Variables,
} from "../../types/cmsTypes"
import { MarketingLandingPage } from "./MarketingLandingPage"
import { Page } from "./Page"

export interface IMarketingPageRepository {
   getAllMarketingPageSlugs(): Promise<{ slug: Slug }[]>

   getMarketingPage(variables: Variables): Promise<MarketingLandingPage>

   getPage(variables: Variables): Promise<Page>

   getFieldsOfStudyWithMarketingPages(): Promise<HygraphRemoteFieldOfStudyResponse>
}

interface IMarketingPageSlugsResponse {
   marketingLandingPages: { slug: Slug }[]
}

interface IPageResponse {
   page: Page
}

interface IFieldOfStudiesResponse {
   fieldOfStudies: HygraphRemoteFieldOfStudyResponse
}

// language=GraphQL
class GraphCMSMarketingPageRepository implements IMarketingPageRepository {
   constructor() {}

   async getAllMarketingPageSlugs(): Promise<{ slug: Slug }[]> {
      const data = await fetchAPI<IMarketingPageSlugsResponse>(`
          {
              marketingLandingPages {
                  slug
              }
          }
      `)
      return data.marketingLandingPages
   }

   async getMarketingPage(variables: Variables): Promise<MarketingLandingPage> {
      const response = await fetchAPI<{
         marketingLandingPage: HygraphResponseMarketingPage
      }>(
         `
              query MarketingLandingPageQuery($slug: String!, $stage: Stage!) {
                  marketingLandingPage(stage: $stage, where: { slug: $slug }) {
                      id
                      pageType
                      slug
                      fieldOfStudies ${fieldOfStudyQueryProps}
                      blocks {
                          ... on EventsSection ${eventsSectionQueryProps}
                          ... on MarketingSignup ${marketingSignupQueryProps}
                          ... on Hero ${heroQueryProps}
                          ... on CompanyValues ${companyValuesQueryProps}
                          ... on Testimonial ${testimonialQueryProps}
                          ... on TestimonialList ${testimonialListQueryProps}
                          ... on CompanyLogos ${companyLogosQueryProps}
                          ... on TextBlock ${textBlockQueryProps}
                          ... on HighlightList ${highlightListQueryProps}
                      }
                      seo ${seoQueryProps}
                  }
              }
         `,
         {
            variables: {
               slug: variables.slug,
               stage: variables.preview ? "DRAFT" : "PUBLISHED",
            },
            preview: variables.preview,
         }
      )
      if (!response.marketingLandingPage) return null
      return MarketingLandingPage.createFromHygraph(
         response.marketingLandingPage
      )
   }

   async getPage(variables: Variables): Promise<Page> {
      const response = await fetchAPI<IPageResponse>(
         `
              query PageQuery($slug: String!, $stage: Stage!) {
                  page(stage: $stage, where: { slug: $slug }) {
                      id
                      slug
                      title
                      subtitle
                      hero ${heroQueryProps}
                      image ${imageQueryProps}
                      seo ${seoQueryProps}
                  }
              }
         `,
         {
            variables: {
               slug: variables.slug,
               stage: variables.preview ? "DRAFT" : "PUBLISHED",
            },
            preview: variables.preview,
         }
      )

      if (!response.page) return null
      return Page.createFromHygraph(response.page)
   }

   async getFieldsOfStudyWithMarketingPages(): Promise<HygraphRemoteFieldOfStudyResponse> {
      const data = await fetchAPI<IFieldOfStudiesResponse>(`
          {
              fieldOfStudies ${fieldOfStudyQueryProps}
          }
      `)
      return data.fieldOfStudies
   }
}

// Singleton
const marketingPageRepo: IMarketingPageRepository =
   new GraphCMSMarketingPageRepository()

export default marketingPageRepo
