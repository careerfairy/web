import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { sxStyles } from "@careerfairy/shared-ui"
import ThumbUpIcon from "@mui/icons-material/ThumbUpOffAlt"
import LoadingButton from "@mui/lab/LoadingButton"
import { Typography } from "@mui/material"
import Box from "@mui/material/Box"
import Skeleton from "@mui/material/Skeleton"
import Stack from "@mui/material/Stack"
import { alpha } from "@mui/material/styles"
import QuestionIcon from "components/views/common/icons/QuestionIcon"
import SectionTitle from "components/views/livestream-dialog/views/livestream-details/main-content/SectionTitle"

const styles = sxStyles({
   greyBorder: {
      borderColor: "#E1E1E1",
   },
   questionItem: {
      borderRadius: 2.5,
      border: "1px solid",
      p: [1.5, 1.625],
      bgcolor: "background.paper",
      height: "100%",
      justifyContent: "space-between",
   },
   upvoteButton: {
      textTransform: "none",
      p: 0,
      "&:hover": {
         background: "transparent",
      },
      "& svg": {
         width: "18px",
         height: "18px",
      },
      "& span": {
         mr: 0.8,
      },
   },
   date: {
      fontSize: "0.857rem",
      color: (theme) => `${alpha(theme.palette.text.secondary, 0.4)}`,
      fontWeight: 400,
   },
   noQuestionsContainer: {
      backgroundColor: (theme) => theme.brand.white[200],
      borderRadius: "8px",
      border: "1px solid",
      borderColor: (theme) => theme.brand.white[500],
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: "16px",
      textAlign: "center",
      padding: "20px 12px",
      flex: "1 1",
      minHeight: { xs: "300px", md: "330px" },
   },
   questionIcon: {
      width: "44px",
      height: "44px",
   },
   askQuestionCopy: {
      fontWeight: 600,
      color: "neutral.800",
   },
   askQuestionCopy2: {
      fontWeight: 400,
      color: "neutral.700",
   },
   noQuestionsCopyContainer: {
      maxWidth: "490px",
      display: "flex",
      flexDirection: "column",
   },
})

type Props = {
   companyName: LivestreamEvent["company"]
}

const Questions = ({ companyName }: Props) => {
   return (
      <>
         <SectionTitle>Upcoming questions</SectionTitle>
         <Box sx={styles.noQuestionsContainer}>
            <QuestionIcon sx={styles.questionIcon} />
            <Box gap="8px" sx={styles.noQuestionsCopyContainer}>
               <Typography variant="brandedH5" sx={styles.askQuestionCopy}>
                  Be the first one to ask {companyName} a question
               </Typography>
               <Typography variant="brandedBody" sx={styles.askQuestionCopy2}>
                  Got a question? Get answers directly from {companyName}
                  {"'s"} employees. The community can upvote the most valuable
                  questions.
               </Typography>
            </Box>
         </Box>
      </>
   )
}

const QuestionSkeleton = () => {
   return (
      <Stack sx={[styles.questionItem, styles.greyBorder]} spacing={1}>
         <Typography>
            <Skeleton width={120} />
         </Typography>
         <Stack
            direction="row"
            alignItems="end"
            justifyContent="space-between"
            spacing={1}
         >
            <LoadingButton
               disabled
               size="small"
               startIcon={<ThumbUpIcon />}
               variant="text"
               sx={styles.upvoteButton}
            >
               <Skeleton width={40} />
            </LoadingButton>
            <Typography sx={styles.date}>
               <Skeleton width={80} />
            </Typography>
         </Stack>
      </Stack>
   )
}

export const QuestionsSkeleton = () => {
   return (
      <Box>
         <SectionTitle>
            <Skeleton width={120} />
         </SectionTitle>
         <Stack spacing={1.25}>
            <QuestionSkeleton />
            <QuestionSkeleton />
            <QuestionSkeleton />
         </Stack>
      </Box>
   )
}

export default Questions
