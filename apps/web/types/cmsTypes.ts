import { EmbedReferences, RichTextContent } from "@graphcms/rich-text-types"
import { ButtonProps } from "@mui/material"

export type Slug = string

export type Variables = {
   [p: string]: any
   slug: string
   preview?: boolean
   locale?: string
}
export interface ICmsImage {
   height?: number
   width?: number
   url: string
   alt?: string
   caption?: string
}

export interface Company {
   name: string
   logo: ICmsImage
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
   photo: ICmsImage
   role?: string
   company?: Company
}

export interface HygraphResponseSeo {
   title: string
   description: string
   keywords: string
   noIndex: boolean
   image: ICmsImage
}

export interface CompanyCaseStudyPreview {
   company: Company
   title: string
   id: string
   published: Date
   formattedPublished?: string
   coverImage: ICmsImage
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
   storySideImage: ICmsImage
   statisticStats: StatisticStat[]
   ogImage: ICmsImage
   coverImage: ICmsImage
   authors: Person[]
   slug: Slug
   seo: HygraphResponseSeo
}

export interface Carousel {
   images: ICmsImage[]
   title: string
}

export interface Testimonial {
   content: string
   person: Person
}
export interface HygraphResponseButton {
   children: string
   slug: string
   href: string
   variant: ButtonProps["variant"]
   color: ButtonProps["color"]
   size: ButtonProps["size"]
}

export interface HygraphResponseHero {
   id: string
   slug: string
   image: ICmsImage
   buttons: HygraphResponseButton[]
}
export type PageTypes = "COMPANY_CASE_STUDY" | "MARKETING_LANDING_PAGE"

export interface HygraphResponseMarketingPage {
   id: string
   title: string
   subtitle: string
   hero: HygraphResponseHero
   buttons: HygraphResponseButton[]
   pageType: PageTypes
   slug: string
   seo: HygraphResponseSeo
   blocks: (HygraphResponseEventsSection | HygraphResponseMarketingSignup)[]
}
export interface HygraphResponsePage {
   id: string
   title: string
   subtitle: string
   slug: string
   seo: HygraphResponseSeo
   image: ICmsImage
}

export interface HygraphResponseEventsSection {
   __typename: string
   id: string
   fieldsOfStudy: string[]
   typeOfEvent: string
}
export interface HygraphResponseMarketingSignup {
   __typename: string
   id: string
   title: string
   subtitle: string
   slug: string
   button: HygraphResponseButton
}
