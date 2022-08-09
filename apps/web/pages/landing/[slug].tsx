import UpcomingLivestreams from "../../components/cms/landing-page/UpcomingLivestreams"
import MarketingSignUp from "../../components/cms/landing-page/MarketingSignUp"
import GeneralLayout from "../../layouts/GeneralLayout"
import SEO from "../../components/util/SEO"
import React, { useEffect } from "react"
import marketingPageRepo from "../../data/graphcms/MarketingPageRepository"
import { GetStaticProps } from "next"
import Header from "../../components/cms/landing-page/Header"
import { useDispatch } from "react-redux"
import * as actions from "store/actions"

/**
 * Just for us to develop the UI while we don't have the hygraph cms setup
 */

const LandingPage = ({ marketingLandingPage }) => {
   const dispatch = useDispatch()

   useEffect(() => {
      dispatch(actions.inLandingPage())

      return () => {
         dispatch(actions.outOfLandingPage())
      }
   }, [])

   return (
      <GeneralLayout>
         <SEO
            title="CareerFairy | Marketing Landing"
            canonical={`https://www.careerfairy.io/landing`}
         />
         <Header
            title={marketingLandingPage.title}
            subTitle={marketingLandingPage.subtitle}
         />
         <UpcomingLivestreams fieldsOfStudy={[""]} />
         <MarketingSignUp />
      </GeneralLayout>
   )
}

export const getStaticProps: GetStaticProps = async ({
   params,
   preview = false,
   locale,
}) => {
   const { marketingLandingPage } = await marketingPageRepo.getMarketingPage({
      slug: params.slug as string,
      preview,
      locale,
   })

   if (!marketingLandingPage) {
      return {
         notFound: true,
      }
   }

   return {
      props: {
         preview,
         marketingLandingPage,
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
