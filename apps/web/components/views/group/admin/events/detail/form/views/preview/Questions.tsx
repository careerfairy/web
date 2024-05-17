import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { sxStyles } from "@careerfairy/shared-ui"
import { Typography } from "@mui/material"
import Box from "@mui/material/Box"
import QuestionIcon from "components/views/common/icons/QuestionIcon"
import SectionTitle from "components/views/livestream-dialog/views/livestream-details/main-content/SectionTitle"

const styles = sxStyles({
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
                  Be the first one to ask{" "}
                  {companyName ? companyName : "Company Name"} a question
               </Typography>
               <Typography variant="brandedBody" sx={styles.askQuestionCopy2}>
                  Got a question? Get answers directly from{" "}
                  {companyName ? companyName : "Company Name"}
                  {"'s"} employees. The community can upvote the most valuable
                  questions.
               </Typography>
            </Box>
         </Box>
      </>
   )
}

export default Questions
