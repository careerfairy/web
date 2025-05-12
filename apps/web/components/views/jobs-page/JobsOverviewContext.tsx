import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import useCustomJobs from "components/custom-hook/custom-job/useCustomJobs"
import { customJobRepo } from "data/RepositoryInstances"
import { useRouter } from "next/router"
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

type JobsOverviewContextType = {
   selectedJob: CustomJob | undefined
   setSelectedJob: (job: CustomJob) => void
   customJobs: CustomJob[]
   searchParams: SearchParams
}

const JobsOverviewContext = createContext<JobsOverviewContextType | undefined>(
   undefined
)

type JobsOverviewContextProviderType = {
   children: ReactNode
}

export type SearchParams = {
   location?: string[]
   term?: string
}

export const JobsOverviewContextProvider = ({
   children,
}: JobsOverviewContextProviderType) => {
   const router = useRouter()
   const searchParams = getSearchParams(router.query)
   const [selectedJob, setSelectedJob] = useState<CustomJob | undefined>(
      undefined
   )

   // TODO: Replace with Algolia search
   const { customJobs } = useCustomJobs({
      totalItems: 15,
      businessFunctionTagIds: [],
      jobTypesIds: [],
      ignoreIds: [],
   })

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
      (job: CustomJob) => {
         router.push(
            {
               pathname: router.pathname,
               query: {
                  ...(searchParams.location && {
                     location: searchParams.location,
                  }),
                  ...(searchParams.term && { term: searchParams.term }),
                  jobId: job.id,
               },
            },
            undefined,
            { shallow: true }
         )
      },
      [router, searchParams]
   )

   // TODO: Add additional state to the context
   const value: JobsOverviewContextType = useMemo(() => {
      return {
         selectedJob: selectedJob,
         setSelectedJob: handleSelectedJobChange,
         customJobs,
         searchParams,
      }
   }, [customJobs, searchParams, selectedJob, handleSelectedJobChange])

   useEffect(() => {
      handleJobIdChange(router.query.jobId as string)
   }, [router.query.jobId, handleJobIdChange])

   return (
      <JobsOverviewContext.Provider value={value}>
         {children}
      </JobsOverviewContext.Provider>
   )
}

const getSearchParams = (query: ParsedUrlQuery): SearchParams => {
   const searchParamLocations: string[] = []
   const term = query.term as string

   if (query.location) {
      if (Array.isArray(query.location)) {
         searchParamLocations.push(...query.location)
      } else {
         searchParamLocations.push(query.location as string)
      }
   }

   return {
      location: searchParamLocations,
      term: term,
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
