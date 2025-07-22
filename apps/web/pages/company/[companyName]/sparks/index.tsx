import { Box } from "@mui/material"
import { TabValue } from "components/views/company-page"
import { CompanyPageSEO } from "components/views/company-page/CompanyPageSEO"
import { GetStaticPaths, NextPage } from "next"
import CompanyPageOverview from "../../../../components/views/company-page"
import GenericDashboardLayout from "../../../../layouts/GenericDashboardLayout"
import {
   mapCustomJobsFromServerSide,
   mapFromServerSide,
} from "../../../../util/serverUtil"
import { CompanyPageData, getCompanyPageData } from "../[[...livestreamDialog]]"

const SparksPage: NextPage<CompanyPageData> = ({
   serverSideGroup,
   serverSideUpcomingLivestreams,
   serverSidePastLivestreams,
   serverSideCustomJobs,
   groupCreators,
}) => {
   return (
      <>
         <CompanyPageSEO serverSideGroup={serverSideGroup} pageType="sparks" />

         <GenericDashboardLayout pageDisplayName={""}>
            <Box sx={{ backgroundColor: "inherit", minHeight: "100vh" }}>
               <CompanyPageOverview
                  group={serverSideGroup}
                  groupCreators={groupCreators}
                  upcomingLivestreams={mapFromServerSide(
                     serverSideUpcomingLivestreams
                  )}
                  pastLivestreams={mapFromServerSide(serverSidePastLivestreams)}
                  customJobs={mapCustomJobsFromServerSide(serverSideCustomJobs)}
                  editMode={false}
                  tab={TabValue.sparks}
               />
            </Box>
         </GenericDashboardLayout>
      </>
   )
}

export const getStaticProps = async (ctx) => {
   const { companyName: companyNameSlug } = ctx.params || {}

   return getCompanyPageData({
      companyNameSlug: companyNameSlug as string,
      ctx,
   })
}

export const getStaticPaths: GetStaticPaths = () => ({
   paths: [],
   fallback: "blocking",
})

export default SparksPage
