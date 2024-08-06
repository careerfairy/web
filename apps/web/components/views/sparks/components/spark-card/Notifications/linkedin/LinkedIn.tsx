import { PublicGroup } from "@careerfairy/shared-lib/groups"
import { PublicCreator } from "@careerfairy/shared-lib/groups/creators"
import { Box, Button, Stack, Typography } from "@mui/material"
import { LinkedInIcon } from "components/views/common/icons/LinkedInIcon"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { sxStyles } from "types/commonTypes"
import { AskYourQuestions } from "./AskYourQuestions"
import { AskYourQuestionsBackground } from "./AskYourQuestionsBackground"

const styles = sxStyles({
   content: {
      display: "flex",
      flexDirection: "column",
      alignSelf: "center",
      alignItems: "center",
      px: { xs: 2, md: 2, lg: 4 },
   },
   backgroundBanner: {
      position: "absolute",
      top: 16,
      left: 0,
      opacity: 0.03,
      svg: {
         width: "auto",
         height: "13vh",
      },
   },
   headliner: {
      width: "100%",
      height: "auto",
      marginBottom: "30px",
   },
   header: {
      textAlign: "center",
      mt: 4,
   },
   title: {
      fontWeight: "bold",
      fontSize: "24px !important",

      "@media (max-height: 800px)": {
         fontSize: "22px !important",
      },
   },
   subtitle: {
      mt: 3,

      "@media (max-height: 800px)": {
         fontSize: "14px !important",
      },
   },
   actions: {
      display: "flex",
      flexDirection: "column",
      mt: 6,
      alignItems: "center",
   },
   backBtn: {
      textTransform: "none",
      mt: 2,
   },
   avatar: {
      position: "relative",
   },
   linkedInContainer: (theme) => ({
      position: "absolute",
      bottom: 0,
      right: 0,
      width: "35px",
      height: "35px",
      backgroundColor: theme.brand.info[600],
      border: `2px solid ${theme.brand.white[400]}`,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
   }),
   linkedInWrapper: {
      marginTop: "5px",
      marginLeft: "-1px",
   },
   linkedInButtonInnerContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "baseline",
      height: "20px",
      gap: "12px",
   },
   linkedInButton: (theme) => ({
      padding: "12px 28px",
      backgroundColor: `${theme.brand.info[600]}`,
      "&:hover": {
         backgroundColor: "#2E5AB4",
      },
      "& svg": {
         width: "18px",
         height: "18px",
      },
   }),
   linkedInText: {
      alignSelf: "center",
      marginTop: "2px",
   },
})

type LinkedInButtonProps = {
   mentorLinkedInUrl: string
}

const LinkedInButton = ({ mentorLinkedInUrl }: LinkedInButtonProps) => {
   return (
      <Button
         sx={styles.linkedInButton}
         variant="contained"
         LinkComponent="a"
         href={mentorLinkedInUrl}
         target="_blank"
      >
         <Stack sx={styles.linkedInButtonInnerContainer}>
            <LinkedInIcon fill="white" />
            <Typography variant="medium" sx={styles.linkedInText}>
               Reach out on LinkedIn
            </Typography>
         </Stack>
      </Button>
   )
}

type Props = {
   group?: PublicGroup
   creator: PublicCreator
   handleSwipeToNext: () => void
}

export const LinkedIn = ({ group, creator, handleSwipeToNext }: Props) => {
   return (
      <>
         <Box sx={styles.backgroundBanner}>
            <AskYourQuestionsBackground />
         </Box>
         <Box sx={styles.content}>
            <AskYourQuestions sx={styles.headliner} />
            <Box sx={styles.avatar}>
               <CircularLogo
                  src={creator?.avatarUrl}
                  alt={"Mentor's avatar"}
                  size={136}
               />
               <Box sx={styles.linkedInContainer}>
                  <Box sx={styles.linkedInWrapper}>
                     <LinkedInIcon fill="white" />
                  </Box>
               </Box>
            </Box>
            <Box sx={styles.header}>
               <Typography variant={"h2"} sx={styles.title}>
                  {`It's time to connect with ${creator?.firstName}`}
               </Typography>
               <Typography variant={"h6"} sx={styles.subtitle}>
                  Connect on LinkedIn, keep the conversation flowing and get
                  your questions answered directly.
               </Typography>
            </Box>
            <Box sx={styles.actions}>
               <LinkedInButton mentorLinkedInUrl={creator?.linkedInUrl} />
               <Button
                  color="info"
                  variant="text"
                  onClick={handleSwipeToNext}
                  sx={styles.backBtn}
               >
                  Watch more Sparks from {group?.universityName}
               </Button>
            </Box>
         </Box>
      </>
   )
}
