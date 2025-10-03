import { OfflineEvent } from "@careerfairy/shared-lib/offline-events/offline-events"
import { ReactNode, createContext, useContext, useMemo } from "react"

type OfflineEventPreviewContextProviderProps = {
   offlineEvent: Partial<OfflineEvent>
   children: ReactNode
}

type OfflineEventPreviewContextProps = {
   offlineEvent: Partial<OfflineEvent>
}

export const OfflineEventPreviewContext = createContext<
   OfflineEventPreviewContextProps | undefined
>(undefined)

export const OfflineEventPreviewContextProvider = ({
   offlineEvent,
   children,
}: OfflineEventPreviewContextProviderProps) => {
   const value = useMemo(() => {
      return {
         offlineEvent,
      }
   }, [offlineEvent])

   return (
      <OfflineEventPreviewContext.Provider value={value}>
         {children}
      </OfflineEventPreviewContext.Provider>
   )
}

export const useOfflineEventPreviewContext = () => {
   const context = useContext(OfflineEventPreviewContext)
   if (context === undefined) {
      throw new Error(
         "useOfflineEventPreviewContext must be used within an OfflineEventPreviewContextProvider"
      )
   }
   return context
}
