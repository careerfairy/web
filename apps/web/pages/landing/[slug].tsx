import marketingPageRepo from "../../data/graphcms/MarketingPageRepository"
import { GetStaticProps } from "next"
import * as Blocks from "../../components/cms/blocks"
import { MarketingLandingPage } from "../../data/graphcms/MarketingLandingPage"
import useServerModel from "../../components/custom-hook/utils/useServerModel"
import CmsPageLayout from "../../layouts/CmsPageLayout"
import { hookLandingPage } from "../../components/cms/constants"
import { MarketingLandingPageProvider } from "../../components/cms/landing-page/MarketingLandingPageProvider"

interface Props {
   marketingLandingPagePlainObject: MarketingLandingPage
}
const LandingPage = ({ marketingLandingPagePlainObject }: Props) => {
   const marketingLandingPage = useServerModel<MarketingLandingPage>(
      marketingLandingPagePlainObject,
      MarketingLandingPage.createFromPlainObject
   )

   return (
      <MarketingLandingPageProvider>
         <CmsPageLayout page={marketingLandingPage}>
            {marketingLandingPage.blocks && (
               <>
                  {marketingLandingPage.blocks.map((block) => {
                     const Component = Blocks[block.__typename]
                     if (!Component) return null
                     return (
                        <Component
                           key={block.id}
                           page={marketingLandingPage}
                           {...block}
                           fieldsOfStudy={marketingLandingPage.fieldsOfStudy}
                        />
                     )
                  })}
               </>
            )}
         </CmsPageLayout>
      </MarketingLandingPageProvider>
   )
}

export const getStaticProps: GetStaticProps = async ({
   params,
   preview = false,
   locale,
}) => {
   // Disabling this page for now (ticket 701)
   return {
      notFound: true,
   }

   const marketingPage = await marketingPageRepo.getMarketingPage({
      slug: params.slug as string,
      preview,
      locale,
   })

   if (!marketingPage) {
      return {
         notFound: true,
      }
   }

   return {
      props: {
         preview,
         marketingLandingPagePlainObject:
            marketingPage.serializeToPlainObject(),
      },
      revalidate: 60,
   }
}

export async function getStaticPaths({ locales }) {
   let paths = []

   if (process.env.APP_ENV !== "test") {
      const marketingPages = await marketingPageRepo
         .getAllMarketingPageSlugs()
         .then((slugs) => slugs.filter(({ slug }) => slug !== hookLandingPage))

      if (locales) {
         for (const locale of locales) {
            paths = [
               ...paths,
               ...marketingPages.map((marketingPage) => ({
                  params: { slug: marketingPage.slug },
                  locale,
               })),
            ]
         }
      } else {
         paths = marketingPages.map((caseStudy) => ({
            params: { slug: caseStudy.slug },
         }))
      }
   }

   return {
      paths,
      fallback: "blocking",
   }
}

export default LandingPage
