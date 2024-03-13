import { ResponsiveStreamButton } from "../Buttons"
import { sxStyles } from "types/commonTypes"

import { Eye } from "react-feather"
import React from "react"
import { useCurrentViewCount } from "store/selectors/streamingAppSelectors"

const styles = sxStyles({
   root: {
      border: (theme) => `1px solid ${theme.brand.black[400]}`,
   },
})

export const ViewCount = () => {
   const viewCount = useCurrentViewCount()

   return (
      <ResponsiveStreamButton
         sx={styles.root}
         variant="outlined"
         startIcon={<Eye />}
      >
         {viewCount}
      </ResponsiveStreamButton>
   )
}
