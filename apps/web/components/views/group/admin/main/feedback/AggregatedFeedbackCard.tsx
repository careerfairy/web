import { getGlobalRatingAverage } from "@careerfairy/shared-lib/livestreams/ratings"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import StarRateRoundedIcon from "@mui/icons-material/StarRateRounded"
import {
   Box,
   Button,
   CircularProgress,
   Pagination,
   Rating,
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableRow,
   Typography,
} from "@mui/material"
import ErrorBoundary from "components/ErrorBoundary"
import Link from "components/views/common/Link"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useRouter } from "next/router"
import { useCallback, useEffect, useState } from "react"
import { ExternalLink } from "react-feather"
import { sxStyles } from "types/commonTypes"
import CardCustom from "../../common/CardCustom"
import useGroupLivestreamStats from "./useGroupLivestreamStats"

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
      width: "70%",
   },
   pagination: {
      "& .MuiPagination-ul li:last-child": {
         display: "block",
      },
      "& .MuiPagination-ul li:last-child button::before": {
         content: "'Next'",
         marginRight: (t) => t.spacing(1),
      },
      "& .MuiPagination-ul li:first-of-type": {
         display: "block",
      },
      "& .MuiPagination-ul li:first-of-type button::after": {
         content: "'Previous'",
         marginLeft: (t) => t.spacing(1),
      },
      "& .MuiPagination-ul li button": {
         padding: (t) => t.spacing(2),
         fontWeight: 500,
      },
      "& .MuiPagination-ul li": {
         display: "none",
      },
      ".MuiPagination-ul": {
         justifyContent: "end",
      },
      flex: "none",
      marginTop: 0,
      marginBottom: (t) => t.spacing(1),
   },
   noLivestreamCopy: { color: (theme) => theme.palette.grey[500] },
   cardEmpty: {
      "& .MuiCardContent-root": {
         height: "100%",
         display: "flex",
         alignItems: "center",
         justifyContent: "center",
      },
   },
   cardList: {
      "& .MuiCardContent-root": {
         minHeight: "325px",
         paddingBottom: 0,
         display: "flex",
         flexDirection: "column",
      },
   },
   tableContainer: {
      flex: 1,
   },
})

const PAGE_SIZE = 4
const CARD_OPTIONS = ["Latest", "Oldest"]

const AggregatedFeedbackCard = () => {
   const [hideOptions, setHideOptions] = useState(false)
   const [sortingMethod, setSortingMethod] =
      useState<typeof CARD_OPTIONS[number]>("Latest")

   const optionsHandler = useCallback((option: typeof CARD_OPTIONS[number]) => {
      setSortingMethod(option)
   }, [])

   return (
      <CardCustom
         title="Live Stream Feedback"
         options={hideOptions ? undefined : CARD_OPTIONS}
         optionsHandler={hideOptions ? undefined : optionsHandler}
         sx={hideOptions ? styles.cardEmpty : styles.cardList}
      >
         <ErrorBoundary>
            <PaginatedFeedback
               key={sortingMethod}
               sortingMethod={sortingMethod}
               setHideOptions={setHideOptions}
            />
         </ErrorBoundary>
      </CardCustom>
   )
}

const PaginatedFeedback = ({
   sortingMethod,
   setHideOptions,
}: {
   sortingMethod: typeof CARD_OPTIONS[number]
   setHideOptions: React.Dispatch<boolean>
}) => {
   const { group } = useGroup()
   const results = useGroupLivestreamStats(
      group.id,
      PAGE_SIZE,
      sortingMethod === "Latest" ? "desc" : "asc"
   )

   useEffect(() => {
      if (!results.loading && (!results.data || results.data.length === 0)) {
         setHideOptions(true)
      }
   }, [results.data, results.loading, setHideOptions])

   const onPageChange = useCallback(
      (_, page: number) => {
         if (page > results.page) {
            results.next()
         } else {
            results.prev()
         }
      },
      [results]
   )

   if (results.loading) {
      return (
         <Box m={3} display="flex" justifyContent="center">
            <CircularProgress color="secondary" />
         </Box>
      )
   }

   if (!results.data || results.data.length === 0) {
      return <NoLivestreams />
   }

   const paginationElement = (
      <Pagination
         count={results.nextDisabled ? results.page : results.page + 1}
         page={results.page}
         color="secondary"
         onChange={onPageChange}
         size="small"
         sx={styles.pagination}
      />
   )

   return (
      <FeedbackCardContent
         stats={results.data}
         pagination={paginationElement}
      />
   )
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
      <>
         <TableContainer sx={styles.tableContainer}>
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
                              href={`/group/${groupId}/admin/analytics/feedback/${row.livestream.id}`}
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

         {pagination}
      </>
   )
}

const NoLivestreams = () => {
   const { livestreamDialog } = useGroup()
   return (
      <Box>
         <Typography mt={2} sx={styles.noLivestreamCopy} align="center">
            You can check live stream feedback here.
            <br />
             Start creating new live stream to get feedbacks.
         </Typography>

         <Box mt={2} mb={3} display="flex" justifyContent="center">
            <Button
               color="secondary"
               variant="contained"
               onClick={() => livestreamDialog.handleOpenNewStreamModal()}
            >
               Create New Live Stream
            </Button>
         </Box>
      </Box>
   )
}

export default AggregatedFeedbackCard
