import { GetStaticProps } from "next"
import marketingPageRepo from "../../data/graphcms/MarketingPageRepository"
import useServerModel from "../../components/custom-hook/useServerModel"
import {
   HygraphRemoteFieldOfStudyResponse,
   HygraphResponseHero,
} from "../../types/cmsTypes"
import CmsPageLayout from "../../layouts/CmsPageLayout"
import { MarketingLandingPage } from "../../data/graphcms/MarketingLandingPage"
import * as Blocks from "../../components/cms/blocks"
import { hookLandingPage } from "../../components/cms/constants"
import LandingPage from "../../components/cms/landing-page/LandingPage"

type Props = {
   serverPage: MarketingLandingPage
   allFieldsOfStudy: HygraphRemoteFieldOfStudyResponse[]
}

const Landing = ({ serverPage, allFieldsOfStudy }: Props) => {
   const page = useServerModel<MarketingLandingPage>(
      serverPage,
      MarketingLandingPage.createFromPlainObject
   )

   return (
      <CmsPageLayout page={page}>
         {page.blocks && (
            <>
               {page.blocks.map((block) => {
                  const Component = Blocks[block.__typename]
                  if (!Component) return null

                  // in case is a hero component we want to pass the fieldsOfStudy to have the input selector
                  if (block.__typename === "Hero") {
                     return (
                        <LandingPage
                           fieldsOfStudy={allFieldsOfStudy}
                           hero={block as HygraphResponseHero}
                        />
                     )
                  }

                  return <Component key={block.id} page={page} {...block} />
               })}
            </>
         )}
      </CmsPageLayout>
   )
}

export const getStaticProps: GetStaticProps = async ({
   preview = true,
   locale,
}) => {
   if (process.env.APP_ENV === "test") {
      return {
         notFound: true,
      }
   }
   const [marketingPage, allFieldsOfStudy] = await Promise.all([
      marketingPageRepo.getMarketingPage({
         slug: hookLandingPage,
         preview,
         locale,
      }),
      marketingPageRepo.getFieldsOfStudyWithMarketingPages(),
   ])

   if (!marketingPage) {
      return {
         notFound: true,
      }
   }
   return {
      props: {
         preview,
         serverPage: marketingPage.serializeToPlainObject(),
         allFieldsOfStudy: allFieldsOfStudy,
      },
      revalidate: 60,
   }
}

export default Landing
