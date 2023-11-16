import { ResponsiveButton, sxStyles } from "@careerfairy/shared-ui"

import { CheckCircle, Wifi } from "react-feather"
import React from "react"
import { Tooltip } from "@mui/material"

const styles = sxStyles({
   root: {
      border: (theme) => `1px solid ${theme.brand.black[400]}`,
      cursor: "default",
   },
})

export const ConnectionStatus = () => {
   return (
      <ResponsiveButton
         sx={styles.root}
         variant="outlined"
         startIcon={<CheckCircle />}
         disableTouchRipple
         endIcon={<Wifi />}
      />
   )
}
