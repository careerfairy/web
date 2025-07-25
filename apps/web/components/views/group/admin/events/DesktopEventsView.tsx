import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import {
   Box,
   Stack,
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableHead,
   TableRow,
   TableSortLabel,
   Typography,
   TypographyProps,
} from "@mui/material"
import { forwardRef, useState } from "react"
import { Calendar, ChevronDown, Eye, IconProps, User } from "react-feather"
import { sxStyles } from "types/commonTypes"
import useClientSidePagination from "../../../../custom-hook/utils/useClientSidePagination"
import { StyledPagination } from "../common/CardCustom"
import { useEventsView } from "./context/EventsViewContext"
import { CardNameTitle } from "./events-table-new/CardNameTitle"
import { QuickActionIcon } from "./events-table-new/QuickActionIcon"
import { SpeakerAvatars } from "./events-table-new/SpeakerAvatars"
import { StatusIcon } from "./events-table-new/StatusIcon"
import { TableColumn } from "./events-table-new/TableColumn"
import { getEventStatsKey } from "./util"

const styles = sxStyles({
   tableContainer: {
      backgroundColor: (theme) => theme.brand.white[100],
      borderRadius: "16px",
      border: "1px solid",
      borderColor: "secondary.50",
      overflowX: "auto",
      px: 1, // 8px horizontal padding to match Figma design
   },
   table: {
      borderCollapse: "separate",
      borderSpacing: "0px 8px",
      "& .MuiTableHead-root": {
         "& .MuiTableRow-root": {
            "& .MuiTableCell-root": {
               paddingBottom: 0, // 8px gap between header and body to match Figma
            },
         },
      },
   },
   tableHead: {
      backgroundColor: (theme) => theme.brand.white[100],
   },
   headerCell: {
      borderBottom: "none",
      py: 0,
      px: 2,
      backgroundColor: "transparent",
      height: 28,
   },
   headerText: (theme) => ({
      fontWeight: 400,
      ...theme.typography.xsmall,
      color: "common.black",
   }),
   headerTextActive: {
      fontWeight: 600,
   },
   bodyRow: {
      cursor: "pointer",
      transition: "all 0.2s ease-in-out",
      height: 80, // Fixed row height
      "& .MuiTableCell-root": {
         borderBottom: "none",
         py: 1,
         px: 2,
         border: "1px solid",
         borderColor: (theme) => theme.brand.white[400],
         backgroundColor: (theme) => theme.brand.white[200],
         boxSizing: "border-box",
         transition: "all 0.2s ease-in-out",
         height: 80, // Fixed cell height
         verticalAlign: "top", // Align content to top
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
            borderColor: "secondary.100", // Light purple border
            backgroundColor: (theme) => theme.brand.white[400], // Light background
         },
      },
   },
   infoText: {
      fontSize: "14px",
      lineHeight: "20px",
      fontWeight: 400,
      color: "neutral.600",
      whiteSpace: "nowrap",
   },
})

type Props = {
   stats: LiveStreamStats[]
}

const HeaderText = ({
   children,
   active,
}: TypographyProps & { active?: boolean }) => {
   return (
      <Typography sx={[styles.headerText, active && styles.headerTextActive]}>
         {children}
      </Typography>
   )
}

const HeaderIcon = forwardRef<HTMLSpanElement, IconProps>((props, ref) => (
   <Box
      component="span"
      ref={ref}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
   >
      <ChevronDown strokeWidth={3} size={16} {...props} />
   </Box>
))
HeaderIcon.displayName = "HeaderIcon"

export const DesktopEventsView = ({ stats }: Props) => {
   const { handleTableSort, getSortDirection, isActiveSort } = useEventsView()
   const [hoveredRow, setHoveredRow] = useState<string | null>(null)

   const { currentPageData, currentPage, totalPages, goToPage } =
      useClientSidePagination({
         data: stats,
         itemsPerPage: 10,
      })

   const handleRowMouseEnter = (statKey: string) => {
      setHoveredRow(statKey)
   }

   const handleRowMouseLeave = () => {
      setHoveredRow(null)
   }

   // Placeholder handlers for action buttons - these would be implemented based on requirements
   const handleExternalLink = (stat: LiveStreamStats) => {
      // Navigate to external view of the livestream
      console.log("External link for:", stat.livestream.title)
   }

   const handleCopy = (stat: LiveStreamStats) => {
      // Copy livestream link or duplicate functionality
      console.log("Copy/duplicate:", stat.livestream.title)
   }

   const handleAnalytics = (stat: LiveStreamStats) => {
      // Navigate to analytics view
      console.log("Analytics for:", stat.livestream.title)
   }

   const handleMessage = (stat: LiveStreamStats) => {
      // Open messaging/feedback feature
      console.log("Message for:", stat.livestream.title)
   }

   const handleFeedback = (stat: LiveStreamStats) => {
      // Open feedback/review feature for past livestreams
      console.log("Feedback for:", stat.livestream.title)
   }

   return (
      <Box>
         <TableContainer sx={styles.tableContainer}>
            <Table sx={styles.table}>
               <TableHead sx={styles.tableHead}>
                  <TableRow>
                     <TableCell sx={styles.headerCell}>
                        <TableSortLabel
                           active={isActiveSort("title")}
                           direction={getSortDirection("title")}
                           onClick={() => handleTableSort("title")}
                           IconComponent={HeaderIcon}
                        >
                           <HeaderText active={isActiveSort("title")}>
                              Live stream title
                           </HeaderText>
                        </TableSortLabel>
                     </TableCell>
                     <TableCell sx={styles.headerCell}>
                        <HeaderText>Speakers</HeaderText>
                     </TableCell>
                     <TableCell sx={styles.headerCell}>
                        <TableSortLabel
                           active={isActiveSort("date")}
                           direction={getSortDirection("date")}
                           onClick={() => handleTableSort("date")}
                           IconComponent={HeaderIcon}
                        >
                           <HeaderText active={isActiveSort("date")}>
                              Date
                           </HeaderText>
                        </TableSortLabel>
                     </TableCell>
                     <TableCell sx={styles.headerCell}>
                        <TableSortLabel
                           active={isActiveSort("registrations")}
                           direction={getSortDirection("registrations")}
                           onClick={() => handleTableSort("registrations")}
                           IconComponent={HeaderIcon}
                        >
                           <HeaderText active={isActiveSort("registrations")}>
                              Registrations
                           </HeaderText>
                        </TableSortLabel>
                     </TableCell>
                     <TableCell sx={styles.headerCell}>
                        <HeaderText>Views</HeaderText>
                     </TableCell>
                     <TableCell sx={styles.headerCell}>
                        <HeaderText>Status</HeaderText>
                     </TableCell>
                     <TableCell sx={styles.headerCell} width={48}>
                        {/* Actions column */}
                     </TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {currentPageData.map((stat) => {
                     const statKey = getEventStatsKey(stat)
                     const isHovered = hoveredRow === statKey

                     return (
                        <TableRow
                           key={statKey}
                           sx={styles.bodyRow}
                           onMouseEnter={() => handleRowMouseEnter(statKey)}
                           onMouseLeave={handleRowMouseLeave}
                        >
                           {/* Title Column */}
                           <TableCell
                              variant="head"
                              id="title-column"
                              sx={{ minWidth: 300 }}
                           >
                              <CardNameTitle
                                 title={stat.livestream.title}
                                 backgroundImageUrl={
                                    stat.livestream.backgroundImageUrl
                                 }
                                 showHoverActions={isHovered}
                                 isDraft={stat.livestream.isDraft}
                                 isPastEvent={
                                    stat.livestream.start
                                       ? stat.livestream.start.toDate() <
                                         new Date()
                                       : false
                                 }
                                 isNotRecorded={
                                    !stat.generalStats.numberOfPeopleReached
                                 }
                                 onExternalLink={() => handleExternalLink(stat)}
                                 onCopy={() => handleCopy(stat)}
                                 onAnalytics={() => handleAnalytics(stat)}
                                 onMessage={() => handleMessage(stat)}
                                 onFeedback={() => handleFeedback(stat)}
                              />
                           </TableCell>

                           {/* Speakers Column */}
                           <TableCell sx={{ minWidth: 124 }}>
                              <SpeakerAvatars
                                 speakers={stat.livestream.speakers}
                                 maxVisible={3}
                              />
                           </TableCell>

                           {/* Date Column */}
                           <TableCell sx={{ width: 170 }}>
                              <TableColumn
                                 icon={<Calendar size={16} color="#6B6B7F" />}
                                 text={
                                    stat.livestream.start
                                       ? stat.livestream.start
                                            .toDate()
                                            .toLocaleDateString("en-US", {
                                               day: "2-digit",
                                               month: "short",
                                               year: "2-digit",
                                               hour: "2-digit",
                                               minute: "2-digit",
                                               hour12: true,
                                            })
                                       : "No date"
                                 }
                                 width={170}
                              />
                           </TableCell>

                           {/* Registrations Column */}
                           <TableCell sx={{ minWidth: 139 }}>
                              <TableColumn
                                 icon={<User size={16} color="#6B6B7F" />}
                                 text={
                                    stat.generalStats.numberOfRegistrations || 0
                                 }
                                 width={100}
                              />
                           </TableCell>

                           {/* Views Column */}
                           <TableCell sx={{ width: 100 }}>
                              <TableColumn
                                 icon={<Eye size={16} color="#6B6B7F" />}
                                 text={
                                    stat.generalStats.numberOfPeopleReached ||
                                    "-"
                                 }
                                 width={100}
                              />
                           </TableCell>

                           {/* Status Column */}
                           <TableCell sx={{ width: 80 }}>
                              <StatusIcon
                                 isDraft={stat.livestream.isDraft}
                                 start={stat.livestream.start}
                              />
                           </TableCell>

                           {/* Actions Column */}
                           <TableCell sx={{ width: 48 }}>
                              <QuickActionIcon />
                           </TableCell>
                        </TableRow>
                     )
                  })}
               </TableBody>
            </Table>
         </TableContainer>

         {totalPages > 1 && (
            <Stack
               direction="row"
               justifyContent="flex-end"
               alignItems="center"
               spacing={2}
               mt={2}
            >
               <StyledPagination
                  color="secondary"
                  size="small"
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, page) => goToPage(page)}
               />
            </Stack>
         )}
      </Box>
   )
}
