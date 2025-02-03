import {
   NodeRendererType,
   RichText,
   RichTextProps,
} from "@graphcms/rich-text-react-renderer"
import { EmbedProps } from "@graphcms/rich-text-types"
import useIsMobile from "components/custom-hook/useIsMobile"
import {
   ArticleBlockType,
   CopyTemplateBlockType,
   CVBlockType,
   FollowCompaniesBlockType,
   HeaderBlockType,
   HighlightsBlockType,
   JobsBlockType,
   LivestreamsCarouselBlockType,
   MentorsCarouselBlockType,
   RichTextReferenceType,
   SparksCarouselBlockType,
   VideoBlockType,
} from "data/hygraph/types"
import { useMemo } from "react"
import {
   ArticleBlock,
   CopyTemplateBlock,
   CVBlock,
   FollowCompaniesBlock,
   HeaderBlock,
   HighlightsBlock,
   JobsBlock,
   LivestreamsCarouselBlock,
   MentorsCarouselBlock,
   SparksCarouselBlock,
   VideoBlock,
} from "../blocks"
import { createDefaultRichTextComponents } from "./default-rich-text-components"

type RendererProps = NodeRendererType & {
   embed: Record<
      RichTextReferenceType["__typename"],
      (props: any) => JSX.Element
   >
}

export const RichTextRenderer = ({ content, references }: RichTextProps) => {
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
            VideoBlock: (props: EmbedProps<VideoBlockType>) => (
               <VideoBlock {...props} />
            ),
            CopyTemplateBlock: (props: EmbedProps<CopyTemplateBlockType>) => (
               <CopyTemplateBlock {...props} />
            ),
            CVBlock: (props: EmbedProps<CVBlockType>) => <CVBlock {...props} />,
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
