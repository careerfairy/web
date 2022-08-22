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
   id: string
   content?: string
   published?: Date
   rating?: number
   person?: Person
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
   buttons: HygraphResponseButton[]
   heroTitle?: string
   heroSubtitle?: string
   fullScreenImage?: boolean
   component?: HygraphFieldOfStudySelectResponse
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
   testimonials?: HygraphResponseTestimonialValue[]
   sliderArrowColor?: string
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

export type PageTypes =
   | "COMPANY_CASE_STUDY"
   | "MARKETING_LANDING_PAGE"
   | "LANDING_PAGE"

export interface HygraphRemoteFieldOfStudyResponse {
   fieldOfStudyId: string
   fieldOfStudyName: string
   marketingLandingPage: {
      slug: string
   }
}

export interface HygraphResponseMarketingPage {
   id: string
   title: string
   subtitle: string
   fieldOfStudies: HygraphRemoteFieldOfStudyResponse[]
   hero: HygraphResponseHero
   buttons: HygraphResponseButton[]
   pageType: PageTypes
   slug: string
   seo: HygraphResponseSeo
   blocks: (
      | HygraphResponseEventsSection
      | HygraphResponseMarketingSignup
      | HygraphResponseHero
   )[]
}
export interface HygraphResponsePage {
   id: string
   title: string
   subtitle: string
   slug: string
   seo: HygraphResponseSeo
   image: ICmsImage
   hero: HygraphResponseHero
}

export interface HygraphResponseEventsSection {
   __typename: string
   id: string
   typeOfEvent: string
}
export interface HygraphResponseMarketingSignup {
   __typename: string
   id: string
   title: string
   shortText: string
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
        buttons ${buttonQueryProps}
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
    }
`
// language=GraphQL
export const marketingSignupQueryProps = `
    {
        id
        __typename
        title
        shortText
        slug
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
export const personQueryProps = `
   {
      id
      name
      role
      photo ${imageQueryProps}
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
