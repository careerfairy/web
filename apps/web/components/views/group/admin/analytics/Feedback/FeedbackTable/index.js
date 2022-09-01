import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Box, Card, Divider, Grow, IconButton, Tab, Tabs } from "@mui/material"
import {
   addMinutes,
   prettyDate,
} from "../../../../../../helperFunctions/HelperFunctions"
import {
   renderAppearAfter,
   renderRatingStars,
   tableIcons,
} from "../../common/TableUtils"
import EditFeedbackModal from "./EditFeedbackModal"
import AreYouSureModal from "../../../../../../../materialUI/GlobalModals/AreYouSureModal"
import { useSnackbar } from "notistack"
import FeedbackGraph from "../FeedbackGraph"
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"
import ExportTable from "../../../../../common/Tables/ExportTable"
import { exportSelectionAction } from "../../../../../../util/tableUtils"
import { CSVDialogDownload } from "../../../../../../custom-hook/useMetaDataActions"
import { useFirebaseService } from "../../../../../../../context/firebase/FirebaseServiceContext"

const FeedbackTable = ({
   fetchingStreams,
   userType,
   currentStream,
   group,
   tableRef,
   setCurrentStream,
   setCurrentRating,
   setCurrentPoll,
   breakdownRef,
   setStreamDataType,
   streamDataType,
   currentPoll,
   handleScrollToSideRef,
   currentRating,
   streamDataTypes,
   typesOfOptions,
   userTypes,
   setUserType,
   ...rest
}) => {
   const firebase = useFirebaseService()
   const [tableData, setTableData] = useState({ data: [], columns: [] })
   const [feedbackModalData, setFeedbackModalData] = useState(null)
   const [areYouSureModal, setAreYouSureModal] = useState({
      data: {},
      open: false,
      warning: "",
   })
   const [deletingFeedback, setDeletingFeedback] = useState(false)
   const { enqueueSnackbar } = useSnackbar()
   const renderDisplayButton = useCallback(
      (rowData) => {
         const hasNoData = () => {
            return Boolean(!rowData.voters?.length)
         }
         const handleClick = () => {
            setCurrentRating(rowData)
            handleScrollToSideRef()
         }
         return (
            <Box display="flex" justifyContent="center">
               <IconButton
                  color={
                     currentRating?.id === rowData.id ? undefined : "default"
                  }
                  disabled={hasNoData()}
                  onClick={handleClick}
                  size="large"
               >
                  <ArrowDownwardIcon />
               </IconButton>
            </Box>
         )
      },
      [currentRating, handleScrollToSideRef, setCurrentRating]
   )
   const pollColumns = useMemo(
      () => [
         {
            field: "question",
            title: "Question",
            width: 300,
         },
         {
            field: "state",
            title: "Status",
            lookup: {
               closed: "Answered",
               upcoming: "New",
               current: "Answering",
            },
         },
         {
            field: "date",
            title: "Date Created",
            type: "date",
            render: (rowData) => prettyDate(rowData.timestamp),
         },
      ],
      []
   )

   const questionColumns = useMemo(
      () => [
         {
            field: "title",
            title: "Question",
            cellStyle: {
               width: 400,
            },
         },
         {
            field: "votes",
            title: "Votes",
            type: "numeric",
         },
         {
            field: "date",
            title: "Posted On",
            type: "date",
            render: (rowData) => prettyDate(rowData.timestamp),
         },
         {
            field: "type",
            title: "status",
            lookup: { done: "Answered", new: "New", current: "Answering" },
         },
      ],
      []
   )
   const feedbackColumns = useMemo(
      () => [
         {
            field: "question",
            title: "Question",
            cellStyle: {
               width: 300,
            },
         },
         {
            field: "average",
            title: "Average Rating",
            render: (rowData) =>
               renderRatingStars({
                  rating: rowData.average,
                  id: rowData.id,
                  isSentimentRating: rowData?.isSentimentRating,
               }),
            filtering: false,
         },
         {
            field: "appearAfter",
            title: "Appear After",
            type: "numeric",
            render: renderAppearAfter,
         },
         {
            field: "votes",
            title: "Votes",
            type: "numeric",
         },
         {
            field: "options",
            title: "Breakdown",
            render: renderDisplayButton,
            filtering: false,
            sorting: false,
            disableClickEventBubbling: true,
            export: false,
         },
         {
            field: "hasText",
            title: "Has Written Reviews",
            type: "boolean",
         },
         {
            field: "isSentimentRating",
            title: "Is Sentiment Rating",
            type: "boolean",
         },
         {
            field: "isForEnd",
            title: "Ask on Stream End",
            type: "boolean",
         },
      ],
      [renderDisplayButton]
   )
   useEffect(() => {
      setTableData((prev) => {
         const dataType = streamDataType.propertyName
         const newData = currentStream?.[dataType] || []
         let newColumns = prev.columns
         if (dataType === "pollEntries") {
            newColumns = pollColumns
         } else if (dataType === "questions") {
            newColumns = questionColumns
         } else if (dataType === "feedback") {
            newColumns = feedbackColumns
         }
         return {
            data: newData,
            columns: newColumns,
         }
      })
   }, [
      streamDataType.propertyName,
      currentStream,
      pollColumns,
      questionColumns,
      feedbackColumns,
   ])

   const handleDisplayTable = (rowData) => {
      setCurrentRating(rowData)
      handleScrollToSideRef()
   }

   const handleEditFeedback = (row) => {
      setFeedbackModalData(row)
   }
   const handleCloseFeedbackModal = () => {
      setFeedbackModalData(null)
   }

   const handleCreateFeedback = () => {
      setFeedbackModalData({})
   }
   const handleOpenAreYouSureModal = (row) => {
      const warning = `Are you sure you want to delete the question "${row.question}"? You wont be able to revert this action`
      setAreYouSureModal({ data: row, open: true, warning })
   }

   const handleDeleteFeedback = async () => {
      try {
         setDeletingFeedback(true)
         const { id: livestreamId } = currentStream
         const { id: feedbackId } = areYouSureModal.data
         if (livestreamId && feedbackId) {
            await firebase.deleteFeedbackQuestion(livestreamId, feedbackId)
         }
         handleCloseAreYouSureModal()
      } catch (e) {
         enqueueSnackbar("Something went wrong, please refresh the page", {
            variant: "error",
            preventDuplicate: true,
         })
         handleCloseAreYouSureModal()
      }
      setDeletingFeedback(false)
   }

   const handleCloseAreYouSureModal = () => {
      setAreYouSureModal({ data: {}, open: false, warning: "" })
   }

   const handleMenuItemClick = (event, index) => {
      setStreamDataType(streamDataTypes[index])
   }

   const active = Boolean(currentStream && !currentRating && !currentPoll)

   const isFeedback = Boolean(streamDataType.propertyName === "feedback")

   const isPoll = Boolean(streamDataType.propertyName === "pollEntries")

   const canEdit = useCallback(
      ({ appearAfter, isForEnd }) => {
         if (currentStream && appearAfter) {
            const { start, hasEnded } = currentStream
            if (hasEnded) {
               return false
            }
            const now = new Date()
            const streamStart = start?.toDate()
            const editDeadline = addMinutes(streamStart, appearAfter)
            const editHardDeadline = addMinutes(streamStart, 720)
            if (now > editDeadline) {
               return false
            }
            return !(isForEnd && now > editHardDeadline)
         } else {
            return false
         }
      },
      [currentStream]
   )

   const getTitle = () => {
      let prefix = "Questions"

      if (isFeedback) {
         prefix = "Feedback"
      }

      if (isPoll) {
         prefix = "Polls"
      }

      const stream = currentStream
         ? `For ${currentStream.company} on ${prettyDate(currentStream.start)}`
         : "For all events"

      return `${prefix} - ${stream}`
   }

   const [csvDownloadData, setCsvDownloadData] = useState(null)

   const handleCloseCsvDialog = useCallback(() => {
      setCsvDownloadData(null)
   }, [])

   return (
      <>
         <Card raised={active} ref={breakdownRef} {...rest}>
            <Tabs
               value={streamDataType.propertyName}
               indicatorColor="primary"
               textColor="primary"
               scrollButtons="auto"
               aria-label="disabled tabs example"
            >
               {streamDataTypes.map(({ displayName, propertyName }, index) => (
                  <Tab
                     key={propertyName}
                     value={propertyName}
                     onClick={(event) => handleMenuItemClick(event, index)}
                     label={`${displayName} - ${
                        fetchingStreams
                           ? "..."
                           : currentStream?.[propertyName]?.length || 0
                     }`}
                  />
               ))}
            </Tabs>
            <Divider />
            <ExportTable
               icons={tableIcons}
               {...tableData}
               isLoading={fetchingStreams}
               actions={[
                  exportSelectionAction(
                     tableData.columns,
                     getTitle(),
                     setCsvDownloadData
                  ),
                  (rowData) => ({
                     icon: tableIcons.ThemedEditIcon,
                     iconProps: { color: "primary" },
                     hidden: !isFeedback || !canEdit(rowData),
                     disabled: !canEdit(rowData),
                     position: "row",
                     tooltip: "Edit",
                     onClick: (event, rowData) => handleEditFeedback(rowData),
                  }),
                  {
                     icon: tableIcons.RedDeleteForeverIcon,
                     iconProps: { color: "primary" },
                     hidden: !isFeedback,
                     position: "row",
                     tooltip: "Delete",
                     onClick: (event, rowData) =>
                        handleOpenAreYouSureModal(rowData),
                  },
                  {
                     icon: tableIcons.ThemedAdd,
                     hidden: !isFeedback || !currentStream,
                     isFreeAction: true,
                     iconProps: { color: "primary" },
                     tooltip: "Add Question",
                     onClick: handleCreateFeedback,
                  },
                  (rowData) => ({
                     icon: tableIcons.ArrowDownwardIcon,
                     hidden: !isFeedback,
                     position: "row",
                     disabled: rowData?.votes === 0,
                     iconProps: { color: "green" },
                     tooltip: "Display Table",
                     onClick: (event, rowData) => handleDisplayTable(rowData),
                  }),
               ]}
               title={
                  currentStream &&
                  `For ${currentStream.company} on ${prettyDate(
                     currentStream.start
                  )}`
               }
               detailPanel={
                  isPoll
                     ? [
                          {
                             tooltip: "Show Chart",
                             icon: tableIcons.InsertChartOutlinedIcon,
                             openIcon: tableIcons.InsertChartIcon,
                             render: ({ rowData }) => {
                                return (
                                   <Grow in>
                                      <span>
                                         <FeedbackGraph
                                            group={group}
                                            setCurrentStream={setCurrentStream}
                                            currentStream={currentStream}
                                            typesOfOptions={typesOfOptions}
                                            userTypes={userTypes}
                                            setUserType={setUserType}
                                            currentPoll={rowData}
                                            userType={userType}
                                            streamDataType={streamDataType}
                                         />
                                      </span>
                                   </Grow>
                                )
                             },
                          },
                       ]
                     : []
               }
            />
         </Card>
         {feedbackModalData && (
            <EditFeedbackModal
               currentStream={currentStream}
               handleClose={handleCloseFeedbackModal}
               data={feedbackModalData}
               open={Boolean(feedbackModalData)}
            />
         )}
         <AreYouSureModal
            open={areYouSureModal.open}
            message={areYouSureModal.warning}
            handleConfirm={handleDeleteFeedback}
            loading={deletingFeedback}
            handleClose={handleCloseAreYouSureModal}
            title="Warning"
         />
         <CSVDialogDownload
            title={csvDownloadData?.title}
            data={csvDownloadData?.data}
            filename={`${csvDownloadData?.filename}.csv`}
            defaultOpen={!!csvDownloadData}
            onClose={handleCloseCsvDialog}
         />
      </>
   )
}

export default FeedbackTable
