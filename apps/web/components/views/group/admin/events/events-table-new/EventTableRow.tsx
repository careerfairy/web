import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { Box, styled, TableCell, TableRow, Typography } from "@mui/material"
import { useRecordingViewsSWR } from "components/custom-hook/recordings/useRecordingViewsSWR"
import { Calendar, Eye, User } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { withStopPropagation } from "util/CommonUtil"
import { EventCardPreview } from "./EventCardPreview"
import { QuickActionIcon } from "./QuickActionIcon"
import { StatusIcon } from "./StatusIcon"
import { TableHighlighter } from "./TableHighlighter"
import {
   getEventDate,
   getLivestreamEventStatus,
   getViewValue,
   LivestreamEventStatus,
} from "./utils"

const styles = sxStyles({
   bodyRow: {
      transition: "all 0.2s ease-in-out",
      height: 80,
      "& .MuiTableCell-root": {
         cursor: "pointer",
         borderBottom: "none",
         py: 1,
         border: "1px solid",
         borderColor: (theme) => theme.brand.purple[50],
         backgroundColor: (theme) => theme.brand.white[200],
         boxSizing: "border-box",
         transition: "all 0.2s ease-in-out",
         height: 80,
         verticalAlign: "top",
         "&:first-of-type": {
            borderTopLeftRadius: "8px",
            borderBottomLeftRadius: "8px",
            borderRight: "none",
         },
         "&:not(:first-of-type):not(:last-child)": {
            borderLeft: "none",
            borderRight: "none",
         },
         "&:last-child": {
            borderTopRightRadius: "8px",
            borderBottomRightRadius: "8px",
            borderLeft: "none",
         },
      },
   },
   bodyRowHovered: {
      "& .MuiTableCell-root": {
         borderColor: "secondary.100",
         backgroundColor: (theme) => theme.brand.white[400],
      },
   },
   bodyCell: {
      px: 1,
   },
})

const CentredBox = styled(Box)({
   display: "flex",
   alignItems: "center",
   width: "100%",
   height: "100%",
})

type EventTableRowProps = {
   stat: LiveStreamStats
   isHovered: boolean
   onMouseEnter: () => void
   onMouseLeave: () => void
   onEnterLiveStreamRoom: () => void
   onShareLiveStream: () => void
   onShareRecording: () => void
   onAnalytics: () => void
   onQuestions: () => void
   onFeedback: () => void
   onEdit: () => void
   onRegistrationsClick: () => void
   onViewsClick: () => void
}

export const EventTableRow = ({
   stat,
   isHovered,
   onMouseEnter,
   onMouseLeave,
   onEnterLiveStreamRoom,
   onShareLiveStream,
   onShareRecording,
   onAnalytics,
   onQuestions,
   onFeedback,
   onEdit,
   onRegistrationsClick,
   onViewsClick,
}: EventTableRowProps) => {
   const eventStatus = getLivestreamEventStatus(stat.livestream)

   const shouldFetchRecordingViews =
      eventStatus === LivestreamEventStatus.RECORDING

   const { totalViews, loading } = useRecordingViewsSWR(
      shouldFetchRecordingViews ? stat.livestream.id : null
   )

   const viewValue = getViewValue(
      eventStatus,
      totalViews,
      loading,
      stat.generalStats?.numberOfParticipants
   )

   return (
      <TableRow
         sx={[styles.bodyRow, isHovered && styles.bodyRowHovered]}
         onMouseEnter={onMouseEnter}
         onMouseLeave={onMouseLeave}
         onFocus={onMouseEnter}
         onBlur={onMouseLeave}
         onClick={withStopPropagation(onEdit)}
      >
         {/* Title Column */}
         <TableCell variant="head" sx={styles.bodyCell}>
            <CentredBox>
               <EventCardPreview
                  title={stat.livestream.title}
                  speakers={stat.livestream.speakers}
                  backgroundImageUrl={stat.livestream.backgroundImageUrl}
                  showHoverActions={isHovered}
                  eventStatus={eventStatus}
                  onEnterLiveStreamRoom={onEnterLiveStreamRoom}
                  onShareLiveStream={onShareLiveStream}
                  onShareRecording={onShareRecording}
                  onAnalytics={onAnalytics}
                  onQuestions={onQuestions}
                  onFeedback={onFeedback}
                  onEdit={onEdit}
               />
            </CentredBox>
         </TableCell>

         {/* Date Column */}
         <TableCell sx={styles.bodyCell}>
            <CentredBox>
               <TableHighlighter
                  title="Live stream date"
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  color="neutral.600"
                  cursor="default"
               >
                  <Box component={Calendar} size={16} />
                  <Typography variant="small" whiteSpace="nowrap">
                     {getEventDate(stat)}
                  </Typography>
               </TableHighlighter>
            </CentredBox>
         </TableCell>

         {/* Registrations Column */}
         <TableCell>
            <CentredBox>
               <TableHighlighter
                  onClick={withStopPropagation(onRegistrationsClick)}
                  title="Registrations"
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  color="neutral.600"
                  width={92}
                  cursor={
                     eventStatus === LivestreamEventStatus.DRAFT
                        ? "default"
                        : "pointer"
                  }
               >
                  <Box component={User} size={16} />
                  <Typography variant="small">
                     {eventStatus === LivestreamEventStatus.DRAFT
                        ? "-"
                        : stat.generalStats.numberOfRegistrations || 0}
                  </Typography>
               </TableHighlighter>
            </CentredBox>
         </TableCell>

         {/* Views Column */}
         <TableCell>
            <CentredBox>
               <TableHighlighter
                  onClick={withStopPropagation(onViewsClick)}
                  title="Views"
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  color="neutral.600"
                  width={92}
                  cursor={
                     eventStatus === LivestreamEventStatus.DRAFT
                        ? "default"
                        : "pointer"
                  }
               >
                  <Box component={Eye} size={16} />
                  <Typography variant="small">{viewValue}</Typography>
               </TableHighlighter>
            </CentredBox>
         </TableCell>

         {/* Status Column */}
         <TableCell sx={styles.bodyCell}>
            <CentredBox gap={0.5}>
               <Box p={1}>
                  <StatusIcon status={eventStatus} size={20} />
               </Box>
               <QuickActionIcon stat={stat} eventStatus={eventStatus} />
            </CentredBox>
         </TableCell>
      </TableRow>
   )
}
