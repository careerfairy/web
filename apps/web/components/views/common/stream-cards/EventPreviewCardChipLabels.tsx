import { Badge, Box, Chip, Stack } from "@mui/material"
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
   let leftChips = []
   let rightChip

   if (hasParticipated && isPast) {
      rightChip = (
         <Chip icon={<CheckIcon />} color="primary" label={"Attended"} />
      )
   }

   if (hasRegistered && !isPast) {
      rightChip = (
         <Chip icon={<CheckIcon />} color="primary" label={"Booked!"} />
      )
   }

   if (isLive) {
      leftChips.push(
         <Chip
            icon={<LiveIcon />}
            color="error"
            label={"LIVE"}
            sx={{ width: { xs: "fit-content", md: "auto" } }}
         />
      )
   }

   if (hasJobToApply) {
      leftChips.push(
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
      )
   }

   return leftChips.length > 0 || rightChip ? (
      <Box className="hideOnHoverContent" sx={styles.wrapper}>
         <Stack spacing={1} direction={{ xs: "column", md: "row" }}>
            {leftChips.map((chip) => chip)}
         </Stack>
         <Box>{rightChip}</Box>
      </Box>
   ) : null
}

export default EventPreviewCardChipLabels
