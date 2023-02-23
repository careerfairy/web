import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { livestreamRepo } from "data/RepositoryInstances"
import { useGroup } from "layouts/GroupDashboardLayout"
import { createContext, useContext, useEffect, useState } from "react"
import { errorLogAndNotify } from "util/CommonUtil"
import MainPageContent from "."

type IMainPageContext = {
   /**
    * Loading status:
    *  undefined => still loading
    *  null => non existent
    */
   nextLivestream: LivestreamEvent | null | undefined
   pastLivestream: LivestreamEvent | null | undefined
}

const initialValues: IMainPageContext = {
   nextLivestream: undefined,
   pastLivestream: undefined,
}

const MainPageContext = createContext<IMainPageContext>(initialValues)

export const MainPageProvider = ({ children }) => {
   const { group } = useGroup()
   const data = useFetchData(group.id)

   return (
      <MainPageContext.Provider value={data}>
         {children}
      </MainPageContext.Provider>
   )
}

const useFetchData = (groupId: string) => {
   const [results, setResults] =
      useState<Pick<IMainPageContext, "nextLivestream" | "pastLivestream">>(
         initialValues
      )

   useEffect(() => {
      let mounted = true

      // Old date so that we can fetch all the past livestreams
      const fromDate = new Date()
      fromDate.setFullYear(fromDate.getFullYear() - 10)

      const promises = {
         nextLivestream: livestreamRepo.getFutureLivestreams(groupId, 1),
         pastLivestream: livestreamRepo.getPastEventsFrom({
            fromDate,
            filterByGroupId: groupId,
            limit: 1,
            showHidden: true,
         }),
      }

      function update(key: string, value: LivestreamEvent | null) {
         if (mounted) {
            setResults((prev) => ({
               ...prev,
               [key]: value,
            }))
         }
      }

      for (const key in promises) {
         promises[key]
            .then((result: LivestreamEvent[]) => {
               if (result?.length > 0) {
                  update(key, result[0])
               } else {
                  update(key, null)
               }
            })
            .catch((e: Error) => {
               errorLogAndNotify(e)
               update(key, null)
            })
      }

      return () => {
         mounted = false
      }
   }, [groupId])

   return results
}

export const useMainPageContext = () => {
   const context = useContext(MainPageContext)
   if (context === undefined) {
      throw new Error(
         "useMainPageContext must be used within a MainPageContextProvider"
      )
   }
   return context
}
