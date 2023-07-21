import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import useCollection, {
   CollectionResponse,
} from "components/custom-hook/useCollection"
import { livestreamRepo } from "data/RepositoryInstances"
import { useGroup } from "layouts/GroupDashboardLayout"
import { createContext, useContext, useMemo } from "react"

type ICompanyInformationContext = {
   /**
    * Loading status:
    *  undefined => still loading
    *  null => non existent
    */
   nextLivestream: LivestreamEvent | null | undefined
   pastLivestream: LivestreamEvent | null | undefined
   nextDraft: LivestreamEvent | null | undefined
}

const initialValues: ICompanyInformationContext = {
   nextLivestream: undefined,
   pastLivestream: undefined,
   nextDraft: undefined,
}

const CompanyInformationContext =
   createContext<ICompanyInformationContext>(initialValues)

export const CompanyInformationProvider = ({ children }) => {
   const { group } = useGroup()
   const data = useFetchData(group.id)

   return (
      <CompanyInformationContext.Provider value={data}>
         {children}
      </CompanyInformationContext.Provider>
   )
}

const useFetchData = (groupId: string) => {
   // fetch data & subscribe for realtime updates
   // when the user updates the next livestream / draft
   // we want to update the displayed data
   const drafts = useDrafts(groupId)
   const futureLivestreams = useFutureLivestreams(groupId)
   const pastLivestreams = usePastLivestreams(groupId)

   return useMemo(
      () => ({
         nextDraft: grabResult(drafts, (drafts) => {
            const futureDrafts = drafts.filter(
               (d) => d.start.toDate() > new Date()
            )

            // most recent future draft
            if (futureDrafts.length > 0) {
               return futureDrafts[0]
            }

            // past draft but is the more recent one
            return drafts[drafts.length - 1]
         }),
         nextLivestream: grabResult(futureLivestreams),
         pastLivestream: grabResult(pastLivestreams),
      }),
      [drafts, futureLivestreams, pastLivestreams]
   )
}

function grabResult<T = unknown>(
   response: CollectionResponse<T>,
   pickerFn: (data: T[]) => T = (data) => data[0]
) {
   if (response.isLoading) {
      return undefined
   }

   if (response.error) {
      return null
   }

   if (response.data.length > 0) {
      return pickerFn(response.data)
   }

   return null
}

const useDrafts = (groupId: string) => {
   const query = useMemo(() => {
      return livestreamRepo.getGroupDraftLivestreamsQuery(groupId)
   }, [groupId])

   return useCollection<LivestreamEvent>(query, true)
}

const useFutureLivestreams = (groupId: string) => {
   const query = useMemo(() => {
      // let's keep showing the next livestream until 5min after it starts
      // so late streamers can still see it and navigate to it
      const date5MinAgo = new Date()
      date5MinAgo.setMinutes(date5MinAgo.getMinutes() - 5)

      return livestreamRepo.getFutureLivestreamsQuery(groupId, 1, date5MinAgo)
   }, [groupId])

   return useCollection<LivestreamEvent>(query, true)
}

const usePastLivestreams = (groupId: string) => {
   const query = useMemo(() => {
      // Old date so that we can fetch all the past livestreams
      const fromDate = new Date()
      fromDate.setFullYear(fromDate.getFullYear() - 10)

      return livestreamRepo.getPastEventsFromQuery({
         fromDate,
         filterByGroupId: groupId,
         limit: 1,
         showHidden: true,
      })
   }, [groupId])

   return useCollection<LivestreamEvent>(query, true)
}

export const useCompanyInformationContext = () => {
   const context = useContext(CompanyInformationContext)
   if (context === undefined) {
      throw new Error(
         "useCompanyInformationContext must be used within a CompanyInformationContextProvider"
      )
   }
   return context
}
