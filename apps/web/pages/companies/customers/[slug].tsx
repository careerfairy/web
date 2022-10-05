import caseStudyRepo from "../../../data/hygraph/CaseStudyRepository"
import SEO from "../../../components/util/SEO"
import CaseStudyLayout from "../../../layouts/CaseStudyLayout"
import Hero from "../../../components/views/case-study/Hero"
import { parseCaseStudy } from "../../../components/cms/util"
import Details from "../../../components/views/case-study/Details"
import About from "../../../components/views/case-study/About"
import Story from "../../../components/views/case-study/Story"
import Statistics from "../../../components/views/case-study/Statistics"
import {
   CompanyCaseStudyPreview,
   CompanyCaseStudy,
} from "../../../types/cmsTypes"
import { GetStaticPaths, GetStaticProps } from "next"
import SeeMore from "../../../components/views/case-study/SeeMore"

interface Props {
   companyCaseStudy: CompanyCaseStudy
   moreCompanyCaseStudies: CompanyCaseStudyPreview[]
   preview: boolean
}
export default function CaseStudy({
   companyCaseStudy,
   moreCompanyCaseStudies,
   preview,
}: Props) {
   return (
      <CaseStudyLayout preview={preview}>
         <SEO
            id={companyCaseStudy?.id}
            {...companyCaseStudy?.seo}
            title={`${companyCaseStudy?.company?.name} - CareerFairy Customer Story`}
         />
         <Hero
            company={companyCaseStudy?.company}
            title={companyCaseStudy?.title}
            coverVideoUrl={companyCaseStudy?.coverVideo?.url}
            coverImage={companyCaseStudy?.coverImage}
         />
         <Details
            published={companyCaseStudy?.formattedPublished}
            industries={companyCaseStudy?.industry}
         />
         <About
            companyName={companyCaseStudy?.company?.name}
            content={companyCaseStudy?.aboutTheCompany}
         />
         <Story
            rawContent={companyCaseStudy?.storyContentSection?.raw}
            references={companyCaseStudy?.statisticsContentSection?.references}
         />
         <Statistics
            rawContent={companyCaseStudy?.statisticsContentSection?.raw}
            references={companyCaseStudy?.statisticsContentSection?.references}
            stats={companyCaseStudy.statisticStats}
         />
         <SeeMore moreCompanyCaseStudies={moreCompanyCaseStudies} />
      </CaseStudyLayout>
   )
}

export const getStaticProps: GetStaticProps = async ({
   params,
   preview = false,
}) => {
   const { companyCaseStudy, moreCompanyCaseStudies } =
      await caseStudyRepo.getCaseStudyAndMoreCaseStudies(
         params.slug as string,
         preview
      )

   if (!companyCaseStudy) {
      return {
         notFound: true,
      }
   }

   let parsedMoreCompanyCaseStudies = []

   for (const moreCaseStudy of moreCompanyCaseStudies) {
      const parsed = await parseCaseStudy(moreCaseStudy)
      parsedMoreCompanyCaseStudies.push(parsed)
   }

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

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
   let paths = []

   if (process.env.APP_ENV !== "test") {
      const caseStudies = await caseStudyRepo.getAllCaseStudiesWithSlug()

      if (locales) {
         for (const locale of locales) {
            paths = [
               ...paths,
               ...caseStudies.map((caseStudy) => ({
                  params: { slug: caseStudy.slug },
                  locale,
               })),
            ]
         }
      } else {
         paths = caseStudies.map((caseStudy) => ({
            params: { slug: caseStudy.slug },
         }))
      }
   }

   return {
      paths,
      fallback: "blocking",
   }
}
