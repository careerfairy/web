import { sxStyles } from "types/commonTypes"

import { Box, SwipeableDrawerProps } from "@mui/material"
import BrandedSwipeableDrawer from "components/views/common/inputs/BrandedSwipeableDrawer"
import TrialStatusContent from "./TrialStatusContent"

const styles = sxStyles({
   root: {
      px: 2,
      pb: 2,
   },
})

type Props = {
   open: boolean
   onOpen: SwipeableDrawerProps["onOpen"]
   onClose: SwipeableDrawerProps["onClose"]
}

const TrialStatusMobileDrawer = ({ open, onClose, onOpen }: Props) => {
   return (
      <BrandedSwipeableDrawer onClose={onClose} onOpen={onOpen} open={open}>
         <Box sx={styles.root}>
            <TrialStatusContent />
         </Box>
      </BrandedSwipeableDrawer>
   )
}

export default TrialStatusMobileDrawer
