import { Box, Collapse, Typography } from "@mui/material"
import { useHandRaiseActive } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"

const styles = sxStyles({
   root: {
      borderRadius: "4px",
      width: "100%",
      background: "linear-gradient(90.55deg, #00D2AA -9.83%, #12EEC4 100.07%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      p: 0.532,
   },
   text: {
      color: "white",
      fontSize: "13px",
      fontWeight: 400,
      lineHeight: "150%",
      letterSpacing: "-0.143px",
      textAlign: "center",
      "& b": {
         fontWeight: 600,
      },
   },
})

export const HandRaiseActiveBanner = () => {
   const { isHost } = useStreamingContext()
   const handRaiseActive = useHandRaiseActive()

   if (!isHost) return null // TODO: Add banner for when user raises hand

   return (
      <Collapse in={handRaiseActive} unmountOnExit>
         <Box sx={styles.root}>
            <Typography sx={styles.text}>
               <b>Hand raise active:</b> Your audience can now request to join
               via audio and video.
            </Typography>
         </Box>
      </Collapse>
   )
}
