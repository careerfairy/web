import Stack from "@mui/material/Stack"
import { Typography } from "@mui/material"
import React, { FC, useCallback, useMemo } from "react"
import { LivestreamQuestion } from "@careerfairy/shared-lib/livestreams"
import { collection, query } from "firebase/firestore"
import { FirestoreInstance } from "../../../../../../../data/firebase/FirebaseInstance"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import NorthIcon from "@mui/icons-material/North"
import Divider from "@mui/material/Divider"
import useIsMobile from "../../../../../../custom-hook/useIsMobile"
import usePaginatedCollection, {
   UsePaginatedCollection,
} from "../../../../../../custom-hook/utils/usePaginatedCollection"
import { StyledPagination } from "../../../common/CardCustom"
import Skeleton from "@mui/material/Skeleton"

type QuestionsProps = {
   livestreamStats: LiveStreamStats
}

const Questions: FC<QuestionsProps> = ({ livestreamStats }) => {
   const results = usePaginatedLivestreamQuestions(
      livestreamStats.livestream.id
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

   if (results.loading) {
      return <QuestionsSkeleton />
   }

   return (
      <Stack spacing={2}>
         <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="h5" fontWeight={600}>
               Questions
            </Typography>
         </Stack>
         <Stack mb={"auto !important"} divider={<Divider />} spacing={2}>
            {results.data.map((question) => (
               <Stack
                  key={question.id}
                  justifyContent="space-between"
                  spacing={1}
                  direction={{
                     xs: "column",
                     md: "row",
                  }}
               >
                  <Typography fontSize="1.07rem" variant="body1">
                     {question.title}
                  </Typography>
                  <Stack
                     ml={"auto !important"}
                     direction="row"
                     alignItems="center"
                     justifyContent="flex-end"
                     width={100}
                     spacing={1}
                  >
                     <NorthIcon color="primary" />
                     <Typography whiteSpace="nowrap" variant="body1">
                        {question.votes} upvotes
                     </Typography>
                  </Stack>
               </Stack>
            ))}
         </Stack>
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
export const QuestionsSkeleton = () => {
   const isMobile = useIsMobile()

   return (
      <Stack spacing={2}>
         <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="h5" fontWeight={600}>
               <Skeleton width={100} />
            </Typography>
         </Stack>
         <Stack divider={<Divider />} spacing={2}>
            {Array.from({ length: isMobile ? 3 : 6 }).map((_, i) => (
               <Stack
                  key={i}
                  justifyContent="space-between"
                  spacing={1}
                  direction={{
                     xs: "column",
                     md: "row",
                  }}
               >
                  <Typography fontSize="1.07rem" width="100%" variant="body1">
                     <Skeleton width="100%" />
                  </Typography>
                  <Stack
                     direction="row"
                     alignItems="center"
                     justifyContent="flex-end"
                     spacing={1}
                  >
                     <NorthIcon color="disabled" />
                     <Typography whiteSpace="nowrap" variant="body1">
                        <Skeleton width={50} />
                     </Typography>
                  </Stack>
               </Stack>
            ))}
         </Stack>
         <StyledPagination
            page={0}
            color="secondary"
            disabled
            onChange={() => {}}
            siblingCount={0}
            boundaryCount={0}
            size="small"
         />
      </Stack>
   )
}

const usePaginatedLivestreamQuestions = (livestreamId: string) => {
   const isMobile = useIsMobile()

   const options = useMemo<UsePaginatedCollection<LivestreamQuestion>>(
      () => ({
         query: query<LivestreamQuestion>(
            // @ts-ignore
            collection(
               FirestoreInstance,
               "livestreams",
               livestreamId,
               "questions"
            )
         ),
         limit: isMobile ? 3 : 6,
         orderBy: {
            field: "votes",
            direction: "desc",
         },
      }),
      [isMobile, livestreamId]
   )
   return usePaginatedCollection<LivestreamQuestion>(options)
}

export default Questions
