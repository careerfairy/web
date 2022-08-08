import { fetchAPI } from "./index"
import {
   caseStudyCompanyCoverImageDimensions,
   caseStudyCompanyLogoDimensions,
} from "../../components/cms/constants"
import {
   CompanyCaseStudy,
   CompanyCaseStudyPreview,
   Slug,
   Variables,
} from "../../types/cmsTypes"

export interface IMarketingPageRepository {
   getAllMarketingPageSlugs(): Promise<{ slug: Slug }[]>

   getCaseStudyAndMoreCaseStudies(
      slug: string,
      preview: boolean
   ): Promise<{
      companyCaseStudy: CompanyCaseStudy
      moreCompanyCaseStudies: CompanyCaseStudyPreview[]
   }>

   getMarketingPage(variables: Variables): Promise<any>
}

class GraphCMSMarketingPageRepository implements IMarketingPageRepository {
   constructor() {}

   async getAllMarketingPageSlugs(): Promise<{ slug: Slug }[]> {
      const data = await fetchAPI(`
         {
            pages(where: {pageType: MARKETING_LANDING_PAGE}) {
               slug
            }
         }
      `)
      return data.companyCaseStudies
   }

   async getMarketingPage(variables: Variables): Promise<any> {
      return await fetchAPI(
         `
          {
            pages(stage: $stage, where: {pageType: MARKETING_LANDING_PAGE, slug: $slug}) {
                id
    stage
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
      ... on Breakpoint {
        id
        stage
        updatedAt
        Breakpoint_title: title
        documentInStages(includeCurrent: true) {
          id
          stage
          updatedAt
        }
      }
      ... on Testimonial {
        id
        stage
        updatedAt
        documentInStages(includeCurrent: true) {
          id
          stage
          updatedAt
        }
      }
      ... on Grid {
        id
        stage
        updatedAt
        Grid_title: title
        Grid_slug: slug
        documentInStages(includeCurrent: true) {
          id
          stage
          updatedAt
        }
      }
      ... on LogoCloud {
        id
        stage
        updatedAt
        LogoCloud_title: title
        documentInStages(includeCurrent: true) {
          id
          stage
          updatedAt
        }
      }
    }
    createdAt
    footer {
      id
      stage
      updatedAt
      title
      documentInStages(includeCurrent: true) {
        id
        stage
        updatedAt
        publishedAt
      }
    }
    hero {
      id
      stage
      updatedAt
      slug
      documentInStages(includeCurrent: true) {
        id
        stage
        updatedAt
        publishedAt
      }
    }
    id
    marketing(first: 500) {
      ... on Newsletter {
        id
        stage
        updatedAt
        Newsletter_title: title
        documentInStages(includeCurrent: true) {
          id
          stage
          updatedAt
        }
      }
      ... on Banner {
        id
        stage
        updatedAt
        Banner_slug: slug
        documentInStages(includeCurrent: true) {
          id
          stage
          updatedAt
        }
      }
      ... on PopUp {
        id
        stage
        updatedAt
        PopUp_title: title
        documentInStages(includeCurrent: true) {
          id
          stage
          updatedAt
        }
      }
      ... on MarketingSignup {
        id
        stage
        updatedAt
        MarketingSignup_title: title
        documentInStages(includeCurrent: true) {
          id
          stage
          updatedAt
        }
      }
    }
    navigation {
      id
      stage
      updatedAt
      title
      documentInStages(includeCurrent: true) {
        id
        stage
        updatedAt
        publishedAt
      }
    }
    navigationLabel
    pageType
    publishedAt
    scheduledIn(first: 500) {
      id
      stage
      updatedAt
      rawPayload
      id
      release {
        id
        status
        releaseAt
        title
        isImplicit
      }
      createdBy {
        id
        name
        picture
        kind
        isActive
      }
      rawPayload
      documentInStages(includeCurrent: true) {
        id
        stage
        updatedAt
        publishedAt
      }
    }
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
        documentInStages(includeCurrent: true) {
          id
          stage
          updatedAt
          publishedAt
        }
      }
      noIndex
    }
    localizations(includeCurrent: true, locales: [en, de]) {
      locale
      updatedAt(variation: LOCALIZATION)
      subtitle
      title
    }
    documentInStages(includeCurrent: true) {
      id
      stage
      updatedAt
      publishedAt
      publishedBy {
        entryId: id
        name
        picture
        kind
        isActive
      }
      localizations(includeCurrent: true, locales: [en, de]) {
        locale
        updatedAt(variation: LOCALIZATION)
      }
    }
    history_026a06093ef4463b967236d3f758c3da_PUBLISHED: history(
      limit: 50
      stageOverride: PUBLISHED
    ) {
      id
      revision
      stage
      createdAt
    }
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

   async getCaseStudyAndMoreCaseStudies(
      slug: string,
      preview: boolean
   ): Promise<{
      companyCaseStudy: CompanyCaseStudy
      moreCompanyCaseStudies: CompanyCaseStudyPreview[]
   }> {
      return await fetchAPI(
         `
             query CompanyCaseStudyBySlug($slug: String!, $stage: Stage!) {
                 companyCaseStudy(stage: $stage, where: { slug: $slug }) {
                     title
                     id
                     company {
                         name
                         logo {
                             height
                             width
                             url(
                                 transformation: {
                                     image: {
                                         resize: { fit: clip, width: ${caseStudyCompanyLogoDimensions.width}, height: ${caseStudyCompanyLogoDimensions.height} }
                                     }
                                 }
                             )
                         }
                     }
                     industry
                     aboutTheCompany
                     storyContentSection {
                         raw
                     }
                     coverVideo {
                         url
                     }
                     statisticsContentSection {
                         raw
                         references {
                             # Your Carousel query
                             ... on Carousel {
                                 id
                                 images {
                                     url
                                     width
                                     height
                                     caption
                                     alt
                                 }
                             }
                             # Your Testimonial query
                             ... on Testimonial {
                                 id
                                 content,
                                 person {
                                     name,
                                     role,
                                     photo{
                                         url
                                         width
                                         height
                                         caption
                                         alt
                                     }
                                 }
                             }
                         }
                     }
                     storySideImage {
                         url
                     }
                     statisticStats {
                         label
                         value
                         id
                     }
                     published
                     ogImage: coverImage {
                         url
                     }
                     coverImage {
                         url(
                             transformation: {
                                 image: {
                                     resize: { fit: clip, width: ${caseStudyCompanyCoverImageDimensions.width},
                                         height: ${caseStudyCompanyCoverImageDimensions.height} }
                                 }
                             }
                         )
                         width
                         height
                     }
                     authors {
                         name
                         photo {
                             url
                         }
                     }
                     slug
                     seo {
                         title
                         description
                         keywords
                         noIndex
                         image {
                             url(
                                 transformation: {
                                     image: {
                                         resize: {
                                             fit: clip
                                             width: 2000
                                             height: 1000
                                         }
                                     }
                                 }
                             )
                         }
                     }
                 }
                 moreCompanyCaseStudies: companyCaseStudies(
                     where: { slug_not: $slug }
                     orderBy: published_ASC
                     first: 3
                 ) {
                     title
                     id
                     company {
                         name
                         logo {
                             height
                             width
                             url(
                                 transformation: {
                                     image: {
                                         resize: { fit: clip, width: ${caseStudyCompanyLogoDimensions.width}, height: ${caseStudyCompanyLogoDimensions.height} }
                                     }
                                 }
                             )
                         }
                     }
                     published
                     ogImage: coverImage {
                         url
                     }
                     coverImage {
                         url
                     }
                     authors {
                         name
                         photo {
                             url
                         }
                     }
                     slug
                 }
             }
         `,
         {
            variables: { slug, stage: preview ? "DRAFT" : "PUBLISHED" },
            preview,
         }
      )
   }
}

// Singleton
const marketingPageRepo: IMarketingPageRepository =
   new GraphCMSMarketingPageRepository()

export default marketingPageRepo
