import { LivestreamQuestion } from "@careerfairy/shared-lib/livestreams"
import { Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ThumbsUp } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   card: {
      backgroundColor: (theme) => theme.brand.white[200],
      border: (theme) => `1px solid ${theme.brand.black[300]}`,
      borderRadius: "12px",
      px: { xs: 1.5 },
      py: { xs: 1.5, md: 2 },
   },
   questionText: {
      color: (theme) => theme.brand.black[700],
      flex: 1,
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
