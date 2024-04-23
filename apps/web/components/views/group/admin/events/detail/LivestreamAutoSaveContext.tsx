import { ReactNode, createContext, useContext, useMemo } from "react"
import { useAutoSave } from "./form/useAutoSave"

type LivestreamAutoSaveContextType = {
   isAutoSaving: boolean
}

const LivestreamAutoSaveContext = createContext<
   LivestreamAutoSaveContextType | undefined
>(undefined)

type LivestreamAutoSaveContextProviderType = {
   children: ReactNode
}

export const LivestreamAutoSaveContextProvider = ({
   children,
}: LivestreamAutoSaveContextProviderType) => {
   const { isAutoSaving } = useAutoSave()

   const value = useMemo(() => ({ isAutoSaving }), [isAutoSaving])

   return (
      <LivestreamAutoSaveContext.Provider value={value}>
         {children}
      </LivestreamAutoSaveContext.Provider>
   )
}

export const useLivestreamAutoSaveContext = () => {
   const context = useContext(LivestreamAutoSaveContext)

   if (!context) {
      throw new Error(
         "useLivestreamAutoSaveContext must be used within a LivestreamAutoSaveContextProvider"
      )
   }

   return context
}
