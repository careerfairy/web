import { PreviewModeAlert } from "components/views/talent-guide/components/PreviewModeAlert"
import { GetStaticProps, NextPage } from "next"
import Link from "next/link"
import { useRouter } from "next/router"
import { Fragment } from "react"
import SEO from "../../components/util/SEO"
import {
   tgBackendPreviewService,
   tgBackendService,
} from "../../data/hygraph/TalentGuideBackendService"
import GenericDashboardLayout from "../../layouts/GenericDashboardLayout"

interface TalentGuidePageProps {
   slugs: string[]
}

const TalentGuidePage: NextPage<TalentGuidePageProps> = ({ slugs }) => {
   const { isPreview, locale } = useRouter()
   return (
      <Fragment>
         <SEO
            title="CareerFairy | Levels"
            description="Enhance your job search journey with expert-curated learning modules. Get in-depth insights, company perspectives, and practical guidance tailored to each stage of your career development."
            noIndex={isPreview}
         />
         <GenericDashboardLayout pageDisplayName="Levels">
            <div>
               <h1>Levels: {isPreview ? "Preview" : "Published"}</h1>
               <p>Locale: {locale}</p>
               <ul>
                  {slugs.map((slug) => (
                     <li key={slug}>
                        <Link locale={locale} href={`/levels/${slug}`}>
                           {slug}
                        </Link>
                     </li>
                  ))}
               </ul>
               {Boolean(isPreview) && <PreviewModeAlert />}
            </div>
         </GenericDashboardLayout>
      </Fragment>
   )
}

export const getStaticProps: GetStaticProps<TalentGuidePageProps> = async ({
   preview = false,
}) => {
   if (process.env.APP_ENV === "test") {
      // no tests for talent guide yet
      return {
         notFound: true, // Return 404 in test environment
      }
   }

   const service = preview ? tgBackendPreviewService : tgBackendService

   const slugs = await service.getAllTalentGuideModulePageSlugs()

   return {
      props: {
         slugs,
      },
      revalidate: 60, // Revalidate every 60 seconds
   }
}

export default TalentGuidePage
