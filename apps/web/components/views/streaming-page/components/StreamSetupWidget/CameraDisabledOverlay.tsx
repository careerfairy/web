import { Box, Typography } from "@mui/material"
import React from "react"
import { VideoOff } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      bgcolor: (theme) => theme.brand.black[800],
      height: "100%",
      width: "100%",
      color: "white",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
   },
   icon: {
      mb: "2px",
      height: 40,
      width: 40,
   },
})

export const CameraDisabledOverlay = () => {
   return (
      <Box sx={styles.root}>
         <Box sx={styles.icon} component={VideoOff} />
         <Typography variant="brandedBody" color="white">
            Camera is off
         </Typography>
      </Box>
   )
}
