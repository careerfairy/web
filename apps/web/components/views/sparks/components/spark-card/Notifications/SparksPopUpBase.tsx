import { Box, Button, Slide, SxProps } from "@mui/material"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { FC, ReactNode, SyntheticEvent } from "react"
import { combineStyles, sxStyles } from "../../../../../../types/commonTypes"

const styles = sxStyles({
   root: {
      zIndex: 10,
      position: "absolute",
      display: "flex",
      flexDirection: "column",
      top: 26,
      left: 26,
      right: 26,
      borderRadius: 3.25,
      backgroundColor: "white",
      padding: 3,
   },
   notification: {
      display: "flex",
      flexDirection: "row",
      mb: 3,
   },
   avatar: {
      width: { xs: 50, md: 60 },
      height: { xs: 50, md: 60 },
   },
   message: {
      display: "flex",
      alignItems: "center",
      ml: 2,
   },
   actions: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
   },
   btn: {
      fontSize: { xs: 12, md: 14 },
      width: "48%",
      textTransform: "none",
      py: { xs: 1, md: 0.5 },
   },
   cancelBtn: {
      color: "#A5A5A5 !important",
   },
})

type Props = {
   showNotification: boolean
   pictureSlot?: ReactNode
   pictureUrl?: string
   message: ReactNode
   cancelText?: string
   cta?: ReactNode
   ctaSx?: SxProps
   cancelHandleClick: (ev: SyntheticEvent) => void
   ctaHandleClick: () => void
}

export const SparksPopUpBase: FC<Props> = ({
   showNotification,
   pictureSlot,
   pictureUrl,
   message,
   cancelText = "Maybe later",
   cta,
   ctaSx,
   cancelHandleClick,
   ctaHandleClick,
}: Props) => {
   return (
      <Slide direction={"down"} in={showNotification}>
         <Box sx={styles.root}>
            <Box sx={styles.notification}>
               {pictureSlot ? (
                  pictureSlot
               ) : (
                  <CircularLogo
                     src={pictureUrl}
                     alt="company logo live stream notification"
                     sx={styles.avatar}
                  />
               )}
               <Box sx={styles.message}>{message}</Box>
            </Box>
            <Box sx={styles.actions}>
               <Button
                  sx={[styles.btn, styles.cancelBtn]}
                  onClick={cancelHandleClick}
                  variant="outlined"
                  size="small"
                  color="grey"
               >
                  {cancelText}
               </Button>
               <Button
                  sx={combineStyles(styles.btn, ctaSx)}
                  onClick={ctaHandleClick}
                  variant="contained"
                  size="small"
                  color="primary"
               >
                  {cta}
               </Button>
            </Box>
         </Box>
      </Slide>
   )
}
