import { LivestreamEventPublicData } from "@careerfairy/shared-lib/livestreams/livestreams"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { livestreamService } from "data/firebase/LivestreamService"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useRouter } from "next/router"
import {
   createContext,
   ReactNode,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react"
import { errorLogAndNotify } from "util/CommonUtil"
import { LivestreamStatsSortOption } from "../../../../../custom-hook/live-stream/useGroupLivestreamsWithStats"
import FeedbackDialog from "../../analytics-new/feedback/feedback-dialog/FeedbackDialog"
import { EnterStreamDialog } from "../EnterStreamDialog"
import { LivestreamEventStatus } from "../events-table-new/utils"
import { QuestionsDialog } from "../feedback-dialogs/QuestionsDialog"
import { PromoteLivestreamDialog } from "../PromoteLivestreamDialog"
import { DeleteLivestreamDialog } from "./DeleteLivestreamDialog"

const FEEDBACK_DIALOG_QUERY_PARAM = "feedbackLivestreamId"
const QUESTIONS_DIALOG_QUERY_PARAM = "questionsLivestreamId"

type EventsViewContextValue = {
   sortBy: LivestreamStatsSortOption
   setSortBy: (sortBy: LivestreamStatsSortOption) => void
   handleTableSort: (field: "title" | "date" | "registrations") => void
   getSortDirection: (
      field: "title" | "date" | "registrations"
   ) => "asc" | "desc"
   isActiveSort: (field: "title" | "date" | "registrations") => boolean
   // Status filtering
   statusFilter: LivestreamEventStatus[]
   setStatusFilter: (statuses: LivestreamEventStatus[]) => void
   // Search term
   searchTerm: string
   setSearchTerm: (searchTerm: string) => void
   // Reset method
   resetFilters: () => void
   // Event action handlers
   handleEnterLiveStreamRoom: (stat: LiveStreamStats) => void
   handleShareLiveStream: (stat: LiveStreamStats) => void
   handleAnalytics: (stat: LiveStreamStats) => void
   handleQuestions: (stat: LiveStreamStats) => void
   handleFeedback: (stat: LiveStreamStats) => void
   handleEdit: (stat: LiveStreamStats) => void
   handleShareRecording: (stat: LiveStreamStats) => void
   handleViewRecording: (stat: LiveStreamStats) => void
   handleDelete: (stat: LiveStreamStats) => void
}

const EventsViewContext = createContext<EventsViewContextValue | null>(null)

/** Maps table fields to their corresponding sort options [asc, desc] */
const sortMappings = {
   title: [
      LivestreamStatsSortOption.TITLE_ASC,
      LivestreamStatsSortOption.TITLE_DESC,
   ],
   date: [
      LivestreamStatsSortOption.START_ASC,
      LivestreamStatsSortOption.START_DESC,
   ],
   registrations: [
      LivestreamStatsSortOption.REGISTRATIONS_ASC,
      LivestreamStatsSortOption.REGISTRATIONS_DESC,
   ],
} as const

/** Maps table fields to their asc/desc sort options */
const fieldMappings = {
   title: {
      asc: LivestreamStatsSortOption.TITLE_ASC,
      desc: LivestreamStatsSortOption.TITLE_DESC,
   },
   date: {
      asc: LivestreamStatsSortOption.START_ASC,
      desc: LivestreamStatsSortOption.START_DESC,
   },
   registrations: {
      asc: LivestreamStatsSortOption.REGISTRATIONS_ASC,
      desc: LivestreamStatsSortOption.REGISTRATIONS_DESC,
   },
} as const

const initialSort = LivestreamStatsSortOption.STATUS_WITH_DATE

type EventsViewProviderProps = {
   children: ReactNode
}

export const EventsViewProvider = ({ children }: EventsViewProviderProps) => {
   const { query, replace, pathname } = useRouter()
   const { livestreamIdToPromote } = query

   const { group } = useGroup()
   const [sortBy, setSortBy] = useState<LivestreamStatsSortOption>(
      LivestreamStatsSortOption.STATUS_WITH_DATE
   )
   const [statusFilter, setStatusFilter] = useState<LivestreamEventStatus[]>([])
   const [searchTerm, setSearchTerm] = useState("")
   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
   const [livestreamToDelete, setLivestreamToDelete] =
      useState<LivestreamEventPublicData | null>(null)
   const [promoteDialogLivestream, setPromoteDialogLivestream] =
      useState<LivestreamEventPublicData | null>(null)
   const [enterStreamDialogLivestreamId, setEnterStreamDialogLivestreamId] =
      useState<string | null>(null)
   const { push } = useRouter()
   const feedbackLivestreamId = query[FEEDBACK_DIALOG_QUERY_PARAM] as string
   const questionsLivestreamId = query[QUESTIONS_DIALOG_QUERY_PARAM] as string

   /** Toggles sort direction for a field - defaults to desc, switches to asc if already desc */
   const handleTableSort = useCallback(
      (field: "title" | "date" | "registrations") => {
         const [ascOption, descOption] = sortMappings[field]

         // If currently sorting by this field in desc, switch to asc
         if (sortBy === descOption) {
            setSortBy(ascOption)
         } else {
            // Otherwise, sort by desc (default)
            setSortBy(descOption)
         }
      },
      [sortBy]
   )

   const getSortDirection = useCallback(
      (field: "title" | "date" | "registrations"): "asc" | "desc" => {
         const fieldMap = fieldMappings[field]
         if (sortBy === fieldMap.asc) return "asc"
         if (sortBy === fieldMap.desc) return "desc"
         return "desc" // default
      },
      [sortBy]
   )

   const isActiveSort = useCallback(
      (field: "title" | "date" | "registrations"): boolean => {
         switch (field) {
            case "title":
               return (
                  sortBy === LivestreamStatsSortOption.TITLE_ASC ||
                  sortBy === LivestreamStatsSortOption.TITLE_DESC
               )
            case "date":
               return (
                  sortBy === LivestreamStatsSortOption.START_ASC ||
                  sortBy === LivestreamStatsSortOption.START_DESC
               )
            case "registrations":
               return (
                  sortBy === LivestreamStatsSortOption.REGISTRATIONS_ASC ||
                  sortBy === LivestreamStatsSortOption.REGISTRATIONS_DESC
               )
            default:
               return false
         }
      },
      [sortBy]
   )

   // Event action handlers
   const handleEnterLiveStreamRoom = useCallback(
      async (stat: LiveStreamStats) => {
         if (stat.livestream.isDraft) return

         setEnterStreamDialogLivestreamId(stat.livestream.id)
      },
      []
   )

   const handleShareLiveStream = useCallback((stat: LiveStreamStats) => {
      if (stat.livestream.isDraft) return
      // Open new promote dialog
      setPromoteDialogLivestream(stat.livestream)
   }, [])

   const handleAnalytics = useCallback(
      (stat: LiveStreamStats) => {
         if (stat.livestream.isDraft) return
         // Navigate to analytics view
         push(
            `/group/${group?.id}/admin/analytics/live-streams/${stat.livestream.id}`
         )
      },
      [group?.id, push]
   )

   const handleQuestions = useCallback(
      (stat: LiveStreamStats) => {
         if (stat.livestream.isDraft) return
         // Open questions dialog via URL
         push(
            {
               pathname,
               query: {
                  ...query,
                  [QUESTIONS_DIALOG_QUERY_PARAM]: stat.livestream.id,
               },
            },
            undefined,
            { shallow: true }
         )
      },
      [pathname, push, query]
   )

   const handleFeedback = useCallback(
      (stat: LiveStreamStats) => {
         if (stat.livestream.isDraft) return
         // Open feedback dialog via URL
         push(
            {
               pathname,
               query: {
                  ...query,
                  [FEEDBACK_DIALOG_QUERY_PARAM]: stat.livestream.id,
               },
            },
            undefined,
            { shallow: true }
         )
      },
      [pathname, push, query]
   )

   const handleEdit = useCallback(
      (stat: LiveStreamStats) => {
         // Navigate to edit page
         push(
            `/group/${group?.id}/admin/content/live-streams/${stat.livestream.id}`
         )
      },
      [group?.id, push]
   )

   const handleShareRecording = useCallback((stat: LiveStreamStats) => {
      if (stat.livestream.isDraft) return

      setPromoteDialogLivestream(stat.livestream)
   }, [])

   const handleViewRecording = useCallback((stat: LiveStreamStats) => {
      // Navigate to recording view
      alert(
         `View recording for ${
            stat.livestream.isDraft ? "draft" : "live stream"
         }: ${stat.livestream.id}`
      )
   }, [])

   const handleDelete = useCallback((stat: LiveStreamStats) => {
      setLivestreamToDelete(stat.livestream)
      setDeleteDialogOpen(true)
   }, [])

   const handleDeleteDialogClose = useCallback(() => {
      setDeleteDialogOpen(false)
      setLivestreamToDelete(null)
   }, [])

   const handleClosePromoteDialog = useCallback(() => {
      setPromoteDialogLivestream(null)
   }, [])

   const handleCloseFeedbackDialog = useCallback(() => {
      const {
         [FEEDBACK_DIALOG_QUERY_PARAM]: _feedbackLivestreamId,
         feedbackId: _feedbackId,
         ...rest
      } = query
      push(
         {
            pathname,
            query: rest,
         },
         undefined,
         { shallow: true }
      )
   }, [pathname, push, query])

   const handleCloseQuestionsDialog = useCallback(() => {
      const { [QUESTIONS_DIALOG_QUERY_PARAM]: _, ...rest } = query
      push(
         {
            pathname,
            query: rest,
         },
         undefined,
         { shallow: true }
      )
   }, [pathname, push, query])

   const handleCloseEnterStreamDialog = useCallback(() => {
      setEnterStreamDialogLivestreamId(null)
   }, [])

   const resetFilters = useCallback(() => {
      setSortBy(initialSort)
      setStatusFilter([])
      setSearchTerm("")
   }, [])

   useEffect(() => {
      if (livestreamIdToPromote) {
         livestreamService
            .getById(livestreamIdToPromote as string)
            .then(setPromoteDialogLivestream)
            .catch((err) => {
               errorLogAndNotify(err, {
                  message: "Failed to fetch livestream for promote dialog",
                  livestreamId: livestreamIdToPromote,
               })
            })
            .finally(() => {
               const newQuery = {
                  ...query,
               }

               delete newQuery.livestreamIdToPromote

               replace({
                  pathname: pathname,
                  query: newQuery,
               })
            })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [livestreamIdToPromote, replace])

   const value = useMemo<EventsViewContextValue>(
      () => ({
         sortBy,
         setSortBy,
         handleTableSort,
         getSortDirection,
         isActiveSort,
         statusFilter,
         setStatusFilter,
         searchTerm,
         setSearchTerm,
         resetFilters,
         handleEnterLiveStreamRoom,
         handleShareLiveStream,
         handleAnalytics,
         handleQuestions,
         handleFeedback,
         handleEdit,
         handleShareRecording,
         handleViewRecording,
         handleDelete,
      }),
      [
         sortBy,
         setSortBy,
         handleTableSort,
         getSortDirection,
         isActiveSort,
         statusFilter,
         setStatusFilter,
         searchTerm,
         setSearchTerm,
         resetFilters,
         handleEnterLiveStreamRoom,
         handleShareLiveStream,
         handleAnalytics,
         handleQuestions,
         handleFeedback,
         handleEdit,
         handleShareRecording,
         handleViewRecording,
         handleDelete,
      ]
   )

   return (
      <EventsViewContext.Provider value={value}>
         {children}
         <DeleteLivestreamDialog
            open={deleteDialogOpen}
            livestream={livestreamToDelete}
            onClose={handleDeleteDialogClose}
         />
         <PromoteLivestreamDialog
            livestream={promoteDialogLivestream}
            open={Boolean(promoteDialogLivestream)}
            companyName={group?.universityName}
            companyCountryCode={group?.companyCountry?.id}
            onClose={handleClosePromoteDialog}
         />
         <FeedbackDialog
            livestreamId={feedbackLivestreamId}
            onClose={handleCloseFeedbackDialog}
         />

         <QuestionsDialog
            livestreamId={questionsLivestreamId}
            onClose={handleCloseQuestionsDialog}
         />
         <EnterStreamDialog
            livestreamId={enterStreamDialogLivestreamId}
            open={Boolean(enterStreamDialogLivestreamId)}
            onClose={handleCloseEnterStreamDialog}
         />
      </EventsViewContext.Provider>
   )
}

export const useEventsView = (): EventsViewContextValue => {
   const context = useContext(EventsViewContext)
   if (!context) {
      throw new Error("useEventsView must be used within an EventsViewProvider")
   }
   return context
}
