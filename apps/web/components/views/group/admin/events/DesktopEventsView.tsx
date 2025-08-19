import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import {
   Box,
   Button,
   Stack,
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableHead,
   TableRow,
   Typography,
} from "@mui/material"
import { useCallback, useEffect } from "react"
import { useDispatch } from "react-redux"
import {
   clearHoveredRow,
   setHoveredRow,
} from "../../../../../store/reducers/eventsTableReducer"
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
   isEmptyNoEvents?: boolean
   isEmptySearchFilter?: boolean
   onCreateLivestream?: () => void
}

export const DesktopEventsView = ({
   stats,
   isEmptyNoEvents,
   isEmptySearchFilter,
   onCreateLivestream,
}: Props) => {
   const {
      handleTableSort,
      getSortDirection,
      isActiveSort,
      statusFilter,
      setStatusFilter,
      resetFilters,
   } = useEventsView()

   // Reset filters when component unmounts
   useEffect(() => {
      return () => {
         resetFilters()
      }
   }, [resetFilters])

   // Reset filters when component unmounts
   useEffect(() => {
      return () => {
         resetFilters()
      }
   }, [resetFilters])

   const { currentPageData, currentPage, totalPages, goToPage } =
      useClientSidePagination({
         data: stats,
         itemsPerPage: ITEMS_PER_PAGE,
      })

   return (
      <Box sx={eventsTableStyles.root}>
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
                        minWidth={COLUMN_WIDTHS.date}
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
                  {isEmptySearchFilter ? (
                     <TableRow>
                        <TableCell colSpan={5} sx={eventsTableStyles.emptyCell}>
                           <Box sx={eventsTableStyles.emptyCard} py={5}>
                              <Typography
                                 variant="brandedBody"
                                 color="neutral.700"
                              >
                                 No live streams found matching your search
                              </Typography>
                           </Box>
                        </TableCell>
                     </TableRow>
                  ) : isEmptyNoEvents ? (
                     <TableRow>
                        <TableCell colSpan={5} sx={eventsTableStyles.emptyCell}>
                           <Stack
                              alignItems="center"
                              sx={eventsTableStyles.emptyCard}
                              py={4}
                           >
                              <Typography
                                 variant="brandedBody"
                                 color="neutral.800"
                                 fontWeight={600}
                                 mb={0.5}
                              >
                                 Plan your first live stream
                              </Typography>
                              <Typography
                                 variant="brandedBody"
                                 color="neutral.700"
                                 mb={1.5}
                              >
                                 This is where all your live streams will
                                 appear. Start by creating one
                              </Typography>
                              <Button
                                 variant="contained"
                                 color="secondary"
                                 onClick={onCreateLivestream}
                              >
                                 Create live stream
                              </Button>
                           </Stack>
                        </TableCell>
                     </TableRow>
                  ) : (
                     <Rows currentPageData={currentPageData} />
                  )}
               </TableBody>
            </Table>
         </TableContainer>
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
      </Box>
   )
}

type RowsProps = {
   currentPageData: LiveStreamStats[]
}

const Rows = ({ currentPageData }: RowsProps) => {
   const {
      handleEnterLiveStreamRoom,
      handleShareLiveStream,
      handleAnalytics,
      handleQuestions,
      handleFeedback,
      handleEdit,
      handleShareRecording,
   } = useEventsView()

   const dispatch = useDispatch()

   const handleRowMouseEnter = useCallback(
      (statKey: string) => {
         dispatch(setHoveredRow(statKey))
      },
      [dispatch]
   )

   const handleRowMouseLeave = useCallback(() => {
      dispatch(clearHoveredRow())
   }, [dispatch])

   return (
      <>
         {currentPageData.map((stat) => {
            const statKey = getEventStatsKey(stat)
            return (
               <EventTableRow
                  key={statKey}
                  stat={stat}
                  statKey={statKey}
                  onMouseEnter={handleRowMouseEnter}
                  onMouseLeave={handleRowMouseLeave}
                  onEnterLiveStreamRoom={handleEnterLiveStreamRoom}
                  onShareLiveStream={handleShareLiveStream}
                  onShareRecording={handleShareRecording}
                  onAnalytics={handleAnalytics}
                  onQuestions={handleQuestions}
                  onFeedback={handleFeedback}
                  onEdit={handleEdit}
                  onRegistrationsClick={handleAnalytics}
                  onViewsClick={handleAnalytics}
               />
            )
         })}
      </>
   )
}
