import { LivestreamEventPublicData } from "@careerfairy/shared-lib/livestreams/livestreams"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { livestreamService } from "data/firebase/LivestreamService"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useRouter } from "next/router"
import {
   createContext,
   ReactNode,
   useCallback,
   useContext,
   useMemo,
   useState,
} from "react"
import { makeLivestreamUrl } from "util/makeUrls"
import { LivestreamStatsSortOption } from "../../../../../custom-hook/live-stream/useGroupLivestreamsWithStats"
import { StreamerLinksDialog } from "../enhanced-group-stream-card/StreamerLinksDialog"
import { LivestreamEventStatus } from "../events-table-new/utils"
import { DeleteLivestreamDialog } from "./DeleteLivestreamDialog"

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

type EventsViewProviderProps = {
   children: ReactNode
   initialSort?: LivestreamStatsSortOption
}

export const EventsViewProvider = ({
   children,
   initialSort = LivestreamStatsSortOption.STATUS_WITH_DATE,
}: EventsViewProviderProps) => {
   const { group } = useGroup()
   const { errorNotification } = useSnackbarNotifications()
   const [sortBy, setSortBy] = useState<LivestreamStatsSortOption>(initialSort)
   const [statusFilter, setStatusFilter] = useState<LivestreamEventStatus[]>([])
   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
   const [livestreamToDelete, setLivestreamToDelete] =
      useState<LivestreamEventPublicData | null>(null)
   const [targetLivestreamStreamerLinksId, setTargetLivestreamStreamerLinksId] =
      useState<string | null>(null)

   const { push } = useRouter()

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

         let url: string

         try {
            const token = await livestreamService.getLivestreamSecureToken(
               stat.livestream.id
            )

            url = makeLivestreamUrl(stat.livestream.id, {
               type: "host",
               token,
            })

            push(url)
         } catch (error) {
            errorNotification(
               error,
               "Unable to open the live stream room. Our team has been notified.",
               { url }
            )
         }
      },
      [push, errorNotification]
   )

   const handleShareLiveStream = useCallback((stat: LiveStreamStats) => {
      // Copy livestream link or duplicate functionality
      if (stat.livestream.isDraft) return

      setTargetLivestreamStreamerLinksId(stat.livestream.id)
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

   const handleQuestions = useCallback((stat: LiveStreamStats) => {
      // Open messaging/feedback feature
      alert(
         `Questions for ${stat.livestream.isDraft ? "draft" : "live stream"}: ${
            stat.livestream.id
         }`
      )
   }, [])

   const handleFeedback = useCallback((stat: LiveStreamStats) => {
      // Open feedback/review feature for past livestreams
      alert(
         `Feedback for ${stat.livestream.isDraft ? "draft" : "live stream"}: ${
            stat.livestream.id
         }`
      )
   }, [])

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
      // Navigate to recording view
      alert(
         `Share recording for ${
            stat.livestream.isDraft ? "draft" : "live stream"
         }: ${stat.livestream.id}`
      )
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

   const handleCloseStreamerLinksModal = useCallback(() => {
      setTargetLivestreamStreamerLinksId(null)
   }, [])

   const value = useMemo<EventsViewContextValue>(
      () => ({
         sortBy,
         setSortBy,
         handleTableSort,
         getSortDirection,
         isActiveSort,
         statusFilter,
         setStatusFilter,
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
         <StreamerLinksDialog
            livestreamId={targetLivestreamStreamerLinksId}
            companyName={group?.universityName}
            companyCountryCode={group?.companyCountry?.id}
            openDialog={Boolean(targetLivestreamStreamerLinksId)}
            onClose={handleCloseStreamerLinksModal}
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
