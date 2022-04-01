import { RichTextContent } from "@graphcms/rich-text-types"

export type Slug = string
export interface CmsImage {
   height?: number
   width?: number
   url: string
}

export interface Company {
   name: string
   logo: CmsImage
}

export interface CmsVideo {
   url: string
}

export interface StatisticStat {
   label: string
   value: string
   id: string
}

export interface Author {
   name: string
   photo: CmsImage
}

export interface Seo {
   title: string
   description: string
   keywords: string
   noIndex: boolean
   image: CmsImage
}

export interface CompanyCaseStudyPreview {
   company: Company
   title: string
   id: string
   published: Date
   formattedPublished?: string
   coverImage: CmsImage
   slug: Slug
   authors: Author[]
}

export interface CompanyCaseStudy {
   id: string
   formattedPublished?: string
   published: Date
   title: string
   company: Company
   industry: string[]
   aboutTheCompany: string
   storyContentSection: {
      raw: RichTextContent
   }
   coverVideo: CmsVideo
   statisticsContentSection: {
      raw: RichTextContent
   }
   storySideImage: CmsImage
   statisticStats: StatisticStat[]
   ogImage: CmsImage
   coverImage: CmsImage
   authors: Author[]
   slug: Slug
   seo: Seo
}
