import { CustomJobApplicationSourceTypes } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box } from "@mui/material"
import { TabValue } from "components/views/company-page"
import { CustomJobDialogLayout } from "components/views/jobs/components/custom-jobs/CustomJobDialogLayout"
import { GetStaticPaths, InferGetStaticPropsType, NextPage } from "next"
import SEO from "../../../../components/util/SEO"
import CompanyPageOverview from "../../../../components/views/company-page"
import { LivestreamDialogLayout } from "../../../../components/views/livestream-dialog"
import GenericDashboardLayout from "../../../../layouts/GenericDashboardLayout"
import {
   deserializeGroupClient,
   mapCustomJobsFromServerSide,
   mapFromServerSide,
} from "../../../../util/serverUtil"
import { getCompanyPageData } from "../[[...livestreamDialog]]"

const PARAMETER_SOURCE = "livestreamDialog"

const MentorsPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
   serverSideGroup,
   serverSideUpcomingLivestreams,
   serverSidePastLivestreams,
   serverSideCustomJobs,
   livestreamDialogData,
   customJobDialogData,
   groupCreators,
}) => {
   const { universityName, id } = deserializeGroupClient(serverSideGroup)

   return (
      <LivestreamDialogLayout livestreamDialogData={livestreamDialogData}>
         <CustomJobDialogLayout
            customJobDialogData={customJobDialogData}
            source={{ source: CustomJobApplicationSourceTypes.Group, id: id }}
            dialogSource={PARAMETER_SOURCE}
         >
            <SEO
               id={`CareerFairy | ${universityName} | Mentors`}
               title={`CareerFairy | ${universityName} | Mentors`}
               description={`Meet mentors of ${universityName} with CareerFairy`}
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
