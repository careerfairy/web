import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { CUSTOM_JOB_REPLICAS } from "@careerfairy/shared-lib/customJobs/search"
import { getQueryStringArray } from "@careerfairy/shared-lib/utils/utils"
import {
   FilterOptions,
   useCustomJobSearchAlgolia,
} from "components/custom-hook/custom-job/useCustomJobSearchAlgolia"
import { customJobRepo } from "data/RepositoryInstances"
import { NextRouter, useRouter } from "next/router"
import { ParsedUrlQuery } from "querystring"
import {
   ReactNode,
   createContext,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react"
import { useDebounce } from "react-use"

type JobsOverviewContextType = {
   selectedJob: CustomJob | undefined
   setSelectedJob: (job: CustomJob) => void
   customJobs: CustomJob[]
   searchParams: SearchParams
   searchTerm: string
   setSearchTerm: (term: string) => void
   setSearchLocations: (locations: string[]) => void
   searchLocations: string[]
   searchBusinessFunctionTags: string[]
   setSearchBusinessFunctionTags: (businessFunctionTags: string[]) => void
   searchJobTypes: string[]
   setSearchJobTypes: (jobTypes: string[]) => void
}

const JobsOverviewContext = createContext<JobsOverviewContextType | undefined>(
   undefined
)

type JobsOverviewContextProviderType = {
   serverCustomJobs?: CustomJob[]
   serverJob?: CustomJob
   children: ReactNode
}

export type SearchParams = {
   location?: string[]
   term?: string
   businessFunctionTags?: string[]
   jobTypes?: string[]
}

export const JobsOverviewContextProvider = ({
   children,
   serverCustomJobs,
   serverJob,
}: JobsOverviewContextProviderType) => {
   const router = useRouter()
   const searchParams = getSearchParams(router.query)

   const [searchTerm, setSearchTerm] = useState(searchParams.term)

   const [selectedJob, setSelectedJob] = useState<CustomJob>(serverJob)

   const filterOptions = useMemo<FilterOptions>(
      () => ({
         arrayFilters: {
            locationIdTags: searchParams.location,
            businessFunctionsTagIds: searchParams.businessFunctionTags,
            normalizedJobType: searchParams.jobTypes,
         },
      }),
      [
         searchParams.businessFunctionTags,
         searchParams.location,
         searchParams.jobTypes,
      ]
   )

   const { data } = useCustomJobSearchAlgolia(searchParams.term, {
      filterOptions,
      targetReplica: CUSTOM_JOB_REPLICAS.TITLE_ASC,
      itemsPerPage: 10,
      initialData: serverCustomJobs,
   })

   const infiniteJobs = useMemo(() => {
      return data?.flatMap((page) => page.deserializedHits) ?? []
   }, [data])

   const handleJobIdChange = useCallback(
      async (jobId: string) => {
         if (jobId) {
            const customJob = await customJobRepo.getCustomJobById(jobId)

            if (customJob) {
               setSelectedJob(customJob)
               return
            }
         }

         setSelectedJob(undefined)
      },
      [setSelectedJob]
   )

   const handleSelectedJobChange = useCallback(
      (job: CustomJob) => handleQueryChange(router, "jobId", job.id),
      [router]
   )

   const handleLocationChange = useCallback(
      (locations: string[]) => handleQueryChange(router, "location", locations),
      [router]
   )

   const handleBusinessFunctionTagsChange = useCallback(
      (businessFunctionTags: string[]) =>
         handleQueryChange(
            router,
            "businessFunctionTags",
            businessFunctionTags
         ),
      [router]
   )

   const handleJobTypesChange = useCallback(
      (jobTypes: string[]) => handleQueryChange(router, "jobTypes", jobTypes),
      [router]
   )

   useDebounce(() => handleQueryChange(router, "term", searchTerm), 300, [
      searchTerm,
   ])

   const value: JobsOverviewContextType = useMemo(() => {
      return {
         selectedJob: selectedJob,
         setSelectedJob: handleSelectedJobChange,
         searchTerm,
         setSearchTerm,
         setSearchLocations: handleLocationChange,
         searchLocations: searchParams.location,
         searchBusinessFunctionTags: searchParams.businessFunctionTags,
         setSearchBusinessFunctionTags: handleBusinessFunctionTagsChange,
         searchJobTypes: searchParams.jobTypes,
         setSearchJobTypes: handleJobTypesChange,
         customJobs: infiniteJobs,
         searchParams,
      }
   }, [
      infiniteJobs,
      searchParams,
      selectedJob,
      handleSelectedJobChange,
      handleBusinessFunctionTagsChange,
      handleLocationChange,
      handleJobTypesChange,
      searchTerm,
   ])

   useEffect(() => {
      if (serverJob?.id !== router.query.jobId) {
         handleJobIdChange(router.query.jobId as string)
      } else {
         setSelectedJob(serverJob)
      }
   }, [router.query.jobId, handleJobIdChange, serverJob])

   return (
      <JobsOverviewContext.Provider value={value}>
         {children}
      </JobsOverviewContext.Provider>
   )
}

const handleQueryChange = (
   router: NextRouter,
   param: keyof SearchParams | "jobId",
   value: string | string[]
) => {
   router.push(
      {
         pathname: router.pathname,
         query: {
            ...router.query,
            [param]: value,
         },
      },
      undefined,
      { shallow: true }
   )
}

const getSearchParams = (query: ParsedUrlQuery): SearchParams => {
   const term = (query.term as string) || ""

   const searchParamLocations = getQueryStringArray(query.location)
   const searchParamBusinessFunctionTags = getQueryStringArray(
      query.businessFunctionTags
   )
   const searchParamJobTypes = getQueryStringArray(query.jobTypes)

   return {
      location: searchParamLocations,
      term: term,
      businessFunctionTags: searchParamBusinessFunctionTags,
      jobTypes: searchParamJobTypes,
   }
}

export const useJobsOverviewContext = () => {
   const context = useContext(JobsOverviewContext)

   if (!context) {
      throw new Error(
         "useJobsOverviewContext must be used within a JobsOverviewContextProvider"
      )
   }

   return context
}
