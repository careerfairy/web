import { getGlobalRatingAverage } from "@careerfairy/shared-lib/livestreams/ratings"
import {
   LiveStreamStats,
   sortStatsByMostRecentLivestreams,
} from "@careerfairy/shared-lib/livestreams/stats"
import PaginationHelper from "@careerfairy/shared-lib/utils/pagination"
import { useTheme } from "@emotion/react"
import StarRateRoundedIcon from "@mui/icons-material/StarRateRounded"
import {
   Box,
   Button,
   Pagination,
   Rating,
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableRow,
   Typography,
} from "@mui/material"
import Link from "components/views/common/Link"
import { useRouter } from "next/router"
import { useCallback, useMemo, useState } from "react"
import { ExternalLink } from "react-feather"
import { sxStyles } from "types/commonTypes"
import CardCustom, { OptionsProps } from "../CardCustom"
import { useMainPageContext } from "../MainPageProvider"

const styles = sxStyles({
   tableBody: {
      ".MuiTableCell-root": {
         borderBottom: "1px solid #EDE7FD",
      },
   },
   tableRow: {
      "&:last-child td, &:last-child th": { border: 0 },
   },
   stars: {
      color: (theme) => theme.palette.primary.main,
   },
   rowTitle: {
      fontWeight: 500,
      fontSize: "1rem",
      marginLeft: (theme) => theme.spacing(2),
      paddingLeft: 0,
   },
   pagination: {
      "& .MuiPagination-ul li:last-child": {
         marginLeft: (t) => t.spacing(1),
      },
      "& .MuiPagination-ul li:last-child button::before": {
         content: "'Next'",
         marginRight: (t) => t.spacing(1),
      },
      "& .MuiPagination-ul li:first-child": {
         marginRight: (t) => t.spacing(1),
      },
      "& .MuiPagination-ul li:first-child button::after": {
         content: "'Previous'",
         marginLeft: (t) => t.spacing(1),
      },
   },
   noLivestreamCopy: { color: (theme) => theme.palette.grey[500] },
})

const AggregatedFeedbackCard = () => {
   const { livestreamStats } = useMainPageContext()

   if (livestreamStats?.length > 0) {
      return <SortedFeedbacks stats={livestreamStats} />
   }

   return <NoLivestreams />
}

const SortedFeedbacks = ({ stats }: { stats: LiveStreamStats[] }) => {
   const [sortingMethod, setSortingMethod] = useState("Latest")

   const sortedStats = useMemo(() => {
      return sortStatsByMostRecentLivestreams(
         stats,
         sortingMethod === "Oldest"
      )?.filter(pastLivestreams)
   }, [stats, sortingMethod])

   const optionsHandler = useCallback((option: string) => {
      setSortingMethod(option)
   }, [])

   return (
      <FeedbackCard optionsHandler={optionsHandler}>
         <PaginatedFeedbacks key={sortingMethod} stats={sortedStats} />
      </FeedbackCard>
   )
}

const PAGE_SIZE = 3
const PaginatedFeedbacks = ({ stats }: { stats: LiveStreamStats[] }) => {
   const [currentPage, setCurrentPage] = useState(1)

   const paginationHelper: PaginationHelper = useMemo(() => {
      return new PaginationHelper(stats.length, PAGE_SIZE, currentPage)
   }, [stats, currentPage])

   const page: LiveStreamStats[] = useMemo(() => {
      return stats.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
   }, [currentPage, stats])

   const onPageChange = useCallback((_, page: number) => {
      setCurrentPage(page)
   }, [])

   const paginationElement =
      paginationHelper.totalPages() > 1 ? (
         <Pagination
            count={paginationHelper.totalPages()}
            page={currentPage}
            color="secondary"
            onChange={onPageChange}
            size="small"
            sx={styles.pagination}
         />
      ) : undefined

   return <FeedbackCardContent stats={page} pagination={paginationElement} />
}

const FeedbackCardContent = ({
   stats,
   pagination,
}: {
   stats: LiveStreamStats[]
   pagination: React.ReactNode
}) => {
   const {
      query: { groupId },
   } = useRouter()

   return (
      <Box>
         <TableContainer>
            <Table>
               <TableBody sx={styles.tableBody}>
                  {stats.map((row) => (
                     <TableRow key={row.livestream.id} sx={styles.tableRow}>
                        <TableCell
                           component="th"
                           scope="row"
                           sx={styles.rowTitle}
                        >
                           {row.livestream.title}
                        </TableCell>
                        <TableCell align="right">
                           <Rating
                              name="read-only"
                              value={getGlobalRatingAverage(row)}
                              precision={0.5}
                              sx={styles.stars}
                              icon={<StarRateRoundedIcon />}
                              emptyIcon={<StarRateRoundedIcon />}
                              readOnly
                           />
                        </TableCell>
                        <TableCell align="right" sx={{ paddingRight: 0 }}>
                           <Link
                              href={`/group/${groupId}/admin/analytics?section=2&subsection=2&livestreamId=${row.livestream.id}`}
                              underline="none"
                              color="secondary"
                           >
                              <ExternalLink width="20" />
                           </Link>
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </TableContainer>

         <Box mt={2} display="flex" justifyContent="flex-end">
            {pagination}
         </Box>
      </Box>
   )
}

const NoLivestreams = () => {
   return (
      <FeedbackCard>
         <Typography mt={2} sx={styles.noLivestreamCopy} align="center">
            You can check live stream feedback here.
            <br />
             Start creating new live stream to get feedbacks.
         </Typography>

         <Box mt={2} mb={3} display="flex" justifyContent="center">
            <Button color="secondary" variant="contained">
               Create New Live Stream
            </Button>
         </Box>
      </FeedbackCard>
   )
}

const CARD_OPTIONS = ["Latest", "Oldest"]

const FeedbackCard = ({
   children,
   optionsHandler,
}: {
   children: React.ReactNode
   optionsHandler?: OptionsProps["handler"]
}) => {
   return (
      <CardCustom
         title="Live Stream Feedback"
         options={CARD_OPTIONS}
         optionsHandler={optionsHandler}
      >
         {children}
      </CardCustom>
   )
}

const pastLivestreams = (statDoc: LiveStreamStats) => {
   if (statDoc?.livestream?.start && statDoc.livestream.start instanceof Date) {
      return statDoc.livestream.start < new Date()
   }

   return false
}

export default AggregatedFeedbackCard
