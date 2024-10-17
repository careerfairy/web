import { NodeRendererType, RichText } from "@graphcms/rich-text-react-renderer"
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
   QuizBlockType,
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

type RichTextRendererProps = Pick<ModuleStepType, "content">

export const ModuleStepContentRenderer = ({
   content,
}: RichTextRendererProps) => {
   const isMobile = useIsMobile()

   const renderers = useMemo<NodeRendererType>(
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
            QuizBlock: (props: EmbedProps<QuizBlockType>) => (
               <QuizBlock {...props} />
            ),
         },
      }),
      [isMobile]
   )

   return (
      <RichText
         content={content.raw}
         references={content.references}
         renderers={renderers}
      />
   )
}
