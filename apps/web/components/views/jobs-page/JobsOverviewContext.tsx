import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { usePublishedCustomJobs } from "components/custom-hook/custom-job/usePublishedCustomJobs"
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
   serverCustomJobs?: CustomJob[]
   serverJob?: CustomJob
   children: ReactNode
}

export type SearchParams = {
   location?: string[]
   term?: string
}

export const JobsOverviewContextProvider = ({
   children,
   serverCustomJobs,
   serverJob,
}: JobsOverviewContextProviderType) => {
   const router = useRouter()
   const searchParams = getSearchParams(router.query)
   const [selectedJob, setSelectedJob] = useState<CustomJob>(serverJob)

   // TODO: Replace customJobs with Algolia search
   const { data: searchCustomJobs } = usePublishedCustomJobs({
      initialData: serverCustomJobs,
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
         customJobs: searchCustomJobs, // TODO: Replace with Algolia search, using the initial data from the server
         searchParams,
      }
   }, [searchCustomJobs, searchParams, selectedJob, handleSelectedJobChange])

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
