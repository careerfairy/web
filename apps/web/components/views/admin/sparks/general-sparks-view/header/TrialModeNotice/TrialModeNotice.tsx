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
   return (
      <Box color="primary" component="span">
         <TrialStatusToolTip>
            <Badge sx={styles.badge} badgeContent={"!"}>
               <Stack spacing={1} direction="row" sx={styles.root}>
                  <Clock size={20} />
                  <Typography variant="body2" sx={styles.label}>
                     Trial mode
                  </Typography>
               </Stack>
            </Badge>
         </TrialStatusToolTip>
      </Box>
   )
}

export default TrialModeNotice
