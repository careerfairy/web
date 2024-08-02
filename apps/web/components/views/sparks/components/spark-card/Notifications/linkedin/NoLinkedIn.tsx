import { PublicGroup } from "@careerfairy/shared-lib/groups"
import { PublicCreator } from "@careerfairy/shared-lib/groups/creators"
import { Box, Button, Typography } from "@mui/material"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { sxStyles } from "types/commonTypes"
import { MoreComing } from "./MoreComing"
import { NoLinkedInBanner } from "./NoLinkedInBanner"

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
      opacity: 0.13,
      svg: {
         width: "auto",
         height: "13vh",
      },
   },
   headliner: {
      width: "auto",
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
   keepWatchingBtn: (theme) => ({
      padding: "12px 28px",
      backgroundColor: `${theme.brand.info[600]}`,
      borderRadius: "24px",
      border: `1px solid ${theme.palette.primary.main}`,
      background: `${theme.brand.white[200]}`,
      color: theme.palette.primary.main,
   }),
})

type Props = {
   group: PublicGroup
   creator: PublicCreator
   handleBack: () => void
   handleSwipeToNext: () => void
}

export const NoLinkedIn = ({
   group,
   creator,
   handleBack,
   handleSwipeToNext,
}: Props) => {
   return (
      <>
         <Box sx={styles.backgroundBanner}>
            <NoLinkedInBanner />
         </Box>
         <Box sx={styles.content}>
            <MoreComing sx={styles.headliner} />
            <Box sx={styles.avatar}>
               <CircularLogo
                  src={creator?.avatarUrl}
                  alt={"Mentor's avatar"}
                  size={136}
               />
            </Box>
            <Box sx={styles.header}>
               <Typography variant={"h2"} sx={styles.title}>
                  {`That's all from ${creator?.firstName}`}
               </Typography>
               <Typography variant={"h6"} sx={styles.subtitle}>
                  {`But there are more Sparks from ${group?.universityName} to watch! Discover which opportunities are waiting you and gain more insights into the world of ${group?.universityName}.`}
               </Typography>
            </Box>
            <Box sx={styles.actions}>
               <Button
                  sx={styles.keepWatchingBtn}
                  variant="contained"
                  onClick={handleSwipeToNext}
               >
                  Keep watching Sparks
               </Button>
               <Button
                  color="info"
                  variant="text"
                  onClick={handleBack}
                  sx={styles.backBtn}
               >
                  {`Back to ${creator?.firstName}'s profile`}
               </Button>
            </Box>
         </Box>
      </>
   )
}
