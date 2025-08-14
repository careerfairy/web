import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import {
   createLiveStreamStatsDoc,
   LiveStreamStats,
} from "@careerfairy/shared-lib/livestreams/stats"
import { reducedRemoteCallsOptions } from "components/custom-hook/utils/useFunctionsSWRFetcher"
import {
   getLivestreamEventStatus,
   LivestreamEventStatus,
} from "components/views/group/admin/events/events-table-new/utils"
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
   /** Status-based: upcoming, draft, past (with date as secondary sort) */
   STATUS_WITH_DATE,
}

export const getGroupLivestreamsWithStatsKey = (groupId: string | null) => {
   if (!groupId) return null
   return `group-livestreams-with-stats-${groupId}`
}

interface UseGroupLivestreamsWithStatsOptions {
   /** Sort results by */
   sortBy?: LivestreamStatsSortOption
   /** Search term to filter by */
   searchTerm?: string
   /** Status filter options */
   statusFilter?: LivestreamEventStatus[]
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
   const {
      sortBy = LivestreamStatsSortOption.START_DESC,
      searchTerm = "",
      statusFilter = [],
   } = options
   const firestore = useFirestore()

   const fetchGroupLivestreamsWithStats = async (): Promise<
      LiveStreamStats[]
   > => {
      if (!groupId) return []

      try {
         // Fetch livestreams
         const livestreamsQuery = query(
            collection(firestore, "livestreams"),
            where("groupIds", "array-contains", groupId),
            where("test", "==", false)
         ).withConverter(createGenericConverter<LivestreamEvent>())

         // Fetch livestream stats
         const statsQuery = query(
            collectionGroup(firestore, "stats"),
            where("id", "==", "livestreamStats"),
            where("livestream.groupIds", "array-contains", groupId),
            where("livestream.test", "==", false)
         ).withConverter(createGenericConverter<LiveStreamStats>())

         // Fetch draft livestreams
         const draftsQuery = query(
            collection(firestore, "draftLivestreams"),
            where("groupIds", "array-contains", groupId)
         ).withConverter(createGenericConverter<LivestreamEvent>())

         const [livestreamsSnapshot, statsSnapshot, draftsSnapshot] =
            await Promise.all([
               getDocs(livestreamsQuery),
               getDocs(statsQuery),
               getDocs(draftsQuery),
            ])

         const livestreams = livestreamsSnapshot.docs.map((doc) => doc.data())

         const livestreamStats: LiveStreamStats[] = statsSnapshot.docs.map(
            (statsDoc) => {
               const latestLivestreamData = livestreams.find(
                  (livestream) =>
                     livestream.id === statsDoc.data().livestream.id
               )

               return {
                  ...statsDoc.data(),
                  livestream:
                     latestLivestreamData || statsDoc.data().livestream,
               }
            }
         )

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
                     ...livestreamData,
                     isDraft: true,
                  },
               }
            }
         )

         // Combine all stats
         return livestreamStats.concat(draftStats)
      } catch (error) {
         console.error("Error fetching group livestreams with stats:", error)
         throw error
      }
   }

   const { data, isLoading, error } = useSWR<LiveStreamStats[]>(
      getGroupLivestreamsWithStatsKey(groupId),
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

      // First filter by search term, then by status, then sort
      let filteredData = filterStatsBySearchTerm(data, searchTerm)
      filteredData = filterStatsByStatus(filteredData, statusFilter)
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
 * Compares two livestream stats by their start date
 * @param a First livestream stat
 * @param b Second livestream stat
 * @param ascending Whether to sort in ascending order (true) or descending order (false)
 * @returns Comparison result for sorting
 */
const compareByDate = (
   a: LiveStreamStats,
   b: LiveStreamStats,
   ascending: boolean = false
): number => {
   const aDate = a.livestream.start?.toDate?.() || new Date(0)
   const bDate = b.livestream.start?.toDate?.() || new Date(0)
   const comparison = aDate.getTime() - bDate.getTime()
   return ascending ? comparison : -comparison
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
      const speakers = stat.livestream.speakers || []

      const titleMatch = title.includes(normalizedSearchTerm)
      const companyMatch = company.includes(normalizedSearchTerm)

      // Check if any speaker name contains the search term
      const speakerMatch = speakers.some((speaker) => {
         if (!speaker) return false

         const fullName = `${speaker.firstName || ""} ${
            speaker.lastName || ""
         }`.toLowerCase()

         return fullName.includes(normalizedSearchTerm)
      })

      return titleMatch || companyMatch || speakerMatch
   })
}

const filterStatsByStatus = (
   stats: LiveStreamStats[],
   statusFilter: LivestreamEventStatus[]
): LiveStreamStats[] => {
   if (statusFilter.length === 0) return stats

   return stats.filter((stat) => {
      // Determine the status of this livestream
      const status = getLivestreamEventStatus(stat.livestream)

      return statusFilter.includes(status)
   })
}

const sortStatsArray = (
   stats: LiveStreamStats[],
   sortBy: LivestreamStatsSortOption
): LiveStreamStats[] => {
   return [...stats].sort((a, b) => {
      switch (sortBy) {
         case LivestreamStatsSortOption.START_ASC:
            return compareByDate(a, b, true)

         case LivestreamStatsSortOption.START_DESC:
         default:
            return compareByDate(a, b, false)

         case LivestreamStatsSortOption.TITLE_ASC: {
            const aTitleAsc = a.livestream.title?.trim()?.toLowerCase() || ""
            const bTitleAsc = b.livestream.title?.trim()?.toLowerCase() || ""
            return aTitleAsc.localeCompare(bTitleAsc)
         }

         case LivestreamStatsSortOption.TITLE_DESC: {
            const aTitleDesc = a.livestream.title?.trim()?.toLowerCase() || ""
            const bTitleDesc = b.livestream.title?.trim()?.toLowerCase() || ""
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

         case LivestreamStatsSortOption.STATUS_WITH_DATE: {
            // Get status priority: upcoming (0), draft (1), recording (2), not recorded (3)
            const getStatusPriority = (stat: LiveStreamStats): number => {
               const status = getLivestreamEventStatus(stat.livestream)
               switch (status) {
                  case LivestreamEventStatus.UPCOMING:
                     return 0
                  case LivestreamEventStatus.DRAFT:
                     return 1
                  case LivestreamEventStatus.RECORDING:
                     return 2
                  case LivestreamEventStatus.NOT_RECORDED:
                     return 3
                  default:
                     return 4
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
