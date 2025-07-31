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
import {
   COLUMN_WIDTHS,
   eventsTableStyles,
} from "./events-table-new/EventsTableStyles"
import { StatusFilterHeader } from "./events-table-new/StatusFilterHeader"
import {
   NonSortableHeaderCell,
   SortableHeaderCell,
} from "./events-table-new/TableHeaderComponents"
import { getEventStatsKey } from "./util"

const ITEMS_PER_PAGE = 10

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
   } = useEventsView()
   const [hoveredRow, setHoveredRow] = useState<string | null>(null)

   const { currentPageData, currentPage, totalPages, goToPage } =
      useClientSidePagination({
         data: stats,
         itemsPerPage: ITEMS_PER_PAGE,
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
                        minWidth={COLUMN_WIDTHS.title}
                     >
                        Live stream title
                     </SortableHeaderCell>
                     <SortableHeaderCell
                        active={isActiveSort("date")}
                        direction={getSortDirection("date")}
                        onSort={() => handleTableSort("date")}
                        tooltip="The date when your live stream is scheduled to occur or has already taken place."
                        width={COLUMN_WIDTHS.date}
                     >
                        Date
                     </SortableHeaderCell>
                     <SortableHeaderCell
                        active={isActiveSort("registrations")}
                        direction={getSortDirection("registrations")}
                        onSort={() => handleTableSort("registrations")}
                        tooltip="The number of talent who registered to your live stream."
                        width={COLUMN_WIDTHS.registrations}
                     >
                        Registrations
                     </SortableHeaderCell>
                     <NonSortableHeaderCell
                        tooltip="The number of talent who watched your live stream, either live or recorded."
                        width={COLUMN_WIDTHS.views}
                     >
                        Views
                     </NonSortableHeaderCell>
                     <StatusFilterHeader
                        selectedStatuses={statusFilter}
                        onStatusFilterChange={setStatusFilter}
                        width={COLUMN_WIDTHS.status}
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
                           onRegistrationsClick={() => handleAnalytics(stat)}
                           onViewsClick={() => handleAnalytics(stat)}
                        />
                     )
                  })}
               </TableBody>
            </Table>

            {totalPages > 1 && (
               <Stack
                  direction="row"
                  justifyContent="flex-end"
                  sx={eventsTableStyles.paginationContainer}
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
         </TableContainer>
      </Box>
   )
}
