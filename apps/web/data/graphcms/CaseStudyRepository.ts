import { fetchAPI } from "./index"
import {
   caseStudyCompanyCoverImageDimensions,
   caseStudyCompanyLogoDimensions,
} from "../../components/cms/constants"
import {
   CompanyCaseStudy,
   CompanyCaseStudyPreview,
   Slug,
} from "../../types/cmsTypes"

export interface ICaseStudyRepository {
   getAllCaseStudiesWithSlug(): Promise<{ slug: Slug }[]>

   getCaseStudyAndMoreCaseStudies(
      slug: string,
      preview: boolean
   ): Promise<{
      companyCaseStudy: CompanyCaseStudy
      moreCompanyCaseStudies: CompanyCaseStudyPreview[]
   }>
}

type ICaseStudySlug = {
   slug: Slug
}

type ICaseStudyResponse = {
   companyCaseStudies: ICaseStudySlug[]
}

// language=GraphQL
class GraphCMSCaseStudyRepository implements ICaseStudyRepository {
   constructor() {}

   async getAllCaseStudiesWithSlug(): Promise<ICaseStudySlug[]> {
      const data = await fetchAPI<ICaseStudyResponse>(`
         {
            companyCaseStudies {
               slug
            }
         }
      `)
      return data.companyCaseStudies
   }

   async getCaseStudyAndMoreCaseStudies(
      slug,
      preview
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
const caseStudyRepo: ICaseStudyRepository = new GraphCMSCaseStudyRepository()

export default caseStudyRepo
