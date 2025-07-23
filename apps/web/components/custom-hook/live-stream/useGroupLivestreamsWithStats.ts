import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import {
   LivestreamEvent,
   pickPublicDataFromLivestream,
} from "@careerfairy/shared-lib/livestreams"
import {
   LiveStreamStats,
   createLiveStreamStatsDoc,
} from "@careerfairy/shared-lib/livestreams/stats"
import { reducedRemoteCallsOptions } from "components/custom-hook/utils/useFunctionsSWRFetcher"
import {
   collection,
   collectionGroup,
   getDocs,
   query,
   where,
} from "firebase/firestore"
import { useMemo } from "react"
import { useFirestore } from "reactfire"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"

/**
 * Sort options for livestream stats
 */
export type LivestreamStatsSortOption =
   | "start-desc" // Most recent first (default)
   | "start-asc" // Oldest first
   | "title-asc" // Title A-Z
   | "title-desc" // Title Z-A
   | "registrations-desc" // Most registrations first
   | "registrations-asc" // Least registrations first
   | "participants-desc" // Most participants first
   | "participants-asc" // Least participants first

interface UseGroupLivestreamsWithStatsOptions {
   sortBy?: LivestreamStatsSortOption
   searchTerm?: string
}

const filterStatsBySearchTerm = (
   stats: LiveStreamStats[],
   searchTerm: string
): LiveStreamStats[] => {
   if (!searchTerm.trim()) return stats

   const normalizedSearchTerm = searchTerm.toLowerCase().trim()

   return stats.filter((stat) => {
      const title = stat.livestream.title?.toLowerCase() || ""
      const company = stat.livestream.company?.toLowerCase() || ""

      return (
         title.includes(normalizedSearchTerm) ||
         company.includes(normalizedSearchTerm)
      )
   })
}

const sortStatsArray = (
   stats: LiveStreamStats[],
   sortBy: LivestreamStatsSortOption
): LiveStreamStats[] => {
   return [...stats].sort((a, b) => {
      switch (sortBy) {
         case "start-asc": {
            const aStartAsc = a.livestream.start?.toDate?.() || new Date(0)
            const bStartAsc = b.livestream.start?.toDate?.() || new Date(0)
            return aStartAsc.getTime() - bStartAsc.getTime()
         }

         case "start-desc":
         default: {
            const aStartDesc = a.livestream.start?.toDate?.() || new Date(0)
            const bStartDesc = b.livestream.start?.toDate?.() || new Date(0)
            return bStartDesc.getTime() - aStartDesc.getTime()
         }

         case "title-asc": {
            const aTitleAsc = a.livestream.title || ""
            const bTitleAsc = b.livestream.title || ""
            return aTitleAsc.localeCompare(bTitleAsc)
         }

         case "title-desc": {
            const aTitleDesc = a.livestream.title || ""
            const bTitleDesc = b.livestream.title || ""
            return bTitleDesc.localeCompare(aTitleDesc)
         }

         case "registrations-desc":
            return (
               b.generalStats.numberOfRegistrations -
               a.generalStats.numberOfRegistrations
            )

         case "registrations-asc":
            return (
               a.generalStats.numberOfRegistrations -
               b.generalStats.numberOfRegistrations
            )

         case "participants-desc":
            return (
               b.generalStats.numberOfParticipants -
               a.generalStats.numberOfParticipants
            )

         case "participants-asc":
            return (
               a.generalStats.numberOfParticipants -
               b.generalStats.numberOfParticipants
            )
      }
   })
}

/**
 * Fetches and processes livestream stats for a group with optional filtering and sorting.
 *
 * @param groupId - The ID of the group to fetch livestreams for
 * @param options - Configuration options:
 *    - sortBy: The sorting criteria. Supported values:
 *      - "start-desc": Sort by start date descending (most recent first)
 *      - "start-asc": Sort by start date ascending (oldest first)
 *      - "title-asc": Sort by livestream title A-Z
 *      - "title-desc": Sort by livestream title Z-A
 *      - "registrations-desc": Sort by number of registrations descending
 *      - "registrations-asc": Sort by number of registrations ascending
 *      - "participants-desc": Sort by number of participants descending
 *      - "participants-asc": Sort by number of participants ascending
 *    - searchTerm: Optional text to filter livestreams by title or company name
 * @returns SWR response with processed LiveStreamStats array
 */
export const useGroupLivestreamsWithStats = (
   groupId: string,
   options: UseGroupLivestreamsWithStatsOptions = {}
) => {
   const { sortBy = "start-desc", searchTerm = "" } = options
   const firestore = useFirestore()

   const fetchGroupLivestreamsWithStats = async (): Promise<
      LiveStreamStats[]
   > => {
      if (!groupId) return []

      try {
         // Fetch published livestream stats using collection group query
         const statsQuery = query(
            collectionGroup(firestore, "stats"),
            where("id", "==", "livestreamStats"),
            where("livestream.groupIds", "array-contains", groupId)
         ).withConverter(createGenericConverter<LiveStreamStats>())

         const statsSnapshot = await getDocs(statsQuery)
         const publishedStats: LiveStreamStats[] = statsSnapshot.docs.map(
            (doc) => ({
               ...doc.data(),
               livestream: {
                  ...doc.data().livestream,
                  isDraft: false,
               },
            })
         )

         // Fetch draft livestreams
         const draftsQuery = query(
            collection(firestore, "draftLivestreams"),
            where("groupIds", "array-contains", groupId)
         ).withConverter(createGenericConverter<LivestreamEvent>())

         const draftsSnapshot = await getDocs(draftsQuery)

         // Transform drafts into stats format
         const draftStats: LiveStreamStats[] = draftsSnapshot.docs.map(
            (doc) => {
               const livestreamData = doc.data()

               // Create mock stats for draft
               const mockStats = createLiveStreamStatsDoc(
                  livestreamData,
                  doc.id
               )

               return {
                  ...mockStats,
                  livestream: {
                     ...pickPublicDataFromLivestream(livestreamData),
                     isDraft: true,
                  },
               }
            }
         )

         // Combine all stats
         return [...publishedStats, ...draftStats]
      } catch (error) {
         console.error("Error fetching group livestreams with stats:", error)
         throw error
      }
   }

   const { data, isLoading, error } = useSWR<LiveStreamStats[]>(
      groupId ? `group-livestreams-with-stats-${groupId}` : null,
      fetchGroupLivestreamsWithStats,
      {
         ...reducedRemoteCallsOptions,
         onError: (error) => {
            errorLogAndNotify(error, {
               title: "Error fetching group livestreams with stats",
               details: { groupId },
            })
         },
      }
   )

   const processedData = useMemo(() => {
      if (!data) return []

      // First filter by search term, then sort
      const filteredData = filterStatsBySearchTerm(data, searchTerm)
      return sortStatsArray(filteredData, sortBy)
   }, [data, searchTerm, sortBy])

   return {
      data: processedData,
      isLoading,
      error,
   }
}
