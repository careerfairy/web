import { Badge, Box, Chip, Stack, Typography } from "@mui/material"
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
   recordingAvailableDays?: number
}

const EventPreviewCardChipLabels = ({
   hasParticipated,
   isPast,
   isLive,
   hasRegistered,
   hasJobToApply,
   recordingAvailableDays,
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

   if (recordingAvailableDays) {
      let daysLeftMessage: JSX.Element

      if (recordingAvailableDays === 1) {
         daysLeftMessage = (
            <Typography ml={0.5} fontWeight={500} color={"error"}>
               1 Day
            </Typography>
         )
      }

      if (recordingAvailableDays > 1) {
         daysLeftMessage = (
            <Typography ml={0.5} fontWeight={500} color={"secondary"}>
               {recordingAvailableDays} Days
            </Typography>
         )
      }

      leftChips.push(
         <Chip
            sx={{ pr: 1 }}
            color={"info"}
            label={
               <Box display={"flex"}>
                  <Typography fontWeight={500}>Available for</Typography>
                  {daysLeftMessage}
               </Box>
            }
         />
      )
   }

   return leftChips.length > 0 || rightChip ? (
      <Box className="hideOnHoverContent" sx={styles.wrapper}>
         <Stack spacing={1} direction={{ xs: "column", md: "row" }}>
            {leftChips.map((chip, index) => ({
               ...chip,
               key: `chip-${index}`,
            }))}
         </Stack>
         <Box>{rightChip}</Box>
      </Box>
   ) : null
}

export default EventPreviewCardChipLabels
