import {
   CustomJob,
   CustomJobApplicationSource,
   CustomJobApplicationSourceTypes,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { CUSTOM_JOB_REPLICAS } from "@careerfairy/shared-lib/customJobs/search"
import { getQueryStringArray } from "@careerfairy/shared-lib/utils/utils"
import { useAuth } from "HOCs/AuthProvider"
import { useLocationSearch } from "components/custom-hook/countries/useLocationSearch"
import {
   FilterOptions,
   useCustomJobSearchAlgolia,
} from "components/custom-hook/custom-job/useCustomJobSearchAlgolia"
import { useUserRecommendedJobs } from "components/custom-hook/custom-job/useRecommendedJobs"
import useIsMobile from "components/custom-hook/useIsMobile"
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
   hasFilters: boolean
   searchResultsCount: number
   showDefaultJobs: boolean
   showResultJobs: boolean
   showOtherJobs: boolean
   isValidating: boolean
   nextPage: () => void
   hasMore: boolean
   context: CustomJobApplicationSource
   jobDetailsDialogOpen: boolean
   jobNotFound: boolean
   setJobDetailsDialogOpen: (open: boolean) => void
   selectedLocationsNames: string[]
   userCountryCode?: string
   recommendedJobs: CustomJob[]
   isLoadingRecommendedJobs: boolean
}

const JobsOverviewContext = createContext<JobsOverviewContextType | undefined>(
   undefined
)

type JobsOverviewContextProviderType = {
   serverCustomJobs?: CustomJob[]
   serverJob?: CustomJob
   children: ReactNode
   dialogOpen?: boolean
   locationNames?: string[]
   numberOfJobs?: number
   userCountryCode?: string
}

export type SearchParams = {
   location?: string[]
   term?: string
   businessFunctionTags?: string[]
   jobTypes?: string[]
   jobId?: string
}

export const JobsOverviewContextProvider = ({
   children,
   serverCustomJobs,
   serverJob,
   dialogOpen,
   locationNames,
   numberOfJobs,
   userCountryCode,
}: JobsOverviewContextProviderType) => {
   const { authenticatedUser } = useAuth()
   const router = useRouter()
   const [isFirstRender, setIsFirstRender] = useState(true)
   const searchParams = getSearchParams(router.query)
   const isMobile = useIsMobile()
   const [isJobDetailsDialogOpen, setIsJobDetailsDialogOpen] =
      useState(dialogOpen)
   const [searchTerm, setSearchTerm] = useState(searchParams.term)
   const [jobNotFound, setJobNotFound] = useState(
      searchParams.jobId && !serverJob
   )
   const [selectedLocationsNames, setSelectedLocationsNames] = useState<
      string[]
   >(locationNames ?? [])

   const { data: locationsData } = useLocationSearch(null, {
      initialLocationIds: searchParams.location,
      limit: 15,
      suspense: false,
   })

   const [selectedJob, setSelectedJob] = useState<CustomJob>(serverJob)

   const filterOptions = useMemo<FilterOptions>(
      () => ({
         arrayFilters: {
            normalizedLocationIds: searchParams.location,
            businessFunctionsTagIds: searchParams.businessFunctionTags,
            normalizedJobType: searchParams.jobTypes,
         },
         booleanFilters: {
            deleted: false,
            published: true,
            isPermanentlyExpired: false,
         },
      }),
      [
         searchParams.businessFunctionTags,
         searchParams.jobTypes,
         searchParams.location,
      ]
   )

   const hasFilters = Boolean(
      searchParams?.location?.length ||
         searchParams?.businessFunctionTags?.length ||
         searchParams?.jobTypes?.length ||
         searchParams?.term?.length
   )

   const { data, isValidating, setSize } = useCustomJobSearchAlgolia(
      searchParams.term,
      {
         filterOptions,
         targetReplica: CUSTOM_JOB_REPLICAS.DEADLINE_ASC,
         itemsPerPage: 10,
         initialData: serverCustomJobs,
      }
   )

   const { data: recommendedJobs, isLoading: isLoadingRecommendedJobs } =
      useUserRecommendedJobs({
         userAuthId: authenticatedUser?.uid,
         limit: 30,
         countryCode: userCountryCode,
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
               setIsJobDetailsDialogOpen(true)
               setJobNotFound(false)
               return
            }
            setJobNotFound(true)
         }

         setIsJobDetailsDialogOpen(false)
         setSelectedJob(undefined)
         setJobNotFound(Boolean(jobId?.length))
      },
      [setSelectedJob, setIsJobDetailsDialogOpen]
   )

   const handleSelectedJobChange = useCallback(
      (job: CustomJob | undefined) => {
         handleQueryChange(router, "jobId", job?.id)
      },
      [router]
   )

   const handleFilterChange = useCallback(
      (param: keyof SearchParams, value: string | string[]) => {
         const query = { ...router.query }
         if (!isFirstRender) {
            delete query.jobId
         }
         if (
            value &&
            (Array.isArray(value) ? value.length > 0 : value !== "")
         ) {
            query[param] = value
         } else {
            delete query[param]
         }

         router
            .push(
               {
                  pathname: router.pathname,
                  query: query,
               },
               undefined,
               { shallow: true }
            )
            .then(() => {
               setIsFirstRender(false)
            })
      },
      [router, isFirstRender]
   )

   const handleLocationChange = useCallback(
      (locations: string[]) => handleFilterChange("location", locations),
      [handleFilterChange]
   )

   const handleBusinessFunctionTagsChange = useCallback(
      (businessFunctionTags: string[]) =>
         handleFilterChange("businessFunctionTags", businessFunctionTags),
      [handleFilterChange]
   )

   const handleJobTypesChange = useCallback(
      (jobTypes: string[]) => handleFilterChange("jobTypes", jobTypes),
      [handleFilterChange]
   )

   useDebounce(() => handleFilterChange("term", searchTerm), 300, [searchTerm])

   const value: JobsOverviewContextType = useMemo(() => {
      const searchResultsCount = hasFilters
         ? data?.at(0)?.nbHits ?? 0
         : numberOfJobs ?? 0

      const nextPage = () => {
         if (searchResultsCount > infiniteJobs?.length) {
            setSize((prevSize) => prevSize + 1)
         }

         return Promise.resolve()
      }

      const hasMore = searchResultsCount > infiniteJobs?.length

      const effectiveJob =
         selectedJob ||
         (hasFilters ? infiniteJobs?.at(0) : recommendedJobs?.at(0)) ||
         serverJob

      return {
         selectedJob: effectiveJob,
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
         hasFilters,
         searchResultsCount,
         showDefaultJobs: !hasFilters,
         showResultJobs: hasFilters && searchResultsCount > 0,
         showOtherJobs: hasFilters && searchResultsCount === 0,
         isValidating,
         nextPage,
         hasMore,
         context: {
            source: CustomJobApplicationSourceTypes.JobSection,
            // Could be changed
            id: searchParams.jobId || selectedJob?.id || "jobSection",
         },
         jobDetailsDialogOpen:
            isJobDetailsDialogOpen && isMobile && Boolean(selectedJob),
         jobNotFound,
         setJobDetailsDialogOpen: setIsJobDetailsDialogOpen,
         selectedLocationsNames,
         userCountryCode,
         recommendedJobs,
         isLoadingRecommendedJobs,
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
      data,
      isValidating,
      setSize,
      isJobDetailsDialogOpen,
      setIsJobDetailsDialogOpen,
      isMobile,
      jobNotFound,
      selectedLocationsNames,
      numberOfJobs,
      userCountryCode,
      recommendedJobs,
      isLoadingRecommendedJobs,
      hasFilters,
      serverJob,
   ])

   useEffect(() => {
      handleJobIdChange(router.query.jobId as string)
   }, [router.query.jobId, handleJobIdChange, serverJob, isMobile])

   useEffect(() => {
      setSelectedLocationsNames(
         locationsData?.map((location) => location.name) ?? []
      )
   }, [locationsData])

   return (
      <JobsOverviewContext.Provider value={value}>
         {children}
      </JobsOverviewContext.Provider>
   )
}

const handleQueryChange = (
   router: NextRouter,
   param: keyof SearchParams,
   value: string | string[]
) => {
   const query = { ...router.query }

   if (value) {
      query[param] = value
   } else {
      delete query[param]
   }

   router.push(
      {
         pathname: router.pathname,
         query: query,
      },
      undefined,
      { shallow: true }
   )
}

const getSearchParams = (query: ParsedUrlQuery): SearchParams => {
   const term = (query.term as string) || ""
   const jobId = (query.jobId as string) || ""

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
      jobId,
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
