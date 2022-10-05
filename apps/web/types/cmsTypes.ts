import { EmbedReferences, RichTextContent } from "@graphcms/rich-text-types"
import { ButtonProps } from "@mui/material"
import { IColors } from "./commonTypes"

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

export interface ICmsVideo {
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
   coverVideo: ICmsVideo
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
   id: string
   content?: string
   published?: Date
   rating?: number
   person?: Person
   title?: string
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
   __typename: string
   id: string
   slug: string
   image: ICmsImage
   video?: ICmsVideo
   selectorLabel?: string
   buttonSelectorLabel?: string
   buttons: HygraphResponseButton[]
   heroTitle?: string
   heroSubtitle?: string
   fullScreenImage?: boolean
   component?: HygraphFieldOfStudySelectResponse
}
export interface HygraphResponseGridBlock {
   __typename: string
   id: string
   slug: string
   numberOfColumns: 1 | 2 | 3 | 4
   title?: string
   headline?: string
   subtitle?: string // markdown string
}

export interface HygraphResponseCompanyValues {
   __typename: string
   id: string
   slug: string
   title: string
   values: HygraphResponseCompanyValue[]
}

export interface HygraphResponseCompanyValue {
   name: string
   description: string
   image: ICmsImage
}

export interface HygraphResponseTestimonialValue {
   __typename: string
   id: string
   slug: string
   title: string
   content: string
   published: Date
   rating: number
   person?: Person
}

export interface HygraphResponseTestimonialListValue {
   __typename: string
   id: string
   slug: string
   testimonialTitle?: {
      raw: RichTextContent
   }
   testimonials?: HygraphResponseTestimonialValue[]
   sliderArrowColor?: IColors
}

export interface HygraphFieldOfStudySelectResponse {
   __typename: string
   id: string
   placeHolderText: string
   label: string
   fallbackMarketingLandingPage: {
      slug: string
   }
}

export interface HygraphResponseCompanyLogosValue {
   __typename: string
   id: string
   title: string
   companies: Company[]
}

export interface HygraphResponseTextBlock {
   __typename: string
   id: string
   slug: string
   textBlockTitle: {
      raw: RichTextContent
   }
   content?: {
      raw: RichTextContent
   }
}

export interface HygraphResponseHighlightList {
   __typename: string
   id: string
   slug: string
   highlightListTitle: string
   highlights?: HygraphResponseHighlight[]
}

export interface HygraphResponseHighlight {
   __typename: string
   slug: string
   highlightTitle?: string
   thumbnail?: ICmsImage
   video?: ICmsVideo
   logo?: ICmsImage
}

export type PageTypes =
   | "COMPANY_CASE_STUDY"
   | "MARKETING_LANDING_PAGE"
   | "LANDING_PAGE"
   | "FAQ_PAGE"

export interface HygraphRemoteFieldOfStudyResponse {
   fieldOfStudyId: string
   fieldOfStudyName: string
   marketingLandingPage: {
      slug: string
   }
}

export interface HygraphResponseMarketingPage {
   id: string
   slug: string
   fieldOfStudies: HygraphRemoteFieldOfStudyResponse[]
   pageType: PageTypes
   seo: HygraphResponseSeo
   blocks: HygraphResponseMarketingPageBlock[]
}

export type HygraphResponseMarketingPageBlock =
   | HygraphResponseEventsSection
   | HygraphResponseMarketingSignup
   | HygraphResponseHero
   | HygraphResponseCompanyValues
   | HygraphResponseTestimonialValue
   | HygraphResponseTestimonialListValue
   | HygraphResponseCompanyLogosValue
   | HygraphResponseTextBlock
   | HygraphResponseHighlightList

export interface HygraphResponsePage {
   id: string
   slug: string
   pageType: PageTypes
   seo: HygraphResponseSeo
   blocks: HygraphResponsePageBlock[]
}

export type HygraphResponsePageBlock =
   | HygraphResponseHero
   | HygraphResponseCompanyValues
   | HygraphResponseTestimonialValue
   | HygraphResponseTestimonialListValue
   | HygraphResponseCompanyLogosValue

export interface HygraphResponseEventsSection {
   __typename: string
   id: string
   typeOfEvent: string
   eventsTitle: string
}
export interface HygraphResponseMarketingSignup {
   __typename: string
   id: string
   formTitle: string
   title: string
   shortText: string
   icon?: ICmsImage
   slug: string
   button: HygraphResponseButton
}

// language=GraphQL
export const imageQueryProps = `
    {
        height
        width
        url
        alt
        caption
    }
`
// language=GraphQL
export const videoQueryProps = `
    {
        url
    }
`
// language=GraphQL
export const richTextQueryProps = `
    {
        raw
    }
`
// language=GraphQL
export const buttonQueryProps = `
    {
        children
        slug
        href
        variant
        color
        size
    }
`

// language=GraphQL
export const seoQueryProps = `
    {
        id
        title
        description
        keywords
        image ${imageQueryProps}
        noIndex
    }
`
// language=GraphQL
export const fieldOfStudySelectQueryProps = `
    {
        id
        __typename
        placeHolderText
        label
        id
        fallbackMarketingLandingPage {
            slug
        }
    }
`

// language=GraphQL
export const heroQueryProps = `
    {
        __typename
        id
        slug
        image ${imageQueryProps}
        video ${videoQueryProps}
        buttons ${buttonQueryProps}
        selectorLabel,
        buttonSelectorLabel,
        heroTitle
        heroSubtitle
        fullScreenImage
        component {
            ... on FieldOfStudySelect ${fieldOfStudySelectQueryProps}
        }
    }
`

// language=GraphQL
export const eventsSectionQueryProps = `
    {
        __typename
        id
        typeOfEvent
        eventsTitle
    }
`
// language=GraphQL
export const marketingSignupQueryProps = `
    {
        id
        __typename
        title
        shortText
        formTitle
        slug
        icon ${imageQueryProps}
        button ${buttonQueryProps}
    }
`
// language=GraphQL
export const fieldOfStudyQueryProps = `
    {
        marketingLandingPage {
            slug
        }
        fieldOfStudyId
        fieldOfStudyName
    }
`
// language=GraphQL
export const companyValueQueryProp = `
    {
        name
        description
        image ${imageQueryProps}
    }
`
// language=GraphQL
export const companyValuesQueryProps = `
    {
        __typename
        id
        title
        values ${companyValueQueryProp}
    }
`
// language=GraphQL
export const companyQueryProp = `
{
   id
   name
   logo ${imageQueryProps}
}
`
// language=GraphQL
export const personQueryProps = `
   {
      id
      name
      role
      photo ${imageQueryProps}
      company ${companyQueryProp}
   }

`
// language=GraphQL
export const testimonialQueryProps = `
    {
        __typename
        id
        title
        content
        published
        rating
        person ${personQueryProps}
    }
`
// language=GraphQL
export const testimonialListQueryProps = `
    {
        __typename
        id
        testimonialTitle ${richTextQueryProps}
        testimonials ${testimonialQueryProps}
        sliderArrowColor
    }
`
// language=GraphQL
export const logoQueryProps = `
    {
        name
        logo ${imageQueryProps}
    }
`
// language=GraphQL
export const companyLogosQueryProps = `
    {
        __typename
        id
        title
        slug
        companies ${logoQueryProps}
    }
`
// language=GraphQL
export const textBlockQueryProps = `
    {
        __typename
        id
        slug
        textBlockTitle ${richTextQueryProps}
        content ${richTextQueryProps}
    }
`
// language=GraphQL
export const highlightQueryProps = `
    {
        slug
        highlightTitle
        logo ${imageQueryProps}
        video ${videoQueryProps}
        thumbnail ${imageQueryProps}
    }
`
// language=GraphQL
export const highlightListQueryProps = `
    {
        __typename
        id
        slug
        highlightListTitle 
        highlights ${highlightQueryProps}
    }
`
