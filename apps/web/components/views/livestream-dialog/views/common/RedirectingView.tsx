import { CircularProgress, Fade, Typography } from "@mui/material"
import { keyframes } from "@mui/system"
import { sxStyles } from "../../../../../types/commonTypes"
import BaseDialogView, { MainContent } from "../../BaseDialogView"

const pulse = keyframes`
  0% {
    transform: scale(0.95);
  }
  
  50% {
    transform: scale(1.05);
  }

  100% {
    transform: scale(0.95);
  }
`

const styles = sxStyles({
   root: {
      height: "100%",
      overflow: "hidden",
   },
   pulseBox: {
      animation: `${pulse} 2s infinite ease-in-out`,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
   },
   progress: {
      color: "secondary",
      size: 60,
   },
   h4: {
      mt: 3,
      color: "secondary.main",
      fontWeight: "bold",
   },
   subtitle: {
      mt: 2,
      color: "grey.600",
      textAlign: "center",
   },
})

const RedirectingView = () => {
   return (
      <BaseDialogView
         sx={styles.root}
         mainContent={
            <MainContent sx={styles.pulseBox}>
               <CircularProgress color="secondary" sx={styles.progress} />
               <Fade in timeout={1000}>
                  <Typography variant="h4" sx={styles.h4}>
                     Redirecting...
                  </Typography>
               </Fade>
               <Fade in timeout={2000}>
                  <Typography variant="subtitle1" sx={styles.subtitle}>
                     Please wait while we transfer you to the event room
                  </Typography>
               </Fade>
            </MainContent>
         }
      />
   )
}

export default RedirectingView
