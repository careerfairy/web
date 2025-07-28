import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { Box, styled, TableCell, TableRow, Typography } from "@mui/material"
import { Calendar, Eye, User } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { checkIfPast } from "util/streamUtil"
import { EventCardPreview } from "./EventCardPreview"
import { COLUMN_WIDTHS } from "./EventsTableStyles"
import { getEventDate } from "./EventsTableUtils"
import { QuickActionIcon } from "./QuickActionIcon"
import { StatusIcon } from "./StatusIcon"
import { TableHighlighter } from "./TableHighlighter"

const styles = sxStyles({
   bodyRow: {
      cursor: "pointer",
      transition: "all 0.2s ease-in-out",
      height: 80,
      "& .MuiTableCell-root": {
         borderBottom: "none",
         py: 1,
         border: "1px solid",
         borderColor: (theme) => theme.brand.white[400],
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
      "&:hover": {
         "& .MuiTableCell-root": {
            borderColor: "secondary.100",
            backgroundColor: (theme) => theme.brand.white[400],
         },
      },
   },
   bodyCell: {
      px: 2,
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
}: EventTableRowProps) => {
   const isPastEvent = checkIfPast(stat.livestream)

   return (
      <TableRow
         sx={styles.bodyRow}
         onMouseEnter={onMouseEnter}
         onMouseLeave={onMouseLeave}
      >
         {/* Title Column */}
         <TableCell
            variant="head"
            id="title-column"
            sx={[styles.bodyCell, { minWidth: COLUMN_WIDTHS.title }]}
         >
            <CentredBox>
               <EventCardPreview
                  title={stat.livestream.title}
                  speakers={stat.livestream.speakers}
                  backgroundImageUrl={stat.livestream.backgroundImageUrl}
                  showHoverActions={isHovered}
                  isDraft={stat.livestream.isDraft}
                  isPastEvent={isPastEvent}
                  hasRecordingAvailable={!stat.livestream.denyRecordingAccess}
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
         <TableCell>
            <CentredBox flexShrink={0} width={COLUMN_WIDTHS.date}>
               <TableHighlighter
                  title="Live stream date"
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  color="neutral.600"
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
                  title="Registrations"
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  width={COLUMN_WIDTHS.registrations}
                  color="neutral.600"
               >
                  <Box component={User} size={16} />
                  <Typography variant="small">
                     {stat.generalStats.numberOfRegistrations || 0}
                  </Typography>
               </TableHighlighter>
            </CentredBox>
         </TableCell>

         {/* Views Column */}
         <TableCell>
            <CentredBox>
               <TableHighlighter
                  title="Views"
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  width={COLUMN_WIDTHS.views}
                  color="neutral.600"
               >
                  <Box component={Eye} size={16} />
                  <Typography variant="small">{"-"}</Typography>
               </TableHighlighter>
            </CentredBox>
         </TableCell>

         {/* Status Column */}
         <TableCell>
            <CentredBox gap={0.5} width={COLUMN_WIDTHS.status}>
               <StatusIcon
                  isDraft={stat.livestream.isDraft}
                  hasRecordingAvailable={!stat.livestream.denyRecordingAccess}
                  isPastEvent={isPastEvent}
               />
               <QuickActionIcon />
            </CentredBox>
         </TableCell>
      </TableRow>
   )
}
