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
   useJobsOverviewContext,
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

import { getLocationIds } from "@careerfairy/shared-lib/countries/types"
import { useAuth } from "HOCs/AuthProvider"
import { buildAlgoliaFilterString } from "components/custom-hook/custom-job/useCustomJobSearchAlgolia"
import { usePreFetchRecommendedJobs } from "components/custom-hook/custom-job/useRecommendedJobs"
import { CustomJobSEOSchemaScriptTag } from "components/views/common/CustomJobSEOSchemaScriptTag"
import { LivestreamDialogLayout } from "components/views/livestream-dialog/LivestreamDialogLayout"
import { Country, State } from "country-state-city"
import { customJobServiceInstance } from "data/firebase/CustomJobService"
import { useRouter } from "next/router"
import { getUserTokenFromCookie } from "util/serverUtil"
import GenericDashboardLayout from "../../layouts/GenericDashboardLayout"

export const HEADER_TRANSITION_TIMEOUT = 100
export const RECOMMENDED_JOBS_LIMIT = 30

const JobsPage: NextPage<
   InferGetServerSidePropsType<typeof getServerSideProps>
> = ({
   serializedCustomJobs,
   customJobData,
   userCountryCode,
   dialogOpen,
   locationNames,
}) => {
   const router = useRouter()
   const { jobId } = router.query
   const { authenticatedUser } = useAuth()

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

   usePreFetchRecommendedJobs({
      limit: RECOMMENDED_JOBS_LIMIT,
      userAuthId: authenticatedUser?.uid,
      countryCode: userCountryCode,
   })

   return (
      <>
         {serverJob && serverJob.id === jobId ? (
            <CustomJobSEOSchemaScriptTag job={serverJob} />
         ) : (
            serverCustomJobs.map((job) => (
               <CustomJobSEOSchemaScriptTag key={job.id} job={job} />
            ))
         )}

         <GenericDashboardLayout
            userCountryCode={userCountryCode}
            hideFooter
            headerFixed={false}
            transitionTimeout={HEADER_TRANSITION_TIMEOUT}
         >
            <LivestreamDialogLayout>
               <JobsOverviewContextProvider
                  serverCustomJobs={serverCustomJobs}
                  serverJob={serverJob}
                  dialogOpen={dialogOpen}
                  locationNames={locationNames}
               >
                  <PageSEO />
                  <JobsPageOverview />
               </JobsOverviewContextProvider>
               <ScrollToTop hasBottomNavBar />
            </LivestreamDialogLayout>
         </GenericDashboardLayout>
      </>
   )
}

const PageSEO = () => {
   const { searchParams, searchResultsCount, selectedLocationsNames } =
      useJobsOverviewContext()

   return (
      <SEO
         id={"CareerFairy | Jobs | " + searchParams.term}
         description={"Find your dream job with CareerFairy."}
         title={getSeoTitle(
            searchParams,
            searchResultsCount,
            selectedLocationsNames
         )}
      />
   )
}

const getSeoTitle = (
   searchParams: SearchParams,
   numberOfJobs: number,
   locationNames: string[]
) => {
   if (!searchParams.location.length && !searchParams.term && numberOfJobs) {
      return `${numberOfJobs} Jobs on CareerFairy`
   }

   if (searchParams.location.length && !searchParams.term && numberOfJobs) {
      return `${numberOfJobs} Jobs in ${locationNames.join(
         ", "
      )} on CareerFairy`
   }

   if (!searchParams.location.length && searchParams.term && numberOfJobs) {
      return `${numberOfJobs} Jobs for ${searchParams.term} on CareerFairy`
   }

   if (searchParams.location.length && searchParams.term && numberOfJobs) {
      return `${numberOfJobs} Jobs for ${
         searchParams.term
      } in ${locationNames.join(", ")} on CareerFairy`
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
   locationNames: string[]
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

   const token = getUserTokenFromCookie(context) as any
   const userAuthId = token?.user_id

   const term = queryTerm as string
   const jobId = queryJobId as string

   const dialogOpen = Boolean(jobId)

   const queryLocations = getQueryStringArray(context.query.location)
   const locationNames = getLocationNames(queryLocations)
   const queryBusinessFunctionTags = getQueryStringArray(
      context.query.businessFunctionTags
   )
   const queryJobTypes = getQueryStringArray(context.query.jobTypes)

   const hasFilters =
      queryLocations.length ||
      queryBusinessFunctionTags.length ||
      queryJobTypes.length ||
      term?.length

   const filterOptions = {
      arrayFilters: {
         locationIdTags: queryLocations,
         businessFunctionsTagIds: queryBusinessFunctionTags,
         normalizedJobType: queryJobTypes,
      },
      booleanFilters: {
         deleted: false,
         published: true,
         isPermanentlyExpired: false,
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

   const recommendedJobs = !hasFilters
      ? await customJobServiceInstance.getRecommendedJobs(
           RECOMMENDED_JOBS_LIMIT,
           userAuthId,
           false,
           {
              userCountryCode,
           }
        )
      : []

   const firstCustomJob = hasFilters
      ? algoliaCustomJobs?.at(0)
      : recommendedJobs?.at(0)

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
         locationNames,
         searchParams: {
            location: queryLocations,
            term: term as string,
            businessFunctionTags: queryBusinessFunctionTags,
            jobTypes: queryJobTypes,
         },
      },
   }
}

/**
 * Not creating a reusable function, as using country-state-city is not a good idea on  the client side.
 * This way whenever the package needs to be used, each page should declare it's own function and use
 * only on the server side.
 * @param locationIds IDs of the locations to get the names for.
 */
const getLocationNames = (locationIds: string[]) => {
   const locations = locationIds?.map((id) => {
      const { countryIsoCode, stateIsoCode } = getLocationIds(id)

      if (!countryIsoCode) return null

      const country = Country.getCountryByCode(countryIsoCode)
      if (stateIsoCode) {
         const state = State.getStateByCodeAndCountry(
            stateIsoCode,
            countryIsoCode
         )

         return {
            id,
            name: `${state.name} (${country.name})`,
         }
      }

      return {
         id,
         name: country.name,
      }
   })

   return locations?.map((location) => location?.name) ?? []
}

export default JobsPage
