import {
   BusinessFunctionTagId,
   ContentTopicTagId,
} from "@careerfairy/shared-lib/constants/tags"
import { TalentGuideModuleCategory } from "@careerfairy/shared-lib/talent-guide"
import { RichTextContent } from "@graphcms/rich-text-types"
export type Page<T = any> = {
   pageType: PageType
   slug?: string
   content?: T
}

export type TalentGuideModule = {
   id: string
   /**
    * The name of the module, eg "Networking" or "Interviewing"
    */
   moduleName: string
   /**
    * The description of the module, eg "Learn how to network effectively"
    */
   moduleDescription: string
   /**
    * The estimated duration in minutes, eg 10
    */
   estimatedModuleDurationMinutes: number
   /**
    * The duration range of the module, eg "10-16"
    * @deprecated Use estimatedModuleDurationMinutes instead
    */
   moduleDuration: string
   /**
    * The thumbnail of the module, eg "https://www.example.com/thumbnail.jpg"
    */
   moduleIllustration: ImageAssetType
   /**
    * The preview video of the module, eg "https://www.example.com/preview.mp4"
    */
   modulePreviewVideo: VideoAssetType
   /**
    * The category of the module, eg "Before Applying" or "Applying Insights"
    */
   category: TalentGuideModuleCategory
   /**
    * The level of the module, used for sorting
    */
   level: number
   /**
    * The blocks of the module, eg HeaderBlock, TextBlock, ImageBlock, LivestreamsBlock etc
    */
   moduleSteps: ModuleStepType[]

   contentTopicTags: ContentTopicTagId[]
   businessFunctionTags: BusinessFunctionTagId[]
}

export type TalentGuideModulePageResponse = {
   page: Page<TalentGuideModule>
}

export type TalentGuideRootPageResponse = {
   pages: Page[]
}

export type TalentGuideSlugsResponse = {
   pages: { slug: string }[]
}

export enum PageType {
   TALENT_GUIDE_MODULE_PAGE = "TALENT_GUIDE_MODULE_PAGE",
   TALENT_GUIDE_ROOT_PAGE = "TALENT_GUIDE_ROOT_PAGE",
}

// Assets

export type ImageAssetType = {
   height: number
   width: number
   url: string
   alt: string
   caption: string
}

export type VideoAssetType = {
   url: string
}

// Components

export type IdentifierType = {
   identifier: string
}

export type HighlightComponentType = {
   __typename: "Highlight"
   id: string
   videoClip: VideoAssetType
   title: string
   liveStreamIdentifier: IdentifierType
   companyIdentifier: IdentifierType
}

export type SparkComponentType = {
   __typename: "Spark"
   id: string
   sparkId: string
}

export type LiveStreamComponentType = {
   __typename: "LiveStream"
   id: string
   liveStreamId: string
}

export type SeoComponentType = {
   __typename: "Seo"
   id: string
   title: string
   description: string
   keywords: string[]
   image: ImageAssetType
   noIndex: boolean
}

// Models
export type HeaderBlockType = {
   __typename: "HeaderBlock"
   id: string
   title: string
   headerVideo: VideoAssetType
}

export type ArticleBlockType = {
   __typename: "ArticleBlock"
   id: string
   title: string
   illustration: ImageAssetType
   companyName: string
   articleUrl: string
}

export type FollowCompaniesBlockType = {
   __typename: "FollowCompaniesBlock"
   id: string
   title: string
}

export type HighlightsBlockType = {
   __typename: "HighlightsBlock"
   id: string
   shouldFetchBasedOnUserData: boolean
   highlights: (HighlightComponentType | SparkComponentType)[]
}

export type JobsBlockType = {
   __typename: "JobsBlock"
   id: string
   title: string
}

export type MentorsCarouselBlockType = {
   __typename: "MentorsCarouselBlock"
   id: string
   title: string
   subHeader: string
}

export type LivestreamsCarouselBlockType = {
   __typename: "LivestreamsCarouselBlock"
   id: string
   title: string
   subHeader: string
   liveStreamIds: LiveStreamComponentType[]
}

export type SparksCarouselBlockType = {
   __typename: "SparksCarouselBlock"
   id: string
}

export type VideoBlockType = {
   __typename: "VideoBlock"
   id: string
   video: VideoAssetType
   videoThumbnail: ImageAssetType
   avatar: ImageAssetType
   label: string
   videoTitle: string
}

export type CopyTemplateBlockType = {
   __typename: "CopyTemplateBlock"
   id: string
   templateType: "NetworkingReachOut"
}

export type QuizAnswerComponentType = {
   __typename: "QuizAnswer"
   id: string
   answer: string
   isCorrect: boolean
   correction: string
}

export type QuizModelType = {
   __typename: "Quiz"
   id: string
   question: string
   /**
    * Text to show if the user gets the answer wrong
    */
   correction: string
   answers: QuizAnswerComponentType[]
}

export type CVBlockType = {
   __typename: "CVBlock"
   id: string
}

export type RichTextReferenceType =
   | ArticleBlockType
   | MentorsCarouselBlockType
   | LivestreamsCarouselBlockType
   | HighlightsBlockType
   | FollowCompaniesBlockType
   | HeaderBlockType
   | JobsBlockType
   | SparksCarouselBlockType
   | VideoBlockType
   | CopyTemplateBlockType
   | CVBlockType

export type RichTextBlockType = {
   __typename: "RichTextBlock"
   id: string
   content: {
      raw: RichTextContent
      /**
       * These are all the blocks that can be referenced inside the rich text content
       */
      references: RichTextReferenceType[]
   }
}

export type ModuleStepType = {
   __typename: "ModuleStep"
   id: string
   stepTitle: string
   /**
    * The slug of the step, eg "networking" or "interviewing", could be used for url based navigation
    */
   stepSlug: string
   content: RichTextBlockType | QuizModelType // Potential discover companies block and any other block that have their custom step cta button
}
