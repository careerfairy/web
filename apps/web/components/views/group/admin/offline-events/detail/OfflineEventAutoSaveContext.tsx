import { ReactNode, createContext, useContext, useMemo } from "react"

type OfflineEventAutoSaveContextType = {
   isAutoSaving: boolean
}

const OfflineEventAutoSaveContext = createContext<
   OfflineEventAutoSaveContextType | undefined
>(undefined)

type OfflineEventAutoSaveContextProviderType = {
   children: ReactNode
}

export const OfflineEventAutoSaveContextProvider = ({
   children,
}: OfflineEventAutoSaveContextProviderType) => {
   // TODO: add auto save back in last stack
   // const { isAutoSaving } = useAutoSave()
   const isAutoSaving = false

   const value = useMemo(() => ({ isAutoSaving }), [isAutoSaving])

   return (
      <OfflineEventAutoSaveContext.Provider value={value}>
         {children}
      </OfflineEventAutoSaveContext.Provider>
   )
}

export const useOfflineEventAutoSaveContext = () => {
   const context = useContext(OfflineEventAutoSaveContext)

   if (!context) {
      throw new Error(
         "useOfflineEventAutoSaveContext must be used within an OfflineEventAutoSaveContextProvider"
      )
   }

   return context
}
