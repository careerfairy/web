import { sxStyles } from "types/commonTypes"

import { ResponsiveStreamButton } from "../Buttons"
import { CheckCircle, Wifi } from "react-feather"
import React from "react"

const styles = sxStyles({
   root: {
      border: (theme) => `1px solid ${theme.brand.black[400]}`,
      cursor: "default",
   },
})

export const ConnectionStatus = () => {
   return (
      <ResponsiveStreamButton
         sx={styles.root}
         variant="outlined"
         startIcon={<CheckCircle />}
         disableTouchRipple
         endIcon={<Wifi />}
      />
   )
}
