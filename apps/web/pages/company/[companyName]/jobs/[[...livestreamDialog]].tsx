import { CustomJobsPresenter } from "@careerfairy/shared-lib/customJobs/CustomJobsPresenter"
import {
   CustomJob,
   CustomJobApplicationSourceTypes,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box } from "@mui/material"
import { CustomJobSEOSchemaScriptTag } from "components/views/common/CustomJobSEOSchemaScriptTag"
import { TabValue } from "components/views/company-page"
import { CustomJobDialogProvider } from "components/views/jobs/components/custom-jobs/CustomJobDialogContext"
import { fromDate } from "data/firebase/FirebaseInstance"
import {
   GetServerSideProps,
   GetServerSidePropsContext,
   InferGetServerSidePropsType,
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

const JobsPage: NextPage<
   InferGetServerSidePropsType<typeof getServerSideProps>
> = ({
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

   const serverCustomJob: CustomJob = useMemo(() => {
      const { serverSideCustomJob } = customJobDialogData || {}
      if (!serverSideCustomJob) return null
      return CustomJobsPresenter.parseDocument(
         serverSideCustomJob as any,
         fromDate
      )
   }, [customJobDialogData])

   const mappedServerCustomJobs: CustomJob[] = useMemo(() => {
      return (
         serverSideCustomJobs?.map((job) => {
            return CustomJobsPresenter.parseDocument(job as any, fromDate)
         }) || []
      )
   }, [serverSideCustomJobs])

   return (
      <LivestreamDialogLayout livestreamDialogData={livestreamDialogData}>
         <CustomJobDialogProvider
            source={{ source: CustomJobApplicationSourceTypes.Group, id: id }}
            serverSideCustomJob={serverCustomJob}
            customJobId={customJobId}
         >
            <>
               {serverCustomJob && serverCustomJob.id === customJobId ? (
                  <CustomJobSEOSchemaScriptTag job={serverCustomJob} />
               ) : (
                  mappedServerCustomJobs.map((job) => (
                     <CustomJobSEOSchemaScriptTag key={job.id} job={job} />
                  ))
               )}
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

const serverCustomJobGetter = async (ctx: GetServerSidePropsContext) => {
   try {
      const customJobId = (ctx.query.dialogJobId as string) || null

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

export const getServerSideProps: GetServerSideProps = async (ctx) => {
   const { companyName: companyNameSlug } = ctx.params || {}

   const result = await getCompanyPageData({
      companyNameSlug: companyNameSlug as string,
      ctx,
      customJobGetter: serverCustomJobGetter,
   })

   if (result.notFound) {
      return { notFound: true }
   }

   return {
      props: result.props!,
   }
}

export default JobsPage
