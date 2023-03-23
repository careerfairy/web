import React, {
   createContext,
   Dispatch,
   SetStateAction,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { FieldOfStudy } from "@careerfairy/shared-lib/fieldOfStudy"
import { useFirestoreCollection } from "../../../../../custom-hook/utils/useFirestoreCollection"
import { createLookup } from "@careerfairy/shared-lib/utils"
import { useRouter } from "next/router"
import { useGroup } from "../../../../../../layouts/GroupDashboardLayout"
import { collectionGroup, query, where } from "firebase/firestore"
import { FirestoreInstance } from "../../../../../../data/firebase/FirebaseInstance"
import { limit } from "@firebase/firestore"

export const userTypes = [
   { value: "registrations", label: "Registrations" },
   { value: "participants", label: "Participants" },
] as const

type UserType = typeof userTypes[number]["value"]

type ILivestreamAnalyticsPageContext = {
   /**
    * Loading status:
    *  undefined => still loading
    *  null => no data
    */
   currentStreamStats: LiveStreamStats | undefined | null
   userType: UserType
   setUserType: Dispatch<SetStateAction<UserType>>
   fieldsOfStudyLookup: Record<string, string>
   setCurrentStreamStats: Dispatch<
      SetStateAction<ILivestreamAnalyticsPageContext["currentStreamStats"]>
   >
}

const initialUserType: ILivestreamAnalyticsPageContext["userType"] =
   "registrations"

const initialValues: ILivestreamAnalyticsPageContext = {
   currentStreamStats: undefined,
   userType: initialUserType,
   fieldsOfStudyLookup: {},
   setCurrentStreamStats: () => {},
   setUserType: () => {},
}

const LivestreamAnalyticsPageContext =
   createContext<ILivestreamAnalyticsPageContext>(initialValues)

export const LivestreamAnalyticsPageProvider = ({ children }) => {
   const router = useRouter()
   const livestreamId = router.query.livestreamId?.[0] as string

   const [currentStreamStats, setCurrentStreamStats] =
      useState<ILivestreamAnalyticsPageContext["currentStreamStats"]>(undefined)

   const [userType, setUserType] = useState<UserType>(initialUserType)

   const { data: fieldsOfStudy } = useFirestoreCollection<FieldOfStudy>(
      "fieldsOfStudy",
      queryOptions
   )

   const fieldsOfStudyLookup = useMemo(
      () => createLookup(fieldsOfStudy, "name"),
      [fieldsOfStudy]
   )

   const value = useMemo<ILivestreamAnalyticsPageContext>(() => {
      return {
         fieldsOfStudyLookup,
         currentStreamStats: livestreamId ? currentStreamStats : undefined,
         userType,
         setCurrentStreamStats,
         setUserType,
      }
   }, [currentStreamStats, fieldsOfStudyLookup, livestreamId, userType])

   return (
      <LivestreamAnalyticsPageContext.Provider value={value}>
         {livestreamId ? (
            <QueryLivestreamStats livestreamId={livestreamId} />
         ) : null}
         {children}
      </LivestreamAnalyticsPageContext.Provider>
   )
}

export const useLivestreamsAnalyticsPageContext = () => {
   const context = useContext(LivestreamAnalyticsPageContext)
   if (context === undefined) {
      throw new Error(
         "useLivestreamsAnalyticsPageContext must be used within a LivestreamAnalyticsPageContextProvider"
      )
   }
   return context
}

const QueryLivestreamStats = ({ livestreamId }: { livestreamId: string }) => {
   const { setCurrentStreamStats } = useLivestreamsAnalyticsPageContext()
   const { group } = useGroup()

   const livestreamStatsQuery = useMemo(() => {
      return query(
         collectionGroup(FirestoreInstance, "stats"),
         where("id", "==", "livestreamStats"),
         where("livestream.groupIds", "array-contains", group.id),
         where("livestream.id", "==", livestreamId),
         limit(1)
      )
   }, [group.id, livestreamId])

   /**
    * We only want to fetch the livestream stats in the livestream analytics page and
    *
    * */
   const { status, data: stats } = useFirestoreCollection<LiveStreamStats>(
      livestreamStatsQuery,
      {
         idField: "id",
         suspense: false,
      }
   )

   const isLoaded = status === "success"
   const isEmpty = isLoaded && stats.length === 0
   const isLoading = status === "loading"

   useEffect(() => {
      if (isEmpty) {
         setCurrentStreamStats(undefined)
         return
      }

      if (isLoading) {
         setCurrentStreamStats(undefined)
         return
      }

      if (isLoaded) {
         setCurrentStreamStats(stats[0])
         return
      }

      setCurrentStreamStats(undefined)
   }, [isEmpty, isLoaded, isLoading, setCurrentStreamStats, stats])

   return null
}

const queryOptions = {
   idField: "id",
   suspense: false,
}
