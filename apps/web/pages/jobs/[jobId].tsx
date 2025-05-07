import {
   CustomJobsPresenter,
   SerializedCustomJob,
} from "@careerfairy/shared-lib/customJobs/CustomJobsPresenter"
import * as Sentry from "@sentry/nextjs"
import useCustomJob from "components/custom-hook/custom-job/useCustomJob"
import { useIsMounted } from "components/custom-hook/utils/useIsMounted"
import SEO from "components/util/SEO"
import ScrollToTop from "components/views/common/ScrollToTop"
import { JobsOverviewContextProvider } from "components/views/jobs-page/JobsOverviewContext"
import JobsPageOverview from "components/views/jobs-page/JobsPageOverview"
import { customJobRepo } from "data/RepositoryInstances"
import GenericDashboardLayout from "layouts/GenericDashboardLayout"
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import { useRouter } from "next/router"
const JobPage: NextPage<
   InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ serializedCustomJob }) => {
   const isMounted = useIsMounted()
   const router = useRouter()
   const { jobId } = router.query
   const test = `https://www.careerfairy.io/${router.pathname}/${jobId}`

   console.log("🚀 ~ test:", test)

   const customJob = useCustomJob(jobId as string)

   if (!isMounted) {
      return null
   }
   return (
      <>
         <SEO
            id={`CareerFairy | Jobs | ${serializedCustomJob.title}`}
            description={serializedCustomJob.description}
            title={`${serializedCustomJob.group.universityName} | ${serializedCustomJob.title} | CareerFairy`}
            canonical={`https://www.careerfairy.io/${router.pathname}/${jobId}`}
         />
         <GenericDashboardLayout>
            <JobsOverviewContextProvider customJob={customJob}>
               <JobsPageOverview />
            </JobsOverviewContextProvider>
         </GenericDashboardLayout>
         <ScrollToTop hasBottomNavBar />
      </>
   )
}

type JobsPageProps = {
   serializedCustomJob: SerializedCustomJob
}

export const getServerSideProps: GetServerSideProps<
   JobsPageProps,
   {
      jobId: string
   }
> = async (context) => {
   const { jobId } = context.params

   if (!jobId) {
      Sentry.captureException(new Error(`Custom job id was not provided`), {
         extra: {
            jobId,
         },
      })

      return {
         notFound: true,
      }
   }

   const customJobFromService = await customJobRepo.getCustomJobById(jobId)

   if (!customJobFromService) {
      Sentry.captureException(
         new Error(`Custom job with id ${jobId} not found`),
         {
            extra: {
               jobId,
            },
         }
      )

      return {
         notFound: true,
      }
   }
   return {
      props: {
         serializedCustomJob: CustomJobsPresenter.serializeDocument(
            customJobFromService
         ) as SerializedCustomJob,
      },
   }
}

export default JobPage
