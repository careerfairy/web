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
} from "@mui/material"
import { Calendar, Eye, User } from "react-feather"
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
      overflow: "hidden",
   },
   table: {
      borderCollapse: "separate",
      borderSpacing: "0px 8px",
   },
   tableHead: {
      backgroundColor: (theme) => theme.brand.white[100],
   },
   headerCell: {
      borderBottom: "none",
      py: 1,
      px: 2,
      backgroundColor: "transparent",
   },
   headerText: {
      fontWeight: 400,
      fontSize: "12px",
      lineHeight: "16px",
      color: "text.primary",
   },
   bodyRow: {
      backgroundColor: (theme) => theme.brand.white[200],
      border: "1px solid",
      borderColor: "neutral.50",
      borderRadius: "8px",
      "& .MuiTableCell-root": {
         borderBottom: "none",
         py: 1,
         px: 2,
         "&:first-of-type": {
            borderTopLeftRadius: "8px",
            borderBottomLeftRadius: "8px",
         },
         "&:last-child": {
            borderTopRightRadius: "8px",
            borderBottomRightRadius: "8px",
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

export const DesktopEventsView = ({ stats }: Props) => {
   const { handleTableSort, getSortDirection, isActiveSort } = useEventsView()

   const { currentPageData, currentPage, totalPages, goToPage } =
      useClientSidePagination({
         data: stats,
         itemsPerPage: 10,
      })

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
                        >
                           <Typography sx={styles.headerText}>
                              Live stream title
                           </Typography>
                        </TableSortLabel>
                     </TableCell>
                     <TableCell sx={styles.headerCell}>
                        <Typography sx={styles.headerText}>Speakers</Typography>
                     </TableCell>
                     <TableCell sx={styles.headerCell}>
                        <TableSortLabel
                           active={isActiveSort("date")}
                           direction={getSortDirection("date")}
                           onClick={() => handleTableSort("date")}
                        >
                           <Typography sx={styles.headerText}>Date</Typography>
                        </TableSortLabel>
                     </TableCell>
                     <TableCell sx={styles.headerCell}>
                        <TableSortLabel
                           active={isActiveSort("registrations")}
                           direction={getSortDirection("registrations")}
                           onClick={() => handleTableSort("registrations")}
                        >
                           <Typography sx={styles.headerText}>
                              Registrations
                           </Typography>
                        </TableSortLabel>
                     </TableCell>
                     <TableCell sx={styles.headerCell}>
                        <Typography sx={styles.headerText}>Views</Typography>
                     </TableCell>
                     <TableCell sx={styles.headerCell}>
                        <Typography sx={styles.headerText}>Status</Typography>
                     </TableCell>
                     <TableCell sx={styles.headerCell} width={48}>
                        {/* Actions column */}
                     </TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {currentPageData.map((stat) => (
                     <TableRow key={getEventStatsKey(stat)} sx={styles.bodyRow}>
                        {/* Title Column */}
                        <TableCell
                           id="title-column"
                           sx={{ minWidth: 300, pl: "8px !important" }}
                        >
                           <CardNameTitle
                              title={stat.livestream.title}
                              backgroundImageUrl={
                                 stat.livestream.backgroundImageUrl
                              }
                           />
                        </TableCell>

                        {/* Speakers Column */}
                        <TableCell sx={{ width: 120 }}>
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
                        <TableCell sx={{ width: 100 }}>
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
                                 stat.generalStats.numberOfPeopleReached || "-"
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
                  ))}
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
