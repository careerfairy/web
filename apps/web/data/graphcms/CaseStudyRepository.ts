import { fetchAPI } from "./index"
import { gql } from "graphql-request"

export interface ICaseStudyRepository {
   getAllCaseStudiesWithSlug(): Promise<{ slug: string }[]>
   getCaseStudyAndMoreCaseStudies(
      slug: string,
      preview: boolean
   ): Promise<{ companyCaseStudy: object; moreCompanyCaseStudies: object[] }>
}

class GraphCMSCaseStudyRepository implements ICaseStudyRepository {
   constructor() {}

   async getAllCaseStudiesWithSlug(): Promise<{ slug: string }[]> {
      const data = await fetchAPI(gql`
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
   ): Promise<{ companyCaseStudy: object; moreCompanyCaseStudies: object[] }> {
      const data = await fetchAPI(
         gql`
            query CompanyCaseStudyBySlug($slug: String!, $stage: Stage!) {
               companyCaseStudy(stage: $stage, where: { slug: $slug }) {
                  title
                  company {
                     name
                  }
                  storyContentSection {
                     raw
                  }
                  statisticsContentSection {
                     raw
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
                     url
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
                  company {
                     name
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
      return data
   }
}

// Singleton
const caseStudyRepo: ICaseStudyRepository = new GraphCMSCaseStudyRepository()

export default caseStudyRepo
