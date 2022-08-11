import { fetchAPI } from "./index"
import {
   HygraphResponseMarketingPage,
   Slug,
   Variables,
} from "../../types/cmsTypes"
import { MarketingLandingPage } from "./MarketingLandingPage"

export interface IMarketingPageRepository {
   getAllMarketingPageSlugs(): Promise<{ slug: Slug }[]>

   getMarketingPage(variables: Variables): Promise<MarketingLandingPage>
}

// language=GraphQL
class GraphCMSMarketingPageRepository implements IMarketingPageRepository {
   constructor() {}

   async getAllMarketingPageSlugs(): Promise<{ slug: Slug }[]> {
      const data = await fetchAPI(`
          {
              marketingLandingPages {
                  slug
              }
          }
      `)
      return data.marketingLandingPages
   }

   async getMarketingPage(variables: Variables): Promise<MarketingLandingPage> {
      const response = await fetchAPI(
         `
              query MarketingLandingPageQuery($slug: String!, $stage: Stage!) {
                  marketingLandingPage(stage: $stage, where: { slug: $slug }) {
                      id
                      pageType
                      slug
                      title
                      subtitle
                      hero {
                          id
                          slug
                          image {
                              height
                              width
                              url
                              caption
                              alt
                          }
                          buttons {
                              children
                              slug
                              href
                              variant
                              color
                              size
                          }
                      }
                      blocks(first: 500) {
                          ... on EventsSection {
                              __typename
                              id
                              fieldsOfStudy
                              typeOfEvent
                          }
                          ... on MarketingSignup {
                              id
                              __typename
                              title
                              subtitle
                              slug
                              button {
                                  children
                                  slug
                                  href
                                  variant
                                  color
                                  size
                              }
                          }
                      }
                      seo {
                          id
                          title
                          description
                          keywords
                          image {
                              id
                              stage
                              updatedAt
                              alt
                              handle
                              fileName
                              mimeType
                              width
                              height
                              size
                              url
                          }
                          noIndex
                      }
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
}

// Singleton
const marketingPageRepo: IMarketingPageRepository =
   new GraphCMSMarketingPageRepository()

export default marketingPageRepo
