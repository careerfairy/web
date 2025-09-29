import {
   OfflineEvent,
   OfflineEventsWithStats,
} from "@careerfairy/shared-lib/offline-events/offline-events"
import { offlineEventService } from "data/firebase/OfflineEventService"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useRouter } from "next/router"
import {
   ReactNode,
   createContext,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react"
import { errorLogAndNotify } from "util/CommonUtil"
import { OfflineEventStatsSortOption } from "../../../../../custom-hook/offline-event/useGroupOfflineEventsWithStats"
// import { FeedbackDialogProvider } from "../../analytics-new/feedback/feedback-dialog/FeedbackDialogProvider"
// import { EnterStreamDialog } from "../EnterStreamDialog"
import { OfflineEventStatus } from "../offline-events-table/utils"
// import { QuestionsDialog } from "../feedback-dialogs/QuestionsDialog"
// import { PromoteLivestreamDialog } from "../PromoteLivestreamDialog"
import { DeleteOfflineEventDialog } from "./DeleteOfflineEventDialog"

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
   // handleQuestions: (stat: OfflineEventsWithStats) => void
   // handleFeedback: (stat: OfflineEventsWithStats) => void
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
   const { query, replace, pathname } = useRouter()
   const { offlineEventIdToPromote } = query

   const { group } = useGroup()
   const [sortBy, setSortBy] = useState<OfflineEventStatsSortOption>(
      OfflineEventStatsSortOption.STATUS_WITH_DATE
   )
   const [statusFilter, setStatusFilter] = useState<OfflineEventStatus[]>([])
   const [searchTerm, setSearchTerm] = useState("")
   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
   const [offlineEventToDelete, setOfflineEventToDelete] =
      useState<OfflineEvent | null>(null)
   const [onPaginationReset, setOnPaginationReset] = useState<
      (() => void) | undefined
   >(undefined)
   // const [promoteDialogOfflineEvent, setPromoteDialogOfflineEvent] =
   //    useState<OfflineEvent | null>(null)
   // const [feedbackDialogOfflineEventId, setFeedbackDialogOfflineEventId] = useState<
   //    string | null
   // >(null)
   // const [feedbackDialogQuestionId, setFeedbackDialogQuestionId] = useState<
   //    string | null
   // >(null)
   // const [questionsDialogOfflineEvent, setQuestionsDialogOfflineEvent] =
   //    useState<OfflineEvent | null>(null)
   // const [enterStreamDialogOfflineEventId, setEnterStreamDialogOfflineEventId] =
   //    useState<string | null>(null)
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
         // Open new promote dialog
         // setPromoteDialogOfflineEvent(stat.offlineEvent)
         const title = stat.offlineEvent.title || "Untitled Event"
         alert(`Share offline event: ${title}`)
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

   // const handleQuestions = useCallback((stat: OfflineEventStats) => {
   //    if (!stat.offlineEvent.published) return
   //    // Open questions dialog
   //    setQuestionsDialogOfflineEvent(stat.offlineEvent)
   // }, [])

   // const handleFeedback = useCallback((stat: OfflineEventStats) => {
   //    if (!stat.offlineEvent.published) return
   //    // Open feedback dialog for past offline events
   //    setFeedbackDialogOfflineEventId(stat.offlineEvent.id)
   //    setFeedbackDialogQuestionId(null)
   // }, [])

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

   // const handleClosePromoteDialog = useCallback(() => {
   //    setPromoteDialogOfflineEvent(null)
   // }, [])

   // const handleCloseFeedbackDialog = useCallback(() => {
   //    setFeedbackDialogOfflineEventId(null)
   //    setFeedbackDialogQuestionId(null)
   // }, [])

   // const handleFeedbackRatingQuestionClick = useCallback((ratingId: string) => {
   //    setFeedbackDialogQuestionId(ratingId)
   // }, [])

   // const handleFeedbackBackToFeedback = useCallback(() => {
   //    setFeedbackDialogQuestionId(null)
   // }, [])

   // const handleCloseQuestionsDialog = useCallback(() => {
   //    setQuestionsDialogOfflineEvent(null)
   // }, [])

   // const handleCloseEnterStreamDialog = useCallback(() => {
   //    setEnterStreamDialogOfflineEventId(null)
   // }, [])

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

   useEffect(() => {
      if (offlineEventIdToPromote) {
         offlineEventService
            .getById(offlineEventIdToPromote as string)
            .then((offlineEvent) => {
               // setPromoteDialogOfflineEvent(offlineEvent)
               alert(`Promote offline event: ${offlineEvent.title}`)
            })
            .catch((err) => {
               errorLogAndNotify(err, {
                  message: "Failed to fetch offline event for promote dialog",
                  offlineEventId: offlineEventIdToPromote,
               })
            })
            .finally(() => {
               const newQuery = {
                  ...query,
               }

               delete newQuery.offlineEventIdToPromote

               replace({
                  pathname: pathname,
                  query: newQuery,
               })
            })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [offlineEventIdToPromote, replace])

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
         // handleQuestions,
         // handleFeedback,
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
         // handleQuestions,
         // handleFeedback,
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
         {/* <PromoteOfflineEventDialog
            offlineEvent={promoteDialogOfflineEvent}
            open={Boolean(promoteDialogOfflineEvent)}
            companyName={group?.universityName}
            companyCountryCode={group?.companyCountry?.id}
            onClose={handleClosePromoteDialog}
         />
         <FeedbackDialogProvider
            offlineEventId={feedbackDialogOfflineEventId}
            feedbackQuestionId={feedbackDialogQuestionId}
            onCloseFeedbackDialog={handleCloseFeedbackDialog}
            onRatingQuestionClick={handleFeedbackRatingQuestionClick}
            onBackToFeedback={handleFeedbackBackToFeedback}
         />

         <QuestionsDialog
            offlineEvent={questionsDialogOfflineEvent}
            onClose={handleCloseQuestionsDialog}
         />
         <EnterStreamDialog
            offlineEventId={enterStreamDialogOfflineEventId}
            open={Boolean(enterStreamDialogOfflineEventId)}
            onClose={handleCloseEnterStreamDialog}
         /> */}
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
