import Stack from "@mui/material/Stack"
import { Box, ButtonBase, Typography } from "@mui/material"
import Skeleton from "@mui/material/Skeleton"
import {
   RatingWithLabel,
   RatingWithLabelSkeleton,
} from "../../../common/inputs"
import React, { FC } from "react"
import { useFirestoreCollection } from "../../../../../../custom-hook/utils/useFirestoreCollection"
import { EventRating } from "@careerfairy/shared-lib/livestreams"
import { collection, query } from "firebase/firestore"
import { FirestoreInstance } from "../../../../../../../data/firebase/FirebaseInstance"
import {
   getGlobalRatingAverage,
   getTotalNumberOfRatings,
} from "@careerfairy/shared-lib/livestreams/ratings"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import useIsMobile from "../../../../../../custom-hook/useIsMobile"
import Link from "../../../../../common/Link"
import { sxStyles } from "../../../../../../../types/commonTypes"

const styles = sxStyles({
   question: {
      textDecoration: "none",
      color: "text.primary",
      textAlign: "left",
      justifyContent: "space-between",
      alignItems: "flex-start",
   },
})

type FeedbacksProps = {
   livestreamStats: LiveStreamStats
   groupId: string
}
const Ratings: FC<FeedbacksProps> = ({ livestreamStats, groupId }) => {
   const isMobile = useIsMobile()
   const { data: ratings } = useLivestreamRatings(livestreamStats.livestream.id)

   return (
      <Stack maxWidth={920} spacing={2}>
         <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h5" fontWeight={600}>
               Feedback
            </Typography>
            <RatingWithLabel
               average={getGlobalRatingAverage(livestreamStats)}
               numberOfRatings={getTotalNumberOfRatings(livestreamStats)}
               color={"secondary.main"}
               size={isMobile ? "medium" : "large"}
            />
         </Stack>
         <Stack spacing={2}>
            {ratings.map((rating) => (
               <Link
                  href={`/group/${groupId}/admin/analytics/feedback/${livestreamStats.livestream.id}/question/${rating.id}`}
                  key={rating.id}
                  noLinkStyle
               >
                  <Stack
                     component={ButtonBase}
                     sx={styles.question}
                     color="text.primary"
                     width="100%"
                     spacing={1}
                     key={rating.id}
                     direction={{
                        xs: "column",
                        md: "row",
                     }}
                  >
                     <Typography fontSize="1.07rem" variant="body1">
                        {rating.question}
                     </Typography>
                     <Box minWidth={195} width={195}>
                        <RatingWithLabel
                           average={
                              livestreamStats.ratings?.[rating.id]
                                 ?.averageRating ?? 0
                           }
                           numberOfRatings={
                              livestreamStats.ratings?.[rating.id]
                                 ?.numberOfRatings ?? 0
                           }
                           color={"primary.main"}
                        />
                     </Box>
                  </Stack>
               </Link>
            ))}
         </Stack>
      </Stack>
   )
}
export const RatingsSkeleton = () => {
   return (
      <Stack maxWidth={920} spacing={2}>
         <Stack
            direction={{
               xs: "column",
               md: "row",
            }}
            spacing={1}
         >
            <Typography variant="h5" fontWeight={600}>
               <Skeleton width={100} />
            </Typography>
            <RatingWithLabelSkeleton size={"large"} />
         </Stack>
         <Stack spacing={2}>
            {Array.from({ length: 3 }).map((_, idx) => (
               <Stack
                  justifyContent="space-between"
                  direction={{
                     xs: "column",
                     md: "row",
                  }}
                  spacing={1}
                  key={idx}
               >
                  <Typography width="40%" fontSize="1.07rem" variant="body1">
                     <Skeleton width={"100%"} />
                  </Typography>
                  <RatingWithLabelSkeleton key={idx} />
               </Stack>
            ))}
         </Stack>
      </Stack>
   )
}

const useLivestreamRatings = (livestreamId: string) => {
   return useFirestoreCollection<EventRating>(
      query(
         collection(FirestoreInstance, "livestreams", livestreamId, "rating")
      ),
      {
         idField: "id",
      }
   )
}
export default Ratings
