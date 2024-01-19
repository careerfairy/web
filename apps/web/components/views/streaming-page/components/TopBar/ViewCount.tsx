import { ResponsiveStreamButton } from "../common"
import { sxStyles } from "types/commonTypes"

import { Eye } from "react-feather"
import React from "react"

const styles = sxStyles({
   root: {
      border: (theme) => `1px solid ${theme.brand.black[400]}`,
   },
})

export const ViewCount = () => {
   return (
      <ResponsiveStreamButton
         sx={styles.root}
         variant="outlined"
         startIcon={<Eye />}
      >
         128
      </ResponsiveStreamButton>
   )
}
