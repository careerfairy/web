import { fetchAPI } from "./index"
import {
   companyLogosQueryProps,
   companyValuesQueryProps,
   heroQueryProps,
   seoQueryProps,
   testimonialListQueryProps,
   testimonialQueryProps,
   Variables,
} from "../../types/cmsTypes"
import { MarketingLandingPage } from "./MarketingLandingPage"
import { Page } from "./Page"

export interface IPageRepository {
   getPage(variables: Variables): Promise<Page>
}

// language=GraphQL
class PageRepository implements IPageRepository {
   constructor() {}

   async getPage(variables: Variables): Promise<MarketingLandingPage> {
      const response = await fetchAPI(
         `
              query PageQuery($slug: String!, $stage: Stage!) {
                  page(stage: $stage, where: { slug: $slug }) {
                      id
                      pageType
                      slug
                      blocks {
                          ... on Hero ${heroQueryProps}
                          ... on CompanyValues ${companyValuesQueryProps}
                          ... on Testimonial ${testimonialQueryProps}
                          ... on TestimonialList ${testimonialListQueryProps}
                          ... on CompanyLogos ${companyLogosQueryProps}

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
      if (!response.page) return null
      return Page.createFromHygraph(response.page)
   }
}

// Singleton
const pageRepo: IPageRepository = new PageRepository()

export default pageRepo
