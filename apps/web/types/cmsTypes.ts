import { RichTextContent, EmbedReferences } from "@graphcms/rich-text-types"

export type Slug = string

export type Variables = {
   [p: string]: any
   slug: string
   preview?: boolean
   locale?: string
}
export interface CmsImage {
   height?: number
   width?: number
   url: string
   alt?: string
   caption?: string
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

export interface Person {
   name: string
   photo: CmsImage
   role?: string
   company?: Company
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
   authors: Person[]
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
      references: EmbedReferences
   }
   coverVideo: CmsVideo
   statisticsContentSection: {
      raw: RichTextContent
      references: EmbedReferences
   }
   storySideImage: CmsImage
   statisticStats: StatisticStat[]
   ogImage: CmsImage
   coverImage: CmsImage
   authors: Person[]
   slug: Slug
   seo: Seo
}

export interface Carousel {
   images: CmsImage[]
   title: string
}

export interface Testimonial {
   content: string
   person: Person
}
