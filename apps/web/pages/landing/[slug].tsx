import SEO from "../../components/util/SEO"
import React, { useEffect } from "react"
import marketingPageRepo from "../../data/graphcms/MarketingPageRepository"
import { GetStaticProps } from "next"
import { useDispatch } from "react-redux"
import * as actions from "store/actions"
import * as Blocks from "../../components/cms/blocks"
import { MarketingLandingPage } from "../../data/graphcms/MarketingLandingPage"
import Hero from "../../components/cms/hero"
import useServerModel from "../../components/custom-hook/useServerModel"
import { firebaseServiceInstance } from "../../data/firebase/FirebaseService"

/**
 * Just for us to develop the UI while we don't have the hygraph cms setup
 */

interface Props {
   marketingLandingPagePlainObject: MarketingLandingPage
}
const LandingPage = ({ marketingLandingPagePlainObject }: Props) => {
   const marketingLandingPage = useServerModel<MarketingLandingPage>(
      marketingLandingPagePlainObject,
      MarketingLandingPage.createFromPlainObject
   )
   const dispatch = useDispatch()
   useEffect(() => {
      dispatch(actions.inLandingPage())

      return () => {
         dispatch(actions.outOfLandingPage())
      }
   }, [])

   return (
      <>
         <SEO
            id={marketingLandingPage?.id}
            {...marketingLandingPage?.seo}
            title={`${marketingLandingPage?.title} - CareerFairy Marketing`}
         />
         {marketingLandingPage.hero && (
            <Hero
               pageTitle={marketingLandingPage.title}
               pageSubTitle={marketingLandingPage.subtitle}
               {...marketingLandingPage.hero}
            />
         )}
         {marketingLandingPage.blocks && (
            <>
               {marketingLandingPage.blocks.map((block) => {
                  const Component = Blocks[block.__typename]
                  if (!Component) return null
                  return (
                     <Component
                        key={block.id}
                        page={marketingLandingPage}
                        fieldsOfStudy={marketingLandingPage.fieldsOfStudy}
                        {...block}
                     />
                  )
               })}
            </>
         )}
      </>
   )
}

export const getStaticProps: GetStaticProps = async ({
   params,
   preview = false,
   locale,
}) => {
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
   const fieldsOfStudy = await firebaseServiceInstance.getFieldsOfStudiesByIds(
      marketingPage.fieldsOfStudy || []
   )
   console.log("-> fieldsOfStudy from req", fieldsOfStudy)
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
      const marketingPages = await marketingPageRepo.getAllMarketingPageSlugs()

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
