import React, { FC, useCallback } from "react"
import { Box, Grid, Typography } from "@mui/material"
import {
   SORT_DIRECTIONS,
   useFeedbackPageContext,
} from "../FeedbackPageProvider"
import useGroupLivestreamStats from "../../../main/feedback/useGroupLivestreamStats"
import { useGroup } from "../../../../../../../layouts/GroupDashboardLayout"
import FeedbackCard, { FeedbackCardSkeleton } from "./FeedbackCard"
import Stack from "@mui/material/Stack"
import { sxStyles } from "../../../../../../../types/commonTypes"
import { StyledPagination } from "../../../common/CardCustom"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"

const styles = sxStyles({
   root: {
      minHeight: 780,
   },
})

const PAGE_SIZE = 9
const PaginatedFeedbacks: FC = () => {
   const { group } = useGroup()
   const { sortDirection } = useFeedbackPageContext()

   const results = useGroupLivestreamStats(
      group.id,
      PAGE_SIZE,
      SORT_DIRECTIONS[sortDirection]
   )

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

   if (!results.loading && !results.data?.length) {
      return <EmptyFeedbacks />
   }

   return (
      <Stack spacing={3} justifyContent="space-between" sx={styles.root}>
         <Grid container spacing={3}>
            <Feedbacks loading={results.loading} stats={results.data} />
         </Grid>
         <StyledPagination
            count={results.nextDisabled ? results.page : results.page + 1}
            page={results.page}
            color="secondary"
            disabled={results.loading}
            onChange={onPageChange}
            siblingCount={0}
            boundaryCount={0}
            size="small"
         />
      </Stack>
   )
}

type FeedbacksCollectionProps = {
   stats: LiveStreamStats[]
   loading: boolean
}
const Feedbacks: FC<FeedbacksCollectionProps> = ({ stats, loading }) => {
   const { group } = useGroup()

   if (loading) {
      return (
         <>
            {Array.from({ length: PAGE_SIZE }).map((el, idx) => (
               <Grid key={idx} item xs={12} sm={6} md={4}>
                  <FeedbackCardSkeleton key={idx} />
               </Grid>
            ))}
         </>
      )
   }

   return (
      <>
         {stats.map((stats) => (
            <Grid key={stats.livestream.id} item xs={12} sm={6} md={4}>
               <FeedbackCard stats={stats} groupId={group.id} />
            </Grid>
         ))}
      </>
   )
}

const EmptyFeedbacks: FC = () => {
   return (
      <Box width="100%" py={7}>
         <Typography align="center" variant="h6">
            Create a live stream to start collection young talent’s feedback.
         </Typography>
      </Box>
   )
}

export default PaginatedFeedbacks
