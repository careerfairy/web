import * as Sentry from "@sentry/nextjs"
import { PreviewModeAlert } from "components/views/talent-guide/components/PreviewModeAlert"
import { Page, TalentGuideModule } from "data/hygraph/types"
import GenericDashboardLayout from "layouts/GenericDashboardLayout"
import { GetStaticProps, NextPage } from "next"
import { useRouter } from "next/router"
import { Fragment } from "react"
import { getTalentGuideOverviewSeoProps } from "util/seo/talentGuideSeo"
import SEO from "../../components/util/SEO"
import { LevelsContainer } from "../../components/views/levels/components/LevelsContainer"
import {
   tgBackendPreviewService,
   tgBackendService,
} from "../../data/hygraph/TalentGuideBackendService"

interface TalentGuidePageProps {
   pages: Page<TalentGuideModule>[]
   rootPage: Page
}

const TalentGuidePage: NextPage<TalentGuidePageProps> = ({
   pages,
   rootPage,
}) => {
   const { isPreview } = useRouter()

   return (
      <Fragment>
         <SEO {...getTalentGuideOverviewSeoProps(rootPage, pages)} />
         <GenericDashboardLayout pageDisplayName="Levels">
            <LevelsContainer pages={pages} />
            {Boolean(isPreview) && <PreviewModeAlert />}
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

   try {
      const pages = await service.getAllTalentGuideModulePages()
      const rootPage = await service.getTalentGuideRootPage()

      return {
         props: {
            pages,
            rootPage,
         },
         revalidate: process.env.NODE_ENV === "development" ? false : 60,
      }
   } catch (error) {
      console.error(error)
      Sentry.captureException(
         new Error(`Failed to fetch talent guide overview page`),
         {
            extra: {
               error: error instanceof Error ? error.message : String(error),
            },
         }
      )

      return { notFound: true }
   }
}

export default TalentGuidePage
