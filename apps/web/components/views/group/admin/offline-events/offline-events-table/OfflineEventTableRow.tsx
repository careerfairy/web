import { Box, styled, TableCell, TableRow, Typography } from "@mui/material"
import { OfflineEventsWithStats } from "components/custom-hook/offline-event/useGroupOfflineEventsWithStats"
import PointerClickIcon from "components/views/common/icons/PointerClickIcon"
import { useCallback } from "react"
import { Calendar, Eye } from "react-feather"
import { useSelector } from "react-redux"
import { sxStyles } from "types/commonTypes"
import { withStopPropagation } from "util/CommonUtil"
import DateUtil from "util/DateUtil"
import { selectIsRowHovered } from "../../../../../../store/selectors/offlineEventsTableSelectors"
import { TableHighlighter } from "../../events/events-table-new/TableHighlighter"
import { OfflineEventCardPreview } from "./OfflineEventCardPreview"
import { OfflineEventStatusBadge } from "./OfflineEventStatusBadge"
import { OfflineEventTableRowActions } from "./OfflineEventTableRowActions"
import { getOfflineEventStatus, OfflineEventStatus } from "./utils"

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

type Props = {
   stat: OfflineEventsWithStats
   statKey: string
   onMouseEnter: (statKey: string) => void
   onMouseLeave: () => void
   onViewOfflineEvent: (stat: OfflineEventsWithStats) => void
   onShareOfflineEvent: (stat: OfflineEventsWithStats) => void
   onAnalytics: (stat: OfflineEventsWithStats) => void
   onEdit: (stat: OfflineEventsWithStats) => void
   onViewRegistration: (stat: OfflineEventsWithStats) => void
   onViewDetails: (stat: OfflineEventsWithStats) => void
   onDelete: (stat: OfflineEventsWithStats) => void
   onClicksClick: (stat: OfflineEventsWithStats) => void
   onViewsClick: (stat: OfflineEventsWithStats) => void
}

export const OfflineEventTableRow = ({
   stat,
   statKey,
   onMouseEnter,
   onMouseLeave,
   onViewOfflineEvent,
   onShareOfflineEvent,
   onAnalytics,
   onEdit,
   onViewRegistration,
   onViewDetails,
   onDelete,
   onClicksClick,
   onViewsClick,
}: Props) => {
   const isHovered = useSelector(selectIsRowHovered(statKey))

   const handleMouseEnter = useCallback(() => {
      onMouseEnter(statKey)
   }, [onMouseEnter, statKey])

   const handleMouseLeave = useCallback(() => {
      onMouseLeave()
   }, [onMouseLeave])

   const status = getOfflineEventStatus(stat.offlineEvent)

   const eventDate = stat.offlineEvent.startAt
      ? DateUtil.formatEventDate(stat.offlineEvent.startAt.toDate())
      : "No date"

   const statusTitle =
      status === OfflineEventStatus.UPCOMING
         ? "Upcoming"
         : status === OfflineEventStatus.DRAFT
         ? "Draft"
         : "Past"

   return (
      <TableRow
         key={statKey}
         sx={[styles.bodyRow, isHovered && styles.bodyRowHovered]}
         onMouseEnter={handleMouseEnter}
         onMouseLeave={handleMouseLeave}
         onFocus={handleMouseEnter}
         onBlur={handleMouseLeave}
         onClick={withStopPropagation(() => onEdit(stat))}
      >
         {/* Event Name Column */}
         <TableCell variant="head" sx={styles.bodyCell}>
            <CentredBox>
               <OfflineEventCardPreview
                  stat={stat}
                  showHoverActions={isHovered}
                  status={status}
                  onShareOfflineEvent={() => onShareOfflineEvent(stat)}
                  onAnalytics={() => onAnalytics(stat)}
                  onEdit={() => onEdit(stat)}
               />
            </CentredBox>
         </TableCell>

         {/* Date Column */}
         <TableCell sx={styles.bodyCell}>
            <CentredBox>
               <TableHighlighter
                  title="Offline event date"
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  color="neutral.600"
                  cursor="default"
               >
                  <Box component={Calendar} size={16} />
                  <Typography variant="small" whiteSpace="nowrap">
                     {eventDate}
                  </Typography>
               </TableHighlighter>
            </CentredBox>
         </TableCell>

         {/* Views Column */}
         <TableCell>
            <CentredBox>
               <TableHighlighter
                  onClick={withStopPropagation(() => onViewsClick(stat))}
                  title="Views"
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  color="neutral.600"
                  width={92}
                  cursor="pointer"
               >
                  <Box component={Eye} size={16} />
                  <Typography variant="small">
                     {stat.stats?.totalViews ?? 0}
                  </Typography>
               </TableHighlighter>
            </CentredBox>
         </TableCell>

         {/* Clicks Column */}
         <TableCell>
            <CentredBox>
               <TableHighlighter
                  onClick={withStopPropagation(() => onClicksClick(stat))}
                  title="Clicks"
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  color="neutral.600"
                  width={92}
                  cursor="pointer"
               >
                  <Box component={PointerClickIcon} color={"white"} />
                  <Typography variant="small">
                     {stat.stats?.totalClicks ?? 0}
                  </Typography>
               </TableHighlighter>
            </CentredBox>
         </TableCell>

         {/* Status Column */}
         <TableCell sx={styles.bodyCell}>
            <CentredBox gap={0.5}>
               <Box>
                  <TableHighlighter
                     title={statusTitle}
                     direction="row"
                     alignItems="center"
                     spacing={1}
                     color="neutral.600"
                     cursor="default"
                  >
                     <OfflineEventStatusBadge status={status} />
                  </TableHighlighter>
               </Box>
               <OfflineEventTableRowActions
                  stat={stat}
                  status={status}
                  isHovered={isHovered}
                  onViewOfflineEvent={onViewOfflineEvent}
                  onShareOfflineEvent={onShareOfflineEvent}
                  onAnalytics={onAnalytics}
                  onEdit={onEdit}
                  onViewRegistration={onViewRegistration}
                  onViewDetails={onViewDetails}
                  onDelete={onDelete}
               />
            </CentredBox>
         </TableCell>
      </TableRow>
   )
}
