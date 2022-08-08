import { fetchAPI } from "./index"
import { Slug, Variables } from "../../types/cmsTypes"

export interface IMarketingPageRepository {
   getAllMarketingPageSlugs(): Promise<{ slug: Slug }[]>

   getMarketingPage(variables: Variables): Promise<any>
}

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

   async getMarketingPage(variables: Variables): Promise<any> {
      return await fetchAPI(
         `
         query MarketingLandingPageQuery($slug: String!, $stage: Stage!) {
  marketingLandingPage(stage: $stage, where: {slug: $slug}) {
    id
    stage
      title
    subtitle
    updatedAt
    createdBy {
      entryId: id
      name
      picture
      kind
      isActive
    }
    updatedBy {
      entryId: id
      name
      picture
      kind
      isActive
    }
    blocks(first: 500) {
      ... on Testimonial {
        id
        stage
        updatedAt
      }
      ... on Grid {
        id
        stage
        updatedAt
        Grid_title: title
        Grid_slug: slug
      }
      ... on LogoCloud {
        id
        stage
        updatedAt
        LogoCloud_title: title
      }
    }
    createdAt
    hero {
      id
      stage
      updatedAt
      slug
    }
    id
    marketing(first: 500) {
      ... on Banner {
        id
        stage
        updatedAt
        Banner_slug: slug
      }
      ... on MarketingSignup {
        id
        stage
        updatedAt
        MarketingSignup_title: title
      }
    }
    navigationLabel
    pageType
    publishedAt
    slug
    updatedAt
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
   }
}

// Singleton
const marketingPageRepo: IMarketingPageRepository =
   new GraphCMSMarketingPageRepository()

export default marketingPageRepo
