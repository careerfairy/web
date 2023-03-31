import { Badge, Box, Chip } from "@mui/material"
import LiveIcon from "@mui/icons-material/RadioButtonChecked"
import CheckIcon from "@mui/icons-material/CheckCircle"

import React from "react"
import { sxStyles } from "../../../../types/commonTypes"

const styles = sxStyles({
   wrapper: {
      position: "absolute",
      display: "flex",
      padding: 2,
      justifyContent: "space-between",
      width: "100%",
   },
   badge: {
      pl: 1,
      "& .MuiBadge-dot": {
         minWidth: 10,
         height: 10,
         borderRadius: "50%",
      },
   },
})

type Props = {
   hasParticipated: boolean
   isPast: boolean
   isLive: boolean
   hasRegistered: boolean
   hasJobToApply: boolean
}

const EventPreviewCardChipLabels = ({
   hasParticipated,
   isPast,
   isLive,
   hasRegistered,
   hasJobToApply,
}: Props) => {
   let chipLabel

   if (hasParticipated && isPast && !isLive) {
      chipLabel = (
         <Chip icon={<CheckIcon />} color="primary" label={"Attended"} />
      )
   }

   if (hasRegistered && !isPast && !isLive) {
      chipLabel = (
         <Chip icon={<CheckIcon />} color="primary" label={"Booked!"} />
      )
   }

   if (isLive) {
      chipLabel = <Chip icon={<LiveIcon />} color="error" label={"LIVE"} />
   }

   return chipLabel || hasJobToApply ? (
      <Box className="hideOnHoverContent" sx={styles.wrapper}>
         <Box>
            {hasJobToApply ? (
               <Chip
                  deleteIcon={
                     <Badge
                        color="primary"
                        variant="dot"
                        overlap="circular"
                        sx={styles.badge}
                     />
                  }
                  sx={{ pr: 1 }}
                  onDelete={() => {}}
                  color={"info"}
                  label={"Easy Apply"}
               />
            ) : null}
         </Box>
         <Box>{chipLabel}</Box>
      </Box>
   ) : null
}

export default EventPreviewCardChipLabels
