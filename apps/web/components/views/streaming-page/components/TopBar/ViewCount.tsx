import { ResponsiveStreamButton } from "../Buttons"
import { sxStyles } from "types/commonTypes"

import { Eye } from "react-feather"
import React from "react"
import { useCurrentViewCount } from "store/selectors/streamingAppSelectors"
import { ActiveViews, setActiveView } from "store/reducers/streamingAppReducer"
import { useAppDispatch } from "components/custom-hook/store"

const styles = sxStyles({
   root: {
      border: (theme) => `1px solid ${theme.brand.black[400]}`,
   },
})

export const ViewCount = () => {
   const viewCount = useCurrentViewCount()

   const dispatch = useAppDispatch()

   const handleClick = () => {
      dispatch(setActiveView(ActiveViews.VIEWERS))
   }

   return (
      <ResponsiveStreamButton
         sx={styles.root}
         onClick={handleClick}
         variant="outlined"
         startIcon={<Eye />}
      >
         {viewCount}
      </ResponsiveStreamButton>
   )
}
