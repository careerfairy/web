import { PreviewModeAlert } from "components/views/talent-guide/components/PreviewModeAlert"
import { Page, TalentGuideModule } from "data/hygraph/types"
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
   pages: Page<TalentGuideModule>[]
}

const TalentGuidePage: NextPage<TalentGuidePageProps> = ({ pages }) => {
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
                  {pages.map((page) => (
                     <li key={page.slug}>
                        <Link locale={locale} href={`/levels/${page.slug}`}>
                           {page.slug}
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

   const pages = await service.getAllTalentGuideModulePages()

   return {
      props: {
         pages,
      },
      revalidate: 60, // Revalidate every 60 seconds
   }
}

export default TalentGuidePage
