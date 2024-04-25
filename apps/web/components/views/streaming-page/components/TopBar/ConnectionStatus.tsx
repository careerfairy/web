import { sxStyles } from "types/commonTypes"

import { ResponsiveStreamButton } from "../Buttons"
import { CheckCircle, Wifi } from "react-feather"
import React from "react"
import { Box } from "@mui/material"

const styles = sxStyles({
   root: {
      border: (theme) => `1px solid ${theme.brand.black[400]}`,
      cursor: "default",
      px: 1.5,
      py: {
         xs: 0.5,
         tablet: 1,
      },
      "& svg": {
         width: {
            xs: 20,
            tablet: 24,
         },
         height: {
            xs: 20,
            tablet: 24,
         },
      },
   },
})

export const ConnectionStatus = () => {
   return (
      <ResponsiveStreamButton
         sx={styles.root}
         variant="outlined"
         disableTouchRipple
      >
         <CheckCircle />
         <Box mr={1.25} />
         <Wifi />
      </ResponsiveStreamButton>
   )
}
