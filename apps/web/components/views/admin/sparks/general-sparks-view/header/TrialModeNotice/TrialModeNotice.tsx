import {
   Badge,
   Box,
   Button,
   Stack,
   Typography,
   badgeClasses,
} from "@mui/material"
import React from "react"
import { sxStyles } from "types/commonTypes"
import { Clock } from "react-feather"
import TrialStatusToolTip from "./TrialStatusToolTip"
import useIsMobile from "components/custom-hook/useIsMobile"
import TrialStatusMobileDrawer from "./TrialStatusMobileDrawer"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import { useGroup } from "layouts/GroupDashboardLayout"

const styles = sxStyles({
   root: {
      bgcolor: "#EBEBEF",
      borderRadius: 1,
      p: 0.5,
      display: "flex",
      alignItems: "center",
      color: "#6B6B7F",
   },
   label: {
      fontSize: "1rem",
      fontWeight: 400,
      color: "inherit",
   },
   badge: {
      [`& .${badgeClasses.badge}`]: {
         color: "common.white",
         background: "red !important",
      },
   },
})

function TrialModeNotice() {
   const { groupPresenter } = useGroup()
   const isMobile = useIsMobile()
   const [statusDrawerOpen, handleOpenStatusDrawer, handleCloseStatusDrawer] =
      useDialogStateHandler()
   return (
      <>
         <Box
            color="primary"
            onClick={isMobile ? handleOpenStatusDrawer : undefined}
            component="span"
         >
            <TrialStatusToolTip disabled={isMobile}>
               <Badge
                  sx={styles.badge}
                  badgeContent={"!"}
                  invisible={!groupPresenter.trialPlanInCriticalState()}
               >
                  <Stack spacing={1} direction="row" sx={styles.root}>
                     <Clock size={20} />
                     <Typography variant="body2" sx={styles.label}>
                        Trial mode
                     </Typography>
                  </Stack>
               </Badge>
            </TrialStatusToolTip>
         </Box>
         {isMobile ? (
            <TrialStatusMobileDrawer
               open={statusDrawerOpen}
               onOpen={handleOpenStatusDrawer}
               onClose={handleCloseStatusDrawer}
            />
         ) : null}
      </>
   )
}

export default TrialModeNotice
