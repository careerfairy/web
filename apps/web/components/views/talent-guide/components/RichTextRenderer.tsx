import {
   NodeRendererType,
   RichText,
   RichTextProps,
} from "@graphcms/rich-text-react-renderer"
import { EmbedProps } from "@graphcms/rich-text-types"
import useIsMobile from "components/custom-hook/useIsMobile"
import {
   ArticleBlockType,
   FollowCompaniesBlockType,
   HeaderBlockType,
   HighlightsBlockType,
   JobsBlockType,
   LivestreamsCarouselBlockType,
   MentorsCarouselBlockType,
   ModuleStepType,
   RichTextReferenceType,
   SparksCarouselBlockType,
} from "data/hygraph/types"
import { useMemo } from "react"
import {
   ArticleBlock,
   FollowCompaniesBlock,
   HeaderBlock,
   HighlightsBlock,
   JobsBlock,
   LivestreamsCarouselBlock,
   MentorsCarouselBlock,
   QuizBlock,
   SparksCarouselBlock,
} from "../blocks"
import { createDefaultRichTextComponents } from "./default-rich-text-components"

type RichTextRendererProps = {
   step: ModuleStepType
}

export const ModuleStepContentRenderer = ({ step }: RichTextRendererProps) => {
   if (!step.content) {
      return null
   }

   if (step.content.__typename === "QuizBlock") {
      return <QuizBlock {...step.content} />
   }

   if (step.content.__typename === "RichTextBlock") {
      return (
         <RichTextRenderer
            content={step.content.content.raw}
            references={step.content.content.references}
         />
      )
   }

   console.warn(
      `Unhandled content type: ${
         (step.content as any).__typename
      } returning null`
   )

   return null
}

type RendererProps = NodeRendererType & {
   embed: Record<
      RichTextReferenceType["__typename"],
      (props: any) => JSX.Element
   >
}

const RichTextRenderer = ({ content, references }: RichTextProps) => {
   const isMobile = useIsMobile()

   const renderers = useMemo<RendererProps>(
      () => ({
         ...createDefaultRichTextComponents(isMobile),
         embed: {
            ArticleBlock: (props: EmbedProps<ArticleBlockType>) => (
               <ArticleBlock {...props} />
            ),
            MentorsCarouselBlock: (
               props: EmbedProps<MentorsCarouselBlockType>
            ) => <MentorsCarouselBlock {...props} />,
            LivestreamsCarouselBlock: (
               props: EmbedProps<LivestreamsCarouselBlockType>
            ) => <LivestreamsCarouselBlock {...props} />,
            HighlightsBlock: (props: EmbedProps<HighlightsBlockType>) => (
               <HighlightsBlock {...props} />
            ),
            FollowCompaniesBlock: (
               props: EmbedProps<FollowCompaniesBlockType>
            ) => <FollowCompaniesBlock {...props} />,
            HeaderBlock: (props: EmbedProps<HeaderBlockType>) => (
               <HeaderBlock {...props} />
            ),
            JobsBlock: (props: EmbedProps<JobsBlockType>) => (
               <JobsBlock {...props} />
            ),
            SparksCarouselBlock: (
               props: EmbedProps<SparksCarouselBlockType>
            ) => <SparksCarouselBlock {...props} />,
         },
      }),
      [isMobile]
   )

   return (
      <RichText
         content={content}
         references={references}
         renderers={renderers}
      />
   )
}
