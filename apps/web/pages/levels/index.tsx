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
}

const TalentGuidePage: NextPage<TalentGuidePageProps> = ({ pages }) => {
   const { isPreview } = useRouter()

   return (
      <Fragment>
         <SEO {...getTalentGuideOverviewSeoProps(pages, isPreview)} />
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

   const pages = await service.getAllTalentGuideModulePages()

   return {
      props: {
         pages,
      },
      revalidate: process.env.NODE_ENV === "development" ? false : 60,
   }
}

export default TalentGuidePage
