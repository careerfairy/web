import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { useAppDispatch } from "components/custom-hook/store"
import { useAuth } from "HOCs/AuthProvider"
import { useRouter } from "next/router"
import {
   ReactNode,
   createContext,
   useCallback,
   useContext,
   useMemo,
   useState,
} from "react"
import { trackLevelsJobClick } from "store/reducers/talentGuideReducer"

export type JobsBlockContextType = {
   selectedJob: CustomJob
   handleCloseJobDialog: () => void
   handleJobCardClick: (job: CustomJob) => void
   selectedJobAreasIds: string[]
   handleSelectJobArea: (areaId: string) => void
   selectedJobTypesIds: string[]
   handleSelectJobType: (typeId: string) => void
   blockId: string
}

const JobsBlockContext = createContext<JobsBlockContextType | undefined>(
   undefined
)

type JobsBlockProviderProps = {
   children: ReactNode
   blockId: string
}

export const JobsBlockProvider = ({
   children,
   blockId,
}: JobsBlockProviderProps) => {
   const { userData } = useAuth()
   const dispatch = useAppDispatch()
   const router = useRouter()
   const userBusinessFunctions = userData?.businessFunctionsTagIds || []

   const [selectedJobAreasIds, setSelectedJobAreasIds] = useState<string[]>(
      userBusinessFunctions || []
   )
   const [selectedJobTypesIds, setSelectedJobTypesIds] = useState<string[]>([])

   const [selectedJob, setSelectedJob] = useState<CustomJob>(null)

   const handleJobCardClick = useCallback(
      (job: CustomJob) => {
         setSelectedJob(job)
         void router.push(
            {
               pathname: router.pathname,
               query: {
                  ...router.query,
                  jobId: job.id,
               },
            },
            undefined,
            {
               scroll: false,
               shallow: true,
            }
         )

         dispatch(
            trackLevelsJobClick({
               jobId: job.id,
               jobName: job.title,
            })
         )
      },
      [router, dispatch]
   )

   const handleCloseJobDialog = useCallback(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { jobId, ...restOfQuery } = router.query
      void router.push(
         {
            pathname: router.pathname,
            query: restOfQuery,
         },
         undefined,
         {
            scroll: false,
            shallow: true,
         }
      )

      setSelectedJob(null)
   }, [router])

   const handleSelectJobArea = useCallback(
      (areaId: string) => {
         if (selectedJobAreasIds.includes(areaId)) {
            const newSelected = selectedJobAreasIds.filter(
               (businessFunctionId) => businessFunctionId != areaId
            )
            setSelectedJobAreasIds(newSelected)
         } else {
            setSelectedJobAreasIds([...selectedJobAreasIds, areaId])
         }
      },
      [selectedJobAreasIds]
   )

   const handleSelectJobType = useCallback(
      (typeId: string) => {
         if (selectedJobTypesIds.includes(typeId)) {
            const newSelected = selectedJobTypesIds.filter(
               (jobTypeId) => jobTypeId != typeId
            )
            setSelectedJobTypesIds(newSelected)
         } else {
            setSelectedJobTypesIds([...selectedJobTypesIds, typeId])
         }
      },
      [selectedJobTypesIds]
   )

   const contextValue = useMemo(
      () => ({
         selectedJob,
         handleCloseJobDialog,
         handleJobCardClick,
         selectedJobAreasIds,
         handleSelectJobArea,
         selectedJobTypesIds,
         handleSelectJobType,
         blockId,
      }),
      [
         selectedJob,
         handleCloseJobDialog,
         handleJobCardClick,
         selectedJobAreasIds,
         handleSelectJobArea,
         selectedJobTypesIds,
         handleSelectJobType,
         blockId,
      ]
   )

   return (
      <JobsBlockContext.Provider value={contextValue}>
         {children}
      </JobsBlockContext.Provider>
   )
}

export const useJobsBlock = () => {
   const context = useContext(JobsBlockContext)
   return context
}
