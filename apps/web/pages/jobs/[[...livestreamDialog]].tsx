import { SearchResponse } from "@algolia/client-search"
import { BusinessFunctionsTags } from "@careerfairy/shared-lib/constants/tags"
import { getLocationIds } from "@careerfairy/shared-lib/countries/types"
import {
   CustomJobsPresenter,
   SerializedCustomJob,
} from "@careerfairy/shared-lib/customJobs/CustomJobsPresenter"
import {
   CustomJob,
   jobTypeOptions,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { CUSTOM_JOB_REPLICAS } from "@careerfairy/shared-lib/customJobs/search"
import { getQueryStringArray } from "@careerfairy/shared-lib/utils/utils"
import { useAuth } from "HOCs/AuthProvider"
import { buildAlgoliaFilterString } from "components/custom-hook/custom-job/useCustomJobSearchAlgolia"
import { usePreFetchRecommendedJobs } from "components/custom-hook/custom-job/useRecommendedJobs"
import { CustomJobSEOSchemaScriptTag } from "components/views/common/CustomJobSEOSchemaScriptTag"
import {
   JobsOverviewContextProvider,
   SearchParams,
   useJobsOverviewContext,
} from "components/views/jobs-page/JobsOverviewContext"
import JobsPageOverview from "components/views/jobs-page/JobsPageOverview"
import { LivestreamDialogLayout } from "components/views/livestream-dialog/LivestreamDialogLayout"
import { Country, State } from "country-state-city"
import { customJobRepo } from "data/RepositoryInstances"
import algoliaRepo from "data/algolia/AlgoliaRepository"
import { customJobServiceInstance } from "data/firebase/CustomJobService"
import { Timestamp } from "firebase/firestore"
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import { useRouter } from "next/router"
import { AlgoliaCustomJobResponse } from "types/algolia"
import { deserializeAlgoliaSearchResponse } from "util/algolia"
import { getUserTokenFromCookie } from "util/serverUtil"
import SEO from "../../components/util/SEO"
import ScrollToTop from "../../components/views/common/ScrollToTop"
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
   algoliaServerResponse,
}) => {
   const router = useRouter()
   const { currentJobId } = router.query
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
         {serverJob && serverJob.id === currentJobId ? (
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
            titleComponent="title"
         >
            <LivestreamDialogLayout>
               <JobsOverviewContextProvider
                  serverJob={serverJob}
                  dialogOpen={dialogOpen}
                  locationNames={locationNames}
                  algoliaServerResponse={algoliaServerResponse}
                  numberOfJobs={algoliaServerResponse?.nbHits}
                  userCountryCode={userCountryCode}
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
      <>
         <meta
            name="description"
            content={getMetaContent(
               searchParams,
               searchResultsCount,
               selectedLocationsNames
            )}
         />
         <SEO
            id={"CareerFairy | Jobs | " + searchParams.term}
            canonical={`https://www.careerfairy.io/jobs${
               searchParams.currentJobId
                  ? `?currentJobId=${searchParams.currentJobId}`
                  : ""
            }`}
            description={"Find your dream job with CareerFairy."}
            title={getSeoTitle(
               searchParams,
               searchResultsCount,
               selectedLocationsNames
            )}
         />
      </>
   )
}

const getMetaContent = (
   searchParams: SearchParams,
   numberOfJobs: number,
   locationNames: string[]
) => {
   const locations = locationNames?.length ? locationNames.join(", ") : null
   const jobTypes = getJobTypeLabels(searchParams.jobTypes)
   const jobTypesStr = jobTypes.length ? jobTypes.join(", ") : null
   const businessFunctions = getBusinessFunctionTagLabels(
      searchParams.businessFunctionTags
   )
   const businessFunctionsStr = businessFunctions.length
      ? businessFunctions.join(", ")
      : null
   const term = searchParams.term

   // Compose dynamic description
   let description = `Browse ${numberOfJobs} early-career jobs, internships and graduate programs across tech, consulting & engineering.`

   const filters: string[] = []
   if (locations)
      filters.push(
         `location${locationNames.length > 1 ? "s" : ""} in ${locations}`
      )
   if (jobTypesStr)
      filters.push(`job type${jobTypes.length > 1 ? "s" : ""}: ${jobTypesStr}`)
   if (businessFunctionsStr)
      filters.push(
         `job area${
            businessFunctions.length > 1 ? "s" : ""
         }: ${businessFunctionsStr}`
      )
   if (term) filters.push(`matching "${term}"`)

   if (filters.length) {
      description = `Browse ${numberOfJobs} early-career jobs${
         filters.length ? " filtered by " + filters.join(", ") : ""
      }. Apply directly on CareerFairy.`
   }

   return description
}

const getSeoTitle = (
   searchParams: SearchParams,
   numberOfJobs: number,
   locationNames: string[]
) => {
   const jobTypes = getJobTypeLabels(searchParams.jobTypes)
   const businessFunctions = getBusinessFunctionTagLabels(
      searchParams.businessFunctionTags
   )
   const locations = locationNames?.length ? locationNames.join(", ") : null
   const term = searchParams.term

   // Build title components
   const titleParts: string[] = []

   // Start with number of jobs
   titleParts.push(numberOfJobs.toString())

   // Add job types (e.g., "Part-Time", "Full-Time")
   if (jobTypes.length) {
      titleParts.push(jobTypes.join(", "))
   }

   // Add business functions (e.g., "Accounting", "Engineering")
   if (businessFunctions.length) {
      titleParts.push(businessFunctions.join(", "))
   }

   // Add "Jobs"
   titleParts.push("Jobs")

   // Build the base title
   let title = titleParts.join(" ")

   // Add location with "in" prefix
   if (locations) {
      title += ` in ${locations}`
   }

   // Add search term with "matching" prefix
   if (term) {
      title += ` matching "${term}"`
   }

   // Add platform branding
   title += " on CareerFairy"

   return title
}

// Helper to get job type labels
const getJobTypeLabels = (jobTypes?: string[]) => {
   if (!jobTypes?.length) return []
   return jobTypes
      .map((type) => jobTypeOptions.find((opt) => opt.value === type)?.label)
      .filter(Boolean)
}

// Helper to get business function tag labels
const getBusinessFunctionTagLabels = (tags?: string[]) => {
   if (!tags?.length) return []
   return tags
      .filter((tag) => tag !== "Other")
      .map((tag) => BusinessFunctionsTags[tag]?.name)
      .filter(Boolean)
}

type JobsPageProps = {
   serializedCustomJobs: SerializedCustomJob[]
   customJobData?: {
      serializedCustomJob: SerializedCustomJob
   }
   locationNames: string[]
   searchParams: SearchParams
   userCountryCode: string
   algoliaServerResponse: SearchResponse<AlgoliaCustomJobResponse>
   dialogOpen: boolean
}

export const getServerSideProps: GetServerSideProps<JobsPageProps> = async (
   context
) => {
   const userCountryCode =
      (context.req.headers["x-vercel-ip-country"] as string) || null

   const { term: queryTerm = "", currentJobId: queryCurrentJobId } =
      context.query

   const token = getUserTokenFromCookie(context) as any
   const userAuthId = token?.user_id

   const term = queryTerm as string
   const currentJobId = queryCurrentJobId as string

   const dialogOpen = Boolean(currentJobId)

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
         normalizedLocationIds: queryLocations,
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
      CUSTOM_JOB_REPLICAS.DEADLINE_ASC,
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
              userCountryCode: userCountryCode,
           }
        )
      : []

   const firstCustomJob = hasFilters
      ? algoliaCustomJobs?.at(0)
      : recommendedJobs?.at(0)

   const customJob = currentJobId
      ? await customJobRepo.getCustomJobById(currentJobId)
      : firstCustomJob

   const serializedCustomJob = customJob
      ? CustomJobsPresenter.serializeDocument(customJob)
      : null

   const serializedCustomJobs =
      algoliaCustomJobs?.map((job) =>
         CustomJobsPresenter.serializeDocument(job)
      ) ?? []

   return {
      props: {
         serializedCustomJobs: serializedCustomJobs,
         algoliaServerResponse: algoliaResponse,
         customJobData: {
            serializedCustomJob,
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
