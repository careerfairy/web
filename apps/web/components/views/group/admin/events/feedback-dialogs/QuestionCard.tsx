import { LivestreamQuestion } from "@careerfairy/shared-lib/livestreams"
import { Skeleton, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ThumbsUp } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   card: (theme) => ({
      backgroundColor: {
         xs: theme.brand.white[100],
         md: theme.brand.white[200],
      },
      border: `1px solid ${theme.brand.white[500]}`,
      borderRadius: {
         xs: "8px",
         md: "12px",
      },
      px: { xs: 1.5 },
      py: { xs: 1.5, md: 2 },
   }),
   skeletonText: {
      width: "100%",
   },
   skeletonVotes: {
      width: 60,
   },
})

type Props = {
   question: LivestreamQuestion
}

export const QuestionCard = ({ question }: Props) => {
   const isMobile = useIsMobile()

   return (
      <Stack
         sx={styles.card}
         spacing={2}
         direction={isMobile ? "column" : "row"}
         justifyContent={isMobile ? "flex-start" : "space-between"}
         alignItems="start"
      >
         <Typography
            variant={isMobile ? "small" : "medium"}
            color={isMobile ? "neutral.800" : "neutral.700"}
         >
            {question.title}
         </Typography>
         <Stack
            minWidth={{
               md: 95,
            }}
            color="neutral.500"
            direction="row"
            alignItems="center"
            flexShrink={0}
            spacing={{
               xs: 1,
               md: 1.25,
            }}
         >
            <ThumbsUp size={15} />
            <Typography variant="small" color="inherit">
               {question.votes} {question.votes === 1 ? "like" : "likes"}
            </Typography>
         </Stack>
      </Stack>
   )
}

export const QuestionCardSkeleton = () => {
   const isMobile = useIsMobile()

   return (
      <Stack
         sx={styles.card}
         spacing={2}
         direction={isMobile ? "column" : "row"}
         justifyContent={isMobile ? "flex-start" : "space-between"}
         alignItems="start"
      >
         <Skeleton
            variant="text"
            sx={styles.skeletonText}
            height={isMobile ? 16 : 20}
         />
         <Stack
            direction="row"
            alignItems="center"
            flexShrink={0}
            spacing={{
               xs: 1,
               md: 1.25,
            }}
         >
            <Skeleton variant="circular" width={15} height={15} />
            <Skeleton variant="text" sx={styles.skeletonVotes} height={14} />
         </Stack>
      </Stack>
   )
}
