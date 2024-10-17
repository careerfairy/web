import { RichText } from "@graphcms/rich-text-react-renderer"
import { EmbedProps } from "@graphcms/rich-text-types"
import { Typography } from "@mui/material"
import { GraphCMSImageLoader } from "components/cms/util"
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
import Image from "next/image"
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

type RichTextRendererProps = ModuleStepType

export const ModuleStepContentRenderer = ({
   content,
}: RichTextRendererProps) => {
   const isMobile = useIsMobile()

   console.log("🚀 ~ file: RichTextRenderer.tsx:36 ~ content:", content)

   return (
      <RichText
         content={content.raw}
         references={content.references}
         renderers={{
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
            h1: ({ children }) => (
               <Typography
                  variant={isMobile ? "desktopBrandedH1" : "mobileBrandedH1"}
                  component="h1"
               >
                  {children}
               </Typography>
            ),
            h2: ({ children }) => (
               <Typography
                  variant={isMobile ? "desktopBrandedH2" : "mobileBrandedH2"}
                  component="h2"
               >
                  {children}
               </Typography>
            ),
            h3: ({ children }) => (
               <Typography
                  variant={isMobile ? "desktopBrandedH3" : "mobileBrandedH3"}
                  component="h3"
               >
                  {children}
               </Typography>
            ),
            h4: ({ children }) => (
               <Typography
                  variant={isMobile ? "desktopBrandedH4" : "mobileBrandedH4"}
                  component="h4"
               >
                  {children}
               </Typography>
            ),
            h5: ({ children }) => (
               <Typography variant={"brandedH5"} component="h5">
                  {children}
               </Typography>
            ),
            h6: ({ children }) => (
               <Typography variant="h6" component="h6">
                  {children}
               </Typography>
            ),
            img: ({ title, altText, height, width, src }) => (
               <Image
                  alt={altText || title}
                  height={height}
                  width={width}
                  loader={GraphCMSImageLoader}
                  src={src}
               />
            ),
         }}
      />
   )
}
