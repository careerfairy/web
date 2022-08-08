import UpcomingLivestreams from "../../components/cms/landing-page/UpcomingLivestreams"
import MarketingSignUp from "../../components/cms/landing-page/MarketingSignUp"
import GeneralLayout from "../../layouts/GeneralLayout"
import SEO from "../../components/util/SEO"
import React from "react"
import marketingPageRepo from "../../data/graphcms/MarketingPageRepository"
import { GetStaticProps } from "next"
import { parseCaseStudy } from "../../components/cms/util"

/**
 * Just for us to develop the UI while we don't have the hygraph cms setup
 */

const landingPage = () => {
   return (
      <GeneralLayout>
         <SEO
            title="CareerFairy | Marketing Landing"
            canonical={`https://www.careerfairy.io/landing`}
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
   const { companyCaseStudy } = await marketingPageRepo.getMarketingPage({
      slug: params.slug as string,
      preview,
      locale,
   })

   if (!companyCaseStudy) {
      return {
         notFound: true,
      }
   }

   let parsedMoreCompanyCaseStudies = []

   const parsedCaseStudyData = await parseCaseStudy(companyCaseStudy)

   return {
      props: {
         preview,
         companyCaseStudy: parsedCaseStudyData,
         moreCompanyCaseStudies: parsedMoreCompanyCaseStudies || [],
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

export default landingPage
