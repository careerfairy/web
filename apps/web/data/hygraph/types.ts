import {
   BusinessFunctionTagId,
   ContentTopicTagId,
} from "@careerfairy/shared-lib/constants/tags"
import { RichTextContent } from "@graphcms/rich-text-types"

export type Page<T = any> = {
   pageType: PageType
   slug?: string
   content?: T
}

export type TalentGuideModule = {
   /**
    * The name of the module, eg "Networking" or "Interviewing"
    */
   moduleName: string
   /**
    * The description of the module, eg "Learn how to network effectively"
    */
   moduleDescription: string
   /**
    * The duration of the module, eg "10 - 20"
    */
   moduleDuration: string
   /**
    * The category of the module, eg "Before Applying" or "Applying Insights"
    */
   category: TalentGuideModuleCategory
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

export enum TalentGuideModuleCategory {
   BEFORE_APPLYING = "WHAT_TO_DO_BEFORE_APPLYING",
   APPLYING = "APPLYING_INSIGHTS",
   AFTER_APPLYING = "STEPS_AFTER_APPLYING",
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
   logo: ImageAssetType
   liveStreamIdentifier: IdentifierType
}

export type SparkComponentType = {
   __typename: "Spark"
   id: string
   sparkId: string
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
   businessFunctionTags: BusinessFunctionTagId[]
   contentTopicTags: ContentTopicTagId[]
   typeOfStreams: "UPCOMING" | "PAST"
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

export type QuizAnswerComponentType = {
   __typename: "QuizAnswer"
   answer: string
} & (
   | {
        isCorrect: true
        /**
         * If the wrong answer is chosen, this is the message to show
         */
        correction: string
     }
   | {
        isCorrect: false
     }
)

export type QuizModelType = {
   __typename: "Quiz"
   id: string
   question: string
   answers: QuizAnswerComponentType[]
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
