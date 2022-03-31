import caseStudyRepo from "../../../data/graphcms/CaseStudyRepository"
import { useRouter } from "next/router"
import ErrorPage from "next/error"
import SEO from "../../../components/util/SEO"

export default function CaseStudy({
   companyCaseStudy,
   moreCompanyCaseStudies,
   preview,
}) {
   const router = useRouter()
   if (!router.isFallback && !companyCaseStudy?.slug) {
      return <ErrorPage statusCode={404} />
   }
   console.log("-> companyCaseStudy", companyCaseStudy)

   return (
      <>
         <SEO {...companyCaseStudy.seo} />
         <div>hi</div>
      </>
   )
}

export async function getStaticProps({ params, preview = false }) {
   const data = await caseStudyRepo.getCaseStudyAndMoreCaseStudies(
      params.slug,
      preview
   )
   return {
      props: {
         preview,
         companyCaseStudy: data.companyCaseStudy,
         moreCompanyCaseStudies: data.moreCompanyCaseStudies || [],
      },
   }
}

export async function getStaticPaths() {
   const caseStudies = await caseStudyRepo.getAllCaseStudiesWithSlug()
   return {
      paths: caseStudies.map(({ slug }) => ({
         params: { slug },
      })),
      fallback: true,
   }
}
