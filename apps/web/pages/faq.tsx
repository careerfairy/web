import pageRepo from "../data/hygraph/PageRepository"
import { GetStaticPropsContext, InferGetStaticPropsType } from "next"
import useServerModel from "../components/custom-hook/utils/useServerModel"
import { Page } from "../data/hygraph/Page"
import CmsPageLayout from "../layouts/CmsPageLayout"
import * as Blocks from "../components/cms/blocks"
import { Alert } from "@mui/material"

type Props = InferGetStaticPropsType<typeof getStaticProps>

const FAQPage = ({ page, preview }: Props) => {
   const faqPage = useServerModel<Page>(page, Page.createFromPlainObject)

   return (
      <>
         {preview && <Alert severity="info">Preview mode is on</Alert>}
         <CmsPageLayout page={faqPage}>
            {faqPage.blocks && (
               <>
                  {faqPage.blocks.map((block) => {
                     const Component = Blocks[block.__typename]
                     if (!Component) return null
                     return (
                        <Component key={block.id} page={faqPage} {...block} />
                     )
                  })}
               </>
            )}
         </CmsPageLayout>
      </>
   )
}

export const getStaticProps = async ({
   locale,
   preview = false,
}: GetStaticPropsContext) => {
   const page = await pageRepo.getPage({
      slug: "faq",
      locale,
      preview,
   })

   return {
      props: {
         page: page.serializeToPlainObject(),
         preview,
      },
      revalidate: 60,
   }
}

export default FAQPage
