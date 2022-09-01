import { GetStaticProps } from "next"
import marketingPageRepo from "../../data/graphcms/MarketingPageRepository"
import {
   HygraphRemoteFieldOfStudyResponse,
   HygraphResponseHero,
} from "../../types/cmsTypes"
import CmsPageLayout from "../../layouts/CmsPageLayout"
import { MarketingLandingPage } from "../../data/graphcms/MarketingLandingPage"
import * as Blocks from "../../components/cms/blocks"
import { hookLandingPage } from "../../components/cms/constants"
import LandingPageHero from "../../components/cms/landing-page/LandingPageHero"
import useServerModel from "../../components/custom-hook/utils/useServerModel"

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
                        <LandingPageHero
                           fieldsOfStudy={allFieldsOfStudy}
                           hero={block as HygraphResponseHero}
                           key={block.__typename}
                        />
                     )
                  }

                  return (
                     <Component key={block.__typename} page={page} {...block} />
                  )
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
