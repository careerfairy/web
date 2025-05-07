import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { ReactNode, createContext, useContext, useMemo, useState } from "react"

type JobsOverviewContextType = {
   selectedJob: CustomJob | undefined
   setSelectedJob: (job: CustomJob) => void
}

const JobsOverviewContext = createContext<JobsOverviewContextType | undefined>(
   undefined
)

type JobsOverviewContextProviderType = {
   children: ReactNode
   customJob?: CustomJob
}

export const JobsOverviewContextProvider = ({
   children,
   customJob,
}: JobsOverviewContextProviderType) => {
   const [selectedJob, setSelectedJob] = useState<CustomJob | undefined>(
      customJob
   )

   const value = useMemo(() => ({ selectedJob, setSelectedJob }), [selectedJob])

   return (
      <JobsOverviewContext.Provider value={value}>
         {children}
      </JobsOverviewContext.Provider>
   )
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
