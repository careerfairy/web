import caseStudyRepo from "../../../data/graphcms/CaseStudyRepository"
import { useRouter } from "next/router"
import ErrorPage from "next/error"
import SEO from "../../../components/util/SEO"
import CaseStudyLayout from "../../../layouts/CaseStudyLayout"
import Hero from "../../../components/views/case-study/Hero"
import { parseCaseStudy } from "../../../components/cms/util"
import Details from "../../../components/views/case-study/Details"
import About from "../../../components/views/case-study/About"
import Story from "../../../components/views/case-study/Story"
import Statistics from "../../../components/views/case-study/Statistics"

export default function CaseStudy({
   companyCaseStudy,
   moreCompanyCaseStudies,
   preview,
}) {
   const router = useRouter()
   console.log("-> companyCaseStudy", companyCaseStudy)
   if (!router.isFallback && !companyCaseStudy?.slug) {
      return <ErrorPage statusCode={404} />
   }

   return (
      <CaseStudyLayout preview={preview}>
         <SEO {...companyCaseStudy?.seo} />
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
         <Story rawContent={companyCaseStudy?.storyContentSection?.raw} />
         <Statistics
            rawContent={companyCaseStudy?.statisticsContentSection?.raw}
         />
      </CaseStudyLayout>
   )
}

export async function getStaticProps({ params, preview = false }) {
   const { companyCaseStudy, moreCompanyCaseStudies } =
      await caseStudyRepo.getCaseStudyAndMoreCaseStudies(params.slug, preview)

   // @ts-ignore
   const parsedCaseStudyData = await parseCaseStudy(companyCaseStudy)

   return {
      props: {
         preview,
         companyCaseStudy: parsedCaseStudyData,
         moreCompanyCaseStudies: moreCompanyCaseStudies || [],
      },
   }
}

export async function getStaticPaths({ locales }) {
   let paths = []

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
   return {
      paths,
      fallback: true,
   }
}
