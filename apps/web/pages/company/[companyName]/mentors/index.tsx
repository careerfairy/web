import { CustomJobApplicationSourceTypes } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box } from "@mui/material"
import { TabValue } from "components/views/company-page"
import { CompanyPageSEO } from "components/views/company-page/CompanyPageSEO"
import { CustomJobDialogLayout } from "components/views/jobs/components/custom-jobs/CustomJobDialogLayout"
import { LivestreamDialogLayout } from "components/views/livestream-dialog"
import { GetStaticPaths, NextPage } from "next"
import CompanyPageOverview from "../../../../components/views/company-page"
import GenericDashboardLayout from "../../../../layouts/GenericDashboardLayout"
import {
   deserializeGroupClient,
   mapCustomJobsFromServerSide,
   mapFromServerSide,
} from "../../../../util/serverUtil"
import { CompanyPageData, getCompanyPageData } from "../[[...livestreamDialog]]"

const PARAMETER_SOURCE = "livestreamDialog"

const MentorsPage: NextPage<CompanyPageData> = ({
   serverSideGroup,
   serverSideUpcomingLivestreams,
   serverSidePastLivestreams,
   serverSideCustomJobs,
   livestreamDialogData,
   customJobDialogData,
   groupCreators,
}) => {
   const { id } = deserializeGroupClient(serverSideGroup)

   return (
      <LivestreamDialogLayout livestreamDialogData={livestreamDialogData}>
         <CustomJobDialogLayout
            customJobDialogData={customJobDialogData}
            source={{ source: CustomJobApplicationSourceTypes.Group, id: id }}
            dialogSource={PARAMETER_SOURCE}
         >
            <CompanyPageSEO
               serverSideGroup={serverSideGroup}
               pageType="mentors"
            />

            <GenericDashboardLayout pageDisplayName={""}>
               <Box sx={{ backgroundColor: "inherit", minHeight: "100vh" }}>
                  <CompanyPageOverview
                     group={serverSideGroup}
                     groupCreators={groupCreators}
                     upcomingLivestreams={mapFromServerSide(
                        serverSideUpcomingLivestreams
                     )}
                     pastLivestreams={mapFromServerSide(
                        serverSidePastLivestreams
                     )}
                     customJobs={mapCustomJobsFromServerSide(
                        serverSideCustomJobs
                     )}
                     editMode={false}
                     tab={TabValue.mentors}
                  />
               </Box>
            </GenericDashboardLayout>
         </CustomJobDialogLayout>
      </LivestreamDialogLayout>
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

export default MentorsPage
