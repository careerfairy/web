import { Group } from "@careerfairy/shared-lib/dist/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import MaterialTable, {
   Action,
   Column,
   MTableAction,
   Options,
} from "@material-table/core"
import AddBoxIcon from "@mui/icons-material/AddBox"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import PublishIcon from "@mui/icons-material/Publish"
import GetStreamerLinksIcon from "@mui/icons-material/Share"
import { Box, CircularProgress } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useMetaDataActions } from "components/custom-hook/useMetaDataActions"
import { defaultTableOptions, tableIcons } from "components/util/tableUtils"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { useRouter } from "next/router"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useAuth } from "../../../../../../HOCs/AuthProvider"
import { errorLogAndNotify } from "../../../../../../util/CommonUtil"
import {
   getResizedUrl,
   prettyDate,
} from "../../../../../helperFunctions/HelperFunctions"
import PdfReportDownloadDialog from "../PdfReportDownloadDialog"
import ToolbarActionsDialog from "../ToolbarActionsDialog"
import StreamerLinksDialog from "../enhanced-group-stream-card/StreamerLinksDialog"
import CompanyLogo from "./CompanyLogo"
import DeleteEventDialog from "./DeleteEventDialog"
import GroupLogos from "./GroupLogos"
import ManageStreamActions from "./ManageStreamActions"
import Speakers from "./Speakers"
import ToolbarDialogAction from "./ToolbarDialogAction"

interface Props {
   streams: LivestreamEvent[]
   isDraft: boolean
   group: Group
   publishingDraft: boolean
   handlePublishStream: (stream: LivestreamEvent) => void
   isPast: boolean
   setGroupsDictionary: React.Dispatch<
      React.SetStateAction<Record<string, Group>>
   >
   groupsDictionary: Record<string, Group>
   eventId: string
}

const EventsTable = ({
   streams,
   isDraft,
   group,
   publishingDraft,
   handlePublishStream,
   isPast,
   setGroupsDictionary,
   groupsDictionary,
   eventId,
}: Props) => {
   const [clickedRows, setClickedRows] = useState({})
   const firebase = useFirebaseService()
   const theme = useTheme()
   const { pathname, push, query } = useRouter()
   const { userData } = useAuth()
   const [deletingEvent, setDeletingEvent] = useState(false)
   const [streamIdToBeDeleted, setStreamIdToBeDeleted] = useState(null)
   const [toolbarActionsDialogOpen, setToolbarActionsDialogOpen] =
      useState(false)
   const [targetStream, setTargetStream] = useState<LivestreamEvent>(null)

   const {
      talentPoolAction,
      pdfReportAction,
      registeredStudentsAction,
      removeReportPdfData,
      reportPdfData,
      participatedStudentsAction,
      getNumberOfRegisteredStudents,
   } = useMetaDataActions({
      group,
      isPast,
      isDraft,
      targetStream,
   })

   const router = useRouter()

   const [targetLivestreamStreamerLinksId, setTargetLivestreamStreamerLinksId] =
      useState("")

   useEffect(() => {
      if (eventId) {
         handleRowClick(undefined, { id: eventId })
      }
   }, [eventId])

   useEffect(() => {
      if (streams?.length) {
         const handleGetGroups = async () => {
            const groupsWithoutData = streams.reduce((acc, currentStream) => {
               const newIdsOfGroupsThatNeedData = []
               if (currentStream.groupIds.length) {
                  currentStream.groupIds.forEach((groupId) => {
                     if (!groupsDictionary[groupId]) {
                        newIdsOfGroupsThatNeedData.push(groupId)
                     }
                  })
               }
               return acc.concat(newIdsOfGroupsThatNeedData)
            }, [])
            const newGroupLogoDictionary = await firebase.getGroupsInfo([
               ...new Set(groupsWithoutData),
            ])
            setGroupsDictionary((prevState) => ({
               ...prevState,
               ...newGroupLogoDictionary,
            }))
         }
         handleGetGroups()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [streams])

   const handleSpeakerSearch = useCallback(
      (term, rowData) =>
         rowData.speakers.some(
            (speaker) =>
               speaker.firstName.toLowerCase().indexOf(term.toLowerCase()) >=
                  0 ||
               speaker.lastName.toLowerCase().indexOf(term.toLowerCase()) >= 0
         ),
      []
   )

   const handleHostsSearch = useCallback(
      (term, rowData) =>
         rowData.groupIds?.some(
            (groupId) =>
               groupsDictionary[groupId]?.universityName
                  ?.toLowerCase()
                  .indexOf(term.toLowerCase()) >= 0
         ),
      [groupsDictionary]
   )
   const handleCompanySearch = useCallback(
      (term, rowData) =>
         rowData.company?.toLowerCase?.().indexOf(term.toLowerCase()) >= 0,
      []
   )

   const handleOpenToolbarActionsDialog = useCallback(() => {
      setToolbarActionsDialogOpen(true)
   }, [])
   const handleCloseToolbarActionsDialog = useCallback(() => {
      setToolbarActionsDialogOpen(false)
   }, [])

   const handleDeleteStream = useCallback(async () => {
      try {
         setDeletingEvent(true)
         const targetCollection = isDraft ? "draftLivestreams" : "livestreams"
         await firebase.deleteLivestream(streamIdToBeDeleted, targetCollection)
         setDeletingEvent(false)
      } catch (e) {
         errorLogAndNotify(e)
         setDeletingEvent(false)
      }
      setStreamIdToBeDeleted(null)
   }, [isDraft, firebase, streamIdToBeDeleted])

   const handleOpenStreamerLinksModal = useCallback((rowData) => {
      if (rowData.id) {
         setTargetLivestreamStreamerLinksId(rowData.id)
      }
   }, [])
   const handleCloseStreamerLinksModal = useCallback(() => {
      setTargetLivestreamStreamerLinksId("")
   }, [])

   const handleClickDeleteStream = useCallback((streamId) => {
      setStreamIdToBeDeleted(streamId)
   }, [])

   const handleEditStreamV2 = useCallback((groupId, livestreamId) => {
      router.push(`/group/${groupId}/admin/events/${livestreamId}`)
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [])

   const manageStreamActions = useCallback(
      (rowData) => {
         const result = [
            {
               icon: <EditIcon color="action" />,
               tooltip: "Edit Event",
               onClick: () => handleEditStreamV2(group.groupId, rowData.id),
               hintTitle: "Edit live stream in new flow",
               hintDescription:
                  "Edit the details of the event like the start date and speakers in the new flow.",
            },
            pdfReportAction(rowData),
            registeredStudentsAction(rowData),
            participatedStudentsAction(rowData),
            talentPoolAction(rowData),
            {
               icon: <GetStreamerLinksIcon color="action" />,
               tooltip: "Get Stream Links",
               onClick: () => handleOpenStreamerLinksModal(rowData),
               hidden: isDraft,
               hintTitle: "Get Stream Links",
               hintDescription:
                  "Get links to share with other streamers and viewers, and access your streaming room directly.",
            },
            {
               icon: <DeleteIcon color="action" />,
               tooltip: isDraft ? "Delete Draft" : "Delete Event",
               onClick: () => handleClickDeleteStream(rowData.id),
               hintTitle: isDraft ? "Delete Draft" : "Delete Event",
               hidden: isDraft
                  ? false
                  : rowData.author?.groupId !== group.groupId &&
                    !userData?.isAdmin,
               hintDescription: userData?.isAdmin
                  ? "You can delete this event because you are a CF admin"
                  : "Deleting an event is a permanent action and cannot be undone.",
            },
            {
               icon: publishingDraft ? (
                  <CircularProgress size={20} color="inherit" />
               ) : (
                  <PublishIcon color="action" />
               ),
               tooltip: publishingDraft
                  ? "Publishing"
                  : !rowData.status?.pendingApproval
                  ? "Needs Approval"
                  : "Publish Stream",
               onClick: !rowData.status?.pendingApproval
                  ? () => handleEditStreamV2(group.groupId, rowData.id)
                  : () => handlePublishStream(rowData),
               hidden: !isDraft,
               disabled: publishingDraft,
               hintTitle: "Publish Stream",
               hintDescription:
                  "Once you are happy with the contents of the drafted event, you can then make it live so that users can now register.",
            },
         ]

         return result
      },
      [
         isDraft,
         pdfReportAction,
         registeredStudentsAction,
         participatedStudentsAction,
         talentPoolAction,
         group.groupId,
         userData?.isAdmin,
         publishingDraft,
         handleEditStreamV2,
         handleOpenStreamerLinksModal,
         handleClickDeleteStream,
         handlePublishStream,
      ]
   )

   const actions = useMemo<Action<LivestreamEvent>[]>(
      () => [
         {
            position: "toolbar",
            icon: () => <AddBoxIcon fontSize="large" color="primary" />,
            onClick: handleOpenToolbarActionsDialog,
            tooltip: "New event",
         },
      ],
      [handleOpenToolbarActionsDialog]
   )

   const columns = useMemo<Column<LivestreamEvent>[]>(
      () => [
         {
            field: "backgroundImageUrl",
            title: "Logo",
            cellStyle: (backgroundImageUrl) => ({
               padding: 0,
               height: 70,
               boxShadow: theme.shadows[2],
               backgroundImage:
                  backgroundImageUrl &&
                  `url("${getResizedUrl(backgroundImageUrl, "xs")}")`,
               backgroundSize: "cover",
               backgroundRepeat: "no-repeat",
            }),
            export: false,
            customFilterAndSearch: handleCompanySearch,
            render: (rowData) => (
               <CompanyLogo
                  onClick={(event) => {
                     event.stopPropagation()
                     handleEditStreamV2(group.groupId, rowData.id)
                  }}
                  livestream={rowData}
               />
            ),
         },
         {
            title: "Manage",
            description: "Title of the event",
            render: (rowData) => (
               <ManageStreamActions
                  rowData={rowData}
                  numberOfRegisteredUsers={getNumberOfRegisteredStudents(
                     rowData
                  )}
                  clicked={Boolean(clickedRows[rowData?.id])}
                  isDraft={isDraft}
                  setTargetStream={setTargetStream}
                  actions={manageStreamActions(rowData)}
               />
            ),
         },
         {
            field: "date",
            title: "Event Date",
            render: (rowData) => {
               return prettyDate(rowData.start)
            },
            type: "date",
         },
         {
            field: "title",
            title: "Title",
            description: "Title of the event",
         },
         {
            field: "company",
            title: "Company",
         },
         {
            title: "Speakers",
            render: (rowData) => {
               return (
                  <Speakers
                     clicked={Boolean(clickedRows[rowData?.id])}
                     speakers={rowData.speakers}
                  />
               )
            },
            customFilterAndSearch: handleSpeakerSearch,
         },
         {
            title: "Host(s)",
            render: (rowData) => {
               return (
                  <GroupLogos
                     groupIds={rowData.groupIds}
                     clicked={Boolean(clickedRows[rowData?.id])}
                     groupsDictionary={groupsDictionary}
                  />
               )
            },
            customFilterAndSearch: handleHostsSearch,
         },
      ],
      [
         handleCompanySearch,
         handleSpeakerSearch,
         handleHostsSearch,
         theme.shadows,
         handleEditStreamV2,
         group.groupId,
         getNumberOfRegisteredStudents,
         clickedRows,
         isDraft,
         manageStreamActions,
         groupsDictionary,
      ]
   )

   const customOptions = useMemo<Options<LivestreamEvent>>(
      () => ({
         ...defaultTableOptions,
         actionsColumnIndex: -1,
         selection: false,
         pageSize: 5,
         actionsCellStyle: {},
         rowStyle: (rowData) => {
            if (rowData.id === eventId) {
               return { border: `5px solid ${theme.palette.primary.main}` }
            }
            return {}
         },
      }),
      [eventId, theme.palette.primary.main]
   )

   const handleRemoveEventId = () => {
      if (eventId) {
         const newQuery = { ...query }
         if (newQuery.eventId) {
            delete newQuery.eventId
         }
         return push({
            pathname,
            query: {
               ...newQuery,
            },
         })
      }
   }

   const handleRowClick = (event, rowData) => {
      setClickedRows((prevState) => {
         const newClickedRows = { ...prevState }
         newClickedRows[rowData.id] = !newClickedRows[rowData.id]
         return newClickedRows
      })
   }

   return (
      <>
         <Box onClick={handleRemoveEventId}>
            <MaterialTable
               style={{ display: "inline-grid" }}
               actions={actions}
               columns={columns}
               data={streams}
               components={{
                  Action: (props) => {
                     return props?.action?.tooltip === "New event" ? (
                        <ToolbarDialogAction {...props.action} />
                     ) : (
                        <MTableAction {...props} />
                     )
                  },
               }}
               onRowClick={handleRowClick}
               options={customOptions}
               title={null}
               icons={tableIcons}
            />
         </Box>
         {streamIdToBeDeleted ? (
            <SuspenseWithBoundary fallback={<></>}>
               <DeleteEventDialog
                  groupId={group.groupId}
                  livestreamId={streamIdToBeDeleted}
                  handleClose={() => setStreamIdToBeDeleted(null)}
                  handleConfirm={handleDeleteStream}
                  loading={deletingEvent}
                  message={`Are you sure you want to delete this ${
                     isDraft ? "draft" : "stream"
                  }? you will be no longer able to recover it`}
               />
            </SuspenseWithBoundary>
         ) : null}
         <StreamerLinksDialog
            livestreamId={targetLivestreamStreamerLinksId}
            companyName={group.universityName}
            companyCountryCode={group.companyCountry?.id}
            openDialog={Boolean(targetLivestreamStreamerLinksId)}
            onClose={handleCloseStreamerLinksModal}
         />
         <PdfReportDownloadDialog
            openDialog={Boolean(reportPdfData)}
            onClose={removeReportPdfData}
            reportPdfData={reportPdfData}
         />
         <ToolbarActionsDialog
            group={group}
            onClose={handleCloseToolbarActionsDialog}
            openDialog={toolbarActionsDialogOpen}
         />
      </>
   )
}

export default EventsTable
