import UpcomingLivestreams from "../../components/cms/landing-page/UpcomingLivestreams"
import MarketingSignUp from "../../components/cms/landing-page/MarketingSignUp"
import GeneralLayout from "../../layouts/GeneralLayout"
import SEO from "../../components/util/SEO"
import React, { useEffect } from "react"
import marketingPageRepo from "../../data/graphcms/MarketingPageRepository"
import { GetStaticProps } from "next"
import { useDispatch } from "react-redux"
import * as actions from "store/actions"
import { MarketingLandingPage } from "../../data/graphcms/MarketingLandingPage"
import Hero from "../../components/cms/hero"
import useServerModel from "../../components/custom-hook/useServerModel"

/**
 * Just for us to develop the UI while we don't have the hygraph cms setup
 */

interface Props {
   serverMarketingLandingPage: MarketingLandingPage
}
const LandingPage = ({ serverMarketingLandingPage }: Props) => {
   const marketingLandingPage = useServerModel<MarketingLandingPage>(
      serverMarketingLandingPage,
      MarketingLandingPage.createFromPlainObject
   )
   console.log("-> marketingLandingPage", marketingLandingPage)
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
         <UpcomingLivestreams fieldsOfStudy={[""]} />
         <MarketingSignUp />
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
   return {
      props: {
         preview,
         serverMarketingLandingPage: marketingPage.serializeToPlainObject(),
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
