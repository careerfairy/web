import {
   CustomJobsPresenter,
   SerializedCustomJob,
} from "@careerfairy/shared-lib/customJobs/CustomJobsPresenter"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { CUSTOM_JOB_REPLICAS } from "@careerfairy/shared-lib/customJobs/search"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams/livestreams"
import {
   SerializedSpark,
   SparkPresenter,
} from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { getQueryStringArray } from "@careerfairy/shared-lib/utils/utils"
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
import algoliaRepo from "data/algolia/AlgoliaRepository"
import { Timestamp } from "firebase/firestore"
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import { deserializeAlgoliaSearchResponse } from "util/algolia"
import SEO from "../../components/util/SEO"
import ScrollToTop from "../../components/views/common/ScrollToTop"

import { buildAlgoliaFilterString } from "components/custom-hook/custom-job/useCustomJobSearchAlgolia"
import { LivestreamDialogLayout } from "components/views/livestream-dialog/LivestreamDialogLayout"
import GenericDashboardLayout from "../../layouts/GenericDashboardLayout"

export const HEADER_TRANSITION_TIMEOUT = 100

const JobsPage: NextPage<
   InferGetServerSidePropsType<typeof getServerSideProps>
> = ({
   serializedCustomJobs,
   customJobData,
   searchParams,
   userCountryCode,
   numberOfJobs,
   dialogOpen,
}) => {
   const seoTitle = getSeoTitle(searchParams, numberOfJobs)
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
         <GenericDashboardLayout
            userCountryCode={userCountryCode}
            hideFooter
            headerFixed={false}
            transitionTimeout={0}
         >
            <LivestreamDialogLayout>
               <JobsOverviewContextProvider
                  serverCustomJobs={serverCustomJobs}
                  serverJob={serverJob}
                  dialogOpen={dialogOpen}
               >
                  <JobsPageOverview />
               </JobsOverviewContextProvider>
               <ScrollToTop hasBottomNavBar />
            </LivestreamDialogLayout>
         </GenericDashboardLayout>
      </>
   )
}

const getSeoTitle = (searchParams: SearchParams, numberOfJobs: number) => {
   if (!searchParams.location.length && !searchParams.term && numberOfJobs) {
      return `${numberOfJobs} Jobs on CareerFairy`
   }

   if (searchParams.location.length && !searchParams.term && numberOfJobs) {
      return `${numberOfJobs} Jobs in ${searchParams.location.join(
         ", "
      )} on CareerFairy`
   }

   if (!searchParams.location.length && searchParams.term && numberOfJobs) {
      return `${numberOfJobs} Jobs for ${searchParams.term} on CareerFairy`
   }

   if (searchParams.location.length && searchParams.term && numberOfJobs) {
      return `${numberOfJobs} Jobs for ${
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
   userCountryCode: string
   numberOfJobs: number
   dialogOpen: boolean
}

export const getServerSideProps: GetServerSideProps<JobsPageProps> = async (
   context
) => {
   const userCountryCode =
      (context.req.headers["x-vercel-ip-country"] as string) || null

   const { term: queryTerm = "", jobId: queryJobId } = context.query

   const term = queryTerm as string
   const jobId = queryJobId as string

   const dialogOpen = Boolean(jobId)

   const queryLocations = getQueryStringArray(context.query.location)
   const queryBusinessFunctionTags = getQueryStringArray(
      context.query.businessFunctionTags
   )
   const queryJobTypes = getQueryStringArray(context.query.jobTypes)

   const filterOptions = {
      arrayFilters: {
         locationIdTags: queryLocations,
         businessFunctionsTagIds: queryBusinessFunctionTags,
         normalizedJobType: queryJobTypes,
      },
      booleanFilters: {
         // deleted: false,
         // published: true,
         // isPermanentlyExpired: false,
      },
   }

   const filters: string = buildAlgoliaFilterString(filterOptions)

   const algoliaResponse = await algoliaRepo.searchCustomJobs(
      term as string,
      filters,
      0,
      CUSTOM_JOB_REPLICAS.TITLE_ASC,
      30
   )

   const algoliaCustomJobs = algoliaResponse.hits
      .map(deserializeAlgoliaSearchResponse)
      .map((job) => job as CustomJob)

   const firstCustomJob = algoliaCustomJobs?.at(0)

   const customJob = jobId
      ? await customJobRepo.getCustomJobById(jobId)
      : firstCustomJob

   const serializedCustomJob = customJob
      ? CustomJobsPresenter.serializeDocument(customJob)
      : null

   const serializedCustomJobs =
      algoliaCustomJobs?.map((job) =>
         CustomJobsPresenter.serializeDocument(job)
      ) ?? []

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
         numberOfJobs: algoliaResponse.nbHits,
         customJobData: {
            serializedCustomJob,
            livestreamsData,
            sparksData: serializedSparks,
         },
         dialogOpen,
         userCountryCode,
         searchParams: {
            location: queryLocations,
            term: term as string,
            businessFunctionTags: queryBusinessFunctionTags,
            jobTypes: queryJobTypes,
         },
      },
   }
}

export default JobsPage
