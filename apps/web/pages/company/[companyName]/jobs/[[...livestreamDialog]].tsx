import { CustomJobsPresenter } from "@careerfairy/shared-lib/customJobs/CustomJobsPresenter"
import { CustomJobApplicationSourceTypes } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box } from "@mui/material"
import { TabValue } from "components/views/company-page"
import { CustomJobDialogProvider } from "components/views/jobs/components/custom-jobs/CustomJobDialogContext"
import { fromDate } from "data/firebase/FirebaseInstance"
import {
   GetServerSidePropsContext,
   GetStaticPaths,
   GetStaticPropsContext,
   InferGetStaticPropsType,
   NextPage,
} from "next"
import { useRouter } from "next/router"
import { useMemo } from "react"
import { errorLogAndNotify } from "util/CommonUtil"
import SEO from "../../../../components/util/SEO"
import CompanyPageOverview from "../../../../components/views/company-page"
import { LivestreamDialogLayout } from "../../../../components/views/livestream-dialog"
import GenericDashboardLayout from "../../../../layouts/GenericDashboardLayout"
import {
   deserializeGroupClient,
   getServerSideCustomJob,
   mapCustomJobsFromServerSide,
   mapFromServerSide,
} from "../../../../util/serverUtil"
import { getCompanyPageData } from "../[[...livestreamDialog]]"

const JobsPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
   serverSideGroup,
   serverSideUpcomingLivestreams,
   serverSidePastLivestreams,
   serverSideCustomJobs,
   livestreamDialogData,
   customJobDialogData,
   groupCreators,
}) => {
   const { query } = useRouter()
   const { universityName, id } = deserializeGroupClient(serverSideGroup)

   const customJobId = query.dialogJobId?.toString() || null

   const serverCustomJob = useMemo(() => {
      const { serverSideCustomJob } = customJobDialogData || {}
      if (!serverSideCustomJob) return null
      return CustomJobsPresenter.parseDocument(
         serverSideCustomJob as any,
         fromDate
      )
   }, [customJobDialogData])

   return (
      <LivestreamDialogLayout livestreamDialogData={livestreamDialogData}>
         <CustomJobDialogProvider
            source={{ source: CustomJobApplicationSourceTypes.Group, id: id }}
            serverSideCustomJob={serverCustomJob}
            customJobId={customJobId}
         >
            <>
               <SEO
                  id={`CareerFairy | ${universityName} | Jobs`}
                  title={`CareerFairy | ${universityName} | Jobs`}
                  description={`Find your dream job at ${universityName} with CareerFairy`}
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
                        tab={TabValue.jobs}
                     />
                  </Box>
               </GenericDashboardLayout>
            </>
         </CustomJobDialogProvider>
      </LivestreamDialogLayout>
   )
}

export const serverCustomJobGetter = async (
   ctx: GetServerSidePropsContext | GetStaticPropsContext
) => {
   try {
      const customJobId = (ctx.params.dialogJobId as string) || null

      if (customJobId) {
         const customJob = await getServerSideCustomJob(customJobId)

         return {
            serverSideCustomJob: customJob
               ? CustomJobsPresenter.serializeDocument(customJob)
               : null,
         }
      }
   } catch (e) {
      errorLogAndNotify(e, {
         message: "Error getting custom job dialog data",
         context: "getCustomJobDialogData",
         extra: {
            ctx,
         },
      })
   }
   return null
}

export const getStaticProps = async (ctx) => {
   const { companyName: companyNameSlug } = ctx.params || {}

   return getCompanyPageData({
      companyNameSlug: companyNameSlug as string,
      ctx,
      customJobGetter: serverCustomJobGetter,
   })
}

export const getStaticPaths: GetStaticPaths = () => ({
   paths: [],
   fallback: "blocking",
})

export default JobsPage
