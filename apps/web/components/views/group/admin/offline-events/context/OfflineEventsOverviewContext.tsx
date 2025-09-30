import { OfflineEvent } from "@careerfairy/shared-lib/offline-events/offline-events"
import { OfflineEventsWithStats } from "components/custom-hook/offline-event/useGroupOfflineEventsWithStats"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useRouter } from "next/router"
import {
   ReactNode,
   createContext,
   useCallback,
   useContext,
   useMemo,
   useState,
} from "react"
import { OfflineEventStatsSortOption } from "../../../../../custom-hook/offline-event/useGroupOfflineEventsWithStats"
import { OfflineEventStatus } from "../offline-events-table/utils"
import { DeleteOfflineEventDialog } from "./DeleteOfflineEventDialog"
import { ShareOfflineEventDialog } from "./ShareOfflineEventDialog"

type OfflineEventsViewContextValue = {
   sortBy: OfflineEventStatsSortOption
   setSortBy: (sortBy: OfflineEventStatsSortOption) => void
   handleTableSort: (field: "title" | "date" | "views" | "clicks") => void
   getSortDirection: (
      field: "title" | "date" | "views" | "clicks"
   ) => "asc" | "desc"
   isActiveSort: (field: "title" | "date" | "views" | "clicks") => boolean
   // Status filtering
   statusFilter: OfflineEventStatus[]
   setStatusFilter: (statuses: OfflineEventStatus[]) => void
   // Search term
   searchTerm: string
   setSearchTerm: (searchTerm: string) => void
   // Reset method
   resetFilters: () => void
   // Pagination reset callback
   onPaginationReset?: () => void
   setOnPaginationReset: (callback: (() => void) | undefined) => void
   // Event action handlers
   handleViewOfflineEvent: (stat: OfflineEventsWithStats) => void
   handleShareOfflineEvent: (stat: OfflineEventsWithStats) => void
   handleAnalytics: (stat: OfflineEventsWithStats) => void
   handleEdit: (stat: OfflineEventsWithStats) => void
   handleViewRegistration: (stat: OfflineEventsWithStats) => void
   handleViewDetails: (stat: OfflineEventsWithStats) => void
   handleDelete: (stat: OfflineEventsWithStats) => void
}

const OfflineEventsViewContext =
   createContext<OfflineEventsViewContextValue | null>(null)

/** Maps table fields to their corresponding sort options [asc, desc] */
const sortMappings = {
   title: [
      OfflineEventStatsSortOption.TITLE_ASC,
      OfflineEventStatsSortOption.TITLE_DESC,
   ],
   date: [
      OfflineEventStatsSortOption.START_ASC,
      OfflineEventStatsSortOption.START_DESC,
   ],
   views: [
      OfflineEventStatsSortOption.VIEWS_ASC,
      OfflineEventStatsSortOption.VIEWS_DESC,
   ],
   clicks: [
      OfflineEventStatsSortOption.CLICKS_ASC,
      OfflineEventStatsSortOption.CLICKS_DESC,
   ],
} as const

/** Maps table fields to their asc/desc sort options */
const fieldMappings = {
   title: {
      asc: OfflineEventStatsSortOption.TITLE_ASC,
      desc: OfflineEventStatsSortOption.TITLE_DESC,
   },
   date: {
      asc: OfflineEventStatsSortOption.START_ASC,
      desc: OfflineEventStatsSortOption.START_DESC,
   },
   views: {
      asc: OfflineEventStatsSortOption.VIEWS_ASC,
      desc: OfflineEventStatsSortOption.VIEWS_DESC,
   },
   clicks: {
      asc: OfflineEventStatsSortOption.CLICKS_ASC,
      desc: OfflineEventStatsSortOption.CLICKS_DESC,
   },
} as const

const initialSort = OfflineEventStatsSortOption.STATUS_WITH_DATE

type OfflineEventsViewProviderProps = {
   children: ReactNode
}

export const OfflineEventsViewProvider = ({
   children,
}: OfflineEventsViewProviderProps) => {
   const { group } = useGroup()
   const [sortBy, setSortBy] = useState<OfflineEventStatsSortOption>(
      OfflineEventStatsSortOption.STATUS_WITH_DATE
   )
   const [statusFilter, setStatusFilter] = useState<OfflineEventStatus[]>([])
   const [searchTerm, setSearchTerm] = useState("")
   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
   const [offlineEventToDelete, setOfflineEventToDelete] =
      useState<OfflineEvent | null>(null)
   const [shareDialogOpen, setShareDialogOpen] = useState(false)
   const [offlineEventToShare, setOfflineEventToShare] =
      useState<OfflineEvent | null>(null)
   const [onPaginationReset, setOnPaginationReset] = useState<
      (() => void) | undefined
   >(undefined)
   const { push } = useRouter()

   /** Toggles sort direction for a field - defaults to desc, switches to asc if already desc */
   const handleTableSort = useCallback(
      (field: "title" | "date" | "views" | "clicks") => {
         const [ascOption, descOption] = sortMappings[field]

         // If currently sorting by this field in desc, switch to asc
         if (sortBy === descOption) {
            setSortBy(ascOption)
         } else {
            // Otherwise, sort by desc (default)
            setSortBy(descOption)
         }

         // Reset pagination to first page when sorting changes
         onPaginationReset?.()
      },
      [sortBy, onPaginationReset]
   )

   const getSortDirection = useCallback(
      (field: "title" | "date" | "views" | "clicks"): "asc" | "desc" => {
         const fieldMap = fieldMappings[field]
         if (sortBy === fieldMap.asc) return "asc"
         if (sortBy === fieldMap.desc) return "desc"
         return "desc" // default
      },
      [sortBy]
   )

   const isActiveSort = useCallback(
      (field: "title" | "date" | "views" | "clicks"): boolean => {
         switch (field) {
            case "title":
               return (
                  sortBy === OfflineEventStatsSortOption.TITLE_ASC ||
                  sortBy === OfflineEventStatsSortOption.TITLE_DESC
               )
            case "date":
               return (
                  sortBy === OfflineEventStatsSortOption.START_ASC ||
                  sortBy === OfflineEventStatsSortOption.START_DESC
               )
            case "views":
               return (
                  sortBy === OfflineEventStatsSortOption.VIEWS_ASC ||
                  sortBy === OfflineEventStatsSortOption.VIEWS_DESC
               )
            case "clicks":
               return (
                  sortBy === OfflineEventStatsSortOption.CLICKS_ASC ||
                  sortBy === OfflineEventStatsSortOption.CLICKS_DESC
               )
            default:
               return false
         }
      },
      [sortBy]
   )

   // Event action handlers
   const handleViewOfflineEvent = useCallback(
      async (stat: OfflineEventsWithStats) => {
         if (!stat.offlineEvent.published) return

         // Navigate to offline event view (with null-safe check)
         const eventId = stat.offlineEvent.id
         if (eventId) {
            push(`/group/${group?.id}/offline-events/${eventId}`)
         }
      },
      [group?.id, push]
   )

   const handleShareOfflineEvent = useCallback(
      (stat: OfflineEventsWithStats) => {
         if (!stat.offlineEvent.published) return
         // Open share dialog
         setOfflineEventToShare(stat.offlineEvent)
         setShareDialogOpen(true)
      },
      []
   )

   const handleAnalytics = useCallback(
      (stat: OfflineEventsWithStats) => {
         if (!stat.offlineEvent.published) return
         // Navigate to analytics view (with null-safe check)
         const eventId = stat.offlineEvent.id
         if (eventId) {
            push(
               `/group/${group?.id}/admin/analytics/offline-events/${eventId}`
            )
         }
      },
      [group?.id, push]
   )

   const handleEdit = useCallback(
      (stat: OfflineEventsWithStats) => {
         // Navigate to edit page (with null-safe check)
         const eventId = stat.offlineEvent.id
         if (eventId) {
            push(`/group/${group?.id}/admin/content/offline-events/${eventId}`)
         }
      },
      [group?.id, push]
   )

   const handleViewRegistration = useCallback(
      (stat: OfflineEventsWithStats) => {
         if (!stat.offlineEvent.published) return

         // Open registration URL in new tab (with null-safe check)
         const registrationUrl = stat.offlineEvent.registrationUrl
         if (registrationUrl) {
            window.open(registrationUrl, "_blank")
         }
      },
      []
   )

   const handleViewDetails = useCallback(
      (stat: OfflineEventsWithStats) => {
         // Navigate to details view (with null-safe check)
         const eventId = stat.offlineEvent.id
         if (eventId) {
            push(`/group/${group?.id}/offline-events/${eventId}`)
         }
      },
      [group?.id, push]
   )

   const handleDelete = useCallback((stat: OfflineEventsWithStats) => {
      setOfflineEventToDelete(stat.offlineEvent)
      setDeleteDialogOpen(true)
   }, [])

   const handleDeleteDialogClose = useCallback(() => {
      setDeleteDialogOpen(false)
      setOfflineEventToDelete(null)
   }, [])

   const handleShareDialogClose = useCallback(() => {
      setShareDialogOpen(false)
      setOfflineEventToShare(null)
   }, [])

   const resetFilters = useCallback(() => {
      setSortBy(initialSort)
      setStatusFilter([])
      setSearchTerm("")
      // Reset pagination when filters are reset
      onPaginationReset?.()
   }, [onPaginationReset])

   // Wrapper for setStatusFilter that resets pagination
   const handleStatusFilterChange = useCallback(
      (statuses: OfflineEventStatus[]) => {
         setStatusFilter(statuses)
         onPaginationReset?.()
      },
      [onPaginationReset]
   )

   // Wrapper for setSearchTerm that resets pagination
   const handleSearchTermChange = useCallback(
      (term: string) => {
         setSearchTerm(term)
         onPaginationReset?.()
      },
      [onPaginationReset]
   )

   const value = useMemo<OfflineEventsViewContextValue>(
      () => ({
         sortBy,
         setSortBy,
         handleTableSort,
         getSortDirection,
         isActiveSort,
         statusFilter,
         setStatusFilter: handleStatusFilterChange,
         searchTerm,
         setSearchTerm: handleSearchTermChange,
         resetFilters,
         onPaginationReset,
         setOnPaginationReset,
         handleViewOfflineEvent,
         handleShareOfflineEvent,
         handleAnalytics,
         handleEdit,
         handleViewRegistration,
         handleViewDetails,
         handleDelete,
      }),
      [
         sortBy,
         setSortBy,
         handleTableSort,
         getSortDirection,
         isActiveSort,
         statusFilter,
         handleStatusFilterChange,
         searchTerm,
         handleSearchTermChange,
         resetFilters,
         onPaginationReset,
         setOnPaginationReset,
         handleViewOfflineEvent,
         handleShareOfflineEvent,
         handleAnalytics,
         handleEdit,
         handleViewRegistration,
         handleViewDetails,
         handleDelete,
      ]
   )

   return (
      <OfflineEventsViewContext.Provider value={value}>
         {children}
         <DeleteOfflineEventDialog
            open={deleteDialogOpen}
            offlineEvent={offlineEventToDelete}
            onClose={handleDeleteDialogClose}
         />
         <ShareOfflineEventDialog
            open={shareDialogOpen}
            offlineEvent={offlineEventToShare}
            companyName={group?.universityName || ""}
            companyCountryCode={group?.companyCountry?.id}
            onClose={handleShareDialogClose}
         />
      </OfflineEventsViewContext.Provider>
   )
}

export const useOfflineEventsOverview = (): OfflineEventsViewContextValue => {
   const context = useContext(OfflineEventsViewContext)
   if (!context) {
      throw new Error(
         "useOfflineEventsOverview must be used within an OfflineEventsViewProvider"
      )
   }
   return context
}
