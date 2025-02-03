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

// Component API ID: Identifier
export const identifierFragment = gql`
   {
      identifier
   }
`

// Component API ID: Highlight
export const highlightComponentFragment = gql`
   {
      __typename
      id
      videoClip ${videoAssetFragment}
      title
      liveStreamIdentifier {
         ... on Identifier ${identifierFragment}
      }
      companyIdentifier {
         ... on Identifier ${identifierFragment}
      }
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

// Component API ID: LiveStream
export const liveStreamComponentFragment = gql`
   {
      __typename
      id
      liveStreamId
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
      highlights(first: 100) {
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
      liveStreamIds(first: 100) {
        ... on LiveStream ${liveStreamComponentFragment}
      }
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

// Model API ID: CopyTemplateBlock
export const copyTemplateBlockFragment = gql`
   {
      __typename
      id
      templateType
   }
`

// Model API ID: CvBlock
export const cvBlockFragment = gql`
   {
      __typename
      id
   }
`

// Model API ID: Quiz
export const quizFragment = gql`
   {
      __typename
      id
      question
      correction
      answers {
         id
         answer
         isCorrect
         correction
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
            ... on CopyTemplateBlock ${copyTemplateBlockFragment}
            ... on CVBlock ${cvBlockFragment}
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

export const talentGuideModulePageFragment = gql`
   {
      slug
      seo ${seoComponentFragment}
      content {
         id
         moduleName
         moduleDescription
         moduleDuration
         estimatedModuleDurationMinutes
         moduleIllustration ${imageAssetFragment}
         modulePreviewVideo ${videoAssetFragment}
         category
         level
         contentTopicTags
         businessFunctionTags
         moduleSteps(first: 100) ${moduleStepFragment}
      }
   }
`
