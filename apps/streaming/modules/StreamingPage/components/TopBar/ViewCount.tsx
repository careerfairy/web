import { ResponsiveButton, sxStyles } from "@careerfairy/shared-ui"

import { Eye } from "react-feather"
import React from "react"

const styles = sxStyles({
   root: {
      border: (theme) => `1px solid ${theme.brand.black[400]}`,
   },
})

export const ViewCount = () => {
   return (
      <ResponsiveButton sx={styles.root} variant="outlined" startIcon={<Eye />}>
         128
      </ResponsiveButton>
   )
}
