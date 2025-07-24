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
export enum LivestreamStatsSortOption {
   /** Most recent first (default) */
   START_DESC,
   /** Oldest first */
   START_ASC,
   /** Title A-Z */
   TITLE_ASC,
   /** Title Z-A */
   TITLE_DESC,
   /** Most registrations first */
   REGISTRATIONS_DESC,
   /** Least registrations first */
   REGISTRATIONS_ASC,
   /** Most participants first */
   PARTICIPANTS_DESC,
   /** Least participants first */
   PARTICIPANTS_ASC,
}

interface UseGroupLivestreamsWithStatsOptions {
   /** Sort results by */
   sortBy?: LivestreamStatsSortOption
   /** Search term to filter by */
   searchTerm?: string
}

/**
 * Fetches and processes livestream stats for a group with optional filtering and sorting.
 *
 * This hook performs the following operations:
 * 1. Fetches published livestream stats using a collection group query on "stats" documents
 * 2. Fetches draft livestreams from the "draftLivestreams" collection
 * 3. Transforms draft livestreams into stats format with empty statistics
 * 4. Combines published and draft data into a unified array
 * 5. Applies client-side search filtering by title or company name
 * 6. Sorts the results on the client side according to the specified criteria
 *
 * The hook handles both published livestreams (with real stats) and draft livestreams
 * (with mock stats) to provide a complete view of all livestreams associated with the group.
 *
 * @param groupId - The ID of the group to fetch livestreams for
 * @param options - Configuration options for filtering and sorting
 * @returns SWR response with processed LiveStreamStats array containing both published and draft livestreams
 */
export const useGroupLivestreamsWithStats = (
   groupId: string,
   options: UseGroupLivestreamsWithStatsOptions = {}
) => {
   const { sortBy = LivestreamStatsSortOption.START_DESC, searchTerm = "" } =
      options
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

               // Create empty stats for draft livestreams
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
         return publishedStats.concat(draftStats)
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

// --- Helpers ---

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
         case LivestreamStatsSortOption.START_ASC: {
            const aStartAsc = a.livestream.start?.toDate?.() || new Date(0)
            const bStartAsc = b.livestream.start?.toDate?.() || new Date(0)
            return aStartAsc.getTime() - bStartAsc.getTime()
         }

         case LivestreamStatsSortOption.START_DESC:
         default: {
            const aStartDesc = a.livestream.start?.toDate?.() || new Date(0)
            const bStartDesc = b.livestream.start?.toDate?.() || new Date(0)
            return bStartDesc.getTime() - aStartDesc.getTime()
         }

         case LivestreamStatsSortOption.TITLE_ASC: {
            const aTitleAsc = a.livestream.title || ""
            const bTitleAsc = b.livestream.title || ""
            return aTitleAsc.localeCompare(bTitleAsc)
         }

         case LivestreamStatsSortOption.TITLE_DESC: {
            const aTitleDesc = a.livestream.title || ""
            const bTitleDesc = b.livestream.title || ""
            return bTitleDesc.localeCompare(aTitleDesc)
         }

         case LivestreamStatsSortOption.REGISTRATIONS_DESC:
            return (
               b.generalStats.numberOfRegistrations -
               a.generalStats.numberOfRegistrations
            )

         case LivestreamStatsSortOption.REGISTRATIONS_ASC:
            return (
               a.generalStats.numberOfRegistrations -
               b.generalStats.numberOfRegistrations
            )

         case LivestreamStatsSortOption.PARTICIPANTS_DESC:
            return (
               b.generalStats.numberOfParticipants -
               a.generalStats.numberOfParticipants
            )

         case LivestreamStatsSortOption.PARTICIPANTS_ASC:
            return (
               a.generalStats.numberOfParticipants -
               b.generalStats.numberOfParticipants
            )
      }
   })
}
