import { Timestamp } from "@careerfairy/shared-lib/firebaseTypes"
import {
   OfflineEvent,
   OfflineEventStats,
} from "@careerfairy/shared-lib/offline-events/offline-events"
import { reducedRemoteCallsOptions } from "components/custom-hook/utils/useFunctionsSWRFetcher"
import {
   OfflineEventStatus,
   getOfflineEventStatus,
} from "components/views/group/admin/offline-events/offline-events-table/utils"
import {
   collection,
   doc,
   getDoc,
   getDocs,
   query,
   where,
} from "firebase/firestore"
import { useMemo } from "react"
import { useFirestore } from "reactfire"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"

export interface OfflineEventsWithStats {
   offlineEvent: OfflineEvent
   stats: {
      totalClicks: number
      totalViews: number
   }
   updatedAt: Timestamp
}
/**
 * Sort options for offline event stats
 */
export enum OfflineEventStatsSortOption {
   /** Most recent first (default) */
   START_DESC,
   /** Oldest first */
   START_ASC,
   /** Title A-Z */
   TITLE_ASC,
   /** Title Z-A */
   TITLE_DESC,
   /** Most views first */
   VIEWS_DESC,
   /** Least views first */
   VIEWS_ASC,
   /** Most clicks first */
   CLICKS_DESC,
   /** Least clicks first */
   CLICKS_ASC,
   /** Status-based: upcoming, draft, past (with date as secondary sort) */
   STATUS_WITH_DATE,
}

export const getGroupOfflineEventsWithStatsKey = (groupId: string | null) =>
   groupId ? `group-offline-events-with-stats-${groupId}` : null

interface UseGroupOfflineEventsWithStatsOptions {
   /** Sort results by */
   sortBy?: OfflineEventStatsSortOption
   /** Search term to filter by */
   searchTerm?: string
   /** Status filter options */
   statusFilter?: OfflineEventStatus[]
}

/**
 * Fetches and processes offline event stats for a group with optional filtering and sorting.
 *
 * This hook performs the following operations:
 * 1. Fetches all offline events from the "offlineEvents" collection for the group
 * 2. For each offline event, fetches its corresponding stats document if it exists
 * 3. Creates default empty stats for events that don't have stats documents
 * 4. Combines all events with their stats into a unified array
 * 5. Applies client-side search filtering by title
 * 6. Sorts the results on the client side according to the specified criteria
 *
 * The hook handles both published and draft offline events, ensuring all events have stats
 * (either real stats from the stats collection or default empty stats).
 *
 * @param groupId - The ID of the group to fetch offline events for
 * @param options - Configuration options for filtering and sorting
 * @returns SWR response with processed OfflineEventsWithStats array containing all offline events with stats
 */
export const useGroupOfflineEventsWithStats = (
   groupId: string,
   options: UseGroupOfflineEventsWithStatsOptions = {}
) => {
   const {
      sortBy = OfflineEventStatsSortOption.STATUS_WITH_DATE,
      searchTerm = "",
      statusFilter = [],
   } = options

   const firestore = useFirestore()

   const fetchGroupOfflineEventsWithStats = async (): Promise<
      OfflineEventsWithStats[]
   > => {
      try {
         // Fetch all offline events for the group
         const offlineEventsQuery = query(
            collection(firestore, "offlineEvents"),
            where("group.id", "==", groupId)
         )

         const offlineEventsSnapshot = await getDocs(offlineEventsQuery)

         // Process each offline event to get its stats
         const offlineEventsWithStats: OfflineEventsWithStats[] = []

         for (const eventDoc of offlineEventsSnapshot.docs) {
            const offlineEventData = eventDoc.data() as OfflineEvent

            // Try to fetch stats for this offline event
            const statsDoc = doc(firestore, "offlineEventStats", eventDoc.id)

            const statsSnapshot = await getDoc(statsDoc)
            const statsData = statsSnapshot.data() as OfflineEventStats

            if (statsData) {
               // Stats exist, use the real stats

               offlineEventsWithStats.push({
                  offlineEvent: offlineEventData,
                  stats: {
                     totalClicks:
                        statsData.generalStats.totalNumberOfRegisterClicks,
                     totalViews:
                        statsData.generalStats.totalNumberOfTalentReached,
                  },
                  updatedAt: statsData.updatedAt,
               })
            } else {
               // No stats exist, create default empty stats
               offlineEventsWithStats.push({
                  offlineEvent: offlineEventData,
                  stats: {
                     totalClicks: 0,
                     totalViews: 0,
                  },
                  updatedAt: offlineEventData.updatedAt,
               })
            }
         }

         return offlineEventsWithStats
      } catch (error) {
         console.error("Error fetching group offline events with stats:", error)
         throw error
      }
   }

   const { data, isLoading, error } = useSWR<OfflineEventsWithStats[]>(
      getGroupOfflineEventsWithStatsKey(groupId),
      fetchGroupOfflineEventsWithStats,
      {
         ...reducedRemoteCallsOptions,
         onError: (error) => {
            errorLogAndNotify(error, {
               title: "Error fetching group offline events with stats",
               details: { groupId },
            })
         },
      }
   )

   const processedData = useMemo(() => {
      if (!data) return []

      // First filter by search term, then by status, then sort
      let filteredData = filterStatsBySearchTerm(data, searchTerm)
      filteredData = filterStatsByStatus(filteredData, statusFilter)
      console.log(
         "🚀 ~ useGroupOfflineEventsWithStats ~ filteredData:",
         filteredData
      )
      return sortStatsArray(filteredData, sortBy)
   }, [data, searchTerm, statusFilter, sortBy])

   return {
      data: processedData,
      isLoading,
      error,
   }
}

// --- Helpers ---

/**
 * Compares two offline events with stats by their start date
 * @param a First offline event with stats
 * @param b Second offline event with stats
 * @param ascending Whether to sort in ascending order (true) or descending order (false)
 * @returns Comparison result for sorting
 */
const compareByDate = (
   a: OfflineEventsWithStats,
   b: OfflineEventsWithStats,
   ascending: boolean
): number => {
   // Handle cases where startAt might be null/undefined (draft events)
   const aTime = a.offlineEvent.startAt?.toMillis() ?? 0
   const bTime = b.offlineEvent.startAt?.toMillis() ?? 0

   // If both are null/undefined, they are equal
   if (aTime === 0 && bTime === 0) return 0

   // If one is null/undefined, always put it at the end (regardless of sort direction)
   if (aTime === 0) return 1
   if (bTime === 0) return -1

   return ascending ? aTime - bTime : bTime - aTime
}

/**
 * Filters offline events with stats by search term
 * @param events Array of offline events with stats
 * @param searchTerm Search term to filter by
 * @returns Filtered array of offline events with stats
 */
const filterStatsBySearchTerm = (
   events: OfflineEventsWithStats[],
   searchTerm: string
): OfflineEventsWithStats[] => {
   if (!searchTerm.trim()) return events

   const lowerSearchTerm = searchTerm.toLowerCase()
   return events.filter((event) => {
      // Handle cases where title might be null/undefined
      const title = event.offlineEvent.title?.toLowerCase() || ""
      return title.includes(lowerSearchTerm)
   })
}

/**
 * Filters offline events with stats by status
 * @param events Array of offline events with stats
 * @param statusFilter Array of statuses to filter by
 * @returns Filtered array of offline events with stats
 */
const filterStatsByStatus = (
   events: OfflineEventsWithStats[],
   statusFilter: OfflineEventStatus[]
): OfflineEventsWithStats[] => {
   if (statusFilter.length === 0) return events

   return events.filter((event) =>
      statusFilter.includes(getOfflineEventStatus(event.offlineEvent))
   )
}

/**
 * Sorts offline events with stats array according to the specified sort option
 * @param events Array of offline events with stats
 * @param sortBy Sort option to apply
 * @returns Sorted array of offline events with stats
 */
const sortStatsArray = (
   events: OfflineEventsWithStats[],
   sortBy: OfflineEventStatsSortOption
): OfflineEventsWithStats[] => {
   return [...events].sort((a, b) => {
      switch (sortBy) {
         case OfflineEventStatsSortOption.START_ASC:
            return compareByDate(a, b, true)

         case OfflineEventStatsSortOption.START_DESC:
         default:
            return compareByDate(a, b, false)

         case OfflineEventStatsSortOption.TITLE_ASC: {
            const aTitleAsc = a.offlineEvent.title?.trim()?.toLowerCase() || ""
            const bTitleAsc = b.offlineEvent.title?.trim()?.toLowerCase() || ""

            // Handle empty titles - put them at the end
            if (!aTitleAsc && !bTitleAsc) return 0
            if (!aTitleAsc) return 1
            if (!bTitleAsc) return -1

            return aTitleAsc.localeCompare(bTitleAsc)
         }

         case OfflineEventStatsSortOption.TITLE_DESC: {
            const aTitleDesc = a.offlineEvent.title?.trim()?.toLowerCase() || ""
            const bTitleDesc = b.offlineEvent.title?.trim()?.toLowerCase() || ""

            // Handle empty titles - put them at the end
            if (!aTitleDesc && !bTitleDesc) return 0
            if (!aTitleDesc) return 1
            if (!bTitleDesc) return -1

            return bTitleDesc.localeCompare(aTitleDesc)
         }

         case OfflineEventStatsSortOption.VIEWS_DESC:
            return (b.stats?.totalViews ?? 0) - (a.stats?.totalViews ?? 0)

         case OfflineEventStatsSortOption.VIEWS_ASC:
            return (a.stats?.totalViews ?? 0) - (b.stats?.totalViews ?? 0)

         case OfflineEventStatsSortOption.CLICKS_DESC:
            return (b.stats?.totalClicks ?? 0) - (a.stats?.totalClicks ?? 0)

         case OfflineEventStatsSortOption.CLICKS_ASC:
            return (a.stats?.totalClicks ?? 0) - (b.stats?.totalClicks ?? 0)

         case OfflineEventStatsSortOption.STATUS_WITH_DATE: {
            // Get status priority: upcoming (0), draft (1), past (2)
            const getStatusPriority = (
               event: OfflineEventsWithStats
            ): number => {
               const status = getOfflineEventStatus(event.offlineEvent)
               switch (status) {
                  case OfflineEventStatus.UPCOMING:
                     return 0
                  case OfflineEventStatus.DRAFT:
                     return 1
                  case OfflineEventStatus.PAST:
                     return 2
                  default:
                     return 3
               }
            }

            const aStatusPriority = getStatusPriority(a)
            const bStatusPriority = getStatusPriority(b)

            // First sort by status priority
            if (aStatusPriority !== bStatusPriority) {
               return aStatusPriority - bStatusPriority
            }

            // Then sort by date within each status category
            return compareByDate(a, b, false)
         }
      }
   })
}
