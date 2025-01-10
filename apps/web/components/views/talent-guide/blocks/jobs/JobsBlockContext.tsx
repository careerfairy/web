import { useAuth } from "HOCs/AuthProvider"
import {
   ReactNode,
   createContext,
   useCallback,
   useContext,
   useMemo,
   useState,
} from "react"

type JobsBlockContextType = {
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
   const userBusinessFunctions = userData?.businessFunctionsTagIds || []

   const [selectedJobAreasIds, setSelectedJobAreasIds] = useState<string[]>(
      userBusinessFunctions || []
   )
   const [selectedJobTypesIds, setSelectedJobTypesIds] = useState<string[]>([])

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
         selectedJobAreasIds,
         handleSelectJobArea,
         selectedJobTypesIds,
         handleSelectJobType,
         blockId,
      }),
      [
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
   if (context === undefined) {
      throw new Error("useJobsBlock must be used within a JobsBlockProvider")
   }
   return context
}
