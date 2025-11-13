import { ReactNode, createContext, useContext, useMemo } from "react"
import { useRecordingAutoSave } from "./useRecordingAutoSave"

type RecordingAutoSaveContextType = {
   isAutoSaving: boolean
}

const RecordingAutoSaveContext = createContext<
   RecordingAutoSaveContextType | undefined
>(undefined)

type RecordingAutoSaveContextProviderType = {
   children: ReactNode
}

export const RecordingAutoSaveContextProvider = ({
   children,
}: RecordingAutoSaveContextProviderType) => {
   const { isAutoSaving } = useRecordingAutoSave()

   const value = useMemo(() => ({ isAutoSaving }), [isAutoSaving])

   return (
      <RecordingAutoSaveContext.Provider value={value}>
         {children}
      </RecordingAutoSaveContext.Provider>
   )
}

export const useRecordingAutoSaveContext = () => {
   const context = useContext(RecordingAutoSaveContext)

   if (!context) {
      throw new Error(
         "useRecordingAutoSaveContext must be used within a RecordingAutoSaveContextProvider"
      )
   }

   return context
}
