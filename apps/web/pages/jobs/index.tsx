import {
   CustomJobsPresenter,
   SerializedCustomJob,
} from "@careerfairy/shared-lib/customJobs/CustomJobsPresenter"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams/livestreams"
import {
   SerializedSpark,
   SparkPresenter,
} from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import {
   JobsOverviewContextProvider,
   SearchParams,
} from "components/views/jobs-page/JobsOverviewContext"
import JobsPageOverview from "components/views/jobs-page/JobsPageOverview"
import {
   customJobRepo,
   livestreamRepo,
   sparkRepo,
} from "data/RepositoryInstances"
import { Timestamp } from "firebase/firestore"
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import SEO from "../../components/util/SEO"
import ScrollToTop from "../../components/views/common/ScrollToTop"
import GenericDashboardLayout from "../../layouts/GenericDashboardLayout"

const JobsPage: NextPage<
   InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ serializedCustomJobs, customJobData, searchParams }) => {
   const seoTitle = getSeoTitle(serializedCustomJobs, searchParams)

   const serverCustomJobs =
      serializedCustomJobs?.map((job) =>
         CustomJobsPresenter.deserialize(job).convertToDocument(
            Timestamp.fromDate
         )
      ) || []

   const serverJob = customJobData?.serializedCustomJob
      ? CustomJobsPresenter.deserialize(
           customJobData.serializedCustomJob
        ).convertToDocument(Timestamp.fromDate)
      : undefined

   return (
      <>
         <SEO
            id={"CareerFairy | Jobs | " + searchParams.term}
            description={"Find your dream job with CareerFairy."}
            title={seoTitle}
         />
         <GenericDashboardLayout>
            <JobsOverviewContextProvider
               serverCustomJobs={serverCustomJobs}
               serverJob={serverJob}
            >
               <JobsPageOverview />
            </JobsOverviewContextProvider>
            <ScrollToTop hasBottomNavBar />
         </GenericDashboardLayout>
      </>
   )
}

const getSeoTitle = (
   serializedCustomJobs: SerializedCustomJob[],
   searchParams: SearchParams
) => {
   if (
      !searchParams.location.length &&
      !searchParams.term &&
      serializedCustomJobs?.length
   ) {
      return `${serializedCustomJobs?.length} Jobs on CareerFairy`
   }

   if (
      searchParams.location.length &&
      !searchParams.term &&
      serializedCustomJobs?.length
   ) {
      return `${
         serializedCustomJobs?.length
      } Jobs in ${searchParams.location.join(", ")} on CareerFairy`
   }

   if (
      !searchParams.location.length &&
      searchParams.term &&
      serializedCustomJobs?.length
   ) {
      return `${serializedCustomJobs?.length} Jobs for ${searchParams.term} on CareerFairy`
   }

   if (
      searchParams.location.length &&
      searchParams.term &&
      serializedCustomJobs?.length
   ) {
      return `${serializedCustomJobs?.length} Jobs for ${
         searchParams.term
      } in ${searchParams.location.join(", ")} on CareerFairy`
   }

   return `Jobs on CareerFairy`
}

type JobsPageProps = {
   serializedCustomJobs: SerializedCustomJob[]
   customJobData?: {
      serializedCustomJob: SerializedCustomJob
      livestreamsData: { [p: string]: any }[]
      sparksData: SerializedSpark[]
   }
   searchParams: SearchParams
}

export const getServerSideProps: GetServerSideProps<JobsPageProps> = async (
   context
) => {
   const { location, term = "", jobId, redirected } = context.query
   const locations = (location as string[]) || []

   // TODO: Replace with Algolia search using the searchParams, also add default limit
   // TODO: Check also size limit, as returning high number of jobs might cause performance issues
   const customJobs = await customJobRepo.getPublishedCustomJobs()
   const firstCustomJob = customJobs?.at(0)

   const customJob = jobId
      ? await customJobRepo.getCustomJobById(jobId as string)
      : firstCustomJob

   const serializedCustomJob = customJob
      ? CustomJobsPresenter.serializeDocument(customJob)
      : null

   const serializedCustomJobs =
      customJobs?.map((job) => CustomJobsPresenter.serializeDocument(job)) ?? []

   // Add redirect to include the jobId in the URL if it's not already there
   if (!redirected && ((jobId && !customJob) || !jobId)) {
      return {
         redirect: {
            destination: `/jobs?${new URLSearchParams({
               ...(locations.length && { location: locations.join(",") }),
               ...(term && { term: term.toString() }),
               // If there is no jobId, we redirect to the first job
               jobId: firstCustomJob?.id || "",
               redirected: "true",
            })}`,
            permanent: false,
         },
      }
   }

   const serializedSparks: SerializedSpark[] = []
   const livestreamsData: { [p: string]: any }[] = []

   // For SEO only
   if (customJob) {
      let jobEvents: LivestreamEvent[] = []
      let jobSparks: Spark[] = []

      if (customJob?.livestreams?.length) {
         jobEvents = await livestreamRepo.getLivestreamsByIds(
            customJob.livestreams
         )
      }
      if (customJob?.sparks?.length) {
         jobSparks = await sparkRepo.getSparksByIds(customJob.sparks)
      }

      jobSparks.forEach((spark) => {
         serializedSparks.push(SparkPresenter.serialize(spark))
      })
      jobEvents.forEach((event) => {
         livestreamsData.push(LivestreamPresenter.serializeDocument(event))
      })
   }

   return {
      props: {
         serializedCustomJobs: serializedCustomJobs,
         customJobData: {
            serializedCustomJob,
            livestreamsData,
            sparksData: serializedSparks,
         },
         searchParams: {
            location: locations,
            term: term as string,
         },
      },
   }
}
export default JobsPage
