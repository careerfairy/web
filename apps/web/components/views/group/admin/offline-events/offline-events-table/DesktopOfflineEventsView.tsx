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
import { OfflineEventsWithStats } from "components/custom-hook/offline-event/useGroupOfflineEventsWithStats"
import useClientSidePagination from "components/custom-hook/utils/useClientSidePagination"
import { useCallback, useEffect, useRef } from "react"
import { useDispatch } from "react-redux"
import {
   clearHoveredRow,
   setHoveredRow,
} from "../../../../../../store/reducers/offlineEventsTableReducer"
import { StyledPagination } from "../../common/CardCustom"
import { useOfflineEventsOverview } from "../context/OfflineEventsOverviewContext"
import { OfflineEventTableRow } from "./OfflineEventTableRow"
import {
   COLUMN_WIDTHS,
   offlineEventsTableStyles,
} from "./OfflineEventsTableStyles"
import { StatusFilterHeader } from "./StatusFilterHeader"
import { SortableHeaderCell } from "./TableHeaderComponents"
import { getOfflineEventStatsKey } from "./utils"

const ITEMS_PER_PAGE = 6

type Props = {
   stats: OfflineEventsWithStats[]
   isEmptyNoEvents?: boolean
   isEmptySearchFilter?: boolean
   onCreateOfflineEvent?: () => void
}

export const DesktopOfflineEventsView = ({
   stats,
   isEmptyNoEvents,
   isEmptySearchFilter,
   onCreateOfflineEvent,
}: Props) => {
   const {
      handleTableSort,
      getSortDirection,
      isActiveSort,
      statusFilter,
      setStatusFilter,
      resetFilters,
      setOnPaginationReset,
   } = useOfflineEventsOverview()

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

   // Use a ref to store the current goToPage function
   const goToPageRef = useRef(goToPage)
   goToPageRef.current = goToPage

   // Register pagination reset callback
   useEffect(() => {
      const resetCallback = () => goToPageRef.current(1)
      setOnPaginationReset(() => resetCallback)
      return () => setOnPaginationReset(undefined)
   }, [setOnPaginationReset])

   return (
      <Box sx={offlineEventsTableStyles.root}>
         <TableContainer sx={offlineEventsTableStyles.tableContainer}>
            <Table sx={offlineEventsTableStyles.table}>
               <TableHead>
                  <TableRow>
                     <SortableHeaderCell
                        active={isActiveSort("title")}
                        direction={getSortDirection("title")}
                        onSort={() => handleTableSort("title")}
                        // minWidth={COLUMN_WIDTHS.title}
                     >
                        Event name
                     </SortableHeaderCell>
                     <SortableHeaderCell
                        active={isActiveSort("date")}
                        direction={getSortDirection("date")}
                        onSort={() => handleTableSort("date")}
                        tooltip="The date when your offline event is scheduled to occur or has already taken place."
                        // minWidth={COLUMN_WIDTHS.date}
                        width={COLUMN_WIDTHS.date}
                     >
                        Date
                     </SortableHeaderCell>
                     <SortableHeaderCell
                        active={isActiveSort("views")}
                        direction={getSortDirection("views")}
                        onSort={() => handleTableSort("views")}
                        tooltip="The number of people who viewed your offline event."
                        width={COLUMN_WIDTHS.views}
                     >
                        Views
                     </SortableHeaderCell>
                     <SortableHeaderCell
                        active={isActiveSort("clicks")}
                        direction={getSortDirection("clicks")}
                        onSort={() => handleTableSort("clicks")}
                        tooltip="The number of people who clicked on your offline event."
                        width={COLUMN_WIDTHS.clicks}
                     >
                        Clicks
                     </SortableHeaderCell>

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
                        <TableCell
                           colSpan={5}
                           sx={offlineEventsTableStyles.emptyCell}
                        >
                           <Box sx={offlineEventsTableStyles.emptyCard} py={5}>
                              <Typography
                                 variant="brandedBody"
                                 color="neutral.700"
                              >
                                 No offline events found matching your search
                              </Typography>
                           </Box>
                        </TableCell>
                     </TableRow>
                  ) : isEmptyNoEvents ? (
                     <TableRow>
                        <TableCell
                           colSpan={5}
                           sx={offlineEventsTableStyles.emptyCell}
                        >
                           <Stack
                              alignItems="center"
                              sx={offlineEventsTableStyles.emptyCard}
                              py={4}
                           >
                              <Typography
                                 variant="brandedBody"
                                 color="neutral.800"
                                 fontWeight={600}
                                 mb={0.5}
                              >
                                 Plan your first offline event
                              </Typography>
                              <Typography
                                 variant="brandedBody"
                                 color="neutral.700"
                                 mb={1.5}
                              >
                                 This is where all your offline events will
                                 appear. Start by creating one
                              </Typography>
                              <Button
                                 variant="contained"
                                 color="secondary"
                                 onClick={onCreateOfflineEvent}
                              >
                                 Create offline event
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
               sx={offlineEventsTableStyles.paginationContainer}
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
   currentPageData: OfflineEventsWithStats[]
}

const Rows = ({ currentPageData }: RowsProps) => {
   const {
      handleViewOfflineEvent,
      handleShareOfflineEvent,
      handleAnalytics,
      handleEdit,
      handleViewRegistration,
      handleViewDetails,
      handleDelete,
   } = useOfflineEventsOverview()

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
            const statKey = getOfflineEventStatsKey(stat)
            return (
               <OfflineEventTableRow
                  key={statKey}
                  stat={stat}
                  statKey={statKey}
                  onMouseEnter={handleRowMouseEnter}
                  onMouseLeave={handleRowMouseLeave}
                  onViewOfflineEvent={handleViewOfflineEvent}
                  onShareOfflineEvent={handleShareOfflineEvent}
                  onAnalytics={handleAnalytics}
                  onEdit={handleEdit}
                  onViewRegistration={handleViewRegistration}
                  onViewDetails={handleViewDetails}
                  onDelete={handleDelete}
                  onClicksClick={handleAnalytics}
                  onViewsClick={handleAnalytics}
               />
            )
         })}
      </>
   )
}
