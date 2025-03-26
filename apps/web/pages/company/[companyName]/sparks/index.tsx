import { Box } from "@mui/material"
import { TabValue } from "components/views/company-page"
import { GetStaticPaths, InferGetStaticPropsType, NextPage } from "next"
import SEO from "../../../../components/util/SEO"
import CompanyPageOverview from "../../../../components/views/company-page"
import GenericDashboardLayout from "../../../../layouts/GenericDashboardLayout"
import {
   deserializeGroupClient,
   mapCustomJobsFromServerSide,
   mapFromServerSide,
} from "../../../../util/serverUtil"
import { getCompanyPageData } from "../[[...livestreamDialog]]"

const SparksPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
   serverSideGroup,
   serverSideUpcomingLivestreams,
   serverSidePastLivestreams,
   serverSideCustomJobs,
   groupCreators,
}) => {
   const { universityName } = deserializeGroupClient(serverSideGroup)

   return (
      <>
         <SEO
            id={`CareerFairy | ${universityName} | Sparks`}
            title={`CareerFairy | ${universityName} | Sparks`}
            description={`Discover ${universityName} with CareerFairy sparks`}
         />

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
