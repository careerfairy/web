import { sxStyles } from "types/commonTypes"

import { Box, SwipeableDrawerProps } from "@mui/material"
import BrandedSwipableDrawer from "components/views/common/inputs/BrandedSwipableDrawer"
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
      <BrandedSwipableDrawer onClose={onClose} onOpen={onOpen} open={open}>
         <Box sx={styles.root}>
            <TrialStatusContent />
         </Box>
      </BrandedSwipableDrawer>
   )
}

export default TrialStatusMobileDrawer
