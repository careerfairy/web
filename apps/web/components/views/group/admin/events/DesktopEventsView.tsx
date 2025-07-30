import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import {
   Box,
   Stack,
   Table,
   TableBody,
   TableContainer,
   TableHead,
   TableRow,
} from "@mui/material"
import { useState } from "react"
import useClientSidePagination from "../../../../custom-hook/utils/useClientSidePagination"
import { StyledPagination } from "../common/CardCustom"
import { useEventsView } from "./context/EventsViewContext"
import { EventTableRow } from "./events-table-new/EventTableRow"
import { eventsTableStyles } from "./events-table-new/EventsTableStyles"
import { StatusFilterHeader } from "./events-table-new/StatusFilterHeader"
import {
   NonSortableHeaderCell,
   SortableHeaderCell,
} from "./events-table-new/TableHeaderComponents"
import { getEventStatsKey } from "./util"

type Props = {
   stats: LiveStreamStats[]
}

export const DesktopEventsView = ({ stats }: Props) => {
   const {
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
      handleRegistrationsClick,
      handleViewsClick,
   } = useEventsView()
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

   return (
      <Box>
         <TableContainer sx={eventsTableStyles.tableContainer}>
            <Table sx={eventsTableStyles.table}>
               <TableHead>
                  <TableRow>
                     <SortableHeaderCell
                        active={isActiveSort("title")}
                        direction={getSortDirection("title")}
                        onSort={() => handleTableSort("title")}
                     >
                        Live stream title
                     </SortableHeaderCell>
                     <SortableHeaderCell
                        active={isActiveSort("date")}
                        direction={getSortDirection("date")}
                        onSort={() => handleTableSort("date")}
                        tooltip="The date when your live stream is scheduled to occur or has already taken place."
                     >
                        Date
                     </SortableHeaderCell>
                     <SortableHeaderCell
                        active={isActiveSort("registrations")}
                        direction={getSortDirection("registrations")}
                        onSort={() => handleTableSort("registrations")}
                        tooltip="The number of talent who registered to your live stream."
                     >
                        Registrations
                     </SortableHeaderCell>
                     <NonSortableHeaderCell tooltip="The number of talent who watched your live stream, either live or recorded.">
                        Views
                     </NonSortableHeaderCell>
                     <StatusFilterHeader
                        selectedStatuses={statusFilter}
                        onStatusFilterChange={setStatusFilter}
                     />
                  </TableRow>
               </TableHead>
               <TableBody>
                  {currentPageData.map((stat) => {
                     const statKey = getEventStatsKey(stat)
                     const isHovered = hoveredRow === statKey

                     return (
                        <EventTableRow
                           key={statKey}
                           stat={stat}
                           isHovered={isHovered}
                           onMouseEnter={() => handleRowMouseEnter(statKey)}
                           onMouseLeave={handleRowMouseLeave}
                           onEnterLiveStreamRoom={() =>
                              handleEnterLiveStreamRoom(stat)
                           }
                           onShareLiveStream={() => handleShareLiveStream(stat)}
                           onShareRecording={() => handleShareRecording(stat)}
                           onAnalytics={() => handleAnalytics(stat)}
                           onQuestions={() => handleQuestions(stat)}
                           onFeedback={() => handleFeedback(stat)}
                           onEdit={() => handleEdit(stat)}
                           onRegistrationsClick={() =>
                              handleRegistrationsClick(stat)
                           }
                           onViewsClick={() => handleViewsClick(stat)}
                        />
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
