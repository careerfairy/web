import { gql } from "graphql-request"

// ==================
//       Assets
// ==================

export const imageAssetFragment = gql`
   {
      height
      width
      url
      alt
      caption
   }
`
export const videoAssetFragment = gql`
   {
      url
   }
`

// ==================
//       Components
// ==================

// Component API ID: Highlight
export const highlightComponentFragment = gql`
   {
      __typename
      id
      videoClip ${videoAssetFragment}
      title
      logo ${imageAssetFragment}
   }
`

// Component API ID: Spark
export const sparkComponentFragment = gql`
   {
      __typename
      id
      sparkId
   }
`

// Component API ID: Seo
export const seoComponentFragment = gql`
   {
        id
        title
        description
        keywords
        image ${imageAssetFragment}
        noIndex
   }
`

// ==================
//       Models
// ==================

// Model API ID: HeaderBlock
export const headerBlockFragment = gql`
   {
      __typename
      id
      title
      headerVideo ${videoAssetFragment}
   }
`

// Model API ID: ArticleBlock
export const articleBlockFragment = gql`
   {
      __typename
      id
      title
      illustration ${imageAssetFragment}
      companyName
      articleUrl
   }
`

// Model API ID: FollowCompaniesBlock
export const followCompaniesBlockFragment = gql`
   {
      __typename
      id
      title
   }
`

// Model API ID: HighlightsBlock
export const highlightsBlockFragment = gql`
   {
      __typename
      id
      shouldFetchBasedOnUserData 
      highlights {
        ... on Highlight ${highlightComponentFragment}
        ... on Spark ${sparkComponentFragment}
      }
   }
`
// Model API ID: JobsBlock
export const jobsBlockFragment = gql`
   {
      __typename
      id
      title
   }
`

// Model API ID: MentorsCarouselBlock
export const mentorsCarouselBlockFragment = gql`
   {
      __typename
      id
      title
      subHeader
   }
`

// Model API ID: LivestreamsCarouselBlock
export const livestreamsCarouselBlockFragment = gql`
   {
      __typename
      id
      title
      subHeader
      businessFunctionTags
      contentTopicTags
      typeOfStreams #Enum: [UPCOMING, PAST]
   }
`

// Model API ID: SparksCarouselBlock
export const sparksCarouselBlockFragment = gql`
   {
      __typename
      id
   }
`

// Model API ID: VideoBlock
export const videoBlockFragment = gql`
   {
      __typename
      id
      video ${videoAssetFragment}
      videoThumbnail ${imageAssetFragment}
      avatar ${imageAssetFragment}
      videoTitle: title
      label
   }
`

// Model API ID: Quiz
export const quizFragment = gql`
   {
      __typename
      id
      question
      answers {
         answer
         isCorrect
      }
   }
`

export const richTextBlockFragment = gql`
   {
      __typename
      id
      content {
         raw
         references {
            ... on ArticleBlock ${articleBlockFragment}
            ... on MentorsCarouselBlock ${mentorsCarouselBlockFragment}
            ... on LivestreamsCarouselBlock ${livestreamsCarouselBlockFragment}
            ... on HighlightsBlock ${highlightsBlockFragment}
            ... on FollowCompaniesBlock ${followCompaniesBlockFragment}
            ... on HeaderBlock ${headerBlockFragment}
            ... on JobsBlock ${jobsBlockFragment}
            ... on SparksCarouselBlock ${sparksCarouselBlockFragment}
            ... on VideoBlock ${videoBlockFragment}
         }
      }
   }
`

// Model API ID: ModuleStep
export const moduleStepFragment = gql`
   {
      __typename
      id
      stepTitle
      stepSlug # incase we want page routing for each step
      content {
         ... on RichTextBlock ${richTextBlockFragment}
         ... on Quiz ${quizFragment}
      }
   }
`
